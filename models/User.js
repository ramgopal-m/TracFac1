const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Program = require('./Program');
const Chat = require('./Chat');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'faculty'],
    required: true
  },
  profile: {
    studentId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values
      required: function() {
        return this.role === 'student';
      }
    },
    facultyId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values
      required: function() {
        return this.role === 'faculty';
      }
    },
    college: String,
    branch: String,
    department: String,
    currentYear: String,
    currentSemester: String,
    currentGPA: String,
    qualification: String,
    description: String,
    courses: [String],
    profilePic: String,
    location: {
      type: {
        cabinNo: String,
        floor: String,
        blockName: String
      },
      default: {}
    },
    timetable: String, // URL to the timetable image
    coursesTable: String, // URL to the courses table image
    socialLinks: {
      type: {
        linkedin: String,
        github: String
      },
      default: {}
    }
  },
  assignedPrograms: [{
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program'
    },
    section: {
      type: mongoose.Schema.Types.ObjectId
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to clean up null users and their data
userSchema.statics.cleanupNullUsers = async function() {
  try {
    console.log('Starting cleanup of null users...');
    
    // Find all users with null or invalid data
    const nullUsers = await this.find({
      $or: [
        { name: null },
        { email: null },
        { role: null },
        { _id: null }
      ]
    });

    console.log(`Found ${nullUsers.length} null users to clean up`);

    for (const user of nullUsers) {
      try {
        // 1. Remove user from program sections
        await Program.updateMany(
          { 'sections.faculty': user._id },
          { $pull: { 'sections.$[].faculty': user._id } }
        );

        await Program.updateMany(
          { 'sections.students': user._id },
          { $pull: { 'sections.$[].students': user._id } }
        );

        // 2. Delete all chats where user is a participant
        await Chat.deleteMany({
          'participants': user._id
        });

        // 3. Delete all messages sent by the user
        await Chat.updateMany(
          { 'messages.sender': user._id },
          { $pull: { messages: { sender: user._id } } }
        );

        // 4. Delete the user
        await user.remove();
        
        console.log(`Cleaned up user: ${user._id}`);
      } catch (error) {
        console.error(`Error cleaning up user ${user._id}:`, error);
      }
    }

    console.log('Cleanup of null users completed');
  } catch (error) {
    console.error('Error during null users cleanup:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema); 