const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Course = require('../models/Course');
const Flashcard = require('../models/Flashcard');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mock data generator for when API fails
const generateMockStudyMaterial = (topic, difficulty, category) => {
  const topicSpecificContent = {
    'javascript': {
      explanation: `JavaScript is a versatile programming language that enables interactive web pages and is an essential part of web applications. At ${difficulty} level, you'll learn about variables, functions, objects, arrays, DOM manipulation, and modern ES6+ features like arrow functions, promises, and async/await.`,
      keyConcepts: [
        'Variables and Data Types (let, const, var)',
        'Functions and Arrow Functions',
        'Objects and Arrays',
        'DOM Manipulation and Event Handling',
        'Async Programming (Promises, async/await)',
        'ES6+ Features (destructuring, spread operator)'
      ],
      examples: [
        'Example 1: Creating interactive forms with validation',
        'Example 2: Building a simple todo application',
        'Example 3: Fetching data from APIs and displaying it'
      ],
      practiceQuestions: [
        {
          question: 'What is the difference between let, const, and var in JavaScript?',
          answer: 'let allows reassignment but not redeclaration, const prevents both reassignment and redeclaration, and var allows both but has function scope and hoisting issues.'
        },
        {
          question: 'How do you handle asynchronous operations in JavaScript?',
          answer: 'You can handle async operations using callbacks, promises, or async/await syntax. Async/await is the modern approach that makes asynchronous code look synchronous.'
        },
        {
          question: 'What is the DOM and how do you manipulate it with JavaScript?',
          answer: 'The DOM (Document Object Model) represents the HTML structure as a tree of objects. You can manipulate it using methods like getElementById, querySelector, createElement, and properties like innerHTML and textContent.'
        }
      ]
    },
    'react': {
      explanation: `React is a JavaScript library for building user interfaces, particularly single-page applications. At ${difficulty} level, you'll learn about components, state management, props, hooks, and the component lifecycle.`,
      keyConcepts: [
        'Components (Functional and Class)',
        'JSX syntax and expressions',
        'Props and PropTypes',
        'State Management (useState, useReducer)',
        'Hooks (useEffect, useContext, custom hooks)',
        'Component Lifecycle and Performance Optimization'
      ],
      examples: [
        'Example 1: Building a counter component with useState',
        'Example 2: Creating a form with controlled components',
        'Example 3: Fetching data in useEffect and displaying it'
      ],
      practiceQuestions: [
        {
          question: 'What is the difference between props and state in React?',
          answer: 'Props are read-only data passed from parent to child components, while state is mutable data managed within a component that can trigger re-renders when updated.'
        },
        {
          question: 'When should you use useEffect in React?',
          answer: 'useEffect is used for side effects like API calls, subscriptions, or DOM manipulations. It runs after the component renders and can be configured to run only when specific dependencies change.'
        },
        {
          question: 'What is JSX and how does it differ from HTML?',
          answer: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files. It gets compiled to regular JavaScript function calls and supports embedding expressions using curly braces.'
        }
      ]
    },
    'python': {
      explanation: `Python is a high-level, interpreted programming language known for its simplicity and readability. At ${difficulty} level, you'll learn about Python's data types, control flow, functions, object-oriented programming, and popular libraries.`,
      keyConcepts: [
        'Data Types (lists, tuples, dictionaries, sets)',
        'Control Flow (if-else, loops, comprehensions)',
        'Functions and Lambda Functions',
        'Object-Oriented Programming (classes, inheritance)',
        'File Handling and Exception Handling',
        'Popular Libraries (NumPy, Pandas, Matplotlib)'
      ],
      examples: [
        'Example 1: Data analysis with Pandas',
        'Example 2: Building a web scraper with BeautifulSoup',
        'Example 3: Creating visualizations with Matplotlib'
      ],
      practiceQuestions: [
        {
          question: 'What is the difference between a list and a tuple in Python?',
          answer: 'Lists are mutable (can be modified after creation) and use square brackets [], while tuples are immutable (cannot be modified) and use parentheses ().'
        },
        {
          question: 'How do you handle exceptions in Python?',
          answer: 'You handle exceptions using try-except blocks. You can catch specific exceptions or use a general except clause, and optionally include else and finally blocks.'
        },
        {
          question: 'What are list comprehensions and when should you use them?',
          answer: 'List comprehensions are concise ways to create lists using square brackets with an expression followed by a for clause. Use them when you want to create a new list based on existing sequences in a readable, efficient way.'
        }
      ]
    }
  };

  // Default content for topics not in the specific content
  const defaultContent = {
    explanation: `${topic} is a fundamental concept in ${category}. At ${difficulty} level, students should understand the core principles and practical applications. This topic involves various methodologies and best practices that are essential for mastery.`,
    keyConcepts: [
      `Core principles of ${topic}`,
      `Practical applications in ${category}`,
      `Best practices and methodologies`,
      `Common challenges and solutions`
    ],
    examples: [
      `Example 1: Applying ${topic} in real-world scenarios`,
      `Example 2: Problem-solving using ${topic} techniques`,
      `Example 3: Case study from ${category} industry`
    ],
    practiceQuestions: [
      {
        question: `What is the primary purpose of ${topic} in ${category}?`,
        answer: `The primary purpose is to provide efficient solutions and methodologies for addressing complex problems in the field.`
      },
      {
        question: `How does ${topic} compare to alternative approaches?`,
        answer: `${topic} offers unique advantages in terms of efficiency, scalability, and maintainability compared to traditional methods.`
      }
    ]
  };

  // Return topic-specific content if available, otherwise default
  const topicLower = topic.toLowerCase();
  for (const key in topicSpecificContent) {
    if (topicLower.includes(key)) {
      return topicSpecificContent[key];
    }
  }
  return defaultContent;
};

const generateMockQuiz = (topic, questionCount, difficulty) => {
  const topicLower = topic.toLowerCase();
  
  // Dynamic question generation based on topic
  const generateDynamicQuestions = (topic, count) => {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      const questionType = i % 3; // Rotate through different question types
      
      if (topicLower.includes('javascript') || topicLower.includes('js')) {
        if (questionType === 0) {
          questions.push({
            question: `What is the primary purpose of ${topic} in modern web development?`,
            options: [
              `To create interactive and dynamic user interfaces`,
              `To style web pages`,
              `To structure HTML content`,
              `To manage databases`
            ],
            correctAnswer: 0,
            explanation: `${topic} is essential for creating interactive, dynamic user interfaces that respond to user actions and update content without page reloads.`,
            hint: 'Think about what makes websites interactive'
          });
        } else if (questionType === 1) {
          questions.push({
            question: `Which concept in ${topic} is most important for handling asynchronous operations?`,
            options: [`Promises and async/await`, `Synchronous functions`, `CSS styling`, `HTML structure`],
            correctAnswer: 0,
            explanation: `Promises and async/await are fundamental in ${topic} for handling asynchronous operations like API calls and timeouts.`,
            hint: 'Consider how to handle operations that take time'
          });
        } else {
          questions.push({
            question: `How would you optimize performance in a ${topic} application?`,
            options: [
              `Code splitting and lazy loading`,
              `Adding more CSS animations`,
              `Using inline styles everywhere`,
              `Removing all comments`
            ],
            correctAnswer: 0,
            explanation: `Code splitting and lazy loading are key performance optimization techniques in ${topic} applications.`,
            hint: 'Think about reducing initial bundle size'
          });
        }
      } else if (topicLower.includes('react')) {
        if (questionType === 0) {
          questions.push({
            question: `What is the main benefit of using ${topic} hooks?`,
            options: [
              `Using state and lifecycle features in functional components`,
              `Creating better CSS animations`,
              `Improving database performance`,
              `Writing HTML faster`
            ],
            correctAnswer: 0,
            explanation: `${topic} hooks allow functional components to use state and other React features that were previously only available in class components.`,
            hint: 'Hooks changed how we write React components'
          });
        } else if (questionType === 1) {
          questions.push({
            question: `How does ${topic} handle component re-rendering?`,
            options: [
              `When state or props change`,
              `Automatically every second`,
              `Only when clicked`,
              `Never after initial render`
            ],
            correctAnswer: 0,
            explanation: `${topic} re-renders components when their state or props change, ensuring the UI stays in sync with the data.`,
            hint: 'What triggers a component to update?'
          });
        } else {
          questions.push({
            question: `What is virtual DOM in ${topic}?`,
            options: [
              `A JavaScript representation of the real DOM`,
              `A new HTML standard`,
              `A CSS framework`,
              `A database technology`
            ],
            correctAnswer: 0,
            explanation: `The virtual DOM is a JavaScript representation of the real DOM that ${topic} uses to optimize updates.`,
            hint: 'It\'s a "virtual" version of something'
          });
        }
      } else if (topicLower.includes('css')) {
        if (questionType === 0) {
          questions.push({
            question: `How would you create a responsive layout using ${topic}?`,
            options: [
              `Media queries and flexible grids`,
              `Fixed pixel values only`,
              `JavaScript for all styling`,
              `Inline styles for everything`
            ],
            correctAnswer: 0,
            explanation: `Media queries and flexible grids are the foundation of responsive design in ${topic}.`,
            hint: 'Think about different screen sizes'
          });
        } else if (questionType === 1) {
          questions.push({
            question: `What is the cascade in ${topic}?`,
            options: [
              `The algorithm for determining which styles apply`,
              `A waterfall animation effect`,
              `A way to organize CSS files`,
              `A CSS preprocessor`
            ],
            correctAnswer: 0,
            explanation: `The cascade is the algorithm that determines which CSS rules apply when multiple rules match the same element.`,
            hint: 'It decides which style "wins"'
          });
        } else {
          questions.push({
            question: `How do you center an element using ${topic}?`,
            options: [
              `Flexbox or Grid with appropriate alignment`,
              `Only using margin-left auto`,
              `Tables for layout`,
              `Position absolute with fixed coordinates`
            ],
            correctAnswer: 0,
            explanation: `Flexbox and Grid provide modern, powerful ways to center elements in ${topic}.`,
            hint: 'Modern CSS has special layout systems'
          });
        }
      } else if (topicLower.includes('python')) {
        if (questionType === 0) {
          questions.push({
            question: `What makes ${topic} a good choice for data science?`,
            options: [
              `Extensive libraries and simple syntax`,
              `Only works on Windows`,
              `Compiled language for speed`,
              `Built-in database`
            ],
            correctAnswer: 0,
            explanation: `${topic}'s extensive libraries (NumPy, Pandas, etc.) and simple syntax make it ideal for data science.`,
            hint: 'Think about libraries like NumPy and Pandas'
          });
        } else if (questionType === 1) {
          questions.push({
            question: `What are list comprehensions in ${topic}?`,
            options: [
              `A concise way to create lists`,
              `A way to sort lists`,
              `A debugging tool`,
              `A type of loop`
            ],
            correctAnswer: 0,
            explanation: `List comprehensions provide a concise syntax for creating lists based on existing lists.`,
            hint: 'It\'s a compact way to make lists'
          });
        } else {
          questions.push({
            question: `How does ${topic} handle memory management?`,
            options: [
              `Automatic garbage collection`,
              `Manual memory allocation`,
              `No memory management needed`,
              `Reference counting only`
            ],
            correctAnswer: 0,
            explanation: `${topic} uses automatic garbage collection to manage memory allocation and deallocation.`,
            hint: 'You don\'t need to manually free memory'
          });
        }
      } else {
        // Generic questions for any topic
        questions.push({
          question: `What is the primary purpose of ${topic}?`,
          options: [
            `To solve specific problems efficiently`,
            `To replace all other technologies`,
            `To make development slower`,
            `Only for academic purposes`
          ],
          correctAnswer: 0,
          explanation: `The primary purpose of ${topic} is to solve specific problems efficiently in its domain.`,
          hint: 'Think about why this technology exists'
        });
      }
    }
    
    return questions;
  };
  
  // Try to generate dynamic questions first
  let questions = generateDynamicQuestions(topic, questionCount);
  
  // If we don't have enough dynamic questions, fall back to static ones
  if (questions.length < questionCount) {
    const topicSpecificQuestions = {
    'javascript': [
      {
        question: 'What is the difference between == and === in JavaScript?',
        options: [
          '== checks for value equality, === checks for both value and type equality',
          '== checks for type equality, === checks for value equality',
          'Both are exactly the same',
          '== is used for objects, === is used for primitives'
        ],
        correctAnswer: 0,
        explanation: '== performs type coercion before comparison, while === checks for both value and type without coercion.'
      },
      {
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0,
        explanation: 'push() adds one or more elements to the end of an array and returns the new length.'
      },
      {
        question: 'What is a closure in JavaScript?',
        options: [
          'A function that has access to variables in its outer scope even after the outer function has returned',
          'A way to close browser windows',
          'A type of loop',
          'A method for string manipulation'
        ],
        correctAnswer: 0,
        explanation: 'Closures allow functions to access variables from their outer (enclosing) scope even after the outer function has finished executing.'
      },
      {
        question: 'Which of the following is NOT a JavaScript data type?',
        options: ['Number', 'String', 'Float', 'Boolean'],
        correctAnswer: 2,
        explanation: 'JavaScript has Number, String, Boolean, Undefined, Null, Symbol, and BigInt as primitive types. Float is not a separate type - numbers are all floating-point.'
      },
      {
        question: 'What does the "this" keyword refer to in JavaScript?',
        options: [
          'The current object context',
          'The global window object',
          'The function itself',
          'It depends on how the function is called'
        ],
        correctAnswer: 3,
        explanation: 'The value of "this" depends on how a function is called: as a method, as a standalone function, with call/apply, or as a constructor.'
      }
    ],
    'react': [
      {
        question: 'What hook is used for side effects in functional components?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
        explanation: 'useEffect is used to perform side effects in functional components, such as API calls, subscriptions, or DOM manipulations.'
      },
      {
        question: 'What is the purpose of keys in React lists?',
        options: [
          'To style list items',
          'To help React identify which items have changed',
          'To sort the list',
          'To add click handlers'
        ],
        correctAnswer: 1,
        explanation: 'Keys help React identify which items have changed, been added, or been removed, improving performance and preventing bugs.'
      },
      {
        question: 'Which method is used to update state in functional components?',
        options: ['setState()', 'this.setState()', 'useState setter function', 'updateState()'],
        correctAnswer: 2,
        explanation: 'In functional components, you use the setter function returned by useState (e.g., setCount(newValue)) to update state.'
      },
      {
        question: 'What is JSX?',
        options: [
          'A JavaScript XML syntax extension',
          'A styling language',
          'A database query language',
          'A testing framework'
        ],
        correctAnswer: 0,
        explanation: 'JSX is a syntax extension that allows you to write HTML-like code in JavaScript files, making React components more readable.'
      },
      {
        question: 'When should you use useMemo hook?',
        options: [
          'To memoize expensive calculations',
          'To fetch data from APIs',
          'To handle user input',
          'To style components'
        ],
        correctAnswer: 0,
        explanation: 'useMemo is used to memoize expensive calculations so they only re-run when dependencies change, improving performance.'
      }
    ],
    'css': [
      {
        question: 'What does the CSS property "box-sizing: border-box" do?',
        options: [
          'Includes padding and border in the element\'s total width and height',
          'Only includes the content area in width and height calculations',
          'Removes padding and border from the element',
          'Makes the element invisible'
        ],
        correctAnswer: 0,
        explanation: 'border-box includes padding and border in the element\'s total width and height, making layout more predictable.',
        hint: 'Think about how padding and border affect the total size of an element.'
      },
      {
        question: 'Which CSS selector has the highest specificity?',
        options: [
          '.class',
          '#id',
          'element',
          'attribute selector'
        ],
        correctAnswer: 1,
        explanation: 'ID selectors (#id) have the highest specificity among common selectors, followed by class selectors, attribute selectors, and element selectors.',
        hint: 'Remember the hierarchy: ID > class > attribute > element'
      },
      {
        question: 'What is the difference between display: none and visibility: hidden?',
        options: [
          'display: none removes the element from layout, visibility: hidden keeps it',
          'visibility: hidden removes the element from layout, display: none keeps it',
          'Both do the same thing',
          'Neither affects the layout'
        ],
        correctAnswer: 0,
        explanation: 'display: none removes the element entirely from the document flow, while visibility: hidden just hides it but maintains its space.',
        hint: 'One removes the element from layout, the other just hides it visually.'
      },
      {
        question: 'Which CSS unit is relative to the font size of the parent element?',
        options: ['em', 'rem', 'px', 'vh'],
        correctAnswer: 0,
        explanation: 'em is relative to the font size of the parent element, while rem is relative to the root font size.',
        hint: 'em = parent font size, rem = root font size'
      },
      {
        question: 'What does the "z-index" property control?',
        options: [
          'The stacking order of positioned elements',
          'The zoom level of an element',
          'The horizontal position of an element',
          'The opacity of an element'
        ],
        correctAnswer: 0,
        explanation: 'z-index controls the stacking order of positioned elements along the z-axis (front to back).'
      },
      {
        question: 'Which Flexbox property aligns items along the main axis?',
        options: ['justify-content', 'align-items', 'flex-direction', 'flex-wrap'],
        correctAnswer: 0,
        explanation: 'justify-content aligns flex items along the main axis (horizontally by default), while align-items works on the cross axis.'
      },
      {
        question: 'What is the CSS "cascade"?',
        options: [
          'The algorithm that determines which CSS rule applies when multiple rules match',
          'A way to animate CSS properties',
          'A CSS preprocessor',
          'A method for organizing CSS files'
        ],
        correctAnswer: 0,
        explanation: 'The cascade is the algorithm that resolves conflicts when multiple CSS rules apply to the same element, considering specificity, source order, and importance.'
      },
      {
        question: 'Which CSS pseudo-class selects elements that are the first child of their parent?',
        options: [':first-child', ':first-of-type', ':nth-child(1)', ':first'],
        correctAnswer: 0,
        explanation: ':first-child selects an element that is the first child of its parent, regardless of element type.'
      }
    ],
    'python': [
      {
        question: 'What is the output of print(2 ** 3) in Python?',
        options: ['6', '8', '9', 'Error'],
        correctAnswer: 1,
        explanation: '** is the exponentiation operator in Python, so 2 ** 3 equals 8 (2 raised to the power of 3).'
      },
      {
        question: 'Which method is used to add an item to the end of a list?',
        options: ['append()', 'add()', 'insert()', 'extend()'],
        correctAnswer: 0,
        explanation: 'append() adds a single item to the end of a list. insert() adds at a specific position, and extend() adds multiple items.'
      },
      {
        question: 'What is the purpose of __init__ method in Python classes?',
        options: [
          'To initialize object attributes',
          'To delete objects',
          'To compare objects',
          'To convert objects to strings'
        ],
        correctAnswer: 0,
        explanation: '__init__ is a special method called when a new object is created, used to initialize its attributes.'
      },
      {
        question: 'Which statement is used to handle exceptions in Python?',
        options: ['try-except', 'if-else', 'for-while', 'switch-case'],
        correctAnswer: 0,
        explanation: 'try-except blocks are used to handle exceptions and prevent program crashes when errors occur.'
      },
      {
        question: 'What is the difference between list and tuple in Python?',
        options: [
          'Lists are mutable, tuples are immutable',
          'Tuples are mutable, lists are immutable',
          'Both are immutable',
          'Both are mutable'
        ],
        correctAnswer: 0,
        explanation: 'Lists can be modified after creation (mutable), while tuples cannot be changed after creation (immutable).'
      }
    ]
  };

  // Get topic-specific questions if available
  let availableQuestions = [];
  for (const key in topicSpecificQuestions) {
    if (topicLower.includes(key)) {
      availableQuestions = topicSpecificQuestions[key];
      break;
    }
  }

  // Add static questions if available
  if (availableQuestions.length > 0) {
    questions.push(...availableQuestions.slice(0, questionCount - questions.length));
  }

  // Fill remaining with dynamic questions if needed
  while (questions.length < questionCount) {
    const genericQuestion = {
      question: `What is the most important aspect of ${topic} in context ${questions.length + 1}?`,
      options: [
        `Fundamental principle ${questions.length + 1}`,
        `Advanced technique ${questions.length + 1}`,
        `Practical application ${questions.length + 1}`,
        `Theoretical framework ${questions.length + 1}`
      ],
      correctAnswer: questions.length % 4,
      explanation: `This is an important aspect of ${topic} that helps in understanding its core concepts.`
    };
    questions.push(genericQuestion);
  }

  return questions.slice(0, questionCount);
};

const generateMockFlashcards = (topic, cardCount, category) => {
  const topicSpecificFlashcards = {
    'javascript': [
      {
        question: 'What is the difference between let, const, and var in JavaScript?',
        answer: 'let allows reassignment but not redeclaration, const prevents both reassignment and redeclaration, and var allows both but has function scope and hoisting issues.',
        difficulty: 'medium',
        category: 'variables'
      },
      {
        question: 'What is a closure in JavaScript and provide an example?',
        answer: 'A closure is a function that has access to variables in its outer scope even after the outer function has returned. Example: function outer() { let x = 10; return function inner() { return x; }; }',
        difficulty: 'hard',
        category: 'functions'
      },
      {
        question: 'What are the different data types in JavaScript?',
        answer: 'Primitive types: Number, String, Boolean, Undefined, Null, Symbol, BigInt. Reference types: Object, Array, Function, Date, RegExp.',
        difficulty: 'easy',
        category: 'data-types'
      },
      {
        question: 'What is the purpose of async/await in JavaScript?',
        answer: 'async/await is syntactic sugar over promises that makes asynchronous code look and behave like synchronous code, making it easier to read and maintain.',
        difficulty: 'medium',
        category: 'async'
      },
      {
        question: 'What is the DOM and how do you manipulate it?',
        answer: 'DOM (Document Object Model) represents HTML as a tree structure. You can manipulate it using methods like getElementById, querySelector, createElement, and properties like innerHTML and textContent.',
        difficulty: 'medium',
        category: 'dom'
      },
      {
        question: 'What is event bubbling and event capturing?',
        answer: 'Event bubbling: events propagate from target to ancestors. Event capturing: events propagate from ancestors to target. addEventListener with true enables capturing.',
        difficulty: 'hard',
        category: 'events'
      },
      {
        question: 'What are arrow functions and how do they differ from regular functions?',
        answer: 'Arrow functions: shorter syntax, no this binding, no arguments object, no super/constructors. Regular functions: have their own this, arguments, can be used as constructors.',
        difficulty: 'medium',
        category: 'functions'
      },
      {
        question: 'What is the difference between null and undefined?',
        answer: 'undefined: variable declared but not assigned. null: intentional absence of value. typeof undefined is "undefined", typeof null is "object".',
        difficulty: 'easy',
        category: 'data-types'
      }
    ],
    'react': [
      {
        question: 'What is the difference between props and state in React?',
        answer: 'Props are read-only data passed from parent to child components. State is mutable data managed within a component that triggers re-renders when updated.',
        difficulty: 'medium',
        category: 'basics'
      },
      {
        question: 'What are React Hooks and name some commonly used ones?',
        answer: 'Hooks are functions that let you use state and other React features in functional components. Common hooks: useState, useEffect, useContext, useReducer, useMemo, useCallback.',
        difficulty: 'easy',
        category: 'hooks'
      },
      {
        question: 'What is JSX and how does it work?',
        answer: 'JSX is a syntax extension for JavaScript that lets you write HTML-like code. It gets compiled to React.createElement() calls and supports embedding expressions with curly braces.',
        difficulty: 'medium',
        category: 'jsx'
      },
      {
        question: 'What is the purpose of useEffect hook?',
        answer: 'useEffect handles side effects in functional components like API calls, subscriptions, DOM manipulations. It runs after render and can cleanup effects with return function.',
        difficulty: 'medium',
        category: 'hooks'
      },
      {
        question: 'What is the Virtual DOM and how does React use it?',
        answer: 'Virtual DOM is a JavaScript representation of the real DOM. React uses it for efficient updates by comparing changes and only updating the real DOM where necessary.',
        difficulty: 'hard',
        category: 'performance'
      },
      {
        question: 'What are controlled and uncontrolled components?',
        answer: 'Controlled: form data handled by React state. Uncontrolled: form data handled by DOM itself using refs. Controlled components provide more control and validation.',
        difficulty: 'medium',
        category: 'forms'
      },
      {
        question: 'What is the purpose of keys in React lists?',
        answer: 'Keys help React identify which items have changed, been added, or removed. They should be unique among siblings and stable for performance and preventing bugs.',
        difficulty: 'easy',
        category: 'lists'
      },
      {
        question: 'What is React Context and when should you use it?',
        answer: 'Context provides a way to pass data through component tree without prop drilling. Use for global data like themes, user authentication, language preferences.',
        difficulty: 'medium',
        category: 'state-management'
      }
    ],
    'python': [
      {
        question: 'What is the difference between list and tuple in Python?',
        answer: 'Lists are mutable (can be modified) and use square brackets []. Tuples are immutable (cannot be modified) and use parentheses (). Lists have more methods.',
        difficulty: 'easy',
        category: 'data-types'
      },
      {
        question: 'What is __init__ method in Python classes?',
        answer: '__init__ is a special method (constructor) called when creating new objects. It initializes object attributes and sets up the initial state of the object.',
        difficulty: 'medium',
        category: 'oop'
      },
      {
        question: 'How do you handle exceptions in Python?',
        answer: 'Use try-except blocks: try: risky_code except ExceptionType: handle_error. Can include else (runs if no exception) and finally (always runs) blocks.',
        difficulty: 'medium',
        category: 'exceptions'
      },
      {
        question: 'What are list comprehensions and give an example?',
        answer: 'List comprehensions create lists using concise syntax. Example: squares = [x**2 for x in range(10)] creates [0, 1, 4, 9, 16, 25, 36, 49, 64, 81].',
        difficulty: 'easy',
        category: 'lists'
      },
      {
        question: 'What is the difference between __str__ and __repr__ in Python?',
        answer: '__str__ returns user-friendly string representation (str(obj)). __repr__ returns developer-friendly representation that ideally can recreate the object (repr(obj)).',
        difficulty: 'hard',
        category: 'oop'
      },
      {
        question: 'What are decorators in Python?',
        answer: 'Decorators are functions that modify other functions or classes. They use @ syntax and allow adding functionality without changing the original function code.',
        difficulty: 'hard',
        category: 'functions'
      },
      {
        question: 'What is the Global Interpreter Lock (GIL) in Python?',
        answer: 'GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode simultaneously. Limits true parallelism in CPython.',
        difficulty: 'hard',
        category: 'concurrency'
      },
      {
        question: 'What is the difference between shallow copy and deep copy?',
        answer: 'Shallow copy copies references to nested objects (copy.copy()). Deep copy creates independent copies of all objects (copy.deepcopy()). Changes to nested objects affect shallow copy but not deep copy.',
        difficulty: 'medium',
        category: 'memory'
      }
    ]
  };

  const flashcards = [];
  const topicLower = topic.toLowerCase();
  
  // Get topic-specific flashcards if available
  let availableFlashcards = [];
  for (const key in topicSpecificFlashcards) {
    if (topicLower.includes(key)) {
      availableFlashcards = topicSpecificFlashcards[key];
      break;
    }
  }

  // If no topic-specific flashcards found, use generic ones
  if (availableFlashcards.length === 0) {
    for (let i = 0; i < cardCount; i++) {
      flashcards.push({
        question: `What is ${topic} concept ${i + 1} and how does it apply to ${category}?`,
        answer: `${topic} concept ${i + 1} is a fundamental principle that involves understanding core mechanisms and applying them effectively in ${category} contexts. This concept is essential for mastering advanced topics and building comprehensive knowledge.`,
        difficulty: ['easy', 'medium', 'hard'][i % 3],
        category: category
      });
    }
  } else {
    // Use topic-specific flashcards, and cycle through them if needed
    for (let i = 0; i < cardCount; i++) {
      const cardIndex = i % availableFlashcards.length;
      flashcards.push(availableFlashcards[cardIndex]);
    }
  }

  return flashcards;
};

const generateMockChatResponse = (message, courseTitle) => {
  const messageLower = message.toLowerCase();
  
  // Topic-specific responses
  if (messageLower.includes('javascript') || messageLower.includes('js')) {
    return `Great question about JavaScript! ${courseTitle ? `In the context of ${courseTitle}, ` : ''}JavaScript is a versatile programming language that powers interactive web experiences. The key concepts you should focus on include understanding variables, functions, objects, and especially modern ES6+ features like arrow functions and async/await. These fundamentals will help you build dynamic applications and understand more advanced frameworks like React or Vue.js. Would you like me to elaborate on any specific JavaScript concept?`;
  }
  
  if (messageLower.includes('react')) {
    return `Excellent question about React! ${courseTitle ? `For ${courseTitle}, ` : ''}React is a powerful JavaScript library for building user interfaces. The core concepts you need to master are components (functional vs class), state management with hooks like useState and useEffect, props for data flow, and understanding the component lifecycle. React's component-based architecture makes it easier to build and maintain complex UIs. Are you curious about any specific React hooks or concepts?`;
  }
  
  if (messageLower.includes('python')) {
    return `Great question about Python! ${courseTitle ? `In ${courseTitle}, ` : ''}Python is known for its simplicity and readability, making it perfect for beginners. You'll want to focus on understanding Python's data types (lists, tuples, dictionaries), control flow structures, functions, and especially object-oriented programming concepts with classes. Python's extensive library ecosystem for data science, web development, and automation makes it incredibly versatile. What specific Python topic would you like to explore deeper?`;
  }
  
  if (messageLower.includes('html') || messageLower.includes('css')) {
    return `Good question about web fundamentals! ${courseTitle ? `In ${courseTitle}, ` : ''}HTML provides the structure of web pages while CSS handles the styling and layout. Understanding semantic HTML5 tags and modern CSS features like Flexbox and Grid is crucial for creating responsive, accessible websites. These technologies work together with JavaScript to create complete web applications. Would you like to know more about specific HTML elements or CSS techniques?`;
  }
  
  // Generic responses for other topics
  const genericResponses = [
    `That's a great question about ${message.split(' ').slice(-2).join(' ')}! ${courseTitle ? `In the context of ${courseTitle}, ` : ''}This concept is fundamental to building a strong foundation. Let me break it down: understanding the core principles first will help you grasp more advanced topics later. The key is to practice applying these concepts in real scenarios.`,
    `I understand you're asking about ${message.split(' ').slice(-2).join(' ')}. ${courseTitle ? `For ${courseTitle}, ` : ''}This is an important topic that connects theory with practical application. The best approach is to start with the basics, understand the "why" behind the concept, and then work through examples. This will help you retain the knowledge better.`,
    `Excellent question! ${message.split(' ').slice(-2).join(' ')} ${courseTitle ? `relates directly to what we're studying in ${courseTitle}. ` : ''}Think of this concept as a building block - mastering it will make understanding more complex topics much easier. Focus on understanding the fundamentals first, then gradually move to more advanced applications.`
  ];
  
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
};

// Test study material endpoint without authentication
router.post('/generate-study-material-test', async (req, res) => {
  try {
    const { courseId, topic, difficulty = 'intermediate' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    // Mock response for testing
    const mockStudyMaterial = {
      id: 'test-' + Date.now(),
      explanation: `This is a comprehensive explanation of ${topic} at ${difficulty} level. The topic covers fundamental concepts and practical applications that are essential for understanding.`,
      keyConcepts: [
        `Core principles of ${topic}`,
        `Practical applications`,
        `Best practices`,
        `Common patterns`
      ],
      examples: [
        `Example 1: Basic ${topic} implementation`,
        `Example 2: Advanced ${topic} techniques`,
        `Example 3: Real-world ${topic} usage`
      ],
      practiceQuestions: [
        {
          question: `What is the primary purpose of ${topic}?`,
          answer: `The primary purpose is to provide efficient solutions and methodologies.`
        },
        {
          question: `How would you apply ${topic} in practice?`,
          answer: `You would apply ${topic} by following established best practices and patterns.`
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

// Test quiz endpoint without authentication
router.post('/generate-quiz-test', async (req, res) => {
  try {
    const { courseId, topic, questionCount = 5, difficulty = 'medium' } = req.body;

    console.log('Test quiz generation:', { courseId, topic, questionCount, difficulty });

    if (!courseId || !topic) {
      return res.status(400).json({ message: 'Course ID and topic are required' });
    }

    // For testing, skip course validation and use mock data
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

// Test flashcard endpoint without authentication
router.post('/generate-flashcards-test', async (req, res) => {
  try {
    const { courseId, topic, cardCount = 10 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    // Mock response for testing
    const mockFlashcards = [
      {
        _id: 'test-' + Date.now() + '-1',
        question: `What is ${topic} and why is it important?`,
        answer: `${topic} is a fundamental concept that enables efficient development and maintenance of modern applications.`,
        difficulty: 'easy',
        category: 'basics',
        isAIGenerated: true
      },
      {
        _id: 'test-' + Date.now() + '-2',
        question: `How do you implement ${topic} in a project?`,
        answer: `Implementation involves understanding the core principles and applying them systematically to achieve desired outcomes.`,
        difficulty: 'medium',
        category: 'implementation',
        isAIGenerated: true
      },
      {
        _id: 'test-' + Date.now() + '-3',
        question: `What are the best practices for ${topic}?`,
        answer: `Best practices include following established patterns, maintaining clean code, and continuously optimizing for performance.`,
        difficulty: 'medium',
        category: 'best-practices',
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

// Generate study material
router.post('/generate-study-material', auth, async (req, res) => {
  try {
    const { courseId, topic, difficulty = 'intermediate' } = req.body;

    if (!courseId || !topic) {
      return res.status(400).json({ message: 'Course ID and topic are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Generate comprehensive study material for the topic "${topic}" at ${difficulty} level. 
    The material should be suitable for a course in ${course.category}. 
    Include:
    1. Detailed explanation (500-800 words)
    2. Key concepts (3-5 bullet points)
    3. Examples or case studies
    4. Practice questions (3 questions with answers)
    
    Format the response in JSON structure like:
    {
      "explanation": "...",
      "keyConcepts": ["...", "..."],
      "examples": ["...", "..."],
      "practiceQuestions": [
        {
          "question": "...",
          "answer": "..."
        }
      ]
    }`;

    let studyMaterial;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        studyMaterial = JSON.parse(text);
      } catch (parseError) {
        // Fallback: create structured response from plain text
        studyMaterial = {
          explanation: text,
          keyConcepts: [],
          examples: [],
          practiceQuestions: []
        };
      }
    } catch (apiError) {
      console.log('API Error, using mock data:', apiError.message);
      // Use mock data as fallback
      studyMaterial = generateMockStudyMaterial(topic, difficulty, course.category);
    }

    // Log activity
    await Activity.create({
      user: req.user._id,
      type: 'study_material_generated',
      metadata: {
        courseId,
        materialType: 'study_material',
        topic
      }
    });

    res.json({
      message: 'Study material generated successfully',
      studyMaterial
    });
  } catch (error) {
    console.error('Generate study material error:', error);
    res.status(500).json({ message: 'Server error while generating study material' });
  }
});

// Test quiz endpoint without authentication
router.post('/generate-quiz-test', async (req, res) => {
  try {
    const { courseId, topic, questionCount = 5, difficulty = 'medium' } = req.body;

    console.log('Test quiz generation:', { courseId, topic, questionCount, difficulty });

    if (!courseId || !topic) {
      return res.status(400).json({ message: 'Course ID and topic are required' });
    }

    // For testing, skip course validation and use mock data
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

// Generate quiz
router.post('/generate-quiz', auth, async (req, res) => {
  try {
    const { courseId, topic, questionCount = 5, difficulty = 'medium' } = req.body;

    if (!courseId || !topic) {
      return res.status(400).json({ message: 'Course ID and topic are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Generate ${questionCount} high-quality, realistic multiple choice questions about "${topic}" at ${difficulty} level for ${course.category}.
    Each question should test practical knowledge and understanding, not just memorization.
    
    Requirements:
    1. Questions should be specific and relevant to ${topic}
    2. Options should be plausible but clearly distinguishable
    3. Only one correct answer per question
    4. Include detailed explanations for the correct answer
    5. Questions should cover different aspects of ${topic}
    
    Format the response as a valid JSON array:
    [
      {
        "question": "Specific question about ${topic} that tests understanding",
        "options": [
          "Correct answer or most accurate option",
          "Plausible but incorrect option 1",
          "Plausible but incorrect option 2", 
          "Plausible but incorrect option 3"
        ],
        "correctAnswer": 0,
        "explanation": "Detailed explanation of why the correct answer is right and why others are wrong"
      }
    ]
    
    Make sure the JSON is valid and can be parsed. Do not include any text before or after the JSON array.`;

    let quizQuestions;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      quizQuestions = JSON.parse(text);
    } catch (apiError) {
      console.log('API Error, using mock data:', apiError.message);
      // Use mock data as fallback
      quizQuestions = generateMockQuiz(topic, questionCount, difficulty);
    }

    // Log activity
    await Activity.create({
      user: req.user._id,
      type: 'quiz_attempt',
      metadata: {
        courseId,
        questionCount
      }
    });

    res.json({
      message: 'Quiz generated successfully',
      quiz: quizQuestions
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ message: 'Server error while generating quiz' });
  }
});

// Generate flashcards
router.post('/generate-flashcards', auth, async (req, res) => {
  try {
    const { courseId, topic, cardCount = 10 } = req.body;

    if (!courseId || !topic) {
      return res.status(400).json({ message: 'Course ID and topic are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Generate ${cardCount} high-quality, educational flashcards for studying "${topic}" in ${course.category}.
    Each flashcard should test important concepts, definitions, or practical applications.
    
    Requirements:
    1. Questions should be clear, specific, and test understanding of ${topic}
    2. Answers should be comprehensive yet concise
    3. Include a mix of definitions, concepts, and practical applications
    4. Assign appropriate difficulty levels (easy, medium, hard)
    5. Group related concepts into categories
    
    Format the response as a valid JSON array:
    [
      {
        "question": "Clear, specific question about ${topic}",
        "answer": "Comprehensive answer that explains the concept thoroughly",
        "difficulty": "easy|medium|hard",
        "category": "specific subtopic or concept area"
      }
    ]
    
    Make sure the JSON is valid and can be parsed. Do not include any text before or after the JSON array.`;

    let flashcardsData;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      flashcardsData = JSON.parse(text);
    } catch (apiError) {
      console.log('API Error, using mock data:', apiError.message);
      // Use mock data as fallback
      flashcardsData = generateMockFlashcards(topic, cardCount, course.category);
    }

    // Save flashcards to database
    const flashcards = await Flashcard.insertMany(
      flashcardsData.map(card => ({
        user: req.user._id,
        course: courseId,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || 'medium',
        category: card.category || topic,
        isAIGenerated: true
      }))
    );

    // Log activity
    await Activity.create({
      user: req.user._id,
      type: 'flashcard_review',
      metadata: {
        courseId,
        flashcardCount: flashcards.length
      }
    });

    res.json({
      message: 'Flashcards generated successfully',
      flashcards
    });
  } catch (error) {
    console.error('Generate flashcards error:', error);
    res.status(500).json({ message: 'Server error while generating flashcards' });
  }
});

// Chatbot endpoint
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, courseId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    let context = '';
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        context = `Context: This conversation is about the course "${course.title}" in ${course.category}. `;
      }
    }

    const prompt = `${context}You are an expert AI tutor specializing in ${course?.category || 'education'}. Your role is to help students understand concepts clearly and effectively.

Student's question: "${message}"

Please provide a response that:
1. Directly answers the question with clear explanations
2. Provides relevant examples or analogies when helpful
3. Breaks down complex concepts into understandable parts
4. Encourages further learning and critical thinking
5. Is conversational and supportive in tone
6. Is comprehensive but not overly lengthy (2-4 paragraphs maximum)

Focus on being educational, practical, and engaging. If the question is unclear, ask for clarification. If it's about a specific programming concept, include code examples when relevant.`;

    let responseText;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      responseText = response.text();
    } catch (apiError) {
      console.log('API Error, using mock data:', apiError.message);
      // Use mock data as fallback
      const courseTitle = context ? context.split('"')[1] : null;
      responseText = generateMockChatResponse(message, courseTitle);
    }

    // Log activity
    await Activity.create({
      user: req.user._id,
      type: 'chatbot_message',
      metadata: {
        courseId,
        messageCount: 1
      }
    });

    res.json({
      message: 'Response generated successfully',
      response: responseText
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error while processing chat message' });
  }
});

module.exports = router;
