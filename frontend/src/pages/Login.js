import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, Mail, Lock, GraduationCap, Star, Users, TrendingUp, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">EduNex Platform</h1>
              </div>
              <button 
                onClick={() => scrollToSection('journey-section')}
                className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg border border-gray-600 hover:border-gray-500"
              >
                Start Learning
              </button>
              <button 
                onClick={() => scrollToSection('signin-section')}
                className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg border border-gray-600 hover:border-gray-500"
              >
                Sign In
              </button>
              <button 
                onClick={() => scrollToSection('users-section')}
                className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg border border-gray-600 hover:border-gray-500"
              >
                Users Say
              </button>
              <button 
                onClick={() => scrollToSection('questions-section')}
                className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg border border-gray-600 hover:border-gray-500"
              >
                Questions
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Professional Margins */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-10">
          
          {/* Big Welcome Section */}
          <section className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl p-16 rounded-3xl border border-purple-500/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Brain className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Welcome to EduNex
              </h1>
              <p className="text-2xl text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                Experience the future of education with AI-powered personalized learning. Transform your educational journey with cutting-edge technology.
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => scrollToSection('journey-section')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  Start Your Journey
                </button>
                <button 
                  onClick={() => scrollToSection('signin-section')}
                  className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  Sign In Now
                </button>
              </div>
            </div>
          </section>

          {/* Section 1: Start Your Learning Journey */}
          <section id="journey-section" className="bg-gradient-to-br from-gray-800/60 to-black/60 backdrop-blur-xl p-10 rounded-3xl border border-gray-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Start Your Learning Journey! 🚀
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-10 max-w-lg mx-auto">
                Join thousands of students experiencing the future of education with EduNex AI-powered personalized learning.
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300 border border-purple-400/30 hover:border-purple-400/50">
                  <Brain className="w-10 h-10 mb-4 mx-auto text-purple-400" />
                  <h3 className="font-semibold text-base mb-2 text-purple-300">AI-Powered Learning</h3>
                  <p className="text-sm text-gray-400">Personalized study materials generated just for you</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300 border border-blue-400/30 hover:border-blue-400/50">
                  <TrendingUp className="w-10 h-10 mb-4 mx-auto text-blue-400" />
                  <h3 className="font-semibold text-base mb-2 text-blue-300">Track Progress</h3>
                  <p className="text-sm text-gray-400">Monitor your learning journey with detailed analytics</p>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl p-6 hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300 border border-green-400/30 hover:border-green-400/50">
                  <Users className="w-10 h-10 mb-4 mx-auto text-green-400" />
                  <h3 className="font-semibold text-base mb-2 text-green-300">Expert Courses</h3>
                  <p className="text-sm text-gray-400">Learn from industry experts and professionals</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-6 hover:from-yellow-500/30 hover:to-yellow-600/30 transition-all duration-300 border border-yellow-400/30 hover:border-yellow-400/50">
                  <MessageCircle className="w-10 h-10 mb-4 mx-auto text-yellow-400" />
                  <h3 className="font-semibold text-base mb-2 text-yellow-300">24/7 Support</h3>
                  <p className="text-sm text-gray-400">Get help whenever you need it with our AI assistant</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Sign In */}
          <section id="signin-section" className="bg-gradient-to-br from-gray-800/60 to-black/60 backdrop-blur-xl p-10 rounded-3xl border border-gray-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Sign In</h2>
              <p className="text-gray-400 text-lg">Access your EduNex AI learning account</p>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-3">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md hover:bg-gray-800/70"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="w-full pl-12 pr-14 py-4 border-2 border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md hover:bg-gray-800/70"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-purple-400 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-purple-400 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 text-purple-500 focus:ring-purple-500 border-gray-600 rounded bg-gray-800"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-6 border-2 border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in to your account'
                  )}
                </button>
              </div>
            </form>

            {/* Demo Account Info */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/20">
              <p className="text-center text-sm text-gray-300 mb-4">
                Demo Account:
              </p>
              <div className="text-center">
                <span className="text-sm text-purple-300 font-medium">student@example.com</span>
                <span className="text-sm text-gray-500 mx-2">/</span>
                <span className="text-sm text-gray-400">password</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-8">
              <p className="text-gray-300 text-lg">
                New to EduNex platform?{' '}
                <Link
                  to="/register"
                  className="font-bold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Create your free account →
                </Link>
              </p>
            </div>
          </section>

          {/* Section 3: What Users Say */}
          <section id="users-section" className="bg-gradient-to-br from-gray-800/60 to-black/60 backdrop-blur-xl p-10 rounded-3xl border border-gray-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">What Users Say 💬</h3>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl p-6 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 border border-blue-400/30">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white text-base font-bold">AK</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-blue-300">Alex Kumar</p>
                    <p className="text-sm text-gray-400">Data Science Enthusiast</p>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-base text-gray-300 italic">"The AI-powered flashcards are game-changers! I can study anytime, anywhere."</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-6 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 border border-green-400/30">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white text-base font-bold">SP</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-green-300">Sarah Patel</p>
                    <p className="text-sm text-gray-400">Web Developer</p>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-base text-gray-300 italic">"Best learning platform! The courses are comprehensive and AI tutor is incredibly helpful."</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-xl p-6 hover:from-orange-500/20 hover:to-red-500/20 transition-all duration-300 border border-orange-400/30">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white text-base font-bold">MJ</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-orange-300">Mike Johnson</p>
                    <p className="text-sm text-gray-400">Business Analyst</p>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-base text-gray-300 italic">"The personalized study materials helped me ace my certification exam!"</p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl p-6 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 border border-purple-400/30">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white text-base font-bold">LW</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-purple-300">Lisa Wang</p>
                    <p className="text-sm text-gray-400">UX Designer</p>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-base text-gray-300 italic">"The AI tutor adapts to my learning style perfectly. Highly recommended!"</p>
              </div>
            </div>
          </section>

          {/* Section 4: Frequently Asked Questions */}
          <section id="questions-section" className="bg-gradient-to-br from-gray-800/60 to-black/60 backdrop-blur-xl p-10 rounded-3xl border border-gray-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Frequently Asked Questions ❓</h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  question: "How do AI-generated study materials work?",
                  answer: "Our AI analyzes your learning style and generates personalized study materials, quizzes, and flashcards tailored to your needs."
                },
                {
                  question: "Can I track my learning progress?",
                  answer: "Yes! Our platform provides detailed analytics and progress tracking to help you monitor your learning journey."
                },
                {
                  question: "Is there a mobile app available?",
                  answer: "Currently, our platform is web-based and works perfectly on all mobile browsers. A native app is coming soon!"
                },
                {
                  question: "What payment methods are accepted?",
                  answer: "We accept all major credit cards, debit cards, and popular digital payment methods for premium features."
                },
                {
                  question: "How quickly can I start learning?",
                  answer: "You can start immediately after signing up! Our AI will create your personalized learning path within minutes."
                },
                {
                  question: "Is customer support available?",
                  answer: "Yes! We offer 24/7 AI-powered support and human customer service during business hours for premium users."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-purple-400/30 overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-5 text-left hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                        <span className="text-white text-xs font-bold">Q</span>
                      </div>
                      <h4 className="font-semibold text-base text-purple-300">{faq.question}</h4>
                    </div>
                    <div className={`transform transition-transform duration-300 ${expandedFAQ === index ? 'rotate-180' : ''}`}>
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedFAQ === index ? 'max-h-32' : 'max-h-0'}`}>
                    <div className="p-5 pt-0">
                      <p className="text-base text-gray-300 pl-11">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Login;
