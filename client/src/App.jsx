import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile';
import SectionManagement from './components/SectionManagement';
import ProgramDetails from './components/ProgramDetails';
import StudentProfileView from './components/StudentProfileView';
import StudentProgramDetails from './components/StudentProgramDetails';
import SectionDetails from './components/SectionDetails';
import FacultySectionDetails from './components/FacultySectionDetails';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/*"
            element={
              <PrivateRoute role="student">
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/faculty/*"
            element={
              <PrivateRoute role="faculty">
                <FacultyDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/sections"
            element={
              <PrivateRoute>
                <SectionManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/faculty/program/:programId"
            element={
              <PrivateRoute allowedRoles={['faculty']}>
                <ProgramDetails />
              </PrivateRoute>
            }
          />
          <Route path="/student/:studentId" element={<PrivateRoute allowedRoles={['faculty']}><StudentProfileView /></PrivateRoute>} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/program/:programId" element={<StudentProgramDetails />} />
          <Route path="/student/program/:programId/section/:sectionId" element={<SectionDetails />} />
          <Route path="/student/profile/:studentId" element={<StudentProfileView />} />
          <Route 
            path="/faculty/program/:programId/section/:sectionId" 
            element={
              <PrivateRoute role="faculty">
                <FacultySectionDetails />
              </PrivateRoute>
            } 
          />
          <Route path="/faculty/student/:studentId" element={<StudentProfileView />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
