const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'instructor'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  profile: {
    bio: { type: String, maxlength: 500 },
    education: { type: String },
    interests: [String],
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
    location: { type: String },
    website: { type: String },
    profilePhoto: { type: String, default: '' },
    github: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    favoriteMusic: { type: String },
    favoriteMovies: { type: String },
    favoriteGames: { type: String },
    codingLanguages: [String],
    hobbies: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
