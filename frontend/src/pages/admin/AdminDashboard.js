import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  UserCheck, 
  UserX,
  Activity,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Students',
      value: dashboard?.overview?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Total Courses',
      value: dashboard?.overview?.totalCourses || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Recent Activities',
      value: dashboard?.overview?.recentActivities || 0,
      icon: Activity,
      color: 'bg-purple-500',
      change: '+20%',
      changeType: 'positive'
    },
    {
      name: 'At Risk Students',
      value: dashboard?.atRiskStudents || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-5%',
      changeType: 'negative'
    }
  ];

  const riskData = dashboard?.riskDistribution || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor student performance and system analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="card card-hover">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Student Risk Distribution</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Low Risk</span>
                  <span className="text-sm text-gray-600">{riskData.low || 0} students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${riskData.low ? (riskData.low.percentage) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Medium Risk</span>
                  <span className="text-sm text-gray-600">{riskData.medium || 0} students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${riskData.medium ? (riskData.medium.percentage) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">High Risk</span>
                  <span className="text-sm text-gray-600">{riskData.high || 0} students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${riskData.high ? (riskData.high.percentage) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/students"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">View All Students</span>
              </Link>

              <Link
                to="/admin/students?riskLevel=high"
                className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">High Risk Students</span>
              </Link>

              <Link
                to="/admin/students?riskLevel=medium"
                className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <UserX className="w-8 h-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Medium Risk</span>
              </Link>

              <Link
                to="/admin/students?riskLevel=low"
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <UserCheck className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Low Risk</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {dashboard?.overview?.recentStudents || 0}
              </div>
              <p className="text-sm text-gray-600">New Students (30 days)</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {dashboard?.overview?.recentActivities || 0}
              </div>
              <p className="text-sm text-gray-600">Total Activities (30 days)</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {dashboard?.atRiskStudents || 0}
              </div>
              <p className="text-sm text-gray-600">Students Needing Attention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
