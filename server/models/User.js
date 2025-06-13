const mongoose = require('mongoose');

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
    enum: ['admin', 'faculty', 'student'],
    required: true
  },
  profile: {
    facultyId: String,
    studentId: String,
    college: String,
    branch: String,
    department: String,
    currentYear: String,
    currentSemester: String,
    profilePic: String,
    timetablePic: String,
    coursesTablePic: String,
    gpaPdf: String,
    currentGpa: String,
    socialLinks: {
      linkedin: String,
      github: String
    },
    description: String,
    courses: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 