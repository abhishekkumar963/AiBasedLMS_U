const express = require('express');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Track user activity
router.post('/track', auth, async (req, res) => {
  try {
    const { type, metadata = {} } = req.body;

    if (!type) {
      return res.status(400).json({ message: 'Activity type is required' });
    }

    const activity = new Activity({
      user: req.user._id,
      type,
      metadata
    });

    await activity.save();

    res.json({ message: 'Activity tracked successfully' });
  } catch (error) {
    console.error('Track activity error:', error);
    res.status(500).json({ message: 'Server error while tracking activity' });
  }
});

// Get user activity history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;

    const activities = await Activity.find(query)
      .populate('metadata.courseId', 'title')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get activity history error:', error);
    res.status(500).json({ message: 'Server error while fetching activity history' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all activities for the user
    const allActivities = await Activity.find({ user: userId });
    const recentActivities = await Activity.find({ 
      user: userId, 
      timestamp: { $gte: thirtyDaysAgo } 
    });

    // Calculate statistics
    const stats = {
      totalActivities: allActivities.length,
      recentActivities: recentActivities.length,
      loginCount: allActivities.filter(a => a.type === 'login').length,
      quizAttempts: allActivities.filter(a => a.type === 'quiz_attempt').length,
      chatbotMessages: allActivities.filter(a => a.type === 'chatbot_message').length,
      studyMaterialsGenerated: allActivities.filter(a => a.type === 'study_material_generated').length,
      flashcardReviews: allActivities.filter(a => a.type === 'flashcard_review').length,
      courseViews: allActivities.filter(a => a.type === 'course_view').length,
      totalTimeSpent: allActivities.reduce((total, activity) => 
        total + (activity.metadata.timeSpent || 0), 0
      ),
      averageQuizScore: calculateAverageQuizScore(allActivities),
      dropoutRisk: calculateDropoutRisk(allActivities, recentActivities)
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ message: 'Server error while fetching activity statistics' });
  }
});

// Helper function to calculate average quiz score
function calculateAverageQuizScore(activities) {
  const quizActivities = activities.filter(a => a.type === 'quiz_attempt' && a.metadata.quizScore);
  if (quizActivities.length === 0) return 0;
  
  const totalScore = quizActivities.reduce((sum, activity) => sum + activity.metadata.quizScore, 0);
  return Math.round((totalScore / quizActivities.length) * 100) / 100;
}

// Helper function to calculate dropout risk
function calculateDropoutRisk(allActivities, recentActivities) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Recent activity metrics
  const recentLogins = recentActivities.filter(a => a.type === 'login').length;
  const recentQuizAttempts = recentActivities.filter(a => a.type === 'quiz_attempt').length;
  const recentChatMessages = recentActivities.filter(a => a.type === 'chatbot_message').length;
  const recentTimeSpent = recentActivities.reduce((total, activity) => 
    total + (activity.metadata.timeSpent || 0), 0
  );
  
  // Calculate risk factors
  const loginFrequency = recentLogins / 30; // Logins per day in last 30 days
  const engagementScore = (recentQuizAttempts * 2) + (recentChatMessages * 1) + (recentTimeSpent / 60);
  const averageQuizScore = calculateAverageQuizScore(recentActivities);
  
  // Risk classification logic
  let risk = 'Low';
  let riskFactors = [];
  
  if (loginFrequency < 0.3) {
    riskFactors.push('Low login frequency');
  }
  
  if (engagementScore < 5) {
    riskFactors.push('Low engagement');
  }
  
  if (averageQuizScore < 50) {
    riskFactors.push('Poor quiz performance');
  }
  
  if (recentTimeSpent < 120) { // Less than 2 hours in 30 days
    riskFactors.push('Low time spent');
  }
  
  // Determine risk level
  if (riskFactors.length >= 3) {
    risk = 'High';
  } else if (riskFactors.length >= 1) {
    risk = 'Medium';
  }
  
  return {
    level: risk,
    factors: riskFactors,
    score: Math.max(0, 100 - (riskFactors.length * 25)), // Simple risk score
    recommendations: getRiskRecommendations(risk, riskFactors)
  };
}

// Helper function to get risk recommendations
function getRiskRecommendations(risk, factors) {
  const recommendations = [];
  
  if (factors.includes('Low login frequency')) {
    recommendations.push('Try to log in daily to maintain learning momentum');
  }
  
  if (factors.includes('Low engagement')) {
    recommendations.push('Engage more with quizzes and chatbot features');
  }
  
  if (factors.includes('Poor quiz performance')) {
    recommendations.push('Review study materials and practice more quizzes');
  }
  
  if (factors.includes('Low time spent')) {
    recommendations.push('Dedicate more time to course activities');
  }
  
  if (risk === 'High') {
    recommendations.push('Consider contacting your instructor for additional support');
  }
  
  return recommendations;
}

module.exports = router;
