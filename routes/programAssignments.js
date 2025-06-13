const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get assigned programs for a user
router.get('/assigned', auth, async (req, res) => {
  try {
    console.log('Fetching assigned programs for user:', req.user._id);
    
    // Find all programs where the user is either faculty or student in any section
    const programs = await Program.find({
      $or: [
        { 'sections.faculty': req.user._id },
        { 'sections.students': req.user._id }
      ]
    }).populate('sections.faculty', 'name email')
      .populate('sections.students', 'name email');

    console.log('Found programs:', programs.length);

    // Filter programs to only include sections where the user is assigned
    const assignedPrograms = programs.map(program => {
      const sections = program.sections.filter(section => {
        // Skip sections with null faculty or students
        if (!section.faculty || !section.students) {
          console.log('Skipping section with null data:', section._id);
          return false;
        }

        // Check if user is faculty or student in this section
        const isFaculty = section.faculty._id.toString() === req.user._id.toString();
        const isStudent = section.students.some(student => 
          student && student._id.toString() === req.user._id.toString()
        );
        
        return isFaculty || isStudent;
      });

      if (sections.length === 0) return null;

      return {
        ...program.toObject(),
        sections
      };
    }).filter(program => program !== null);

    console.log('Filtered assigned programs:', assignedPrograms.length);
    res.json(assignedPrograms);
  } catch (error) {
    console.error('Error fetching assigned programs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign students to a section
router.post('/:programId/sections/:sectionId/students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can assign students' });
    }

    const { studentIds } = req.body;
    const program = await Program.findById(req.params.programId);
    
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const section = program.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Update section's students
    section.students = studentIds;
    await program.save();

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

    res.json(program);
  } catch (error) {
    console.error('Error assigning students:', error);
    res.status(400).json({ error: error.message });
  }
});

// Assign faculty to a section
router.post('/:programId/sections/:sectionId/faculty', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can assign faculty' });
    }

    const { facultyId } = req.body;
    const program = await Program.findById(req.params.programId);
    
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const section = program.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Update section's faculty
    section.faculty = facultyId;
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

    res.json(program);
  } catch (error) {
    console.error('Error assigning faculty:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 