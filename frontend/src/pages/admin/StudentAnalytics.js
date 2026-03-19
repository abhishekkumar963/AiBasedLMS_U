import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  BarChart3,
  Brain,
  MessageSquare,
  Target
} from 'lucide-react';
import axios from 'axios';

const StudentAnalytics = () => {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentAnalytics();
  }, [id]);

  const fetchStudentAnalytics = async () => {
    try {
      const response = await axios.get(`/api/admin/students/${id}/analytics`);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch student analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student you're looking for doesn't exist.</p>
          <Link to="/admin/students" className="btn btn-primary">
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  const { student, riskData, activityBreakdown, performance, recentActivity } = analytics;

  const performanceMetrics = [
    {
      name: 'Average Quiz Score',
      value: `${performance.averageQuizScore}%`,
      icon: Target,
      color: 'bg-blue-500',
      trend: '+5%'
    },
    {
      name: 'Total Time Spent',
      value: formatTime(performance.totalTimeSpent),
      icon: Clock,
      color: 'bg-green-500',
      trend: '+12%'
    },
    {
      name: 'Enrolled Courses',
      value: performance.enrolledCourses,
      icon: BookOpen,
      color: 'bg-purple-500',
      trend: '+2'
    },
    {
      name: 'Generated Materials',
      value: performance.generatedMaterials,
      icon: Brain,
      color: 'bg-orange-500',
      trend: '+8'
    }
  ];

  const activityTypes = [
    { type: 'login', name: 'Logins', icon: Calendar, color: 'bg-blue-100 text-blue-800' },
    { type: 'quiz_attempt', name: 'Quiz Attempts', icon: Target, color: 'bg-green-100 text-green-800' },
    { type: 'chatbot_message', name: 'Chat Messages', icon: MessageSquare, color: 'bg-purple-100 text-purple-800' },
    { type: 'study_material_generated', name: 'Study Materials', icon: Brain, color: 'bg-orange-100 text-orange-800' },
    { type: 'course_view', name: 'Course Views', icon: BookOpen, color: 'bg-indigo-100 text-indigo-800' },
    { type: 'flashcard_review', name: 'Flashcard Reviews', icon: Activity, color: 'bg-pink-100 text-pink-800' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/students"
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600">{student.email}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full border ${
                riskData.level === 'High' ? 'risk-high' :
                riskData.level === 'Medium' ? 'risk-medium' : 'risk-low'
              }`}>
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="font-medium">{riskData.level} Risk</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{riskData.score}/100</div>
                <div className="text-sm text-gray-600">Risk Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        {riskData.factors.length > 0 && (
          <div className="card mb-8 border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Risk Factors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskData.factors.map((factor, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">{factor}</span>
                </div>
              ))}
            </div>
            {riskData.recommendations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h3>
                <ul className="space-y-1">
                  {riskData.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.name} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-green-600">{metric.trend} from last month</p>
                  </div>
                  <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Activity Breakdown</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {activityTypes.map((activity) => {
                const Icon = activity.icon;
                const count = activityBreakdown.byType[activity.type] || 0;
                const percentage = activityBreakdown.total > 0 ? (count / activityBreakdown.total * 100).toFixed(1) : 0;
                
                return (
                  <div key={activity.type}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{activity.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Weekly Activity</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {activityBreakdown.byDay.map((day) => (
                <div key={day.day}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{day.day}</span>
                    <span className="text-sm text-gray-600">{day.count} activities</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((day.count / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activityTypes.find(t => t.type === activity.type)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.metadata.courseId?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {activity.metadata.quizScore && `Score: ${activity.metadata.quizScore}%`}
                      {activity.metadata.timeSpent && `Time: ${activity.metadata.timeSpent}min`}
                      {activity.metadata.messageCount && `Messages: ${activity.metadata.messageCount}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(activity.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
