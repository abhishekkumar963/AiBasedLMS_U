const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Activity = require('../models/Activity');
const Course = require('../models/Course');
// const auth = require('../middleware/auth');

// Helper function to extract JSON from Gemini response
const extractJSON = (text) => {
  let jsonText = text.trim();

  // Extract JSON from markdown code blocks if present
  if (jsonText.includes('```json')) {
    const parts = jsonText.split('```json');
    if (parts.length > 1) {
      const codeBlock = parts[1];
      const endBlock = codeBlock.indexOf('```');
      if (endBlock !== -1) {
        jsonText = codeBlock.substring(0, endBlock).trim();
      }
    }
  } else if (jsonText.includes('```')) {
    const parts = jsonText.split('```');
    if (parts.length > 1) {
      jsonText = parts[1].trim();
    }
  }

  return jsonText;
};

// Initialize Gemini AI with optimized configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetriableAIError = (error) => {
  const message = (error?.message || '').toLowerCase();
  return message.includes('503') || message.includes('high demand') || message.includes('service unavailable');
};

const getAIErrorResponse = (error, fallbackMessage) => {
  const message = error?.message || '';
  const lower = message.toLowerCase();

  if (lower.includes('429') || lower.includes('quota') || lower.includes('too many requests')) {
    return {
      status: 429,
      message: 'AI service is temporarily rate-limited. Please wait a few seconds and try again.'
    };
  }

  if (lower.includes('503') || lower.includes('high demand') || lower.includes('service unavailable')) {
    return {
      status: 503,
      message: 'AI service is under high demand right now. Please retry shortly.'
    };
  }

  return {
    status: 502,
    message: fallbackMessage
  };
};

const generateWithRetry = async (model, prompt, timeoutMs = 60000, maxAttempts = 3) => {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await withTimeout(model.generateContent(prompt), timeoutMs);
    } catch (error) {
      lastError = error;
      if (!isRetriableAIError(error) || attempt === maxAttempts) {
        throw error;
      }
      await sleep(700 * attempt);
    }
  }

  throw lastError || new Error('AI generation failed after retries');
};

const parseJSONResponse = (text) => {
  // First try direct parse (best for responseMimeType JSON)
  try {
    return JSON.parse(text);
  } catch (directParseError) {
    // Fallback to extracted code block JSON
    const jsonText = extractJSON(text);
    return JSON.parse(jsonText);
  }
};

const generateStructuredContent = async (prompt, maxOutputTokens = 1500, fallbackPrompt = null) => {
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens,
          candidateCount: 1,
          responseMimeType: 'application/json'
        }
      });

      const result = await generateWithRetry(model, prompt, 60000);
      const text = result.response.text();
      return parseJSONResponse(text);
    } catch (error) {
      lastError = error;
      console.warn(`AI generation failed with ${modelName}:`, error.message);
      if (fallbackPrompt) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens,
              candidateCount: 1,
              responseMimeType: 'application/json'
            }
          });
          const retryResult = await generateWithRetry(model, fallbackPrompt, 60000);
          const retryText = retryResult.response.text();
          return parseJSONResponse(retryText);
        } catch (retryError) {
          lastError = retryError;
          console.warn(`AI retry failed with ${modelName}:`, retryError.message);
        }
      }
    }
  }

  throw lastError || new Error('Failed to generate AI content');
};

const normalizeQuizQuestions = (quizData) => {
  if (Array.isArray(quizData)) return quizData;
  if (Array.isArray(quizData?.questions)) return quizData.questions;
  return [];
};

const normalizeFlashcards = (flashcardData) => {
  if (Array.isArray(flashcardData)) return flashcardData;
  if (Array.isArray(flashcardData?.flashcards)) return flashcardData.flashcards;
  return [];
};

const generateTextContent = async (prompt, maxOutputTokens = 700) => {
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens,
          candidateCount: 1
        }
      });

      const result = await generateWithRetry(model, prompt, 60000);
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.warn(`Chat generation failed with ${modelName}:`, error.message);
    }
  }

  throw lastError || new Error('Failed to generate chat response');
};

const getPlatformHelpResponse = async (message) => {
  const query = message.toLowerCase();

  if (query.includes('enroll') || query.includes('join course') || query.includes('enrol')) {
    return `To enroll in a course:
1) Open the Courses page from the top menu.
2) Choose a course and open its details.
3) Click the Enroll button.
4) Once enrolled, the course appears in your dashboard and My Courses list.

If you cannot enroll, check that you're logged in and try refreshing once.`;
  }

  if (query.includes('course') && (query.includes('provided') || query.includes('available') || query.includes('offer'))) {
    const courses = await Course.find({ isPublished: true }).select('title category level').limit(8);
    if (!courses.length) {
      return 'We currently do not have published courses visible right now. Please check again shortly.';
    }

    const list = courses
      .map((course, index) => `${index + 1}. ${course.title} (${course.category}, ${course.level})`)
      .join('\n');

    return `Here are some available courses right now:\n${list}\n\nYou can view the full list in the Courses section.`;
  }

  if (query.includes('ai study') || (query.includes('study') && query.includes('ai'))) {
    return `AI Study helps you generate topic-based learning material instantly.
- Select a course
- Enter a topic (for example: React Hooks)
- Choose difficulty
- Click Generate Material

You will get explanation, key concepts, examples, and practice questions for revision.`;
  }

  if (query.includes('quiz') && (query.includes('work') || query.includes('how'))) {
    return `Quiz works like this:
- Select a course and enter a topic
- System generates 10 AI questions with 4 options each
- Attempt questions and submit
- You get instant score, correct answers, and explanations at the end.`;
  }

  if (query.includes('flashcard') && (query.includes('work') || query.includes('how'))) {
    return `Flashcards are generated by topic for fast revision:
- Select a course
- Enter a topic and number of cards
- Generate flashcards
- Flip cards, review answers, and mark your confidence while studying.`;
  }

  if (query.includes('profile') && (query.includes('update') || query.includes('edit') || query.includes('change'))) {
    return `To update your profile:
1) Go to your profile/account settings page.
2) Edit your details (bio, education, interests, social links, etc.).
3) Save changes.

You can also update profile photo from the same section.`;
  }

  return null;
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
      const prompt = `Generate study material about "${topic}" (${difficulty} level).
      
      JSON format:
      {
        "explanation": "detailed explanation",
        "keyConcepts": ["concept1", "concept2", "concept3"],
        "examples": ["example1", "example2"],
        "practiceQuestions": [{"question": "q1", "answer": "a1"}]
      }`;

      const fallbackPrompt = `Return only valid JSON. Topic: "${topic}". Difficulty: "${difficulty}".
Schema:
{
  "explanation": "string",
  "keyConcepts": ["string","string","string"],
  "examples": ["string","string"],
  "practiceQuestions": [{"question":"string","answer":"string"}]
}`;
      const studyMaterial = await generateStructuredContent(prompt, 2000, fallbackPrompt);
      
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

      const errorResponse = getAIErrorResponse(
        aiError,
        'Unable to generate study material from AI right now. Please try again.'
      );
      return res.status(errorResponse.status).json({ message: errorResponse.message });
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

      const fallbackPrompt = `Return only valid JSON for a ${questionCount}-question quiz on "${topic}" (${difficulty}).
Keep each explanation concise (max 25 words) to avoid truncation.
Schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["string","string","string","string"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]
}`;
      const quizData = await generateStructuredContent(prompt, 3200, fallbackPrompt);
      const questions = normalizeQuizQuestions(quizData);
      if (!questions.length) {
        throw new Error('AI returned invalid quiz format');
      }
      
      // Cache the result
      setCachedData(cacheKey, questions);
      
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
        quiz: questions
      });
      
    } catch (aiError) {
      console.error('AI generation failed:', aiError);

      const errorResponse = getAIErrorResponse(
        aiError,
        'Unable to generate quiz from AI right now. Please try again.'
      );
      return res.status(errorResponse.status).json({ message: errorResponse.message });
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

      const fallbackPrompt = `Return only valid JSON with ${cardCount} flashcards for topic "${topic}".
Schema:
{
  "flashcards": [
    {
      "question": "string",
      "answer": "string",
      "difficulty": "easy|medium|hard",
      "category": "string"
    }
  ]
}`;
      const flashcardData = await generateStructuredContent(prompt, 1500, fallbackPrompt);
      const flashcards = normalizeFlashcards(flashcardData);
      if (!flashcards.length) {
        throw new Error('AI returned invalid flashcard format');
      }
      
      // Cache the result
      setCachedData(cacheKey, flashcards);
      
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
        flashcards
      });
      
    } catch (aiError) {
      console.error('AI generation failed:', aiError);

      const errorResponse = getAIErrorResponse(
        aiError,
        'Unable to generate flashcards from AI right now. Please try again.'
      );
      return res.status(errorResponse.status).json({ message: errorResponse.message });
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

// AI Assistant chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, courseId } = req.body;
    const user = req.user;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Provide guaranteed product-help answers for common platform questions
    const helpResponse = await getPlatformHelpResponse(message);
    if (helpResponse) {
      if (user?._id) {
        await Activity.create({
          user: user._id,
          type: 'chatbot_message',
          metadata: { courseId, messageCount: 1, source: 'platform_help' }
        });
      }

      return res.json({
        message: 'Response generated successfully',
        response: helpResponse
      });
    }

    let courseContext = '';
    if (courseId) {
      const course = await Course.findById(courseId).select('title category');
      if (course) {
        courseContext = `Context course: ${course.title} (${course.category}). `;
      }
    }

    const prompt = `${courseContext}You are an educational assistant inside an LMS app.
Answer the user's question clearly and practically in 4-8 lines.
If they ask how to use a feature, provide step-by-step guidance.

User question: "${message}"`;

    let responseText;
    try {
      responseText = await generateTextContent(prompt, 800);
    } catch (aiError) {
      console.error('Chat AI generation failed:', aiError);
      responseText = `I can still help with platform guidance.
Try asking things like:
- How to enroll in a course
- What courses are available
- How AI Study works
- How Quiz works
- How Flashcards work
- How to update profile`;
    }

    if (user?._id) {
      await Activity.create({
        user: user._id,
        type: 'chatbot_message',
        metadata: { courseId, messageCount: 1, source: 'ai_chat' }
      });
    }

    return res.json({
      message: 'Response generated successfully',
      response: responseText
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ message: 'Server error while processing chat message' });
  }
});

module.exports = router;
