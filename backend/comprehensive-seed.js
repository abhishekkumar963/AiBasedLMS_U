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

    // Create 44 comprehensive courses
    const courses = [
      // Web Development Courses (9 courses)
      {
        title: 'HTML Fundamentals',
        description: 'Master the building blocks of web with semantic HTML5 markup and modern web standards.',
        category: 'Web Development',
        level: 'Beginner',
        duration: 15,
        instructor: {
          name: 'John Smith',
          email: 'john.smith@example.com',
          bio: 'Frontend Developer with 8+ years of experience'
        },
        thumbnail: '/course-images/html-fundamentals.svg',
        price: 0,
        rating: 4.6,
        isPublished: true,
        tags: ['html', 'web development', 'frontend'],
        modules: [
          {
            title: 'HTML5 Basics',
            description: 'Understanding HTML structure and semantic elements',
            order: 1,
            content: {
              text: 'Learn the fundamentals of HTML5 including semantic markup, forms, and multimedia elements.',
              videoUrl: 'https://example.com/html-basics',
              resources: ['https://developer.mozilla.org/en-US/docs/Web/HTML']
            }
          }
        ]
      },
      {
        title: 'CSS Styling Mastery',
        description: 'Create beautiful, responsive layouts with modern CSS techniques and animations.',
        category: 'Web Development',
        level: 'Beginner',
        duration: 20,
        instructor: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          bio: 'CSS Expert and UI/UX Designer'
        },
        thumbnail: '/course-images/css-mastery.svg',
        price: 29,
        rating: 4.7,
        isPublished: true,
        tags: ['css', 'styling', 'responsive design'],
        modules: [
          {
            title: 'CSS Fundamentals',
            description: 'Selectors, properties, and layout techniques',
            order: 1,
            content: {
              text: 'Master CSS selectors, box model, flexbox, and grid layouts.',
              resources: ['https://developer.mozilla.org/en-US/docs/Web/CSS']
            }
          }
        ]
      },
      {
        title: 'JavaScript Complete Guide',
        description: 'From basics to advanced concepts including ES6+, async programming, and DOM manipulation.',
        category: 'Web Development',
        level: 'Intermediate',
        duration: 40,
        instructor: {
          name: 'Mike Wilson',
          email: 'mike.w@example.com',
          bio: 'Full Stack JavaScript Developer'
        },
        thumbnail: '/course-images/javascript-complete.svg',
        price: 49,
        rating: 4.8,
        isPublished: true,
        tags: ['javascript', 'es6', 'dom'],
        modules: [
          {
            title: 'JavaScript Fundamentals',
            description: 'Variables, functions, and control flow',
            order: 1,
            content: {
              text: 'Learn JavaScript basics including variables, data types, functions, and control structures.',
              resources: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript']
            }
          }
        ]
      },
      {
        title: 'React Development Bootcamp',
        description: 'Build modern web apps with React, hooks, state management, and component architecture.',
        category: 'Web Development',
        level: 'Intermediate',
        duration: 35,
        instructor: {
          name: 'Alex Chen',
          email: 'alex.c@example.com',
          bio: 'React Specialist and Frontend Architect'
        },
        thumbnail: '/course-images/react-bootcamp.svg',
        price: 69,
        rating: 4.9,
        isPublished: true,
        tags: ['react', 'hooks', 'components'],
        modules: [
          {
            title: 'React Fundamentals',
            description: 'Components, props, and state management',
            order: 1,
            content: {
              text: 'Master React concepts including components, props, state, and lifecycle methods.',
              resources: ['https://reactjs.org/docs/getting-started.html']
            }
          }
        ]
      },
      {
        title: 'Express.js Backend Development',
        description: 'Build robust RESTful APIs and backend services with Node.js and Express framework.',
        category: 'Web Development',
        level: 'Intermediate',
        duration: 30,
        instructor: {
          name: 'David Kumar',
          email: 'david.k@example.com',
          bio: 'Backend Developer and API Specialist'
        },
        thumbnail: '/course-images/express-backend.svg',
        price: 59,
        rating: 4.7,
        isPublished: true,
        tags: ['express', 'nodejs', 'api'],
        modules: [
          {
            title: 'Express Fundamentals',
            description: 'Setting up Express server and routing',
            order: 1,
            content: {
              text: 'Learn to build RESTful APIs with Express.js including routing, middleware, and error handling.',
              resources: ['https://expressjs.com/']
            }
          }
        ]
      },
      {
        title: 'Node.js Server Programming',
        description: 'Master server-side JavaScript with Node.js, npm, and asynchronous programming.',
        category: 'Web Development',
        level: 'Intermediate',
        duration: 25,
        instructor: {
          name: 'Emily Davis',
          email: 'emily.d@example.com',
          bio: 'Node.js Developer and Systems Architect'
        },
        thumbnail: '/course-images/nodejs-server.svg',
        price: 54,
        rating: 4.6,
        isPublished: true,
        tags: ['nodejs', 'server', 'async'],
        modules: [
          {
            title: 'Node.js Basics',
            description: 'Event-driven programming and modules',
            order: 1,
            content: {
              text: 'Understand Node.js event loop, modules, and asynchronous programming patterns.',
              resources: ['https://nodejs.org/docs/']
            }
          }
        ]
      },
      {
        title: 'MongoDB Database Essentials',
        description: 'Learn NoSQL database design, queries, aggregation, and performance optimization.',
        category: 'Web Development',
        level: 'Intermediate',
        duration: 22,
        instructor: {
          name: 'Robert Taylor',
          email: 'robert.t@example.com',
          bio: 'Database Administrator and MongoDB Expert'
        },
        thumbnail: '/course-images/mongodb-database.svg',
        price: 44,
        rating: 4.5,
        isPublished: true,
        tags: ['mongodb', 'nosql', 'database'],
        modules: [
          {
            title: 'MongoDB Fundamentals',
            description: 'Documents, collections, and basic queries',
            order: 1,
            content: {
              text: 'Master MongoDB document model, queries, indexes, and aggregation pipeline.',
              resources: ['https://docs.mongodb.com/']
            }
          }
        ]
      },
      {
        title: 'Angular Framework Mastery',
        description: 'Build enterprise-scale applications with Angular, TypeScript, and RxJS.',
        category: 'Web Development',
        level: 'Advanced',
        duration: 45,
        instructor: {
          name: 'Lisa Anderson',
          email: 'lisa.a@example.com',
          bio: 'Angular Developer and TypeScript Expert'
        },
        thumbnail: '/course-images/angular-framework.svg',
        price: 79,
        rating: 4.7,
        isPublished: true,
        tags: ['angular', 'typescript', 'rxjs'],
        modules: [
          {
            title: 'Angular Fundamentals',
            description: 'Components, services, and dependency injection',
            order: 1,
            content: {
              text: 'Learn Angular architecture including components, services, modules, and dependency injection.',
              resources: ['https://angular.io/docs']
            }
          }
        ]
      },
      {
        title: 'Next.js Full Stack Development',
        description: 'Build production-ready full-stack applications with Next.js, API routes, and deployment.',
        category: 'Web Development',
        level: 'Advanced',
        duration: 38,
        instructor: {
          name: 'James Wilson',
          email: 'james.w@example.com',
          bio: 'Next.js Specialist and Full Stack Developer'
        },
        thumbnail: '/course-images/nextjs-fullstack.svg',
        price: 89,
        rating: 4.8,
        isPublished: true,
        tags: ['nextjs', 'fullstack', 'deployment'],
        modules: [
          {
            title: 'Next.js Fundamentals',
            description: 'Pages, routing, and API routes',
            order: 1,
            content: {
              text: 'Master Next.js features including file-based routing, API routes, and static generation.',
              resources: ['https://nextjs.org/docs']
            }
          }
        ]
      },

      // Data Science Courses (4 courses)
      {
        title: 'Python for Data Science',
        description: 'Master Python programming with NumPy, Pandas, and data manipulation techniques.',
        category: 'Data Science',
        level: 'Beginner',
        duration: 35,
        instructor: {
          name: 'Dr. Michael Chen',
          email: 'michael.c@example.com',
          bio: 'Data Scientist and Python Expert'
        },
        thumbnail: '/course-images/python-data-science.svg',
        price: 69,
        rating: 4.8,
        isPublished: true,
        tags: ['python', 'numpy', 'pandas'],
        modules: [
          {
            title: 'Python Basics for Data Science',
            description: 'NumPy arrays and Pandas DataFrames',
            order: 1,
            content: {
              text: 'Learn Python fundamentals for data science including NumPy arrays and Pandas operations.',
              resources: ['https://pandas.pydata.org/']
            }
          }
        ]
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Introduction to ML algorithms, model training, and evaluation techniques.',
        category: 'Data Science',
        level: 'Intermediate',
        duration: 40,
        instructor: {
          name: 'Dr. Sarah Martinez',
          email: 'sarah.m@example.com',
          bio: 'ML Researcher and Data Scientist'
        },
        thumbnail: '/course-images/machine-learning-fundamentals.svg',
        price: 89,
        rating: 4.7,
        isPublished: true,
        tags: ['machine learning', 'algorithms', 'scikit-learn'],
        modules: [
          {
            title: 'ML Algorithms',
            description: 'Supervised and unsupervised learning',
            order: 1,
            content: {
              text: 'Understand classification, regression, clustering, and model evaluation.',
              resources: ['https://scikit-learn.org/']
            }
          }
        ]
      },
      {
        title: 'Data Visualization with Matplotlib',
        description: 'Create compelling data visualizations and interactive dashboards with Python.',
        category: 'Data Science',
        level: 'Intermediate',
        duration: 25,
        instructor: {
          name: 'Alex Thompson',
          email: 'alex.t@example.com',
          bio: 'Data Visualization Expert'
        },
        thumbnail: '/course-images/data-visualization.svg',
        price: 49,
        rating: 4.6,
        isPublished: true,
        tags: ['visualization', 'matplotlib', 'seaborn'],
        modules: [
          {
            title: 'Plotting Fundamentals',
            description: 'Charts, graphs, and statistical plots',
            order: 1,
            content: {
              text: 'Master data visualization with Matplotlib and Seaborn for effective data communication.',
              resources: ['https://matplotlib.org/']
            }
          }
        ]
      },
      {
        title: 'Deep Learning with TensorFlow',
        description: 'Build neural networks and deep learning models for computer vision and NLP.',
        category: 'Data Science',
        level: 'Advanced',
        duration: 50,
        instructor: {
          name: 'Dr. Emily Rodriguez',
          email: 'emily.r@example.com',
          bio: 'Deep Learning Researcher'
        },
        thumbnail: '/course-images/deep-learning-tensorflow.svg',
        price: 119,
        rating: 4.9,
        isPublished: true,
        tags: ['deep learning', 'tensorflow', 'neural networks'],
        modules: [
          {
            title: 'Neural Network Basics',
            description: 'Perceptrons, backpropagation, and activation functions',
            order: 1,
            content: {
              text: 'Learn deep learning fundamentals including neural networks and TensorFlow.',
              resources: ['https://tensorflow.org/']
            }
          }
        ]
      },

      // Mobile Apps Courses (5 courses)
      {
        title: 'React Native Development',
        description: 'Build cross-platform mobile apps for iOS and Android with React Native.',
        category: 'Mobile Apps',
        level: 'Intermediate',
        duration: 35,
        instructor: {
          name: 'Chris Johnson',
          email: 'chris.j@example.com',
          bio: 'Mobile App Developer and React Native Expert'
        },
        thumbnail: '/course-images/react-native-dev.svg',
        price: 79,
        rating: 4.7,
        isPublished: true,
        tags: ['react native', 'mobile', 'cross-platform'],
        modules: [
          {
            title: 'React Native Basics',
            description: 'Components, navigation, and platform-specific code',
            order: 1,
            content: {
              text: 'Learn to build mobile apps with React Native including navigation and native modules.',
              resources: ['https://reactnative.dev/']
            }
          }
        ]
      },
      {
        title: 'Flutter Mobile Development',
        description: 'Create beautiful mobile apps with Flutter, Dart, and Material Design.',
        category: 'Mobile Apps',
        level: 'Intermediate',
        duration: 30,
        instructor: {
          name: 'Maria Garcia',
          email: 'maria.g@example.com',
          bio: 'Flutter Developer and UI/UX Designer'
        },
        thumbnail: '/course-images/flutter-mobile.svg',
        price: 69,
        rating: 4.6,
        isPublished: true,
        tags: ['flutter', 'dart', 'material design'],
        modules: [
          {
            title: 'Flutter Fundamentals',
            description: 'Widgets, layouts, and navigation',
            order: 1,
            content: {
              text: 'Master Flutter development including widgets, state management, and app deployment.',
              resources: ['https://flutter.dev/docs']
            }
          }
        ]
      },
      {
        title: 'iOS Swift Development',
        description: 'Build native iOS apps with Swift, SwiftUI, and Apple\'s latest frameworks.',
        category: 'Mobile Apps',
        level: 'Intermediate',
        duration: 42,
        instructor: {
          name: 'David Lee',
          email: 'david.l@example.com',
          bio: 'iOS Developer and Swift Expert'
        },
        thumbnail: '/course-images/ios-swift-development.svg',
        price: 89,
        rating: 4.8,
        isPublished: true,
        tags: ['ios', 'swift', 'swiftui'],
        modules: [
          {
            title: 'Swift Programming',
            description: 'Swift syntax and SwiftUI framework',
            order: 1,
            content: {
              text: 'Learn Swift programming and SwiftUI for native iOS app development.',
              resources: ['https://developer.apple.com/swift/']
            }
          }
        ]
      },
      {
        title: 'Android Kotlin Development',
        description: 'Create native Android apps with Kotlin, Jetpack Compose, and modern Android development.',
        category: 'Mobile Apps',
        level: 'Intermediate',
        duration: 38,
        instructor: {
          name: 'Amit Patel',
          email: 'amit.p@example.com',
          bio: 'Android Developer and Kotlin Specialist'
        },
        thumbnail: '/course-images/android-kotlin-development.svg',
        price: 84,
        rating: 4.7,
        isPublished: true,
        tags: ['android', 'kotlin', 'jetpack compose'],
        modules: [
          {
            title: 'Kotlin for Android',
            description: 'Kotlin syntax and Jetpack Compose',
            order: 1,
            content: {
              text: 'Master Android development with Kotlin and modern Jetpack Compose UI.',
              resources: ['https://developer.android.com/kotlin']
            }
          }
        ]
      },
      {
        title: 'Mobile App UI/UX Design',
        description: 'Design intuitive mobile interfaces with user-centered design principles.',
        category: 'Mobile Apps',
        level: 'Beginner',
        duration: 20,
        instructor: {
          name: 'Lisa Wang',
          email: 'lisa.w@example.com',
          bio: 'Mobile UI/UX Designer'
        },
        thumbnail: '/course-images/mobile-ui-design.svg',
        price: 39,
        rating: 4.5,
        isPublished: true,
        tags: ['mobile design', 'ui', 'ux'],
        modules: [
          {
            title: 'Mobile Design Principles',
            description: 'Touch interactions and mobile patterns',
            order: 1,
            content: {
              text: 'Learn mobile-first design principles and create user-friendly mobile interfaces.',
              resources: ['https://material.io/design/']
            }
          }
        ]
      },

      // UI/UX Design Courses (8 courses)
      {
        title: 'UI Design Fundamentals',
        description: 'Master visual design principles, color theory, and typography for digital interfaces.',
        category: 'UI/UX Design',
        level: 'Beginner',
        duration: 18,
        instructor: {
          name: 'Rachel Green',
          email: 'rachel.g@example.com',
          bio: 'UI Designer and Visual Artist'
        },
        thumbnail: '/course-images/ui-design-fundamentals.svg',
        price: 34,
        rating: 4.6,
        isPublished: true,
        tags: ['ui design', 'color theory', 'typography'],
        modules: [
          {
            title: 'Visual Design Basics',
            description: 'Color, typography, and layout principles',
            order: 1,
            content: {
              text: 'Learn fundamental UI design principles including color theory, typography, and layout.',
              resources: ['https://refactoringui.com/']
            }
          }
        ]
      },
      {
        title: 'UX Research Methods',
        description: 'Conduct user research, usability testing, and create data-driven designs.',
        category: 'UI/UX Design',
        level: 'Intermediate',
        duration: 25,
        instructor: {
          name: 'Tom Anderson',
          email: 'tom.a@example.com',
          bio: 'UX Researcher and Product Designer'
        },
        thumbnail: '/course-images/ux-research-methods.svg',
        price: 54,
        rating: 4.7,
        isPublished: true,
        tags: ['ux research', 'usability testing', 'user interviews'],
        modules: [
          {
            title: 'Research Fundamentals',
            description: 'User interviews and usability testing',
            order: 1,
            content: {
              text: 'Master UX research methods including user interviews, surveys, and usability testing.',
              resources: ['https://www.nngroup.com/']
            }
          }
        ]
      },
      {
        title: 'Figma Masterclass',
        description: 'Create stunning designs, prototypes, and design systems with Figma.',
        category: 'UI/UX Design',
        level: 'Beginner',
        duration: 22,
        instructor: {
          name: 'Sophie Turner',
          email: 'sophie.t@example.com',
          bio: 'Figma Expert and Design System Specialist'
        },
        thumbnail: '/course-images/ui-ux-course.svg',
        price: 44,
        rating: 4.8,
        isPublished: true,
        tags: ['figma', 'prototyping', 'design systems'],
        modules: [
          {
            title: 'Figma Fundamentals',
            description: 'Components, variants, and prototyping',
            order: 1,
            content: {
              text: 'Learn Figma for UI design including components, variants, and interactive prototypes.',
              resources: ['https://www.figma.com/resources/']
            }
          }
        ]
      },
      {
        title: 'Adobe XD for Designers',
        description: 'Design and prototype user experiences with Adobe XD and Creative Cloud.',
        category: 'UI/UX Design',
        level: 'Intermediate',
        duration: 20,
        instructor: {
          name: 'Mark Davis',
          email: 'mark.d@example.com',
          bio: 'Adobe Creative Expert and UX Designer'
        },
        thumbnail: '/course-images/ui-ux-course.svg',
        price: 39,
        rating: 4.5,
        isPublished: true,
        tags: ['adobe xd', 'prototyping', 'creative cloud'],
        modules: [
          {
            title: 'Adobe XD Basics',
            description: 'Design tools and prototyping features',
            order: 1,
            content: {
              text: 'Master Adobe XD for UI/UX design and interactive prototyping.',
              resources: ['https://helpx.adobe.com/xd/']
            }
          }
        ]
      },
      {
        title: 'Web Design Principles',
        description: 'Create responsive, accessible, and user-friendly web interfaces.',
        category: 'UI/UX Design',
        level: 'Beginner',
        duration: 15,
        instructor: {
          name: 'Jennifer White',
          email: 'jennifer.w@example.com',
          bio: 'Web Designer and Accessibility Expert'
        },
        thumbnail: '/course-images/ui-ux-course.svg',
        price: 29,
        rating: 4.4,
        isPublished: true,
        tags: ['web design', 'responsive', 'accessibility'],
        modules: [
          {
            title: 'Responsive Web Design',
            description: 'Mobile-first design and accessibility',
            order: 1,
            content: {
              text: 'Learn responsive design principles and web accessibility standards.',
              resources: ['https://www.w3.org/WAI/WCAG21/quickref/']
            }
          }
        ]
      },
      {
        title: 'Interaction Design',
        description: 'Design engaging user interactions, micro-animations, and delightful experiences.',
        category: 'UI/UX Design',
        level: 'Intermediate',
        duration: 28,
        instructor: {
          name: 'Kevin Brown',
          email: 'kevin.b@example.com',
          bio: 'Interaction Designer and Animation Expert'
        },
        thumbnail: '/course-images/ui-ux-course.svg',
        price: 59,
        rating: 4.7,
        isPublished: true,
        tags: ['interaction design', 'animations', 'micro-interactions'],
        modules: [
          {
            title: 'Interaction Fundamentals',
            description: 'Micro-interactions and animation principles',
            order: 1,
            content: {
              text: 'Design engaging interactions and micro-animations for better user experience.',
              resources: ['https://www.interaction-design.org/']
            }
          }
        ]
      },
      {
        title: 'Design Systems Creation',
        description: 'Build scalable design systems, component libraries, and design tokens.',
        category: 'UI/UX Design',
        level: 'Advanced',
        duration: 30,
        instructor: {
          name: 'Nancy Liu',
          email: 'nancy.l@example.com',
          bio: 'Design System Architect and Senior UX Designer'
        },
        thumbnail: '/course-images/ui-ux-course.svg',
        price: 69,
        rating: 4.8,
        isPublished: true,
        tags: ['design systems', 'component libraries', 'design tokens'],
        modules: [
          {
            title: 'Design System Fundamentals',
            description: 'Components, patterns, and documentation',
            order: 1,
            content: {
              text: 'Learn to create and maintain design systems for consistent product design.',
              resources: ['https://designsystemsrepo.com/']
            }
          }
        ]
      },
      {
        title: 'User Psychology in Design',
        description: 'Apply cognitive psychology principles to create intuitive user experiences.',
        category: 'UI/UX Design',
        level: 'Intermediate',
        duration: 24,
        instructor: {
          name: 'Dr. Robert Kim',
          email: 'robert.k@example.com',
          bio: 'Cognitive Psychologist and UX Researcher'
        },
        thumbnail: '/course-images/ui-ux-course.svg',
        price: 54,
        rating: 4.6,
        isPublished: true,
        tags: ['user psychology', 'cognitive design', 'behavioral design'],
        modules: [
          {
            title: 'Psychology Principles',
            description: 'Cognitive biases and decision making',
            order: 1,
            content: {
              text: 'Apply psychology principles to design more intuitive user interfaces.',
              resources: ['https://www.nngroup.com/articles/']
            }
          }
        ]
      },

      // DevOps Courses (6 courses)
      {
        title: 'Docker Containerization',
        description: 'Containerize applications with Docker, Docker Compose, and best practices.',
        category: 'DevOps',
        level: 'Intermediate',
        duration: 25,
        instructor: {
          name: 'Steve Harris',
          email: 'steve.h@example.com',
          bio: 'DevOps Engineer and Container Expert'
        },
        thumbnail: '/course-images/docker-containerization.svg',
        price: 59,
        rating: 4.7,
        isPublished: true,
        tags: ['docker', 'containers', 'devops'],
        modules: [
          {
            title: 'Docker Fundamentals',
            description: 'Images, containers, and Docker Compose',
            order: 1,
            content: {
              text: 'Learn Docker containerization including images, containers, and multi-container applications.',
              resources: ['https://docs.docker.com/']
            }
          }
        ]
      },
      {
        title: 'Kubernetes Orchestration',
        description: 'Deploy and manage containerized applications at scale with Kubernetes.',
        category: 'DevOps',
        level: 'Advanced',
        duration: 35,
        instructor: {
          name: 'Maria Rodriguez',
          email: 'maria.r@example.com',
          bio: 'Kubernetes Specialist and Cloud Architect'
        },
        thumbnail: '/course-images/kubernetes-orchestration.svg',
        price: 89,
        rating: 4.8,
        isPublished: true,
        tags: ['kubernetes', 'orchestration', 'cloud'],
        modules: [
          {
            title: 'Kubernetes Basics',
            description: 'Pods, services, and deployments',
            order: 1,
            content: {
              text: 'Master Kubernetes for container orchestration and cloud-native applications.',
              resources: ['https://kubernetes.io/docs/']
            }
          }
        ]
      },
      {
        title: 'CI/CD Pipeline Mastery',
        description: 'Build automated deployment pipelines with Jenkins, GitHub Actions, and GitLab CI.',
        category: 'DevOps',
        level: 'Intermediate',
        duration: 30,
        instructor: {
          name: 'James Wilson',
          email: 'james.w@example.com',
          bio: 'DevOps Engineer and Automation Expert'
        },
        thumbnail: '/course-images/cicd-pipeline.svg',
        price: 74,
        rating: 4.6,
        isPublished: true,
        tags: ['cicd', 'jenkins', 'automation'],
        modules: [
          {
            title: 'CI/CD Fundamentals',
            description: 'Build pipelines and automated testing',
            order: 1,
            content: {
              text: 'Learn to build CI/CD pipelines for automated testing and deployment.',
              resources: ['https://docs.github.com/en/actions']
            }
          }
        ]
      },
      {
        title: 'AWS Cloud Services',
        description: 'Master AWS cloud architecture, services, and best practices for scalable applications.',
        category: 'DevOps',
        level: 'Intermediate',
        duration: 35,
        instructor: {
          name: 'David Chen',
          email: 'david.c@example.com',
          bio: 'AWS Solutions Architect'
        },
        thumbnail: '/course-images/aws-cloud-services.svg',
        price: 79,
        rating: 4.7,
        isPublished: true,
        tags: ['aws', 'cloud', 'architecture', 'ec2'],
        modules: [
          {
            title: 'AWS Fundamentals',
            description: 'EC2, S3, and core AWS services',
            order: 1,
            content: {
              text: 'Master AWS cloud services for application deployment and management.',
              resources: ['https://aws.amazon.com/documentation/']
            }
          }
        ]
      },
      {
        title: 'Infrastructure as Code',
        description: 'Manage infrastructure with Terraform, CloudFormation, and configuration management.',
        category: 'DevOps',
        level: 'Advanced',
        duration: 28,
        instructor: {
          name: 'Lisa Park',
          email: 'lisa.p@example.com',
          bio: 'Infrastructure Engineer and Terraform Expert'
        },
        thumbnail: '/course-images/terraform-infrastructure.svg',
        price: 84,
        rating: 4.8,
        isPublished: true,
        tags: ['terraform', 'infrastructure as code', 'cloudformation'],
        modules: [
          {
            title: 'IaC Fundamentals',
            description: 'Terraform and CloudFormation basics',
            order: 1,
            content: {
              text: 'Learn infrastructure as code principles with Terraform and CloudFormation.',
              resources: ['https://www.terraform.io/docs/']
            }
          }
        ]
      },
      {
        title: 'Monitoring and Logging',
        description: 'Implement comprehensive monitoring, logging, and alerting for production systems.',
        category: 'DevOps',
        level: 'Intermediate',
        duration: 22,
        instructor: {
          name: 'Tom Martinez',
          email: 'tom.m@example.com',
          bio: 'Site Reliability Engineer and Monitoring Expert'
        },
        thumbnail: '/course-images/monitoring-observability.svg',
        price: 54,
        rating: 4.5,
        isPublished: true,
        tags: ['monitoring', 'logging', 'observability'],
        modules: [
          {
            title: 'Monitoring Fundamentals',
            description: 'Metrics, logs, and alerting',
            order: 1,
            content: {
              text: 'Implement monitoring and logging for production system observability.',
              resources: ['https://prometheus.io/docs/']
            }
          }
        ]
      },

      // AI & ML Courses (7 courses)
      {
        title: 'Introduction to Artificial Intelligence',
        description: 'Explore AI concepts, search algorithms, and problem-solving techniques.',
        category: 'AI & ML',
        level: 'Beginner',
        duration: 30,
        instructor: {
          name: 'Dr. Alan Turing',
          email: 'alan.t@example.com',
          bio: 'AI Researcher and Computer Scientist'
        },
        thumbnail: '/course-images/data-science-course.svg',
        price: 69,
        rating: 4.6,
        isPublished: true,
        tags: ['artificial intelligence', 'algorithms', 'search'],
        modules: [
          {
            title: 'AI Fundamentals',
            description: 'Search algorithms and problem solving',
            order: 1,
            content: {
              text: 'Learn fundamental AI concepts including search algorithms and problem-solving techniques.',
              resources: ['https://ai.stanford.edu/']
            }
          }
        ]
      },
      {
        title: 'Neural Networks Deep Dive',
        description: 'Build and train neural networks from scratch with backpropagation and optimization.',
        category: 'AI & ML',
        level: 'Advanced',
        duration: 45,
        instructor: {
          name: 'Dr. Geoffrey Hinton',
          email: 'geoffrey.h@example.com',
          bio: 'Deep Learning Pioneer and Neural Network Expert'
        },
        thumbnail: '/course-images/neural-networks-deep-dive.svg',
        price: 119,
        rating: 4.9,
        isPublished: true,
        tags: ['neural networks', 'deep learning', 'backpropagation'],
        modules: [
          {
            title: 'Neural Network Architecture',
            description: 'Perceptrons and backpropagation',
            order: 1,
            content: {
              text: 'Master neural network architecture and training algorithms.',
              resources: ['https://www.deeplearningbook.org/']
            }
          }
        ]
      },
      {
        title: 'Computer Vision with OpenCV',
        description: 'Process images and videos with computer vision algorithms and deep learning.',
        category: 'AI & ML',
        level: 'Advanced',
        duration: 40,
        instructor: {
          name: 'Dr. Andrew Ng',
          email: 'andrew.n@example.com',
          bio: 'Computer Vision Expert and ML Educator'
        },
        thumbnail: '/course-images/computer-vision-opencv.svg',
        price: 99,
        rating: 4.8,
        isPublished: true,
        tags: ['computer vision', 'opencv', 'image processing'],
        modules: [
          {
            title: 'Computer Vision Basics',
            description: 'Image processing and feature detection',
            order: 1,
            content: {
              text: 'Learn computer vision techniques with OpenCV and deep learning.',
              resources: ['https://opencv.org/']
            }
          }
        ]
      },
      {
        title: 'Natural Language Processing',
        description: 'Process and understand human language with NLP techniques and transformers.',
        category: 'AI & ML',
        level: 'Advanced',
        duration: 42,
        instructor: {
          name: 'Dr. Christopher Manning',
          email: 'chris.m@example.com',
          bio: 'NLP Researcher and Computational Linguist'
        },
        thumbnail: '/course-images/natural-language-processing.svg',
        price: 109,
        rating: 4.7,
        isPublished: true,
        tags: ['nlp', 'transformers', 'text processing'],
        modules: [
          {
            title: 'NLP Fundamentals',
            description: 'Text processing and language models',
            order: 1,
            content: {
              text: 'Master natural language processing with modern transformer models.',
              resources: ['https://www.nlp.org/']
            }
          }
        ]
      },
      {
        title: 'Reinforcement Learning',
        description: 'Build intelligent agents that learn through interaction and reward systems.',
        category: 'AI & ML',
        level: 'Advanced',
        duration: 38,
        instructor: {
          name: 'Dr. Richard Sutton',
          email: 'richard.s@example.com',
          bio: 'Reinforcement Learning Pioneer'
        },
        thumbnail: '/course-images/data-science-course.svg',
        price: 94,
        rating: 4.8,
        isPublished: true,
        tags: ['reinforcement learning', 'agents', 'q-learning'],
        modules: [
          {
            title: 'RL Fundamentals',
            description: 'Markov decision processes and Q-learning',
            order: 1,
            content: {
              text: 'Learn reinforcement learning algorithms and agent training.',
              resources: ['https://www.cs.ubc.ca/~schmidtm/Courses/540/']
            }
          }
        ]
      },
      {
        title: 'AI Ethics and Responsible AI',
        description: 'Understand ethical considerations and responsible AI development practices.',
        category: 'AI & ML',
        level: 'Intermediate',
        duration: 20,
        instructor: {
          name: 'Dr. Timnit Gebru',
          email: 'timnit.g@example.com',
          bio: 'AI Ethics Researcher and Advocate'
        },
        thumbnail: '/course-images/data-science-course.svg',
        price: 44,
        rating: 4.6,
        isPublished: true,
        tags: ['ai ethics', 'responsible ai', 'bias'],
        modules: [
          {
            title: 'AI Ethics Fundamentals',
            description: 'Bias, fairness, and transparency',
            order: 1,
            content: {
              text: 'Understand ethical considerations in AI development and deployment.',
              resources: ['https://www.partnershiponai.org/']
            }
          }
        ]
      },
      {
        title: 'ML Model Deployment',
        description: 'Deploy machine learning models to production with MLOps best practices.',
        category: 'AI & ML',
        level: 'Advanced',
        duration: 35,
        instructor: {
          name: 'Dr. Andrej Karpathy',
          email: 'andrej.k@example.com',
          bio: 'ML Engineer and MLOps Specialist'
        },
        thumbnail: '/course-images/data-science-course.svg',
        price: 89,
        rating: 4.7,
        isPublished: true,
        tags: ['mlops', 'model deployment', 'production'],
        modules: [
          {
            title: 'MLOps Fundamentals',
            description: 'Model serving and monitoring',
            order: 1,
            content: {
              text: 'Learn to deploy and monitor machine learning models in production.',
              resources: ['https://ml-ops.org/']
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
      createdCourses[0]._id, // HTML Fundamentals
      createdCourses[2]._id, // JavaScript Complete Guide
      createdCourses[9]._id  // Python for Data Science
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
