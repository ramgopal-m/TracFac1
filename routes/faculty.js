const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// Get faculty profile
router.get('/profile', auth, checkRole(['faculty']), async (req, res) => {
  try {
    const faculty = await User.findById(req.user._id).select('-password');
    res.json(faculty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update faculty profile
router.patch('/profile', auth, checkRole(['faculty']), async (req, res) => {
  try {
    const updates = req.body;
    const faculty = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');
    
    res.json(faculty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all students
router.get('/students', auth, checkRole(['faculty']), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }, '-password');
    res.json(students);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Search faculty by email
router.get('/search', auth, async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const faculty = await User.findOne({ email, role: 'faculty' })
      .select('-password')
      .populate('assignedPrograms');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    console.error('Error searching faculty:', error);
    res.status(500).json({ message: 'Error searching faculty' });
  }
});

module.exports = router; 