import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Sparkles,
  Download,
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Layers,
  FileText,
  Award,
  BarChart3,
  Lightbulb,
  Rocket,
  Eye,
  Heart,
  Share2,
  BookmarkPlus,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import axios from 'axios';

const AIStudy = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedHistory, setGeneratedHistory] = useState([]);
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState([]);
  const [viewMode, setViewMode] = useState('focus');
  const [showStats, setShowStats] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [selectedSection, setSelectedSection] = useState('all');

  useEffect(() => {
    fetchEnrolledCourses();
    fetchGeneratedHistory();
    fetchBookmarkedMaterials();
    // If course ID is in URL, set it as selected
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    let interval;
    if (isReading && studyMaterial) {
      interval = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isReading, studyMaterial]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get('/api/courses/enrolled/my-courses');
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      // If not enrolled in any courses, fetch all courses as fallback
      try {
        const allCoursesResponse = await axios.get('/api/courses');
        setCourses(allCoursesResponse.data.courses);
      } catch (fallbackError) {
        console.error('Failed to fetch all courses:', fallbackError);
      }
    }
  };

  const fetchGeneratedHistory = async () => {
    try {
      const response = await axios.get('/api/activity/history?type=study_material_generated');
      setGeneratedHistory(response.data.activities.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const generateStudyMaterial = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse || !topic) {
      console.log('Missing required fields:', { selectedCourse, topic });
      setError('Please select a course and enter a topic');
      return;
    }

    console.log('Generating study material with:', { selectedCourse, topic, difficulty });
    console.log('Auth token:', localStorage.getItem('token'));

    setLoading(true);
    setError(null);
    
    // Add timeout for the entire request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - please try again')), 45000);
    });
    
    try {
      // Try the real AI endpoint first
      let response;
      try {
        response = await Promise.race([
          axios.post('/api/ai/generate-study-material', {
            courseId: selectedCourse,
            topic,
            difficulty
          }),
          timeoutPromise
        ]);
        console.log('Using real AI endpoint');
      } catch (aiError) {
        console.log('AI endpoint failed, using test endpoint:', aiError.message);
        if (aiError.message === 'Request timeout - please try again') {
          throw aiError;
        }
        // Fall back to test endpoint
        response = await Promise.race([
          axios.post('/api/ai/generate-study-material-test', {
            courseId: selectedCourse,
            topic,
            difficulty
          }),
          timeoutPromise
        ]);
        console.log('Using test endpoint (mock data)');
      }

      console.log('API Response:', response.data);
      console.log('Study material received:', response.data.studyMaterial);
      console.log('Study material type:', typeof response.data.studyMaterial);
      console.log('Study material keys:', Object.keys(response.data.studyMaterial || {}));
      setStudyMaterial(response.data.studyMaterial);
      // Force a re-render by updating state
      setTimeout(() => {
        console.log('Study material state after timeout:', studyMaterial);
      }, 100);
      setReadingTime(0);
      setIsReading(true);
      fetchGeneratedHistory(); // Refresh history
    } catch (error) {
      console.error('Failed to generate study material:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Set user-friendly error message
      if (error.response?.status === 401) {
        setError('Please log in to generate study materials');
      } else if (error.response?.status === 404) {
        setError('Course not found. Please select a valid course');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to generate study material. Please try again.');
      }
      
      // Log additional debugging info
      console.log('Current studyMaterial state:', studyMaterial);
      console.log('Loading state:', loading);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarkedMaterials = async () => {
    try {
      const response = await axios.get('/api/activity/bookmarks?type=study_material');
      setBookmarkedMaterials(response.data.bookmarks || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!studyMaterial) return;
    
    try {
      const isBookmarked = bookmarkedMaterials.some(b => b.metadata.materialId === studyMaterial.id);
      
      if (isBookmarked) {
        await axios.delete(`/api/activity/bookmark/${studyMaterial.id}`);
        setBookmarkedMaterials(prev => prev.filter(b => b.metadata.materialId !== studyMaterial.id));
      } else {
        await axios.post('/api/activity/bookmark', {
          type: 'study_material',
          metadata: {
            materialId: studyMaterial.id,
            topic: studyMaterial.topic,
            courseId: selectedCourse
          }
        });
        setBookmarkedMaterials(prev => [...prev, {
          metadata: { materialId: studyMaterial.id, topic: studyMaterial.topic }
        }]);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const shareMaterial = () => {
    if (!studyMaterial) return;
    
    const shareData = {
      title: `Study Material: ${topic}`,
      text: `Check out this AI-generated study material on ${topic}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatReadingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadMaterial = () => {
    if (!studyMaterial) return;

    const content = `
Study Material: ${topic}
Difficulty: ${difficulty}
Generated on: ${new Date().toLocaleDateString()}

EXPLANATION:
${studyMaterial.explanation}

KEY CONCEPTS:
${studyMaterial.keyConcepts.map((concept, index) => `${index + 1}. ${concept}`).join('\n')}

EXAMPLES:
${studyMaterial.examples.map((example, index) => `${index + 1}. ${example}`).join('\n')}

PRACTICE QUESTIONS:
${studyMaterial.practiceQuestions.map((q, index) => `
Question ${index + 1}: ${q.question}
Answer: ${q.answer}
`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '_')}_study_material.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8">
      {/* Static cyber grid background */}
      <div className="cyber-grid"></div>
      
      {/* Static particles */}
      <div className="particles">
        {[...Array(15)].map((_, i) => (
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
        {/* Header with Enhanced Features */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-display text-neon mb-2">AI Study Assistant</h1>
              <p className="text-white text-lg">
                Generate personalized study materials with advanced AI technology
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className="btn-glass flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Stats
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'focus' ? 'immersive' : 'focus')}
                className="btn-glass flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                {viewMode === 'focus' ? 'Immersive' : 'Focus'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ">
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-300">Total Generated</p>
                  <p className="heading-large text-neon">{generatedHistory.length}</p>
                </div>
                <Rocket className="w-8 h-8 text-neon-400" />
              </div>
            </div>
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-300">Bookmarked</p>
                  <p className="heading-large text-purple-400">{bookmarkedMaterials.length}</p>
                </div>
                <BookmarkPlus className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-300">Reading Time</p>
                  <p className="heading-large text-neonGreen-400">{formatReadingTime(readingTime)}</p>
                </div>
                <Clock className="w-8 h-8 text-neonGreen-400" />
              </div>
            </div>
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-300">Study Streak</p>
                  <p className="heading-large text-orange-400">7 days</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <div className="lg:col-span-1">
            <div className="card max-h-[80vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="heading-large text-white">Generate Material</h2>
                    <p className="text-caption text-gray-300 mt-1">Create AI-powered study content</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-yellow-400">AI Enhanced</span>
                  </div>
                </div>

              <form onSubmit={generateStudyMaterial} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-1">
                    Select Course
                  </label>
                  <select
                    className="input-neon"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                  >
                    <option value="" className="bg-dark-800">Choose a course...</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id} className="bg-dark-800">
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    className="input-neon"
                    placeholder="e.g., JavaScript Arrays, Photosynthesis..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-1">
                    Study Mode
                  </label>
                  <select
                    className="input-neon"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="beginner" className="bg-dark-800">🌱 Beginner - Build foundations</option>
                    <option value="intermediate" className="bg-dark-800">🚀 Intermediate - Deepen understanding</option>
                    <option value="advanced" className="bg-dark-800">⭐ Advanced - Master concepts</option>
                    <option value="expert" className="bg-dark-800">🎯 Expert - Specialized topics</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedCourse || !topic}
                  className="btn-neon-blue w-full disabled:opacity-50 hover-scale"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Magic...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Material
                    </>
                  )}
                </button>
              </form>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Enhanced Recent History */}
              {generatedHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h3 className="heading-small text-white mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Recent Generations
                  </h3>
                  <div className="space-y-3">
                    {generatedHistory.slice(0, 3).map((item, index) => (
                      <div key={index} className="glass-card p-3 rounded-xl hover-lift cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white text-sm">
                              {item.metadata.topic}
                            </div>
                            <div className="text-gray-300 text-xs">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <Star className="w-4 h-4 text-yellow-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Generated Content */}
          <div className="lg:col-span-2">
            {studyMaterial ? (
              <div className="card">
                {/* Debug info */}
                <div className="mb-4 p-2 bg-blue-500/20 rounded text-xs text-blue-300">
                  DEBUG: studyMaterial exists - {JSON.stringify(Object.keys(studyMaterial))}
                  <br />
                  DEBUG: explanation length - {studyMaterial.explanation?.length || 0}
                  <br />
                  DEBUG: keyConcepts length - {studyMaterial.keyConcepts?.length || 0}
                  <br />
                  DEBUG: selectedSection - {selectedSection}
                </div>
                {/* Enhanced Header with Actions */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="heading-large text-white mb-2 flex items-center">
                      {topic}
                      <span className="ml-3 px-3 py-1 bg-neon-500/20 rounded-full text-xs text-neon-400">
                        {difficulty}
                      </span>
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-white/80">
                      <span className="flex items-center">
                        <Brain className="w-4 h-4 mr-1" />
                        AI Generated
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatReadingTime(readingTime)} read time
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {studyMaterial.keyConcepts?.length || 0} concepts
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsReading(!isReading)}
                      className="btn-glass p-3"
                      title={isReading ? 'Pause reading' : 'Start reading'}
                    >
                      {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={toggleBookmark}
                      className="btn-glass p-3"
                      title="Bookmark"
                    >
                      <Heart className={`w-4 h-4 ${bookmarkedMaterials.some(b => b.metadata.materialId === studyMaterial.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <button
                      onClick={shareMaterial}
                      className="btn-glass p-3"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={downloadMaterial}
                      className="btn-glass flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Section Navigation */}
                <div className="flex space-x-2 mb-6 overflow-x-auto">
                  {['all', 'explanation', 'concepts', 'examples', 'questions'].map((section) => (
                    <button
                      key={section}
                      onClick={() => setSelectedSection(section)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSection === section
                          ? 'bg-neon-500 text-white'
                          : 'glass text-gray-300 hover:text-white'
                      }`}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Explanation */}
                {(selectedSection === 'all' || selectedSection === 'explanation') && (
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-neon-500/20 rounded-lg flex items-center justify-center mr-3">
                        <BookOpen className="w-4 h-4 text-neon-400" />
                      </div>
                      <h3 className="heading-medium text-white">Explanation</h3>
                    </div>
                    <div className="glass-card p-6 rounded-xl">
                      <p className="text-white leading-relaxed text-lg">
                        {studyMaterial.explanation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Key Concepts */}
                {(selectedSection === 'all' || selectedSection === 'concepts') && studyMaterial.keyConcepts && studyMaterial.keyConcepts.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Target className="w-4 h-4 text-purple-400" />
                      </div>
                      <h3 className="heading-medium text-white">Key Concepts</h3>
                      <span className="ml-3 px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-400">
                        {studyMaterial.keyConcepts.length} concepts
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studyMaterial.keyConcepts.map((concept, index) => (
                        <div key={index} className="glass-card p-4 rounded-xl hover-lift">
                          <div className="flex items-start">
                            <div className="w-6 h-6 bg-neonGreen-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <CheckCircle className="w-3 h-3 text-neonGreen-400" />
                            </div>
                            <span className="text-white font-medium">{concept}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {(selectedSection === 'all' || selectedSection === 'examples') && studyMaterial.examples && studyMaterial.examples.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                      </div>
                      <h3 className="heading-medium text-white">Examples</h3>
                      <span className="ml-3 px-2 py-1 bg-yellow-500/20 rounded-full text-xs text-yellow-400">
                        {studyMaterial.examples.length} examples
                      </span>
                    </div>
                    <div className="space-y-4">
                      {studyMaterial.examples.map((example, index) => (
                        <div key={index} className="glass-card p-5 rounded-xl hover-lift border-l-4 border-yellow-400">
                          <div className="flex items-start">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-yellow-400 font-bold text-sm">{index + 1}</span>
                            </div>
                            <p className="text-white leading-relaxed">{example}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice Questions */}
                {(selectedSection === 'all' || selectedSection === 'questions') && studyMaterial.practiceQuestions && studyMaterial.practiceQuestions.length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Award className="w-4 h-4 text-green-400" />
                      </div>
                      <h3 className="heading-medium text-white">Practice Questions</h3>
                      <span className="ml-3 px-2 py-1 bg-green-500/20 rounded-full text-xs text-green-400">
                        {studyMaterial.practiceQuestions.length} questions
                      </span>
                    </div>
                    <div className="space-y-4">
                      {studyMaterial.practiceQuestions.map((question, index) => (
                        <div key={index} className="glass-card p-5 rounded-xl hover-lift">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-white flex items-center">
                              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
                                <span className="text-green-400 font-bold text-xs">Q{index + 1}</span>
                              </div>
                              {question.question}
                            </h4>
                          </div>
                          <div className="glass p-4 rounded-lg border-l-4 border-green-400">
                            <div className="flex items-center mb-2">
                              <Layers className="w-4 h-4 text-green-400 mr-2" />
                              <p className="text-sm font-bold text-green-400">Answer:</p>
                            </div>
                            <p className="text-white leading-relaxed">{question.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-16">
                {/* Debug info */}
                <div className="mb-4 p-2 bg-red-500/20 rounded text-xs text-red-300">
                  DEBUG: No studyMaterial - Loading: {loading.toString()}, Error: {error || 'none'}
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-neon-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow-blue">
                  <Brain className="w-10 h-10 text-neon-400" />
                </div>
                <h3 className="heading-large text-white mb-3">
                  Ready to supercharge your learning?
                </h3>
                <p className="text-body text-gray-300 mb-6 max-w-md mx-auto">
                  Select a course and topic to generate personalized AI-powered study materials that adapt to your learning style
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-1 text-yellow-400" />
                    <span>Powered by Google Gemini AI</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-neon-400" />
                    <span>Advanced ML Technology</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudy;
