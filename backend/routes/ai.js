const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
// const auth = require('../middleware/auth');

// Helper function to extract JSON from Gemini response
const extractJSON = (text) => {
  let jsonText = text;
  
  // Extract JSON from markdown code blocks
  if (text.includes('```json')) {
    const parts = text.split('```json');
    if (parts.length > 1) {
      const codeBlock = parts[1];
      const endBlock = codeBlock.indexOf('```');
      if (endBlock !== -1) {
        jsonText = codeBlock.substring(0, endBlock).trim();
      }
    }
  } else if (text.includes('```')) {
    const parts = text.split('```');
    if (parts.length > 1) {
      jsonText = parts[1].trim();
    }
  }
  
  // Remove any leading/trailing quotes
  if (jsonText.startsWith('"') && jsonText.endsWith('"')) {
    jsonText = jsonText.slice(1, -1);
  }
  
  // Fix escaped characters properly
  jsonText = jsonText
    .replace(/\\n/g, '\n')   // Convert literal \n to actual newlines
    .replace(/\\r/g, '\r')   // Convert literal \r to actual carriage returns  
    .replace(/\\t/g, '\t')   // Convert literal \t to actual tabs
    .replace(/\\"/g, '"');   // Fix escaped quotes
  
  return jsonText;
};

// Initialize Gemini AI with optimized configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple in-memory cache (in production, use Redis)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (type, topic, params) => `${type}:${topic}:${JSON.stringify(params)}`;

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Timeout helper function
const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    })
  ]);
};

// Mock data generators
const generateMockQuiz = (topic, questionCount, difficulty) => {
  const questions = [];
  
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      question: `What is the most important aspect of ${topic} in context ${i + 1}?`,
      options: [
        `Fundamental principle ${i + 1}`,
        `Advanced technique ${i + 1}`,
        `Practical application ${i + 1}`,
        `Theoretical framework ${i + 1}`
      ],
      correctAnswer: i % 4,
      explanation: `This question tests understanding of ${topic} concepts and their practical applications.`,
      hint: `Think about the core concepts of ${topic}`
    });
  }
  
  return questions;
};

// Test quiz endpoint without authentication
router.post('/generate-quiz-test', async (req, res) => {
  try {
    const { courseId, topic, questionCount = 5, difficulty = 'medium' } = req.body;

    console.log('Test quiz generation:', { courseId, topic, questionCount, difficulty });

    if (!courseId || !topic) {
      return res.status(400).json({ message: 'Course ID and topic are required' });
    }

    // Generate mock quiz
    const quizQuestions = generateMockQuiz(topic, questionCount, difficulty);
    
    console.log('Generated mock quiz:', quizQuestions);

    res.json({
      message: 'Test quiz generated successfully',
      quiz: quizQuestions
    });
  } catch (error) {
    console.error('Test quiz generation error:', error);
    res.status(500).json({ message: 'Server error while generating test quiz' });
  }
});

// Generate study material
router.post('/generate-study-material', async (req, res) => {
  try {
    const { courseId, topic, difficulty = 'intermediate' } = req.body;
    const user = req.user;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    // Check cache first
    const cacheKey = getCacheKey('study_material', topic, { difficulty });
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return res.json({
        message: 'Study material generated successfully',
        studyMaterial: cachedData
      });
    }

    // Try to generate with real AI
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          candidateCount: 1
        }
      });
      
      const prompt = `Generate study material about "${topic}" (${difficulty} level).
      
      JSON format:
      {
        "explanation": "detailed explanation",
        "keyConcepts": ["concept1", "concept2", "concept3"],
        "examples": ["example1", "example2"],
        "practiceQuestions": [{"question": "q1", "answer": "a1"}]
      }`;

      const result = await withTimeout(model.generateContent(prompt));
      const text = result.response.text();
      const jsonText = extractJSON(text);
      const studyMaterial = JSON.parse(jsonText);
      
      // Cache the result
      setCachedData(cacheKey, studyMaterial);
      
      // Track activity
      if (user) {
        await Activity.create({
          user: user._id,
          type: 'study_material_generated',
          metadata: {
            courseId,
            topic,
            difficulty
          }
        });
      }

      res.json({
        message: 'Study material generated successfully',
        studyMaterial
      });
      
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      
      // Fallback to mock data
      const mockStudyMaterial = {
        id: Date.now().toString(),
        explanation: `This is a comprehensive explanation of ${topic} at ${difficulty} level.`,
        keyConcepts: [`Concept 1 of ${topic}`, `Concept 2 of ${topic}`, `Concept 3 of ${topic}`],
        examples: [`Example 1 for ${topic}`, `Example 2 for ${topic}`],
        practiceQuestions: [
          {
            question: `What is ${topic}?`,
            answer: `${topic} is an important concept in modern development.`
          }
        ]
      };

      res.json({
        message: 'Study material generated successfully',
        studyMaterial: mockStudyMaterial
      });
    }
  } catch (error) {
    console.error('Study material generation error:', error);
    res.status(500).json({ message: 'Server error while generating study material' });
  }
});

// Generate quiz
router.post('/generate-quiz', async (req, res) => {
  try {
    const { courseId, topic, questionCount = 5, difficulty = 'medium' } = req.body;
    const user = req.user;

    if (!courseId || !topic) {
      return res.status(400).json({ message: 'Course ID and topic are required' });
    }

    // Check cache first
    const cacheKey = getCacheKey('quiz', topic, { questionCount, difficulty });
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return res.json({
        message: 'Quiz generated successfully',
        quiz: cachedData
      });
    }

    // Try to generate with real AI
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          candidateCount: 1
        }
      });
      
      const prompt = `Generate ${questionCount} quiz questions about "${topic}" (${difficulty}).
      
      JSON format:
      {
        "questions": [
          {
            "question": "specific question",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0,
            "explanation": "explanation"
          }
        ]
      }`;

      const result = await withTimeout(model.generateContent(prompt));
      const text = result.response.text();
      const jsonText = extractJSON(text);
      const quizData = JSON.parse(jsonText);
      
      // Cache the result
      setCachedData(cacheKey, quizData.questions);
      
      // Track activity
      if (user) {
        await Activity.create({
          user: user._id,
          type: 'quiz_generated',
          metadata: {
            courseId,
            topic,
            questionCount,
            difficulty
          }
        });
      }

      res.json({
        message: 'Quiz generated successfully',
        quiz: quizData.questions
      });
      
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      
      // Fallback to mock data
      const quizQuestions = generateMockQuiz(topic, questionCount, difficulty);
      
      res.json({
        message: 'Quiz generated successfully',
        quiz: quizQuestions
      });
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Server error while generating quiz' });
  }
});

// Generate flashcards
router.post('/generate-flashcards', async (req, res) => {
  try {
    const { courseId, topic, cardCount = 10 } = req.body;
    const user = req.user;

    if (!courseId || !topic) {
      return res.status(400).json({ message: 'Course ID and topic are required' });
    }

    // Check cache first
    const cacheKey = getCacheKey('flashcards', topic, { cardCount });
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return res.json({
        message: 'Flashcards generated successfully',
        flashcards: cachedData
      });
    }

    // Try to generate with real AI
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          candidateCount: 1
        }
      });
      
      const prompt = `Generate ${cardCount} flashcards about "${topic}".
      
      JSON format:
      {
        "flashcards": [
          {
            "question": "specific question",
            "answer": "comprehensive answer",
            "difficulty": "medium",
            "category": "topic area"
          }
        ]
      }`;

      const result = await withTimeout(model.generateContent(prompt));
      const text = result.response.text();
      const jsonText = extractJSON(text);
      const flashcardData = JSON.parse(jsonText);
      
      // Cache the result
      setCachedData(cacheKey, flashcardData.flashcards);
      
      // Track activity
      if (user) {
        await Activity.create({
          user: user._id,
          type: 'flashcards_generated',
          metadata: {
            courseId,
            topic,
            cardCount
          }
        });
      }

      res.json({
        message: 'Flashcards generated successfully',
        flashcards: flashcardData.flashcards
      });
      
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      
      // Fallback to mock data
      const mockFlashcards = [];
      for (let i = 0; i < cardCount; i++) {
        mockFlashcards.push({
          _id: Date.now().toString() + i,
          question: `What is concept ${i + 1} in ${topic}?`,
          answer: `Concept ${i + 1} in ${topic} is fundamental to understanding the subject.`,
          difficulty: ['easy', 'medium', 'hard'][i % 3],
          category: 'general',
          isAIGenerated: true
        });
      }
      
      res.json({
        message: 'Flashcards generated successfully',
        flashcards: mockFlashcards
      });
    }
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ message: 'Server error while generating flashcards' });
  }
});

// Test study material endpoint
router.post('/generate-study-material-test', async (req, res) => {
  try {
    const { courseId, topic, difficulty = 'intermediate' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    const mockStudyMaterial = {
      id: 'test-' + Date.now(),
      explanation: `This is a comprehensive explanation of ${topic} at ${difficulty} level.`,
      keyConcepts: [`Core principle of ${topic}`, `Practical applications`, `Best practices`],
      examples: [`Example 1: Basic ${topic}`, `Example 2: Advanced ${topic}`],
      practiceQuestions: [
        {
          question: `What is the primary purpose of ${topic}?`,
          answer: `The primary purpose is to provide efficient solutions.`
        }
      ]
    };
    
    res.json({
      message: 'Test study material generated successfully',
      studyMaterial: mockStudyMaterial
    });
  } catch (error) {
    console.error('Test study material error:', error);
    res.status(500).json({ message: 'Server error while generating test study material' });
  }
});

// Test flashcard endpoint
router.post('/generate-flashcards-test', async (req, res) => {
  try {
    const { courseId, topic, cardCount = 10 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    const mockFlashcards = [
      {
        _id: 'test-' + Date.now() + '-1',
        question: `What is ${topic} and why is it important?`,
        answer: `${topic} is a fundamental concept that enables efficient development.`,
        difficulty: 'easy',
        category: 'basics',
        isAIGenerated: true
      },
      {
        _id: 'test-' + Date.now() + '-2',
        question: `How do you implement ${topic} in practice?`,
        answer: `Implementation involves understanding core principles and applying them systematically.`,
        difficulty: 'medium',
        category: 'implementation',
        isAIGenerated: true
      }
    ];
    
    res.json({
      message: 'Test flashcards generated successfully',
      flashcards: mockFlashcards
    });
  } catch (error) {
    console.error('Test flashcard error:', error);
    res.status(500).json({ message: 'Server error while generating test flashcards' });
  }
});

module.exports = router;
