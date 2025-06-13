const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Program = require('../models/Program');
const { auth, checkRole } = require('../middleware/auth');

// Get complete user data with profile
router.get('/user/:userId', auth, async (req, res) => {
  try {
    console.log('Fetching complete user data for ID:', req.params.userId);
    
    const user = await User.findById(req.params.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure profile object exists
    if (!user.profile) {
      user.profile = {};
    }

    // Set default values for undefined fields based on user role
    const defaultProfile = {
      // Common fields for all roles
      profilePic: '',
      description: '',
      socialLinks: {
        linkedin: '',
        github: ''
      },
      // Student specific fields
      ...(user.role === 'student' && {
        studentId: '',
        college: '',
        branch: '',
        department: '',
        currentYear: '',
        currentSemester: '',
        currentGPA: '',
        qualification: '',
        courses: [],
        location: {
          cabinNo: '',
          floor: '',
          blockName: ''
        },
        timetable: '',
        coursesTable: ''
      }),
      // Faculty specific fields
      ...(user.role === 'faculty' && {
        facultyId: '',
        qualification: '',
        specialization: '',
        experience: '',
        officeLocation: '',
        officeHours: '',
        courses: []
      })
    };

    // Merge default values with existing profile
    user.profile = {
      ...defaultProfile,
      ...user.profile
    };

    // Add assigned programs if they exist
    if (user.assignedPrograms && user.assignedPrograms.length > 0) {
      const programIds = user.assignedPrograms.map(ap => ap.program);
      const programs = await Program.find({ _id: { $in: programIds } })
        .select('title description sections')
        .lean();

      user.assignedPrograms = user.assignedPrograms.map(ap => {
        const program = programs.find(p => p._id.toString() === ap.program.toString());
        return {
          ...ap,
          programDetails: program || null
        };
      });
    }

    console.log('Successfully fetched complete user data');
    res.json(user);
  } catch (error) {
    console.error('Error fetching complete user data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student profile
router.get('/profile', auth, checkRole(['student']), async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select('-password')
      .lean(); // Convert to plain JavaScript object

    // Ensure profile object exists
    if (!student.profile) {
      student.profile = {};
    }

    // Set default values for undefined fields
    const defaultProfile = {
      studentId: '',
      college: '',
      branch: '',
      department: '',
      currentYear: '',
      currentSemester: '',
      currentGPA: '',
      qualification: '',
      description: '',
      courses: [],
      profilePic: '',
      location: {
        cabinNo: '',
        floor: '',
        blockName: ''
      },
      timetable: '',
      coursesTable: '',
      socialLinks: {
        linkedin: '',
        github: ''
      }
    };

    // Merge default values with existing profile
    student.profile = {
      ...defaultProfile,
      ...student.profile
    };

    res.json(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update student profile
router.patch('/profile', auth, checkRole(['student']), async (req, res) => {
  try {
    const updates = req.body;
    
    // If updating profile fields, ensure they're nested under profile
    const profileUpdates = {};
    const topLevelUpdates = {};

    // Separate profile updates from top-level updates
    Object.keys(updates).forEach(key => {
      if (key in defaultProfile) {
        profileUpdates[key] = updates[key];
      } else {
        topLevelUpdates[key] = updates[key];
      }
    });

    // Update the user document
    const student = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...topLevelUpdates,
          'profile': profileUpdates
        }
      },
      { new: true }
    ).select('-password');

    res.json(student);
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all faculty members
router.get('/faculty', auth, checkRole(['student']), async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }, '-password');
    res.json(faculty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Test route to print complete user data
router.get('/test/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Testing complete user data retrieval for ID:', userId);

    // Find user and populate all related data
    const user = await User.findById(userId)
      .select('-password')
      .lean();

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Print complete user data
    console.log('\n=== Complete User Data ===');
    console.log(JSON.stringify(user, null, 2));
    console.log('========================\n');

    // Print specific sections for better readability
    console.log('=== Basic Info ===');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('ID:', user._id);
    console.log('Created At:', user.createdAt);

    console.log('\n=== Profile Info ===');
    console.log(JSON.stringify(user.profile, null, 2));

    if (user.assignedPrograms && user.assignedPrograms.length > 0) {
      console.log('\n=== Assigned Programs ===');
      console.log(JSON.stringify(user.assignedPrograms, null, 2));
    }

    res.json({ message: 'User data printed to console', user });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 