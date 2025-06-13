const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { auth } = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');

// Import routes
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const studentRouter = require('./routes/student');
const facultyRouter = require('./routes/faculty');
const programsRouter = require('./routes/program');
const programAssignmentsRouter = require('./routes/programAssignments');
const sectionsRouter = require('./routes/sections');
const chatRouter = require('./routes/chat');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilePicsDir = path.join(uploadsDir, 'profile-pics');
const timetablesDir = path.join(uploadsDir, 'timetables');
const courseTablesDir = path.join(uploadsDir, 'course-tables');

[profilePicsDir, timetablesDir, courseTablesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = profilePicsDir;
    
    switch (file.fieldname) {
      case 'profilePic':
        uploadPath = profilePicsDir;
        break;
      case 'timetable':
        uploadPath = timetablesDir;
        break;
      case 'coursesTable':
        uploadPath = courseTablesDir;
        break;
      default:
        uploadPath = profilePicsDir;
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePic') {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed for profile pictures!'), false);
    }
  } else if (file.fieldname === 'timetable' || file.fieldname === 'coursesTable') {
    if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
      return cb(new Error('Only PDF and image files are allowed for timetables and course tables!'), false);
    }
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// MongoDB Connection with options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit the process if MongoDB connection fails
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Faculty Tracking System API' });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/student', studentRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/programs', programsRouter);
app.use('/api/program-assignments', programAssignmentsRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/chat', chatRouter);

// Add a route to fetch all users
app.get('/api/users', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Profile update route
app.put('/api/auth/profile', auth, upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'timetable', maxCount: 1 },
  { name: 'coursesTable', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse profile data from request body
    const profileData = JSON.parse(req.body.profile || '{}');

    // Handle profile picture upload
    if (req.files && req.files['profilePic']) {
      const profilePic = req.files['profilePic'][0];
      // Delete old profile picture if it exists
      if (user.profile.profilePic) {
        const oldPicPath = path.join(profilePicsDir, path.basename(user.profile.profilePic));
        if (fs.existsSync(oldPicPath)) {
          fs.unlinkSync(oldPicPath);
        }
      }
      // Update profile picture URL with local path
      profileData.profilePic = `/uploads/profile-pics/${profilePic.filename}`;
    }

    // Handle timetable upload
    if (req.files && req.files['timetable']) {
      const timetable = req.files['timetable'][0];
      // Delete old timetable if it exists
      if (user.profile.timetable) {
        const oldTimetablePath = path.join(timetablesDir, path.basename(user.profile.timetable));
        if (fs.existsSync(oldTimetablePath)) {
          fs.unlinkSync(oldTimetablePath);
        }
      }
      // Update timetable URL with local path
      profileData.timetable = `/uploads/timetables/${timetable.filename}`;
    }

    // Handle course table upload
    if (req.files && req.files['coursesTable']) {
      const coursesTable = req.files['coursesTable'][0];
      // Delete old course table if it exists
      if (user.profile.coursesTable) {
        const oldCoursesTablePath = path.join(courseTablesDir, path.basename(user.profile.coursesTable));
        if (fs.existsSync(oldCoursesTablePath)) {
          fs.unlinkSync(oldCoursesTablePath);
        }
      }
      // Update course table URL with local path
      profileData.coursesTable = `/uploads/course-tables/${coursesTable.filename}`;
    }

    // Preserve existing IDs based on role
    if (user.role === 'student') {
      profileData.studentId = user.profile.studentId;
    } else if (user.role === 'faculty') {
      profileData.facultyId = user.profile.facultyId;
    }

    // Update user profile
    user.profile = {
      ...user.profile,
      ...profileData
    };

    await user.save();

    // Make URLs absolute
    if (user.profile.profilePic) {
      // Only add BASE_URL if the path doesn't already start with http
      if (!user.profile.profilePic.startsWith('http')) {
        user.profile.profilePic = `${process.env.BASE_URL}${user.profile.profilePic}`;
      }
    }
    if (user.profile.timetable) {
      // Only add BASE_URL if the path doesn't already start with http
      if (!user.profile.timetable.startsWith('http')) {
        user.profile.timetable = `${process.env.BASE_URL}${user.profile.timetable}`;
      }
    }
    if (user.profile.coursesTable) {
      // Only add BASE_URL if the path doesn't already start with http
      if (!user.profile.coursesTable.startsWith('http')) {
        user.profile.coursesTable = `${process.env.BASE_URL}${user.profile.coursesTable}`;
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from specific upload directories
app.use('/uploads/profile-pics', express.static(path.join(__dirname, 'uploads', 'profile-pics')));
app.use('/uploads/timetables', express.static(path.join(__dirname, 'uploads', 'timetables')));
app.use('/uploads/course-tables', express.static(path.join(__dirname, 'uploads', 'course-tables')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 