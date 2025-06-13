const express = require('express');
const router = express.Router();
const SectionConcern = require('../models/SectionConcern');
const auth = require('../middleware/auth');

// @route   POST /api/concerns
// @desc    Create a new concern
// @access  Private (students only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit concerns' });
    }

    const { title, description, sectionName, studentName, studentId } = req.body;

    // Create new concern
    const concern = new SectionConcern({
      sectionName,
      title,
      description,
      studentName,
      studentId
    });

    await concern.save();
    res.json(concern);
  } catch (error) {
    console.error('Error creating concern:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/concerns/:sectionName
// @desc    Get all concerns for a section
// @access  Private
router.get('/:sectionName', auth, async (req, res) => {
  try {
    const concerns = await SectionConcern.find({ 
      sectionName: req.params.sectionName 
    }).sort({ createdAt: -1 });

    res.json(concerns);
  } catch (error) {
    console.error('Error fetching concerns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 