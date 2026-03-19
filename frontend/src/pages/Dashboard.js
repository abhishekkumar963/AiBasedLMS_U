import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  MessageSquare, 
  CreditCard, 
  TrendingUp, 
  Clock,
  Target,
  Award,
  Activity,
  Play,
  User,
  ChevronRight,
  Star,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    let completedFields = 0;
    const totalFields = 4; // name, bio, education, interests
    
    if (user.name && user.name.trim()) completedFields++;
    if (user.profile?.bio && user.profile.bio.trim()) completedFields++;
    if (user.profile?.education && user.profile.education.trim()) completedFields++;
    if (user.profile?.interests && user.profile.interests.length > 0) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, coursesRes, featuredRes] = await Promise.all([
        axios.get('/api/activity/stats'),
        axios.get('/api/courses/enrolled/my-courses'),
        axios.get('/api/courses/featured/list')
      ]);

      setStats(statsRes.data.stats);
      setEnrolledCourses(coursesRes.data.courses);
      setFeaturedCourses(featuredRes.data.courses);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'Browse Courses',
      description: 'Explore new courses and topics',
      icon: BookOpen,
      color: 'bg-blue-500',
      href: '/courses'
    },
    {
      name: 'My Profile',
      description: 'Create and manage your profile',
      icon: User,
      color: 'bg-indigo-500',
      href: '/profile'
    },
    {
      name: 'AI Study Assistant',
      description: 'Generate study materials with AI',
      icon: Brain,
      color: 'bg-purple-500',
      href: '/ai-study'
    },
    {
      name: 'Practice Flashcards',
      description: 'Review with interactive flashcards',
      icon: CreditCard,
      color: 'bg-green-500',
      href: '/flashcards'
    },
    {
      name: 'AI Chatbot',
      description: 'Get help from AI tutor',
      icon: MessageSquare,
      color: 'bg-orange-500',
      href: '/chatbot'
    }
  ];

  const statCards = [
    {
      name: 'Enrolled Courses',
      value: enrolledCourses.length,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      name: 'Study Streak',
      value: '7 days',
      icon: TrendingUp,
      color: 'bg-green-500',
      change: 'Personal best!'
    },
    {
      name: 'Quiz Average',
      value: `${stats?.averageQuizScore || 0}%`,
      icon: Target,
      color: 'bg-purple-500',
      change: '+5% improvement'
    },
    {
      name: 'Study Time',
      value: `${Math.floor((stats?.totalTimeSpent || 0) / 60)}h`,
      icon: Clock,
      color: 'bg-orange-500',
      change: 'This week'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {/* Static cyber grid background */}
      <div className="cyber-grid"></div>
      
      {/* Static particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="gradient-neon rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Static background particles */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/30 rounded-full"
                  style={{
                    left: `${15 + i * 12}%`,
                    top: `${10 + i * 10}%`
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="heading-display mb-4">
                  Welcome {user?.name}! 🎉
                </h1>
                <p className="text-xl text-white/90 mb-6">
                  Ready to continue your learning journey? Here's what's happening today.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="glass rounded-2xl px-6 py-3 neon-glow-blue">
                    <p className="text-sm text-white/80 mb-1">Current Streak</p>
                    <p className="text-3xl font-bold text-white">🔥 7 days</p>
                  </div>
                  <div className="glass rounded-2xl px-6 py-3 neon-glow-purple">
                    <p className="text-sm text-white/80 mb-1">Total Points</p>
                    <p className="text-3xl font-bold text-white">⭐ 1,250</p>
                  </div>
                  <div className="glass rounded-2xl px-6 py-3 neon-glow-green">
                    <p className="text-sm text-white/80 mb-1">Profile Complete</p>
                    <p className="text-3xl font-bold text-white">{profileCompletion}%</p>
                  </div>
                  {profileCompletion < 100 && (
                    <Link 
                      to="/profile"
                      className="glass-dark rounded-2xl px-6 py-3 neon-glow-orange"
                    >
                      <p className="text-sm font-bold text-white">Complete Profile</p>
                    </Link>
                  )}
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 glass rounded-full flex items-center justify-center neon-glow-pink">
                  <Brain className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.name} 
                className="card card-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center neon-glow-blue`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full glass text-white ${
                    stat.changeType === 'positive' 
                      ? 'bg-neonGreen-500/20' 
                      : 'bg-cyber-500/20'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-white font-medium">{stat.name}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-large text-white">Quick Actions</h2>
            <span className="text-white">Jump into your learning</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="group card card-hover"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-24 h-24 ${action.color} rounded-3xl flex items-center justify-center mb-6 neon-glow-green`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="heading-small mb-3 text-white">{action.name}</h3>
                    <p className="text-white leading-relaxed mb-4">{action.description}</p>
                    <div className="text-white font-bold text-sm flex items-center">
                      Get Started →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enrolled Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-large text-white">My Courses</h2>
              <Link
                to="/courses"
                className="text-white text-sm font-bold"
              >
                View All →
              </Link>
            </div>
            
            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.slice(0, 3).map((course, index) => (
                  <div key={course._id} className="card card-hover">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="heading-small mb-2 text-white">{course.title}</h3>
                        <p className="text-white mb-3">{course.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-white/80">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-neon-400" />
                            {course.duration}h
                          </span>
                          <span className="flex items-center">
                            <Award className="w-4 h-4 mr-2 text-purple-400" />
                            {course.level}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/courses/${course._id}`}
                        className="btn-neon-blue flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="heading-medium mb-3 text-white">No courses yet</h3>
                <p className="text-white mb-6">Start your learning journey by enrolling in a course</p>
                <Link to="/courses" className="btn-neon-green">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>

          {/* Featured Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-large text-white">Featured Courses</h2>
              <Link
                to="/courses"
                className="text-white text-sm font-bold"
              >
                Explore More →
              </Link>
            </div>
            
            <div className="space-y-4">
              {featuredCourses.slice(0, 3).map((course, index) => (
                <div key={course._id} className="card card-hover">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="heading-small mb-2 text-white">{course.title}</h3>
                      <p className="text-white mb-3">{course.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-white/80">
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-2 text-purple-400" />
                          {course.level}
                        </span>
                        <span className="flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-neonGreen-400" />
                          {course.enrolledStudents?.length || 0} students
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-glass"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        {stats && (
          <div className="mt-8 card">
            <h2 className="heading-large mb-8 text-white">Learning Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-3">
                  {stats.totalActivities}
                </div>
                <p className="text-white font-medium">Total Activities</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-3">
                  {stats.studyMaterialsGenerated}
                </div>
                <p className="text-white font-medium">AI Materials Generated</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-3">
                  {stats.chatbotMessages}
                </div>
                <p className="text-white font-medium">Chatbot Interactions</p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements & Gamification */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-large text-white">Achievements</h2>
            <span className="text-white">Unlock new badges as you learn</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Fast Learner', icon: '🚀', unlocked: true, description: 'Complete 5 lessons' },
              { name: 'Quiz Master', icon: '🏆', unlocked: true, description: 'Score 90%+ on 3 quizzes' },
              { name: 'Streak Star', icon: '⭐', unlocked: true, description: '7-day streak' },
              { name: 'AI Explorer', icon: '🤖', unlocked: false, description: 'Generate 10 AI materials' },
              { name: 'Course Champion', icon: '🎯', unlocked: false, description: 'Complete 3 courses' },
              { name: 'Knowledge Seeker', icon: '📚', unlocked: false, description: 'Study for 50 hours' }
            ].map((achievement, index) => (
              <div 
                key={achievement.name}
                className={`card text-center p-4 transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'neon-glow-purple hover:scale-105' 
                    : 'opacity-50 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="text-sm font-bold text-white mb-1">{achievement.name}</h3>
                <p className="text-xs text-white/70">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-large text-white">Recent Activity</h2>
            <span className="text-white">Your learning journey</span>
          </div>
          <div className="card">
            <div className="space-y-4">
              {[
                { type: 'course', title: 'Started React Fundamentals', time: '2 hours ago', icon: '📖', color: 'neon-glow-blue' },
                { type: 'quiz', title: 'Completed JavaScript Quiz', time: '5 hours ago', icon: '✅', color: 'neon-glow-green' },
                { type: 'ai', title: 'Generated study notes', time: '1 day ago', icon: '🤖', color: 'neon-glow-purple' },
                { type: 'flashcard', title: 'Practiced CSS flashcards', time: '2 days ago', icon: '🎴', color: 'neon-glow-orange' },
                { type: 'achievement', title: 'Earned Fast Learner badge', time: '3 days ago', icon: '🏆', color: 'neon-glow-pink' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl glass-dark hover:glass transition-all duration-300">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{activity.title}</h3>
                    <p className="text-white/70 text-sm">{activity.time}</p>
                  </div>
                  <div className="text-white/50">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Recommendations */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-large text-white">Recommended for You</h2>
            <span className="text-white">Personalized learning suggestions</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Advanced React Patterns',
                type: 'Course',
                description: 'Master advanced React concepts and patterns',
                reason: 'Based on your React progress',
                color: 'bg-gradient-to-r from-blue-500 to-purple-500'
              },
              {
                title: 'JavaScript Quiz Challenge',
                type: 'Quiz',
                description: 'Test your JavaScript knowledge with 20 questions',
                reason: 'Perfect for your current level',
                color: 'bg-gradient-to-r from-green-500 to-teal-500'
              },
              {
                title: 'CSS Flexbox & Grid',
                type: 'Flashcards',
                description: 'Practice modern CSS layout techniques',
                reason: 'Popular in your field',
                color: 'bg-gradient-to-r from-orange-500 to-red-500'
              }
            ].map((rec, index) => (
              <div key={index} className="card card-hover group">
                <div className={`h-2 rounded-t-2xl ${rec.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full glass text-white">
                      {rec.type}
                    </span>
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="heading-small mb-3 text-white group-hover:text-neon-400 transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-white mb-4 text-sm">{rec.description}</p>
                  <p className="text-white/70 text-xs mb-4">{rec.reason}</p>
                  <button className="w-full btn-glass text-sm">
                    Start Learning →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Statistics */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-large text-white">Study Analytics</h2>
            <span className="text-white">Track your learning patterns</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="heading-medium mb-6 text-white">Weekly Study Time</h3>
              <div className="space-y-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const hours = [2, 3, 1, 4, 2, 5, 3][index];
                  const percentage = (hours / 5) * 100;
                  return (
                    <div key={day} className="flex items-center space-x-4">
                      <span className="text-white font-medium w-12">{day}</span>
                      <div className="flex-1 bg-dark-700 rounded-full h-8 relative overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-white font-bold">
                            {hours}h
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card">
              <h3 className="heading-medium mb-6 text-white">Learning Categories</h3>
              <div className="space-y-4">
                {[
                  { name: 'Frontend Development', progress: 75, color: 'from-blue-500 to-cyan-500' },
                  { name: 'JavaScript', progress: 60, color: 'from-yellow-500 to-orange-500' },
                  { name: 'React & Redux', progress: 45, color: 'from-purple-500 to-pink-500' },
                  { name: 'CSS & Styling', progress: 80, color: 'from-green-500 to-teal-500' },
                  { name: 'Backend Basics', progress: 30, color: 'from-red-500 to-rose-500' }
                ].map((category, index) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{category.name}</span>
                      <span className="text-white/70 text-sm">{category.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full bg-gradient-to-r ${category.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${category.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Community */}
        <div className="mt-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-large text-white">Learning Community</h2>
            <span className="text-white">Connect with fellow learners</span>
          </div>
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-neon-500 to-purple-500 flex items-center justify-center neon-glow-blue">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="heading-medium mb-2 text-white">2,543</h3>
                <p className="text-white">Active Learners</p>
              </div>
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center neon-glow-green">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h3 className="heading-medium mb-2 text-white">18,432</h3>
                <p className="text-white">Discussions</p>
              </div>
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center neon-glow-orange">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="heading-medium mb-2 text-white">956</h3>
                <p className="text-white">Achievements Unlocked</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
