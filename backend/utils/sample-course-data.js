// Sample course data structure with image support

export const sampleCourses = [
  {
    _id: "1",
    title: "Complete React Development Bootcamp",
    description: "Learn React from scratch and build modern web applications with hooks, context, and Redux",
    category: "Web Development",
    level: "Intermediate",
    duration: 12,
    price: 89,
    rating: 4.8,
    enrolledStudents: [/* student IDs */],
    instructor: {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      bio: "Senior React Developer with 8+ years of experience building scalable web applications",
      avatar: "/course-images/instructor-1.jpg"
    },
    imageUrl: "/course-images/course-1.jpg",
    createdAt: "2024-01-15",
    modules: [
      {
        title: "React Fundamentals",
        description: "Learn the basics of React including components, props, and state",
        duration: "2h",
        imageUrl: "/course-images/module-1-0.jpg",
        videoThumbnail: "/course-images/video-thumb-1-0.jpg",
        content: {
          text: "In this module, you'll learn the fundamental concepts of React including JSX, components, props, and state management...",
          videoUrl: "https://example.com/react-fundamentals-video",
          resources: [
            { name: "React Cheatsheet", type: "PDF", url: "/resources/react-cheatsheet.pdf" },
            { name: "Project Files", type: "ZIP", url: "/resources/module-1-files.zip" }
          ]
        },
        quiz: {
          questions: [
            {
              question: "What is JSX?",
              options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"],
              correct: 0
            }
          ]
        }
      },
      {
        title: "React Hooks Deep Dive",
        description: "Master useState, useEffect, and custom hooks",
        duration: "3h",
        imageUrl: "/course-images/module-1-1.jpg",
        videoThumbnail: "/course-images/video-thumb-1-1.jpg",
        content: {
          text: "Deep dive into React Hooks and learn how to build reusable custom hooks...",
          videoUrl: "https://example.com/react-hooks-video",
          resources: [
            { name: "Hooks Reference", type: "PDF", url: "/resources/hooks-reference.pdf" }
          ]
        },
        quiz: {
          questions: [
            {
              question: "Which hook is used for side effects?",
              options: ["useState", "useEffect", "useContext", "useReducer"],
              correct: 1
            }
          ]
        }
      }
    ]
  },
  {
    _id: "2", 
    title: "Data Science with Python",
    description: "Master data analysis, visualization, and machine learning with Python",
    category: "Data Science",
    level: "Advanced",
    duration: 16,
    price: 129,
    rating: 4.9,
    enrolledStudents: [/* student IDs */],
    instructor: {
      name: "Dr. Michael Chen",
      email: "michael.chen@example.com", 
      bio: "Data Scientist with expertise in machine learning and statistical analysis",
      avatar: "/course-images/instructor-2.jpg"
    },
    imageUrl: "/course-images/course-2.jpg",
    createdAt: "2024-02-01",
    modules: [
      {
        title: "Python for Data Science",
        description: "Learn NumPy, Pandas, and data manipulation",
        duration: "4h",
        imageUrl: "/course-images/module-2-0.jpg",
        content: {
          text: "Master Python libraries essential for data science...",
          videoUrl: "https://example.com/python-ds-video",
          resources: [
            { name: "Python Notebook", type: "IPYNB", url: "/resources/python-ds-notebook.ipynb" }
          ]
        }
      }
    ]
  }
];

// Image categories and suggested content
export const imageCategories = {
  "Web Development": [
    "code-editor", "browser-devtools", "react-logo", "javascript-code", "component-tree",
    "hooks-diagram", "state-management", "api-integration", "deployment", "debugging"
  ],
  "Data Science": [
    "data-chart", "python-logo", "jupyter-notebook", "machine-learning", "statistics",
    "data-cleaning", "visualization", "neural-network", "algorithm-flow", "dataset"
  ],
  "Mobile Apps": [
    "phone-mockup", "app-interface", "react-native", "flutter-logo", "mobile-ui",
    "app-store", "device-testing", "push-notifications", "mobile-performance", "app-icons"
  ],
  "UI/UX Design": [
    "design-tools", "figma-screen", "wireframe", "prototype", "color-palette",
    "typography", "user-flows", "design-system", "responsive-design", "accessibility"
  ],
  "DevOps": [
    "server-rack", "cloud-services", "docker-containers", "kubernetes", "ci-cd-pipeline",
    "monitoring-dashboard", "load-balancer", "infrastructure", "deployment", "scaling"
  ],
  "AI & ML": [
    "ai-brain", "neural-network", "algorithm", "data-processing", "model-training",
    "ai-interface", "chatbot-ui", "computer-vision", "nlp-processing", "prediction-model"
  ]
};
