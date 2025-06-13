const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Section = require('../models/Section');
const User = require('../models/User');

// Get all sections
router.get('/', auth, async (req, res) => {
  try {
    const sections = await Section.find()
      .populate('faculty', 'name email')
      .populate('students', 'name email')
      .sort({ createdAt: -1 });
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new section
router.post('/', auth, async (req, res) => {
  try {
    const { name, faculty, students } = req.body;

    // Validate section name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Section name is required' });
    }

    // Validate faculty array
    if (faculty && faculty.length > 0) {
      const facultyUsers = await User.find({
        _id: { $in: faculty },
        role: 'faculty'
      });
      
      if (facultyUsers.length !== faculty.length) {
        return res.status(400).json({ message: 'Invalid faculty members specified' });
      }
    }

    // Validate students array
    if (students && students.length > 0) {
      const studentUsers = await User.find({
        _id: { $in: students },
        role: 'student'
      });
      
      if (studentUsers.length !== students.length) {
        return res.status(400).json({ message: 'Invalid students specified' });
      }
    }

    const section = new Section({
      name,
      faculty: faculty || [],
      students: students || []
    });

    await section.save();

    // Populate the faculty and students before sending response
    const populatedSection = await Section.findById(section._id)
      .populate('faculty', 'name email')
      .populate('students', 'name email');

    res.status(201).json(populatedSection);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update section
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, faculty, students } = req.body;
    const sectionId = req.params.id;

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Validate faculty array if provided
    if (faculty && faculty.length > 0) {
      const facultyUsers = await User.find({
        _id: { $in: faculty },
        role: 'faculty'
      });
      
      if (facultyUsers.length !== faculty.length) {
        return res.status(400).json({ message: 'Invalid faculty members specified' });
      }
      section.faculty = faculty;
    }

    // Validate students array if provided
    if (students && students.length > 0) {
      const studentUsers = await User.find({
        _id: { $in: students },
        role: 'student'
      });
      
      if (studentUsers.length !== students.length) {
        return res.status(400).json({ message: 'Invalid students specified' });
      }
      section.students = students;
    }

    if (name) {
      section.name = name;
    }

    await section.save();

    const updatedSection = await Section.findById(sectionId)
      .populate('faculty', 'name email')
      .populate('students', 'name email');

    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get section by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('students', 'name email');

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete section
router.delete('/:id', auth, async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    await section.deleteOne();
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 