const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Activity = require('../models/Activity');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Get all students with their risk levels
router.get('/students', async (req, res) => {
  try {
    const { page = 1, limit = 20, riskLevel, search } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Calculate risk levels for each student
    const studentsWithRisk = await Promise.all(
      students.map(async (student) => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const allActivities = await Activity.find({ user: student._id });
        const recentActivities = await Activity.find({ 
          user: student._id, 
          timestamp: { $gte: thirtyDaysAgo } 
        });

        const riskData = calculateStudentRisk(allActivities, recentActivities);
        
        return {
          ...student.toObject(),
          riskLevel: riskData.level,
          riskScore: riskData.score,
          riskFactors: riskData.factors,
          lastLogin: student.lastLogin,
          totalActivities: allActivities.length,
          recentActivities: recentActivities.length
        };
      })
    );

    // Filter by risk level if specified
    let filteredStudents = studentsWithRisk;
    if (riskLevel && riskLevel !== 'all') {
      filteredStudents = studentsWithRisk.filter(student => 
        student.riskLevel.toLowerCase() === riskLevel.toLowerCase()
      );
    }

    const total = await User.countDocuments(query);

    res.json({
      students: filteredStudents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      riskSummary: calculateRiskSummary(studentsWithRisk)
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
});

// Get detailed student analytics
router.get('/students/:id/analytics', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const allActivities = await Activity.find({ user: studentId })
      .populate('metadata.courseId', 'title')
      .sort({ timestamp: -1 });
    
    const recentActivities = await Activity.find({ 
      user: studentId, 
      timestamp: { $gte: thirtyDaysAgo } 
    });

    const lastWeekActivities = await Activity.find({ 
      user: studentId, 
      timestamp: { $gte: sevenDaysAgo } 
    });

    // Calculate detailed analytics
    const analytics = {
      student: student.getPublicProfile(),
      riskData: calculateStudentRisk(allActivities, recentActivities),
      activityBreakdown: {
        total: allActivities.length,
        last30Days: recentActivities.length,
        last7Days: lastWeekActivities.length,
        byType: getActivityBreakdown(allActivities),
        byDay: getActivityByDay(lastWeekActivities)
      },
      performance: {
        averageQuizScore: calculateAverageQuizScore(allActivities),
        totalTimeSpent: allActivities.reduce((total, activity) => 
          total + (activity.metadata.timeSpent || 0), 0
        ),
        enrolledCourses: student.enrolledCourses.length,
        generatedMaterials: allActivities.filter(a => a.type === 'study_material_generated').length
      },
      recentActivity: lastWeekActivities.slice(0, 10)
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching student analytics' });
  }
});

// Create course
router.post('/courses', async (req, res) => {
  try {
    const courseData = req.body;
    
    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error while creating course' });
  }
});

// Update course
router.put('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error while updating course' });
  }
});

// Delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error while deleting course' });
  }
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      totalCourses,
      recentStudents,
      recentActivities,
      allStudents
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      User.countDocuments({ 
        role: 'student', 
        createdAt: { $gte: thirtyDaysAgo } 
      }),
      Activity.countDocuments({ timestamp: { $gte: thirtyDaysAgo } }),
      User.find({ role: 'student' }).select('_id')
    ]);

    // Calculate risk distribution
    const riskDistribution = await Promise.all(
      allStudents.map(async (student) => {
        const activities = await Activity.find({ user: student._id });
        const recent = await Activity.find({ 
          user: student._id, 
          timestamp: { $gte: thirtyDaysAgo } 
        });
        return calculateStudentRisk(activities, recent);
      })
    );

    const riskCounts = riskDistribution.reduce((acc, risk) => {
      acc[risk.level] = (acc[risk.level] || 0) + 1;
      return acc;
    }, {});

    const dashboard = {
      overview: {
        totalStudents,
        totalCourses,
        recentStudents,
        recentActivities
      },
      riskDistribution: {
        low: riskCounts.Low || 0,
        medium: riskCounts.Medium || 0,
        high: riskCounts.High || 0
      },
      atRiskStudents: riskCounts.High + riskCounts.Medium
    };

    res.json({ dashboard });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
});

// Helper functions
function calculateStudentRisk(allActivities, recentActivities) {
  const recentLogins = recentActivities.filter(a => a.type === 'login').length;
  const recentQuizAttempts = recentActivities.filter(a => a.type === 'quiz_attempt').length;
  const recentChatMessages = recentActivities.filter(a => a.type === 'chatbot_message').length;
  const recentTimeSpent = recentActivities.reduce((total, activity) => 
    total + (activity.metadata.timeSpent || 0), 0
  );
  
  const loginFrequency = recentLogins / 30;
  const engagementScore = (recentQuizAttempts * 2) + (recentChatMessages * 1) + (recentTimeSpent / 60);
  const averageQuizScore = calculateAverageQuizScore(recentActivities);
  
  let risk = 'Low';
  let riskFactors = [];
  
  if (loginFrequency < 0.3) riskFactors.push('Low login frequency');
  if (engagementScore < 5) riskFactors.push('Low engagement');
  if (averageQuizScore < 50) riskFactors.push('Poor quiz performance');
  if (recentTimeSpent < 120) riskFactors.push('Low time spent');
  
  if (riskFactors.length >= 3) risk = 'High';
  else if (riskFactors.length >= 1) risk = 'Medium';
  
  return {
    level: risk,
    factors: riskFactors,
    score: Math.max(0, 100 - (riskFactors.length * 25))
  };
}

function calculateAverageQuizScore(activities) {
  const quizActivities = activities.filter(a => a.type === 'quiz_attempt' && a.metadata.quizScore);
  if (quizActivities.length === 0) return 0;
  
  const totalScore = quizActivities.reduce((sum, activity) => sum + activity.metadata.quizScore, 0);
  return Math.round((totalScore / quizActivities.length) * 100) / 100;
}

function getActivityBreakdown(activities) {
  return activities.reduce((breakdown, activity) => {
    breakdown[activity.type] = (breakdown[activity.type] || 0) + 1;
    return breakdown;
  }, {});
}

function getActivityByDay(activities) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map(day => {
    const count = activities.filter(activity => 
      new Date(activity.timestamp).getDay() === days.indexOf(day)
    ).length;
    return { day, count };
  });
}

function calculateRiskSummary(students) {
  const summary = students.reduce((acc, student) => {
    acc[student.riskLevel] = (acc[student.riskLevel] || 0) + 1;
    return acc;
  }, {});
  
  const total = students.length;
  return {
    low: { count: summary.Low || 0, percentage: total > 0 ? ((summary.Low || 0) / total * 100).toFixed(1) : 0 },
    medium: { count: summary.Medium || 0, percentage: total > 0 ? ((summary.Medium || 0) / total * 100).toFixed(1) : 0 },
    high: { count: summary.High || 0, percentage: total > 0 ? ((summary.High || 0) / total * 100).toFixed(1) : 0 }
  };
}

module.exports = router;
