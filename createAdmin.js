const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Admin credentials
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123', // This will be hashed by the pre-save middleware
  role: 'admin',
  profile: {
    department: 'Administration',
    position: 'System Administrator'
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create new admin user
    const admin = new User(adminUser);
    await admin.save();
    
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 