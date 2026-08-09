import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Brain, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  BarChart3,
  Star,
  Zap,
  Trophy,
  Flame,
  Timer,
  Eye,
  Share2,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  Flag,
  Lightbulb
} from 'lucide-react';
import axios from 'axios';

const Quiz = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [questionReview, setQuestionReview] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrolledCourses();
    fetchQuizHistory();
  }, []);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !showResults && !isPaused) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResults) {
      handleQuizComplete();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, showResults, isPaused]);

  const fetchQuizHistory = async () => {
    try {
      const response = await axios.get('/api/activity/history?type=quiz_attempt');
      setQuizHistory(response.data.activities.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch quiz history:', error);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const useHint = () => {
    if (!quiz || !quiz[currentQuestion]) return;
    
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  };

  const shareQuiz = () => {
    const score = calculateScore();
    const shareData = {
      title: `Quiz Score: ${score}% on ${topic}`,
      text: `I just scored ${score}% on a quiz about ${topic}! Can you beat my score?`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Quiz link copied to clipboard!');
    }
  };

  const skipQuestion = () => {
    console.log('Skipping question:', currentQuestion);
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = -1; // Mark as skipped
    setSelectedAnswers(newAnswers);
    
    if (quiz && quiz[currentQuestion]) {
      const reviewItem = {
        questionIndex: currentQuestion,
        question: quiz[currentQuestion].question,
        userAnswer: -1,
        correctAnswer: quiz[currentQuestion].correctAnswer,
        isSkipped: true
      };
      setQuestionReview([...questionReview, reviewItem]);
    }
    
    handleNextQuestion();
  };

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

  const generateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Generating quiz with:', { selectedCourse, topic });
      console.log('Auth token:', localStorage.getItem('token'));
      
      const response = await axios.post('/api/ai/generate-quiz', {
        courseId: selectedCourse,
        topic,
        questionCount: 10,
        difficulty: 'medium'
      }, {
        timeout: 240000
      });

      console.log('API Response:', response.data);
      console.log('Quiz data received:', response.data.quiz);
      console.log('Quiz length:', response.data.quiz?.length);
      
      if (response.data.quiz && response.data.quiz.length > 0) {
        setQuiz(response.data.quiz);
        setSelectedAnswers(new Array(response.data.quiz.length).fill(null));
        setCurrentQuestion(0);
        setShowResults(false);
        setTimeLeft(600); // 10 minutes
        setQuizStartTime(new Date());
        setHintsUsed(0);
        setQuestionReview([]);
        setShowHint(false);
        setIsPaused(false);
      } else {
        console.error('No quiz data received');
        setError('Failed to generate quiz questions. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        setError('Please log in to generate quizzes');
      } else if (error.response?.status === 404) {
        setError('Course not found. Please select a valid course');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to generate quiz. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    setSelectedAnswer(answerIndex);
    setShowHint(false);
  };

  const handleNextQuestion = () => {
    // Add to review if answered
    if (selectedAnswer !== null && quiz[currentQuestion]) {
      const reviewItem = {
        questionIndex: currentQuestion,
        question: quiz[currentQuestion].question,
        userAnswer: selectedAnswer,
        correctAnswer: quiz[currentQuestion].correctAnswer,
        isCorrect: selectedAnswer === quiz[currentQuestion].correctAnswer
      };
      setQuestionReview([...questionReview, reviewItem]);
    }
    
    setSelectedAnswer(null);
    setShowHint(false);
    
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuizComplete = () => {
    setShowResults(true);
    setTimeLeft(0);
    
    // Track activity
    const score = calculateScore();
    axios.post('/api/activity/track', {
      type: 'quiz_attempt',
      metadata: {
        courseId: selectedCourse,
        quizScore: score,
        questionCount: quiz.length,
        timeSpent: quizStartTime ? Math.floor((new Date() - quizStartTime) / 60000) : 0,
        hintsUsed: hintsUsed,
        skippedQuestions: selectedAnswers.filter(a => a === -1).length
      }
    }).then(() => {
      fetchQuizHistory();
    }).catch(console.error);
  };

  const calculateScore = () => {
    if (!quiz || !selectedAnswers.length) return 0;
    
    let correct = 0;
    quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / quiz.length) * 100);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setTimeLeft(null);
    setTopic('');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score) => {
    if (score >= 95) return { message: 'Perfect! Outstanding performance!', emoji: '🏆', color: 'text-yellow-400' };
    if (score >= 90) return { message: 'Excellent! Outstanding performance!', emoji: '⭐', color: 'text-neonGreen-400' };
    if (score >= 80) return { message: 'Great job! Well done!', emoji: '🎯', color: 'text-neon-400' };
    if (score >= 70) return { message: 'Good effort! Keep practicing!', emoji: '💪', color: 'text-blue-400' };
    if (score >= 60) return { message: 'Not bad! Room for improvement.', emoji: '📚', color: 'text-orange-400' };
    return { message: 'Keep studying! You\'ll do better next time!', emoji: '🌱', color: 'text-red-400' };
  };

  if (!quiz) {
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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header with Enhanced Features */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="heading-display text-neon mb-2">AI Quiz Generator</h1>
                <p className="text-white text-lg">
                  Challenge yourself with AI-powered adaptive quizzes
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
              </div>
            </div>
          </div>

          {/* Stats Dashboard */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-4 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-caption text-gray-300">Quizzes Taken</p>
                    <p className="heading-large text-neon">{quizHistory.length}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-neon-400" />
                </div>
              </div>
              <div className="glass-card p-4 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-caption text-gray-300">Avg Score</p>
                    <p className="heading-large text-neonGreen-400">
                      {quizHistory.length > 0 ? Math.round(quizHistory.reduce((sum, q) => sum + (q.metadata.quizScore || 0), 0) / quizHistory.length) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-neonGreen-400" />
                </div>
              </div>
              <div className="glass-card p-4 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-caption text-gray-300">Best Score</p>
                    <p className="heading-large text-purple-400">
                      {quizHistory.length > 0 ? Math.max(...quizHistory.map(q => q.metadata.quizScore || 0)) : 0}%
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="glass-card p-4 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-caption text-gray-300">Study Streak</p>
                    <p className="heading-large text-orange-400">7 days</p>
                  </div>
                  <Flame className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>
          )}

          {/* Quiz Generation Form */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Target className="w-6 h-6 text-neon-400 mr-3" />
                <div>
                  <h2 className="heading-large text-white">Generate New Quiz</h2>
                  <p className="text-caption text-gray-300 mt-1">AI-powered adaptive questions</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-400">Smart Quiz</span>
              </div>
            </div>

            <form onSubmit={generateQuiz} className="space-y-6">
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
                  Quiz Topic
                </label>
                <input
                  type="text"
                  className="input-neon"
                  placeholder="e.g., JavaScript Arrays, World War II, Photosynthesis..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-300 mt-1">
                  <span className="flex items-center">
                    <Brain className="w-3 h-3 mr-1" />
                    The AI will generate 10 adaptive multiple-choice questions tailored to your level
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-neon-blue w-full disabled:opacity-50 hover-scale"
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Generating Smart Quiz...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Quiz
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

            <div className="mt-6 p-4 glass-card rounded-xl">
              <h3 className="heading-small text-white mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Quiz Features:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-neonGreen-400" />
                  <span>10 adaptive questions</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-purple-400" />
                  <span>4 answer options per question</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-orange-400" />
                  <span>10-minute time limit</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-neon-400" />
                  <span>Instant score & feedback</span>
                </div>
                <div className="flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-yellow-400" />
                  <span>AI-powered generation</span>
                </div>
                <div className="flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-cyan-400" />
                  <span>Hints available</span>
                </div>
              </div>
            </div>

            {/* Quiz History */}
            {quizHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="heading-small text-white mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Recent Quiz Attempts
                </h3>
                <div className="space-y-2">
                  {quizHistory.slice(0, 3).map((quiz, index) => (
                    <div key={index} className="glass-card p-3 rounded-xl hover-lift">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-sm">
                            Score: {quiz.metadata.quizScore}%
                          </div>
                          <div className="text-gray-300 text-xs">
                            {new Date(quiz.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const correctAnswers = quiz.filter((q, index) => selectedAnswers[index] === q.correctAnswer).length;
    const scoreMessage = getScoreMessage(score);
    const skippedCount = selectedAnswers.filter(a => a === -1).length;

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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="card">
            <div className="text-center">
              <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-6 neon-glow-purple">
                <span className="text-4xl">{scoreMessage.emoji}</span>
              </div>
              
              <h2 className="heading-large text-white mb-2">Quiz Complete!</h2>
              
              <div className={`text-6xl font-bold mb-4 ${scoreMessage.color}`}>
                {score}%
              </div>
              
              <p className="heading-medium text-white mb-6">
                {scoreMessage.message}
              </p>

              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neonGreen-400">{correctAnswers}</div>
                  <p className="text-sm text-white">Correct</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{quiz.length - correctAnswers - skippedCount}</div>
                  <p className="text-sm text-white">Incorrect</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{skippedCount}</div>
                  <p className="text-sm text-white">Skipped</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-400">{hintsUsed}</div>
                  <p className="text-sm text-white">Hints Used</p>
                </div>
              </div>

              {/* Review Answers */}
              <div className="mb-8">
                <h3 className="heading-medium text-white mb-4">Review Your Answers</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {quiz.map((question, index) => {
                    const isCorrect = selectedAnswers[index] === question.correctAnswer;
                    return (
                      <div key={index} className={`glass-card p-4 rounded-xl ${
                        isCorrect ? 'border-neonGreen-400/30' : 'border-red-400/30'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-white flex-1">
                            Q{index + 1}: {question.question}
                          </h4>
                          <div className="ml-2">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                optIndex === question.correctAnswer
                                  ? 'bg-green-200 text-green-800 font-medium'
                                  : optIndex === selectedAnswers[index] && !isCorrect
                                  ? 'bg-red-200 text-red-800'
                                  : 'text-gray-600'
                              }`}
                            >
                              {option}
                              {optIndex === question.correctAnswer && ' ✓'}
                              {optIndex === selectedAnswers[index] && !isCorrect && ' ✗'}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={shareQuiz}
                  className="btn-glass flex items-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Score
                </button>
                <button
                  onClick={resetQuiz}
                  className="btn-neon-blue flex-1 flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Generate New Quiz
                </button>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setSelectedAnswers(new Array(quiz.length).fill(null));
                    setTimeLeft(600);
                    setQuizStartTime(new Date());
                    setHintsUsed(0);
                    setQuestionReview([]);
                    setShowHint(false);
                    setIsPaused(false);
                  }}
                  className="btn-glass"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retake
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.length) {
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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-neon-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow-blue">
              <Brain className="w-10 h-10 text-neon-400" />
            </div>
            <h3 className="heading-large text-white mb-3">No quiz available</h3>
            <p className="text-body text-gray-300 mb-6">Please generate a quiz to get started</p>
          </div>
        </div>
      </div>
    );
  }

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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Quiz Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="heading-large text-white mb-1">Quiz: {topic}</h2>
              <p className="text-white">Question {currentQuestion + 1} of {quiz.length}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm">
                <Timer className="w-4 h-4 mr-1" />
                <span className={timeLeft < 60 ? 'text-red-400 font-medium' : 'text-white'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={togglePause}
                className="btn-glass p-2"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={resetQuiz}
                className="btn-glass"
              >
                Exit Quiz
              </button>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>Progress</span>
              <span>{Math.round(((currentQuestion + 1) / quiz.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-neon-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Navigation Dots */}
          <div className="mt-4 flex justify-center space-x-2">
            {quiz.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index <= currentQuestion || selectedAnswers[index] !== null) {
                    setCurrentQuestion(index);
                    setSelectedAnswer(selectedAnswers[index]);
                    setShowHint(false);
                  }
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestion
                    ? 'bg-neon-400'
                    : selectedAnswers[index] !== null
                    ? 'bg-neonGreen-400'
                    : 'bg-gray-600'
                } ${
                  index <= currentQuestion || selectedAnswers[index] !== null ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                title={`Question ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Pause Overlay */}
        {isPaused && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="card text-center">
              <Pause className="w-16 h-16 text-neon-400 mx-auto mb-4" />
              <h3 className="heading-large text-white mb-2">Quiz Paused</h3>
              <p className="text-white mb-6">Take a break - your progress is saved</p>
              <button
                onClick={togglePause}
                className="btn-neon-blue"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Quiz
              </button>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="card mb-6">
          {/* Debug info */}
          <div className="mb-4 p-2 bg-blue-500/20 rounded text-xs text-blue-300">
            DEBUG: Quiz exists - {quiz ? 'YES' : 'NO'}, Length: {quiz?.length || 0}, Current: {currentQuestion}
            {quiz && quiz[currentQuestion] ? `, Question: "${quiz[currentQuestion].question?.substring(0, 50)}..."` : ''}
          </div>
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="heading-medium text-white flex-1">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-neon-500/20 rounded-full text-neon-400 font-bold mr-3">
                  {currentQuestion + 1}
                </span>
                {quiz && quiz[currentQuestion] ? quiz[currentQuestion].question : 'No question available'}
              </h3>
              <button
                onClick={skipQuestion}
                className="btn-glass p-2 text-sm"
                title="Skip question"
              >
                <SkipForward className="w-4 h-4 mr-1" />
                Skip
              </button>
            </div>
            
            {/* Hint Section */}
            {showHint && quiz && quiz[currentQuestion] && quiz[currentQuestion].hint && (
              <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                <div className="flex items-start">
                  <Lightbulb className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-yellow-400 mb-1">Hint:</p>
                    <p className="text-white text-sm">{quiz[currentQuestion].hint}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {/* Debug options */}
              <div className="mb-2 p-2 bg-yellow-500/20 rounded text-xs text-yellow-300">
                DEBUG: Options available - {quiz && quiz[currentQuestion] ? quiz[currentQuestion].options?.length || 0 : 0}
              </div>
              {quiz && quiz[currentQuestion] && quiz[currentQuestion].options ? (
                quiz[currentQuestion].options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedAnswer === index
                        ? 'border-neon-400 bg-neon-400/10 neon-glow-blue'
                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-neon-400 bg-neon-400'
                          : 'border-gray-500'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-white font-medium">{option}</span>
                    </div>
                  </label>
                ))
              ) : (
                <div className="p-4 bg-red-500/20 rounded text-red-300">
                  No options available for this question
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {!showHint && quiz && quiz[currentQuestion] && quiz[currentQuestion].hint && (
                <button
                  onClick={useHint}
                  className="btn-glass text-sm"
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Hint ({hintsUsed + 1})
                </button>
              )}
            </div>
            
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="btn-neon-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
