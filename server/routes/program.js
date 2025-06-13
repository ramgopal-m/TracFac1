const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Program = require('../models/Program');

// Get program by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('sections.faculty', 'name email profile')
      .populate('sections.students', 'name email profile');

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
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
    } else if (req.user.role === 'student') {
      const hasAccess = program.sections.some(section => 
        section.students && section.students.some(student => 
          student && student._id.toString() === req.user._id.toString()
        )
      );
      
      console.log('Student access check:', hasAccess ? 'Granted' : 'Denied');
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 