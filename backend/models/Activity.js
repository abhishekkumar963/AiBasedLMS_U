const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['login', 'course_view', 'quiz_attempt', 'chatbot_message', 'study_material_generated', 'flashcard_review'],
    required: true
  },
  metadata: {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    quizScore: { type: Number },
    timeSpent: { type: Number }, // in minutes
    messageCount: { type: Number },
    materialType: { type: String },
    flashcardCount: { type: Number }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
