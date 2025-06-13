const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all programs
router.get('/', auth, async (req, res) => {
  try {
    const programs = await Program.find().populate('sections.faculty', 'name email')
      .populate('sections.students', 'name email');
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new program
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received program creation request:', {
      user: { id: req.user._id, role: req.user.role },
      body: req.body
    });

    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to create program');
      return res.status(403).json({ error: 'Only admin can create programs' });
    }

    // Validate required fields
    if (!req.body.title || !req.body.description) {
      console.log('Missing required fields:', req.body);
      return res.status(400).json({ 
        error: 'Title and description are required',
        received: req.body
      });
    }

    // Create program with validated data
    const program = new Program({
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      sections: []
    });

    console.log('Attempting to save program:', program);
    await program.save();
    console.log('Program saved successfully:', program);
    
    res.status(201).json(program);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.errors || {}
    });
  }
});

// Update a program
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update programs' });
    }
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, description: req.body.description },
      { new: true }
    );
    res.json(program);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a program
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete programs' });
    }
    await Program.findByIdAndDelete(req.params.id);
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a section to a program
router.post('/:id/sections', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can add sections' });
    }

    const { name, facultyId, studentIds } = req.body;
    
    // Verify faculty exists
    const faculty = await User.findOne({ _id: facultyId, role: 'faculty' });
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Verify students exist
    const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
    if (students.length !== studentIds.length) {
      return res.status(404).json({ error: 'One or more students not found' });
    }

    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Create the section
    const section = {
      name,
      faculty: facultyId,
      students: studentIds
    };

    program.sections.push(section);
    await program.save();

    // Update faculty's assigned programs
    await User.findByIdAndUpdate(
      facultyId,
      {
        $addToSet: {
          assignedPrograms: {
            program: program._id,
            section: section._id
          }
        }
      }
    );

    // Update students' assigned programs
    await User.updateMany(
      { _id: { $in: studentIds } },
      {
        $addToSet: {
          assignedPrograms: {
            program: program._id,
            section: section._id
          }
        }
      }
    );

    // Populate the response
    const populatedProgram = await Program.findById(program._id)
      .populate('sections.faculty', 'name email')
      .populate('sections.students', 'name email');

    res.status(201).json(populatedProgram);
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update a section in a program
router.put('/:id/sections/:sectionId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update sections' });
    }

    const { name, facultyId, studentIds } = req.body;
    
    // Verify faculty exists
    const faculty = await User.findOne({ _id: facultyId, role: 'faculty' });
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Verify students exist
    const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
    if (students.length !== studentIds.length) {
      return res.status(404).json({ error: 'One or more students not found' });
    }

    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const section = program.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    section.name = name;
    section.faculty = facultyId;
    section.students = studentIds;

    await program.save();
    res.json(program);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a section from a program
router.delete('/:id/sections/:sectionId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete sections' });
    }

    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    program.sections.pull(req.params.sectionId);
    await program.save();
    res.json(program);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get program by ID
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Fetching program with ID:', req.params.id);
    console.log('User requesting program:', {
      id: req.user._id,
      role: req.user.role
    });

    const program = await Program.findById(req.params.id)
      .populate('sections.faculty', 'name email profile.profilePic')
      .populate({
        path: 'sections.students',
        select: 'name email profile',
        transform: doc => {
          if (!doc) return null;
          // Ensure profile object exists with default values
          if (!doc.profile) {
            doc.profile = {};
          }
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
          doc.profile = {
            ...defaultProfile,
            ...doc.profile
          };
          return doc;
        }
      });

    console.log('Found program:', program ? 'Yes' : 'No');

    if (!program) {
      console.log('Program not found');
      return res.status(404).json({ error: 'Program not found' });
    }

    // Check if the requesting user has access to this program
    if (req.user.role === 'faculty') {
      const hasAccess = program.sections.some(section => 
        section.faculty && section.faculty._id.toString() === req.user._id.toString()
      );
      
      console.log('Faculty access check:', hasAccess ? 'Granted' : 'Denied');
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    console.log('Sending program data');
    res.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 