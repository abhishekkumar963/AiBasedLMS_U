const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-lms');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();

    // Create student user
    const studentUser = new User({
      name: 'Student User',
      email: 'student@demo.com',
      password: 'student123',
      role: 'student'
    });
    await studentUser.save();

    // Create mock courses
    const courses = [
      {
        title: 'Introduction to JavaScript',
        description: 'Learn the fundamentals of JavaScript programming, from basic syntax to advanced concepts like closures and prototypes.',
        category: 'Programming',
        level: 'Beginner',
        duration: 40,
        instructor: {
          name: 'John Smith',
          email: 'john.smith@example.com',
          bio: 'Senior JavaScript Developer with 10+ years of experience'
        },
        thumbnail: '/course-images/web-development-course.svg',
        price: 0,
        rating: 4.5,
        isPublished: true,
        tags: ['javascript', 'programming', 'web development'],
        modules: [
          {
            title: 'Getting Started with JavaScript',
            description: 'Introduction to JavaScript and setting up your development environment',
            order: 1,
            content: {
              text: 'JavaScript is a versatile programming language that powers the interactive web. In this module, you\'ll learn the basics of JavaScript syntax, variables, and data types.',
              videoUrl: 'https://example.com/video1',
              resources: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript']
            },
            quiz: {
              questions: [
                {
                  question: 'What is the correct way to declare a variable in JavaScript?',
                  options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
                  correctAnswer: 0,
                  explanation: 'The correct way to declare a variable in JavaScript is using the var, let, or const keyword.'
                }
              ]
            }
          },
          {
            title: 'Functions and Scope',
            description: 'Understanding functions, parameters, and scope in JavaScript',
            order: 2,
            content: {
              text: 'Functions are the building blocks of JavaScript applications. Learn how to create and use functions effectively.',
              resources: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions']
            }
          }
        ]
      },
        {
        title: 'React Development Masterclass',
        description: 'Master React.js from basics to advanced concepts including hooks, context, and performance optimization.',
        category: 'Programming',
        level: 'Intermediate',
        duration: 60,
        instructor: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          bio: 'React Expert and Frontend Architect'
        },
        thumbnail: '/course-images/web-development-course.svg',
        price: 99,
        rating: 4.8,
        isPublished: true,
        tags: ['react', 'javascript', 'frontend', 'ui'],
        modules: [
          {
            title: 'React Fundamentals',
            description: 'Understanding components, props, and state',
            order: 1,
            content: {
              text: 'React is a JavaScript library for building user interfaces. Learn the core concepts of React development.',
              resources: ['https://reactjs.org/docs/getting-started.html']
            }
          }
        ]
      },
        {
        title: 'Data Structures and Algorithms',
        description: 'Comprehensive course on data structures, algorithms, and problem-solving techniques for technical interviews.',
        category: 'Programming',
        level: 'Advanced',
        duration: 80,
        instructor: {
          name: 'Dr. Michael Chen',
          email: 'm.chen@example.com',
          bio: 'Computer Science Professor with expertise in algorithms'
        },
        thumbnail: '/course-images/web-development-course.svg',
        price: 149,
        rating: 4.7,
        tags: ['algorithms', 'data structures', 'computer science'],
        modules: [
          {
            title: 'Introduction to Algorithms',
            description: 'Understanding algorithm complexity and analysis',
            order: 1,
            content: {
              text: 'Algorithms are the heart of computer science. Learn how to analyze and design efficient algorithms.',
              resources: ['https://www.geeksforgeeks.org/fundamentals-of-algorithms/']
            }
          }
        ]
      },
        {
        title: 'Mathematics for Machine Learning',
        description: 'Essential mathematical concepts including linear algebra, calculus, and probability for machine learning.',
        category: 'Mathematics',
        level: 'Intermediate',
        duration: 50,
        instructor: {
          name: 'Dr. Emily Rodriguez',
          email: 'e.rodriguez@example.com',
          bio: 'Mathematician and ML Researcher'
        },
        thumbnail: '/course-images/data-science-course.svg',
        price: 79,
        rating: 4.6,
        tags: ['mathematics', 'machine learning', 'linear algebra'],
        modules: [
          {
            title: 'Linear Algebra Basics',
            description: 'Vectors, matrices, and linear transformations',
            order: 1,
            content: {
              text: 'Linear algebra is the foundation of machine learning. Master vectors, matrices, and their operations.',
              resources: ['https://www.khanacademy.org/math/linear-algebra']
            }
          }
        ]
      },
        {
        title: 'Web Design Fundamentals',
        description: 'Learn modern web design principles including HTML5, CSS3, responsive design, and user experience.',
        category: 'Design',
        level: 'Beginner',
        duration: 30,
        instructor: {
          name: 'Alex Thompson',
          email: 'alex.t@example.com',
          bio: 'UX/UI Designer with 8 years of experience'
        },
        thumbnail: '/course-images/ui-ux-course.svg',
        price: 0,
        rating: 4.4,
        tags: ['web design', 'html', 'css', 'ux'],
        modules: [
          {
            title: 'HTML5 and Semantic Markup',
            description: 'Modern HTML5 elements and best practices',
            order: 1,
            content: {
              text: 'HTML5 provides semantic elements that give meaning to web content. Learn how to structure web pages properly.',
              resources: ['https://developer.mozilla.org/en-US/docs/Web/HTML']
            }
          }
        ]
      },
        {
        title: 'Business Communication Skills',
        description: 'Develop professional communication skills for business environments including presentations and negotiations.',
        category: 'Business',
        level: 'Intermediate',
        duration: 25,
        instructor: {
          name: 'Lisa Anderson',
          email: 'lisa.a@example.com',
          bio: 'Business Communication Coach'
        },
        thumbnail: '/course-images/web-development-course.svg',
        price: 49,
        rating: 4.3,
        tags: ['business', 'communication', 'soft skills'],
        modules: [
          {
            title: 'Effective Presentations',
            description: 'Creating and delivering impactful presentations',
            order: 1,
            content: {
              text: 'Presentation skills are crucial in business. Learn how to create and deliver compelling presentations.',
              resources: ['https://www.ted.com/talks']
            }
          }
        ]
      },
        {
        title: 'Spanish for Beginners',
        description: 'Learn Spanish from scratch with interactive lessons covering vocabulary, grammar, and conversation.',
        category: 'Languages',
        level: 'Beginner',
        duration: 45,
        instructor: {
          name: 'Maria Garcia',
          email: 'maria.g@example.com',
          bio: 'Native Spanish speaker and language instructor'
        },
        thumbnail: '/course-images/spanish-course.svg',
        price: 39,
        rating: 4.5,
        tags: ['spanish', 'languages', 'grammar'],
        modules: [
          {
            title: 'Basic Spanish Phrases',
            description: 'Essential phrases for everyday conversations',
            order: 1,
            content: {
              text: 'Start your Spanish journey with basic phrases and greetings used in everyday conversations.',
              resources: ['https://www.duolingo.com/course/es/en/Learn-Spanish']
            }
          }
        ]
      },
        {
        title: 'Introduction to Biology',
        description: 'Explore the fundamentals of biology including cell structure, genetics, evolution, and ecology.',
        category: 'Science',
        level: 'Beginner',
        duration: 55,
        instructor: {
          name: 'Dr. James Wilson',
          email: 'j.wilson@example.com',
          bio: 'Biology Professor and Researcher'
        },
        thumbnail: '/course-images/biology-course.svg',
        price: 0,
        rating: 4.6,
        tags: ['biology', 'science', 'genetics'],
        modules: [
          {
            title: 'Cell Structure and Function',
            description: 'Understanding the basic unit of life',
            order: 1,
            content: {
              text: 'Cells are the fundamental units of life. Learn about cell structure, organelles, and their functions.',
              resources: ['https://www.khanacademy.org/science/biology']
            }
          }
        ]
      }
    ];

    // Insert courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`Created ${createdCourses.length} courses`);

    // Enroll student in some courses
    studentUser.enrolledCourses = [
      createdCourses[0]._id, // Introduction to JavaScript
      createdCourses[1]._id, // React Development Masterclass
      createdCourses[3]._id  // Mathematics for Machine Learning
    ];
    await studentUser.save();

    console.log('Database seeded successfully!');
    console.log('Admin login: admin@demo.com / admin123');
    console.log('Student login: student@demo.com / student123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the seeder
seedData();
