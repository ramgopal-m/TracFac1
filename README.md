# TracFac - Student-Faculty Tracking and Communication System
**Project SRS & Interface images at:** [TracFac](https://tracfac.netlify.app/)

TracFac is a comprehensive web-based platform designed to facilitate direct communication between faculty and students, eliminating the need for external communication channels. The system provides a centralized platform for academic interactions, program management, and student-faculty relationships within educational institutions.

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- jQuery
- Font Awesome Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM

### Authentication & Security
- JWT (JSON Web Tokens)
- bcrypt for password hashing
- Environment variables for sensitive data

## Prerequisites

Before running the project, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   ```bash
   node --version
   ```

2. **MongoDB** (v4.4 or higher)
   ```bash
   mongod --version
   ```

3. **npm** (Node Package Manager)
   ```bash
   npm --version
   ```

## Project Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nagur-Meera/TracFac.git
   cd tracfac
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/tracfac
   JWT_SECRET=your_jwt_secret_key
   ADMIN_EMAIL=admin@tracfac.com
   ADMIN_PASSWORD=your_secure_password
   ```

4. **Database Setup**
   - Start MongoDB service
   - Create initial admin user in MongoDB:
   ```javascript
   // Run in MongoDB shell
   use tracfac
   db.users.insertOne({
     email: "admin@tracfac.com",
     password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // Password: admin@123
     role: "admin",
     firstName: "Admin",
     lastName: "User",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

## Running the Application

### Prerequisites
1. Ensure MongoDB is running on your system
2. Create and configure the `.env` file in the root directory
3. Install all dependencies for both server and client

### Starting the Backend Server

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # Production mode
   npm start

   # Development mode with hot reload
   npm run dev
   ```

   The server will start on port 3000 (or the port specified in your .env file)

### Starting the Frontend Client

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install client dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will start on port 5173 (Vite's default port)

### Accessing the Application

1. **Development Environment**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

2. **Production Environment**
   - The application will be accessible at: http://localhost:3000

### Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tracfac
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@tracfac.com
ADMIN_PASSWORD=admin@123

# Client Configuration (if needed)
VITE_API_URL=http://localhost:3000
```

### Common Issues and Solutions

1. **Port Already in Use**
   ```bash
   # Find the process using the port
   netstat -ano | findstr :3000
   
   # Kill the process
   taskkill /PID <process_id> /F
   ```

2. **MongoDB Connection Issues**
   - Ensure MongoDB service is running
   - Check MongoDB connection string in .env file
   - Verify MongoDB authentication if enabled

3. **Dependency Installation Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   
   # Reinstall dependencies
   npm install
   ```

### Development Workflow

1. **For Backend Development**
   ```bash
   cd server
   npm run dev
   ```

2. **For Frontend Development**
   ```bash
   cd client
   npm run dev
   ```

3. **For Full Stack Development**
   - Open two terminal windows
   - Run server in one terminal
   - Run client in another terminal

### Production Deployment

1. **Build the Frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start Production Server**
   ```bash
   cd server
   npm start
   ```

## Default Admin Credentials

The system comes with a default admin account:
- Email: admin@tracfac.com
- Password: (set in .env file)

## Project Structure

```
tracfac/
├── client/                    # Frontend React application
│   ├── public/               # Static files
│   │   ├── index.html        # Main HTML file
│   │   └── assets/          # Static assets
│   ├── src/                  # Source code
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── services/       # API services
│   │   └── App.js          # Main App component
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
│
├── server/                   # Backend Node.js application
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   └── validation.js   # Input validation
│   ├── models/             # Database models
│   │   ├── user.js        # User model
│   │   ├── program.js     # Program model
│   │   ├── section.js     # Section model
│   │   └── message.js     # Message model
│   ├── routes/            # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── user.js       # User routes
│   │   ├── program.js    # Program routes
│   │   └── message.js    # Message routes
│   ├── utils/            # Utility functions
│   ├── app.js           # Express application
│   └── package.json     # Backend dependencies
│
├── diagrams/              # Architecture diagrams
│   ├── index.html        # Main diagrams page
│   ├── css/             # Diagram styles
│   │   └── style.css    # Custom styles
│   └── js/              # Diagram scripts
│       └── script.js    # Diagram functionality
│
├── uploads/              # File uploads directory
│   ├── profile/         # Profile pictures
│   ├── documents/       # Shared documents
│   └── messages/        # Message attachments
│
├── public/              # Public static files
│   ├── css/            # Global styles
│   ├── js/             # Global scripts
│   └── images/         # Global images
│
├── .env                # Environment variables
├── server.js          # Main server file
├── createAdmin.js     # Admin creation script
├── package.json       # Root dependencies
├── SRS.md            # Software Requirements Specification
└── README.md         # Project documentation
```

## Features

1. **User Management**
   - Role-based access control (Admin, Faculty, Student)
   - Profile management
   - Secure authentication

2. **Program Management**
   - Create and manage academic programs
   - Section management
   - Student enrollment
   - Support for various academic initiatives:
     - Regular Courses: Standard academic courses with lectures, assignments, and assessments
     - Mentor-Mentee Programs: One-on-one or small group mentoring relationships
     - Research Projects: Collaborative research initiatives
     - Student Clubs: Student organizations with faculty advisors
     - Workshops and Seminars: Short-term educational events
     - Internship Programs: Structured work experiences with academic oversight

3. **Communication**
   - Direct messaging between faculty and students
   - Group conversations for programs
   - File sharing capabilities
   - Real-time notifications for:
     - New messages
     - Program updates
     - Section changes
     - Enrollment confirmations

4. **Dashboard**
   - Role-specific dashboards
   - Program overview
   - Student tracking
   - Faculty assignments
   - Real-time updates for:
     - Program changes
     - Student enrollments
     - Faculty assignments
     - Section modifications

## API Documentation

The API documentation is available at:
```
http://localhost:3000/api-docs
```

## Security Considerations

1. **Environment Variables**
   - Never commit .env file
   - Use strong passwords
   - Rotate JWT secrets regularly

2. **Database Security**
   - Use MongoDB authentication
   - Implement proper indexing
   - Regular backups

3. **Application Security**
   - Input validation
   - XSS protection
   - CSRF protection
   - Rate limiting

## Team Members

### Geetesh K (AP22110010062)
**Role:** Project Manager and Technical Writer  
**Responsibilities:**
- Managing the project
- Writing the SRS
- Overseeing technical aspects
- Documentation and coordination

### Nagur Meeravali Shaik (AP22110010061)
**Role:** Lead Developer  
**Responsibilities:**
- System architecture design
- Core functionality implementation
- Backend development
- Technical leadership

### Mansoor Muzahid Shaik (AP22110010019)
**Role:** Frontend Developer and QA Engineer  
**Responsibilities:**
- Frontend development
- Quality assurance
- System testing
- Bug tracking and resolution

### Ram Gopal M (AP22110010063)
**Role:** Frontend Developer and UI/UX Designer  
**Responsibilities:**
- User interface design
- User experience optimization
- Frontend development
- Visual design implementation

`
