const express = require('express');
const Flashcard = require('../models/Flashcard');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's flashcards for a specific course
router.get('/', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { user: req.user._id };
    
    if (courseId) {
      query.course = courseId;
    }

    const flashcards = await Flashcard.find(query)
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.json({ flashcards });
  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({ message: 'Server error while fetching flashcards' });
  }
});

// Create a new flashcard
router.post('/', auth, async (req, res) => {
  try {
    const { question, answer, courseId, difficulty = 'medium', category } = req.body;

    if (!question || !answer || !courseId) {
      return res.status(400).json({ message: 'Question, answer, and course ID are required' });
    }

    const flashcard = new Flashcard({
      user: req.user._id,
      course: courseId,
      question,
      answer,
      difficulty,
      category
    });

    await flashcard.save();

    res.status(201).json({
      message: 'Flashcard created successfully',
      flashcard
    });
  } catch (error) {
    console.error('Create flashcard error:', error);
    res.status(500).json({ message: 'Server error while creating flashcard' });
  }
});

// Update flashcard progress
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { reviewCount, correctCount, nextReview } = req.body;
    
    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        reviewCount: reviewCount || 0,
        correctCount: correctCount || 0,
        lastReviewed: new Date(),
        nextReview: nextReview || new Date()
      },
      { new: true }
    );

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    res.json({
      message: 'Flashcard progress updated successfully',
      flashcard
    });
  } catch (error) {
    console.error('Update flashcard progress error:', error);
    res.status(500).json({ message: 'Server error while updating flashcard progress' });
  }
});

// Delete a flashcard
router.delete('/:id', auth, async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    res.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Delete flashcard error:', error);
    res.status(500).json({ message: 'Server error while deleting flashcard' });
  }
});

module.exports = router;
