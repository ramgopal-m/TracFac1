const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');
const Program = require('../models/Program');

// Get all users (admin only)
router.get('/users', auth, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, '-password').select('name email role profile');
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add new student
router.post('/students', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Generate a unique student ID (format: STU-YYYY-XXXX)
    let studentId;
    let isUnique = false;
    
    while (!isUnique) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      studentId = `STU-${year}-${randomNum}`;
      
      // Check if studentId already exists
      const existingStudent = await User.findOne({ 'profile.studentId': studentId });
      if (!existingStudent) {
        isUnique = true;
      }
    }

    const student = new User({
      name,
      email,
      password,
      role: 'student',
      profile: {
        studentId: studentId
      }
    });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add new faculty
router.post('/faculty', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Generate a unique faculty ID (format: FAC-YYYY-XXXX)
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const facultyId = `FAC-${year}-${randomNum}`;

    const faculty = new User({
      name,
      email,
      password,
      role: 'faculty',
      profile: {
        facultyId: facultyId
      }
    });
    
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.patch('/users/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clean up null users
router.post('/cleanup-null-users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can perform cleanup' });
    }

    await User.cleanupNullUsers();
    res.json({ message: 'Null users cleanup completed successfully' });
  } catch (error) {
    console.error('Error during null users cleanup:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get admin dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const [students, faculty, programs] = await Promise.all([
      User.countDocuments({ role: 'student', deleted: { $ne: true } }),
      User.countDocuments({ role: 'faculty', deleted: { $ne: true } }),
      Program.countDocuments({ deleted: { $ne: true } })
    ]);

    console.log('Stats counts:', { students, faculty, programs });

    res.json({
      students: students || 0,
      faculty: faculty || 0,
      programs: programs || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
});

module.exports = router; 