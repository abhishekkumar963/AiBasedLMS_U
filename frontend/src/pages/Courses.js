import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  ChevronDown,
  Play
} from 'lucide-react';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [pagination.currentPage, selectedCategory, selectedLevel, searchTerm]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: 12,
        category: selectedCategory || undefined,
        level: selectedLevel || undefined,
        search: searchTerm || undefined
      };

      const response = await axios.get('/api/courses', { params });
      setCourses(response.data.courses);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/courses/categories/list');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
    fetchCourses();
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`/api/courses/${courseId}/enroll`);
      // Refresh courses to update enrolled status
      fetchCourses();
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    }
  };

  const handleCategoryClick = (categoryName) => {
    if (activeCategory === categoryName) {
      // If clicking the same category, clear filter
      setActiveCategory('');
      setSelectedCategory('');
    } else {
      // Set new category filter
      setActiveCategory(categoryName);
      setSelectedCategory(categoryName);
    }
    setPagination({ ...pagination, currentPage: 1 });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && courses.length === 0) {
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
        {[...Array(30)].map((_, i) => (
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
        {/* Enhanced Hero Section */}
        <div className="mb-12">
          <div className="gradient-neon rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-white/20 rounded-full animate-pulse"
                  style={{
                    left: `${10 + i * 8}%`,
                    top: `${15 + i * 7}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="heading-display mb-4">
                    Explore Courses 🚀
                  </h1>
                  <p className="text-xl text-white/90 mb-6 max-w-2xl">
                    Discover new topics and expand your knowledge with our comprehensive course library
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="glass rounded-2xl px-6 py-4 neon-glow-blue">
                      <p className="text-sm text-white/80 mb-1">Available Courses</p>
                      <p className="text-3xl font-bold text-white">{courses.length}+</p>
                    </div>
                    <div className="glass rounded-2xl px-6 py-4 neon-glow-purple">
                      <p className="text-sm text-white/80 mb-1">Expert Instructors</p>
                      <p className="text-3xl font-bold text-white">50+</p>
                    </div>
                    <div className="glass rounded-2xl px-6 py-4 neon-glow-green">
                      <p className="text-sm text-white/80 mb-1">Success Rate</p>
                      <p className="text-3xl font-bold text-white">98%</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-40 h-40 glass rounded-full flex items-center justify-center neon-glow-pink">
                    <BookOpen className="w-20 h-20 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-large text-white">Popular Categories</h2>
            <span className="text-white">Explore by topic</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Web Development', icon: '💻', courses: 9, color: 'from-blue-500 to-cyan-500' },
              { name: 'Data Science', icon: '📊', courses: 4, color: 'from-purple-500 to-pink-500' },
              { name: 'Mobile Apps', icon: '📱', courses: 5, color: 'from-green-500 to-teal-500' },
              { name: 'UI/UX Design', icon: '🎨', courses: 8, color: 'from-orange-500 to-red-500' },
              { name: 'DevOps', icon: '⚙️', courses: 6, color: 'from-indigo-500 to-purple-500' },
              { name: 'AI & ML', icon: '🤖', courses: 7, color: 'from-yellow-500 to-orange-500' }
            ].map((category, index) => (
              <div key={category.name} className={`card card-hover text-center p-4 group cursor-pointer ${activeCategory === category.name ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}`} onClick={() => handleCategoryClick(category.name)}>
                <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center neon-glow-blue group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{category.name}</h3>
                <p className="text-xs text-white/70">{category.courses} courses</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-neon-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses, topics, or instructors..."
                  className="input-neon pl-12 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-glass flex items-center gap-2 px-6 py-3"
              >
                <Filter className="w-5 h-5" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="flex items-center gap-2">
                <button className="glass px-4 py-2 rounded-xl text-white hover:glass-dark transition-colors">
                  <span className="text-sm">Trending</span>
                </button>
                <button className="glass px-4 py-2 rounded-xl text-white hover:glass-dark transition-colors">
                  <span className="text-sm">New</span>
                </button>
                <button className="glass px-4 py-2 rounded-xl text-white hover:glass-dark transition-colors">
                  <span className="text-sm">Free</span>
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-glass-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Category</label>
                  <select
                    className="input-neon"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPagination({ ...pagination, currentPage: 1 });
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-3">Level</label>
                  <select
                    className="input-neon"
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setPagination({ ...pagination, currentPage: 1 });
                    }}
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Duration</label>
                  <select className="input-neon">
                    <option value="">Any Duration</option>
                    <option value="short">Under 2 hours</option>
                    <option value="medium">2-5 hours</option>
                    <option value="long">Over 5 hours</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-large text-white">Featured Courses</h2>
            <span className="text-white">Hand-picked by our experts</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {courses.slice(0, 2).map((course, index) => (
              <div key={course._id} className="card card-hover group">
                <div className="aspect-video bg-gradient-to-br from-neon-500 to-purple-500 rounded-2xl mb-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <BookOpen className="w-20 h-20 text-white transform group-hover:scale-110 transition-transform duration-300" />
                    )}
                  </div>
                  {course.price === 0 && (
                    <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full text-sm font-bold text-white neon-glow-green">
                      Free
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className="glass px-3 py-1 rounded-full text-xs font-bold text-white">
                      Featured
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="heading-medium group-hover:text-neon-400 transition-colors">
                      {course.title}
                    </h3>
                    <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full glass text-white ${
                      course.level === 'Beginner' ? 'neon-glow-green' :
                      course.level === 'Intermediate' ? 'neon-glow-orange' : 'neon-glow-pink'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  
                  <p className="text-white leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center text-white/80">
                        <Clock className="w-4 h-4 mr-2 text-neon-400" />
                        {course.duration}h
                      </span>
                      <span className="flex items-center text-white/80">
                        <Users className="w-4 h-4 mr-2 text-purple-400" />
                        {course.enrolledStudents?.length || 0} students
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-1 text-yellow-400" />
                      <span className="font-bold text-white">{course.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                    <div>
                      <p className="text-xl font-bold text-white">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </p>
                      <p className="text-xs text-white/70">{course.category}</p>
                    </div>
                    
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-neon-blue flex items-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Course
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Courses Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-large text-white">All Courses</h2>
            <span className="text-white">{courses.length} courses available</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="card card-hover group">
                <div className="aspect-video bg-gradient-to-br from-neon-500 to-purple-500 rounded-2xl mb-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <BookOpen className="w-16 h-16 text-white transform group-hover:scale-110 transition-transform duration-300" />
                    )}
                  </div>
                  {course.price === 0 && (
                    <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs font-bold text-white neon-glow-green">
                      Free
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className="glass px-2 py-1 rounded-full text-xs font-bold text-white">
                      {course.category}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="heading-small group-hover:text-neon-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full glass text-white ${
                      course.level === 'Beginner' ? 'neon-glow-green' :
                      course.level === 'Intermediate' ? 'neon-glow-orange' : 'neon-glow-pink'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  
                  <p className="text-white text-sm line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-white/70">
                        <Clock className="w-4 h-4 mr-1 text-neon-400" />
                        {course.duration}h
                      </span>
                      <span className="flex items-center text-white/70">
                        <Users className="w-4 h-4 mr-1 text-purple-400" />
                        {course.enrolledStudents?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      <span className="font-bold text-white">{course.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                    <div>
                      <p className="text-lg font-bold text-white">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </p>
                      <p className="text-xs text-white/70">{course.category}</p>
                    </div>
                    
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-glass text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Pagination */}
        {pagination.totalPages > 1 && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="text-white">
                Showing <span className="font-bold">{((pagination.currentPage - 1) * 12) + 1}</span> to{' '}
                <span className="font-bold">{Math.min(pagination.currentPage * 12, pagination.total)}</span> of{' '}
                <span className="font-bold">{pagination.total}</span> courses
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                  disabled={pagination.currentPage === 1}
                  className="btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination({ ...pagination, currentPage: pageNum })}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${
                          pagination.currentPage === pageNum
                            ? 'btn-neon-blue'
                            : 'glass hover:glass-dark text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Empty State */}
        {courses.length === 0 && !loading && (
          <div className="card text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-neon-500 to-purple-500 flex items-center justify-center neon-glow-blue">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="heading-medium mb-4 text-white">No courses found</h3>
            <p className="text-white mb-8 max-w-md mx-auto">
              Try adjusting your search terms or filters to find the perfect course for you
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLevel('');
                setPagination({ ...pagination, currentPage: 1 });
              }}
              className="btn-neon-green"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Learning Tips Section */}
        <div className="mt-16 mb-8">
          <div className="card">
            <h2 className="heading-large mb-8 text-white text-center">Learning Tips & Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎯',
                  title: 'Set Clear Goals',
                  description: 'Define what you want to achieve and create a learning roadmap'
                },
                {
                  icon: '⏰',
                  title: 'Stay Consistent',
                  description: 'Dedicate regular time to learning and maintain your study streak'
                },
                {
                  icon: '🤝',
                  title: 'Join Community',
                  description: 'Connect with other learners and share your knowledge'
                }
              ].map((tip, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{tip.icon}</div>
                  <h3 className="heading-medium mb-3 text-white">{tip.title}</h3>
                  <p className="text-white leading-relaxed">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
