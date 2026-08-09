import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  Brain, 
  RefreshCw, 
  Check, 
  X, 
  Plus,
  BookOpen,
  Filter,
  BarChart3,
  TrendingUp,
  Star,
  Zap,
  Trophy,
  Flame,
  Clock,
  Eye,
  Share2,
  BookmarkPlus,
  Shuffle,
  SkipForward,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Target,
  Award,
  Timer
} from 'lucide-react';
import axios from 'axios';

const Flashcards = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateData, setGenerateData] = useState({
    topic: '',
    cardCount: 10
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    reviewed: 0,
    correct: 0,
    streak: 0,
    averageTime: 0
  });
  const [showStats, setShowStats] = useState(false);
  const [studyMode, setStudyMode] = useState('review');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayDelay, setAutoPlayDelay] = useState(3000);
  const [showSettings, setShowSettings] = useState(false);
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [studySession, setStudySession] = useState({
    startTime: null,
    cardsStudied: 0,
    correctAnswers: 0
  });
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchFlashcards();
    }
  }, [selectedCourse]);

  useEffect(() => {
    let interval;
    if (isAutoPlay && !isFlipped && flashcards.length > 0) {
      interval = setTimeout(() => {
        setIsFlipped(true);
        setTimeout(() => {
          nextCard();
        }, autoPlayDelay);
      }, autoPlayDelay);
    }
    return () => clearTimeout(interval);
  }, [isAutoPlay, isFlipped, currentCardIndex, autoPlayDelay, flashcards.length]);

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

  const fetchFlashcards = async () => {
    try {
      const response = await axios.get(`/api/flashcards?courseId=${selectedCourse}`);
      setFlashcards(response.data.flashcards);
      updateStats(response.data.flashcards);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    }
  };

  const updateStats = (cards) => {
    const reviewed = cards.filter(card => card.reviewCount > 0).length;
    const correct = cards.reduce((sum, card) => sum + card.correctCount, 0);
    const streak = calculateStreak(cards);
    
    setStats({
      total: cards.length,
      reviewed,
      correct,
      streak,
      averageTime: reviewed > 0 ? Math.round((cards.reduce((sum, card) => sum + (card.averageTime || 0), 0) / reviewed) / 1000) : 0
    });
  };

  const calculateStreak = (cards) => {
    // Simple streak calculation - consecutive days of study
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const studiedToday = cards.some(card => 
      card.lastReviewed && new Date(card.lastReviewed).toDateString() === today
    );
    const studiedYesterday = cards.some(card => 
      card.lastReviewed && new Date(card.lastReviewed).toDateString() === yesterday
    );
    
    if (studiedToday) return 1;
    if (studiedYesterday) return 2;
    return 0;
  };

  const startStudySession = () => {
    setStudySession({
      startTime: new Date(),
      cardsStudied: 0,
      correctAnswers: 0
    });
    setShowProgress(true);
  };

  const endStudySession = () => {
    if (studySession.startTime) {
      const duration = Math.floor((new Date() - studySession.startTime) / 60000);
      // Track session
      axios.post('/api/activity/track', {
        type: 'flashcard_session',
        metadata: {
          courseId: selectedCourse,
          cardsStudied: studySession.cardsStudied,
          correctAnswers: studySession.correctAnswers,
          duration: duration
        }
      }).catch(console.error);
    }
  };

  const generateFlashcards = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/ai/generate-flashcards', {
        courseId: selectedCourse,
        topic: generateData.topic,
        cardCount: generateData.cardCount
      }, {
        timeout: 240000
      });

      setFlashcards([...flashcards, ...response.data.flashcards]);
      updateStats([...flashcards, ...response.data.flashcards]);
      setShowGenerateForm(false);
      setGenerateData({ topic: '', cardCount: 10 });
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardResponse = (correct) => {
    if (!flashcards[currentCardIndex]) return;

    const updatedFlashcards = [...flashcards];
    const currentCard = updatedFlashcards[currentCardIndex];
    
    currentCard.reviewCount++;
    if (correct) {
      currentCard.correctCount++;
      setStudySession(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1
      }));
    }
    currentCard.lastReviewed = new Date();

    // Update next review time (spaced repetition)
    const interval = correct ? 
      Math.min((currentCard.reviewCount * 2) * 24 * 60 * 60 * 1000, 30 * 24 * 60 * 60 * 1000) : // Max 30 days
      24 * 60 * 60 * 1000; // Incorrect: 1 day
    currentCard.nextReview = new Date(Date.now() + interval);

    setFlashcards(updatedFlashcards);
    updateStats(updatedFlashcards);
    setStudySession(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1
    }));
    
    // Move to next card
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0); // Loop back to first card
    }
  };

  const previousCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      setCurrentCardIndex(flashcards.length - 1); // Loop to last card
    }
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const shareProgress = () => {
    const accuracy = stats.reviewed > 0 ? Math.round((stats.correct / (stats.reviewed * 1)) * 100) : 0;
    const shareData = {
      title: `Flashcard Progress`,
      text: `I've mastered ${stats.correct}/${stats.total} flashcards with ${accuracy}% accuracy! Study streak: ${stats.streak} days 🔥`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Progress link copied to clipboard!');
    }
  };

  const filterCards = () => {
    let filtered = [...flashcards];
    
    if (difficulty !== 'all') {
      filtered = filtered.filter(card => {
        const accuracy = card.reviewCount > 0 ? card.correctCount / card.reviewCount : 0;
        if (difficulty === 'easy') return accuracy >= 0.8;
        if (difficulty === 'medium') return accuracy >= 0.5 && accuracy < 0.8;
        if (difficulty === 'hard') return accuracy < 0.5;
        return true;
      });
    }
    
    // Sort cards
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'difficulty') return (a.correctCount / Math.max(a.reviewCount, 1)) - (b.correctCount / Math.max(b.reviewCount, 1));
      if (sortBy === 'reviewed') return b.reviewCount - a.reviewCount;
      return 0;
    });
    
    return filtered;
  };

  const currentCard = flashcards[currentCardIndex];
  const filteredCards = filterCards();

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
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-display text-neon mb-2">Flashcards</h1>
              <p className="text-white text-lg">
                Master your knowledge with intelligent spaced repetition
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
                onClick={() => setShowSettings(!showSettings)}
                className="btn-glass p-3"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8 ">
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-300">Total Cards</p>
                  <p className="heading-large text-neon">{stats.total}</p>
                </div>
                <CreditCard className="w-8 h-8 text-neon-400" />
              </div>
            </div>
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-300">Reviewed</p>
                  <p className="heading-large text-purple-400">{stats.reviewed}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-300">Accuracy</p>
                  <p className="heading-large text-neonGreen-400">
                    {stats.reviewed > 0 ? Math.round((stats.correct / (stats.reviewed * 1)) * 100) : 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-neonGreen-400" />
              </div>
            </div>
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-300">Study Streak</p>
                  <p className="heading-large text-orange-400">{stats.streak} days</p>
                </div>
                <Flame className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-300">Avg Time</p>
                  <p className="heading-large text-cyan-400">{stats.averageTime}s</p>
                </div>
                <Clock className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 w-full">
            {/* Enhanced Course Selection */}
            <div className="card mb-4 lg:mb-6">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-neon-400 mr-2" />
                  <h2 className="heading-medium text-white text-sm lg:text-base">Select Course</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400" />
                  <span className="text-xs text-yellow-400 hidden sm:inline">Smart Study</span>
                </div>
              </div>
              
              <select
                className="input-neon w-full"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="" className="bg-dark-800">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id} className="bg-dark-800">
                    {course.title}
                  </option>
                ))}
              </select>

              {selectedCourse && (
                <div className="mt-3 lg:mt-4 space-y-2">
                  <button
                    onClick={() => setShowGenerateForm(!showGenerateForm)}
                    className="btn-neon-blue w-full flex items-center justify-center text-sm lg:text-base py-2 lg:py-3"
                  >
                    <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="truncate">Generate AI Flashcards</span>
                  </button>
                  {flashcards.length > 0 && (
                    <button
                      onClick={startStudySession}
                      className="btn-glass w-full flex items-center justify-center text-sm lg:text-base py-2 lg:py-3"
                    >
                      <Play className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                      <span className="truncate">Start Study Session</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Stats */}
            {flashcards.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                    <h2 className="heading-medium text-white">Progress</h2>
                  </div>
                  <button
                    onClick={shareProgress}
                    className="btn-glass p-2"
                    title="Share progress"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Overall Progress</span>
                      <span className="font-medium text-white">
                        {stats.reviewed > 0 ? Math.round((stats.correct / (stats.reviewed * 1)) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-neon-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.reviewed > 0 ? (stats.correct / (stats.reviewed * 1)) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Reviewed</span>
                        <span className="font-medium text-purple-400">{stats.reviewed}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(stats.reviewed / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Accuracy</span>
                        <span className="font-medium text-neonGreen-400">
                          {stats.reviewed > 0 ? Math.round((stats.correct / (stats.reviewed * 1)) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-neonGreen-500 h-2 rounded-full"
                          style={{ width: `${stats.reviewed > 0 ? (stats.correct / (stats.reviewed * 1)) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center text-sm">
                      <Flame className="w-4 h-4 text-orange-400 mr-1" />
                      <span className="text-orange-400">{stats.streak} day streak</span>
                    </div>
                    <button
                      onClick={shuffleCards}
                      className="btn-glass text-sm flex items-center"
                    >
                      <Shuffle className="w-3 h-3 mr-1" />
                      Shuffle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 w-full overflow-hidden">
            {/* Enhanced Generate Form */}
            {showGenerateForm && (
              <div className="card mb-6 ">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-medium text-white flex items-center">
                    <Brain className="w-5 h-5 text-neon-400 mr-2" />
                    Generate AI Flashcards
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400">Smart Generation</span>
                  </div>
                </div>
                <form onSubmit={generateFlashcards} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      Topic
                    </label>
                    <input
                      type="text"
                      className="input-neon"
                      placeholder="e.g., JavaScript Functions, World War II..."
                      value={generateData.topic}
                      onChange={(e) => setGenerateData({...generateData, topic: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      Number of Cards
                    </label>
                    <select
                      className="input-neon"
                      value={generateData.cardCount}
                      onChange={(e) => setGenerateData({...generateData, cardCount: parseInt(e.target.value)})}
                    >
                      <option value={5}>5 cards</option>
                      <option value={10}>10 cards</option>
                      <option value={15}>15 cards</option>
                      <option value={20}>20 cards</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-neon-blue flex-1 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="spinner w-4 h-4 mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGenerateForm(false)}
                      className="btn-glass"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Enhanced Flashcard Display */}
            {currentCard ? (
              <div>
                {/* Study Session Progress */}
                {showProgress && studySession.startTime && (
                  <div className="card mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Timer className="w-4 h-4 text-neon-400 mr-2" />
                          <span className="text-white text-sm">
                            {Math.floor((new Date() - studySession.startTime) / 60000)}m
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 text-purple-400 mr-2" />
                          <span className="text-white text-sm">
                            {studySession.cardsStudied} cards
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 text-neonGreen-400 mr-2" />
                          <span className="text-white text-sm">
                            {studySession.cardsStudied > 0 ? Math.round((studySession.correctAnswers / studySession.cardsStudied) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={endStudySession}
                        className="btn-glass text-sm"
                      >
                        End Session
                      </button>
                    </div>
                  </div>
                )}

                {/* Enhanced Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 lg:mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center justify-center sm:justify-start space-x-2 lg:space-x-4 w-full sm:w-auto">
                    <button
                      onClick={previousCard}
                      className="btn-glass flex items-center text-sm lg:text-base px-3 lg:px-4 py-2"
                      disabled={flashcards.length <= 1}
                    >
                      <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    <div className="text-white text-sm lg:text-base font-medium px-2">
                      <span className="font-bold">{currentCardIndex + 1}</span> / {flashcards.length}
                    </div>
                    <button
                      onClick={nextCard}
                      className="btn-glass flex items-center text-sm lg:text-base px-3 lg:px-4 py-2"
                      disabled={flashcards.length <= 1}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <SkipForward className="w-3 h-3 lg:w-4 lg:h-4 ml-1 lg:ml-2" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className={`btn-glass p-2 ${isAutoPlay ? 'bg-neon-500/20' : ''}`}
                      title={isAutoPlay ? 'Stop auto-play' : 'Start auto-play'}
                    >
                      {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={shuffleCards}
                      className="btn-glass p-2"
                      title="Shuffle cards"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Enhanced Flashcard */}
                <div className="card max-w-4xl mx-auto lg:max-w-2xl">
                  <div 
                    className="min-h-[300px] lg:min-h-[350px] flex items-center justify-center cursor-pointer relative overflow-hidden"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div className={`absolute inset-0 transition-all duration-700 transform-gpu ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`} style={{ backfaceVisibility: 'hidden' }}>
                      {!isFlipped ? (
                        <div className="text-center p-4 lg:p-8">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-neon-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 neon-glow-blue">
                            <CreditCard className="w-6 h-6 lg:w-8 lg:h-8 text-neon-400" />
                          </div>
                          <h3 className="heading-medium text-white mb-3 lg:mb-4 leading-relaxed text-sm lg:text-base px-2">
                            {currentCard.question}
                          </h3>
                          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-300">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>Click to reveal</span>
                            </div>
                            {currentCard.reviewCount > 0 && (
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>Reviewed {currentCard.reviewCount}x</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 lg:p-8">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-neonGreen-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 neon-glow-green">
                            <Check className="w-6 h-6 lg:w-8 lg:h-8 text-neonGreen-400" />
                          </div>
                          <p className="text-white text-sm lg:text-lg leading-relaxed mb-4 lg:mb-6 px-2">
                            {currentCard.answer}
                          </p>
                          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-300">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>Click to show question</span>
                            </div>
                            {currentCard.isAIGenerated && (
                              <div className="flex items-center">
                                <Brain className="w-4 h-4 mr-1" />
                                <span>AI Generated</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Response Buttons */}
                  {isFlipped && (
                    <div className="border-t border-gray-700 pt-4 lg:pt-6 mt-4 lg:mt-6">
                      <p className="text-xs sm:text-sm text-gray-300 text-center mb-3 lg:mb-4">
                        How well did you know this?
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3">
                        <button
                          onClick={() => handleCardResponse(false)}
                          className="btn-glass flex items-center justify-center hover:bg-red-500/20 py-2 lg:py-3 text-xs sm:text-sm"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-red-400" />
                          <span className="text-red-400">Need Work</span>
                        </button>
                        <button
                          onClick={() => handleCardResponse(true)}
                          className="btn-glass flex items-center justify-center hover:bg-yellow-500/20 py-2 lg:py-3 text-xs sm:text-sm"
                        >
                          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-yellow-400" />
                          <span className="text-yellow-400">Somewhat</span>
                        </button>
                        <button
                          onClick={() => handleCardResponse(true)}
                          className="btn-glass flex items-center justify-center hover:bg-neonGreen-500/20 py-2 lg:py-3 text-xs sm:text-sm"
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-neonGreen-400" />
                          <span className="text-neonGreen-400">Got It!</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Card Info */}
                <div className="text-center mt-4 lg:mt-6 text-xs sm:text-sm text-gray-300">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                    {currentCard.isAIGenerated && (
                      <div className="flex items-center">
                        <Brain className="w-4 h-4 mr-1 text-neon-400" />
                        <span>AI Generated</span>
                      </div>
                    )}
                    {currentCard.reviewCount > 0 && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Reviewed {currentCard.reviewCount} times</span>
                      </div>
                    )}
                    {currentCard.correctCount > 0 && (
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        <span>{currentCard.correctCount} correct</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-8 lg:py-16 px-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-neon-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 neon-glow-blue">
                  <CreditCard className="w-8 h-8 lg:w-10 lg:h-10 text-neon-400" />
                </div>
                <h3 className="heading-large text-white mb-2 lg:mb-3 text-lg lg:text-xl">
                  Ready to master new concepts?
                </h3>
                <p className="text-body text-gray-300 mb-4 lg:mb-6 max-w-sm lg:max-w-md mx-auto text-sm lg:text-base">
                  Select a course and generate AI-powered flashcards to start your intelligent learning journey
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-300">
                  <div className="flex items-center">
                    <Brain className="w-4 h-4 mr-1 text-neon-400" />
                    <span>Smart Spaced Repetition</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-yellow-400" />
                    <span>AI-Powered</span>
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

export default Flashcards;
