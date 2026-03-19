# AI-Based Learning Management System

A comprehensive MERN stack LMS with AI-powered features including:
- Admin and Student roles
- AI study material generation (Google Gemini)
- AI quiz generation
- Flashcards system
- Chatbot integration
- Student activity tracking and dropout risk classification

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **AI Integration**: Google Gemini API

## Features
- User authentication and authorization
- Course management
- AI-powered study material generation
- AI quiz generation
- Interactive flashcards
- AI chatbot for learning assistance
- Student activity tracking
- Dropout risk classification (Low, Medium, High)
- Admin dashboard for student management

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Create a `.env` file in the backend directory:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5002
```
