import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Target,
  Brain,
  MessageSquare,
  CreditCard,
  User,
  Calendar,
  Award
} from 'lucide-react';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await axios.post(`/api/courses/${id}/enroll`);
      fetchCourse(); // Refresh course data
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = course?.enrolledStudents?.some(student => 
    student._id === localStorage.getItem('userId')
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen py-8">
      {/* Static cyber grid background */}
      <div className="cyber-grid"></div>
      
      {/* Static particles */}
      <div className="particles">
        {[...Array(25)].map((_, i) => (
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
        {/* Enhanced Course Header */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Course Image/Video */}
              <div className="aspect-video bg-gradient-to-br from-neon-500 to-purple-500 rounded-2xl mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                
                {/* Course Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {course.imageUrl ? (
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-center">
                      <BookOpen className="w-20 h-20 text-white mb-4 transform group-hover:scale-110 transition-transform duration-300" />
                      <p className="text-white text-lg font-semibold">{course.category}</p>
                    </div>
                  )}
                </div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center neon-glow-blue">
                    <Play className="w-8 h-8 text-neon-600" />
                  </div>
                </div>
                
                {course.price === 0 && (
                  <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full text-sm font-bold text-white neon-glow-green">
                    Free Course
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4">
                  <span className="glass px-3 py-1 rounded-full text-xs font-bold text-white">
                    {course.level}
                  </span>
                </div>
              </div>
              
              {/* Course Meta Info */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="glass px-4 py-2 rounded-full text-sm font-bold text-white neon-glow-blue">
                  {course.category}
                </span>
                <div className="flex items-center text-sm text-white/80">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="font-bold">{course.rating.toFixed(1)}</span>
                  <span className="ml-1">({course.enrolledStudents?.length || 0} students)</span>
                </div>
              </div>

              <h1 className="heading-display mb-4 text-white">{course.title}</h1>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">{course.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="glass rounded-2xl p-4 text-center">
                  <Clock className="w-6 h-6 text-neon-400 mx-auto mb-2" />
                  <p className="text-sm text-white/80">Duration</p>
                  <p className="text-lg font-bold text-white">{course.duration}h</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-white/80">Students</p>
                  <p className="text-lg font-bold text-white">{course.enrolledStudents?.length || 0}</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-white/80">Created</p>
                  <p className="text-lg font-bold text-white">
                    {new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Enhanced Instructor Info */}
              <div className="glass rounded-2xl p-6">
                <h3 className="heading-medium mb-4 text-white">Your Instructor</h3>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-neon-500 to-purple-500 rounded-full flex items-center justify-center mr-4 neon-glow-blue">
                    {course.instructor.avatar ? (
                      <img 
                        src={course.instructor.avatar} 
                        alt={course.instructor.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-white">{course.instructor.name}</p>
                    <p className="text-white/80 mb-2">{course.instructor.email}</p>
                    {course.instructor.bio && (
                      <p className="text-white/70 leading-relaxed">{course.instructor.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="card glass-card sticky top-8">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-white mb-2">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </p>
                  <p className="text-white/80">One-time payment</p>
                </div>

                {isEnrolled ? (
                  <Link
                    to={`/ai-study?course=${id}`}
                    className="btn-neon-blue w-full mb-4 flex items-center justify-center text-lg py-4"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Course
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn-neon-green w-full mb-4 disabled:opacity-50 text-lg py-4"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}

                {/* Enhanced Quick Actions */}
                {isEnrolled && (
                  <div className="space-y-3">
                    <Link
                      to={`/ai-study?course=${id}`}
                      className="btn-glass w-full flex items-center justify-center py-3 hover:glass-dark"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Study Material
                    </Link>
                    <Link
                      to={`/flashcards?course=${id}`}
                      className="btn-glass w-full flex items-center justify-center py-3 hover:glass-dark"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Practice Flashcards
                    </Link>
                    <Link
                      to={`/chatbot?course=${id}`}
                      className="btn-glass w-full flex items-center justify-center py-3 hover:glass-dark"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask AI Tutor
                    </Link>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-glass-border">
                  <h4 className="font-bold text-white mb-4">This course includes:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center text-white/80">
                      <Target className="w-5 h-5 mr-3 text-neonGreen-400" />
                      <span>{course.modules?.length || 0} comprehensive modules</span>
                    </li>
                    <li className="flex items-center text-white/80">
                      <Clock className="w-5 h-5 mr-3 text-neon-400" />
                      <span>{course.duration} hours of video content</span>
                    </li>
                    <li className="flex items-center text-white/80">
                      <Brain className="w-5 h-5 mr-3 text-purple-400" />
                      <span>AI-powered study tools</span>
                    </li>
                    <li className="flex items-center text-white/80">
                      <MessageSquare className="w-5 h-5 mr-3 text-orange-400" />
                      <span>24/7 AI chatbot support</span>
                    </li>
                    <li className="flex items-center text-white/80">
                      <Award className="w-5 h-5 mr-3 text-yellow-400" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Course Content */}
        {course.modules && course.modules.length > 0 && (
          <div className="card mb-8">
            <h2 className="heading-large mb-8 text-white">Course Content</h2>
            
            <div className="space-y-6">
              {course.modules.map((module, index) => (
                <div
                  key={index}
                  className={`glass rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:neon-glow-blue ${
                    activeModule === index 
                      ? 'neon-glow-purple border-neon-400/30' 
                      : 'hover:glass-dark'
                  }`}
                  onClick={() => setActiveModule(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 font-bold text-lg transition-all duration-300 ${
                        activeModule === index 
                          ? 'bg-gradient-to-r from-neon-500 to-purple-500 text-white neon-glow-blue' 
                          : 'glass text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="heading-medium mb-2 text-white group-hover:text-neon-400 transition-colors">
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-white/70 leading-relaxed">{module.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {module.quiz && (
                        <span className="glass px-3 py-1 rounded-full text-xs font-bold text-yellow-400">
                          <Target className="w-3 h-3 mr-1 inline" />
                          Quiz
                        </span>
                      )}
                      {module.duration && (
                        <span className="glass px-3 py-1 rounded-full text-xs font-bold text-neon-400">
                          <Clock className="w-3 h-3 mr-1 inline" />
                          {module.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {activeModule === index && (
                    <div className="mt-6 pt-6 border-t border-glass-border ">
                      {/* Module Image */}
                      {module.imageUrl && (
                        <div className="mb-6">
                          <img 
                            src={module.imageUrl} 
                            alt={module.title}
                            className="w-full h-48 object-cover rounded-2xl"
                          />
                        </div>
                      )}
                      
                      {module.content?.text && (
                        <div className="mb-6">
                          <h4 className="heading-medium mb-4 text-white">Lesson Content</h4>
                          <div className="glass rounded-2xl p-6">
                            <p className="text-white leading-relaxed">{module.content.text}</p>
                          </div>
                        </div>
                      )}
                      
                      {module.content?.videoUrl && (
                        <div className="mb-6">
                          <h4 className="heading-medium mb-4 text-white">Video Lesson</h4>
                          <div className="aspect-video bg-gradient-to-br from-neon-500 to-purple-500 rounded-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center neon-glow-blue group-hover:scale-110 transition-transform duration-300">
                                <Play className="w-8 h-8 text-neon-600" />
                              </div>
                            </div>
                            {module.videoThumbnail && (
                              <img 
                                src={module.videoThumbnail} 
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <a 
                            href={module.content.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-neon-blue mt-4 inline-flex items-center"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Watch Video
                          </a>
                        </div>
                      )}

                      {module.content?.resources && module.content.resources.length > 0 && (
                        <div className="mb-6">
                          <h4 className="heading-medium mb-4 text-white">Download Resources</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {module.content.resources.map((resource, idx) => (
                              <a 
                                key={idx}
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="glass p-4 rounded-2xl hover:glass-dark transition-all duration-300 group"
                              >
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-r from-neon-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 neon-glow-blue">
                                    <CreditCard className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white font-medium group-hover:text-neon-400 transition-colors">
                                      {resource.name || `Resource ${idx + 1}`}
                                    </p>
                                    <p className="text-white/70 text-sm">{resource.type || 'PDF'}</p>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {module.quiz && (
                        <div className="glass rounded-2xl p-6">
                          <h4 className="heading-medium mb-4 text-white">Module Quiz</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white mb-2">
                                <Target className="w-5 h-5 mr-2 inline text-yellow-400" />
                                {module.quiz.questions.length} Questions
                              </p>
                              <p className="text-white/70 text-sm">Test your knowledge</p>
                            </div>
                            <button className="btn-neon-green">
                              <Target className="w-4 h-4 mr-2" />
                              Start Quiz
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Gallery */}
        <div className="card mb-8">
          <h2 className="heading-large mb-8 text-white">Course Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Interactive Lessons', desc: 'Hands-on learning experience', icon: '🎯' },
              { title: 'AI Assistant', desc: '24/7 learning support', icon: '🤖' },
              { title: 'Community', desc: 'Learn with peers', icon: '👥' },
              { title: 'Certificates', desc: 'Earn credentials', icon: '🏆' },
              { title: 'Mobile Access', desc: 'Learn on the go', icon: '📱' },
              { title: 'Lifetime Access', desc: 'Learn at your pace', icon: '♾️' }
            ].map((feature, index) => (
              <div key={index} className="glass rounded-2xl p-6 text-center hover:glass-dark transition-all duration-300 group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="heading-medium mb-2 text-white">{feature.title}</h3>
                <p className="text-white/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Courses */}
        <div className="card">
          <h2 className="heading-large mb-8 text-white">Related Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Advanced React Patterns', level: 'Advanced', duration: '8h', students: 1234 },
              { title: 'JavaScript Mastery', level: 'Intermediate', duration: '12h', students: 2456 },
              { title: 'CSS Animations', level: 'Beginner', duration: '6h', students: 892 }
            ].map((course, index) => (
              <div key={index} className="glass rounded-2xl overflow-hidden hover:glass-dark transition-all duration-300 group">
                <div className="aspect-video bg-gradient-to-br from-neon-500 to-purple-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white transform group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="heading-small mb-2 text-white group-hover:text-neon-400 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-white/70 mb-4">
                    <span>{course.level}</span>
                    <span>{course.duration}</span>
                    <span>{course.students} students</span>
                  </div>
                  <button className="btn-glass w-full text-sm">
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
