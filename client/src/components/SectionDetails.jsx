import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Divider,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  Book as BookIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import Chat from './Chat';

function SectionDetails() {
  const { programId, sectionId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [facultyData, setFacultyData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [showTimetable, setShowTimetable] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [imageCache, setImageCache] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch program details to get the section
        const programResponse = await axios.get(`/api/programs/${programId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Find the specific section
        const sectionData = programResponse.data.sections.find(
          s => s._id === sectionId
        );
        
        if (!sectionData) {
          setError('Section not found');
          return;
        }
        
        setSection(sectionData);

        // If faculty exists, fetch complete faculty data
        if (sectionData.faculty?.email) {
          try {
            const facultyResponse = await axios.get(`/api/faculty/search?email=${sectionData.faculty.email}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            // Store the complete faculty data
            setFacultyData(facultyResponse.data);
          } catch (facultyError) {
            console.error('Error fetching faculty details:', facultyError);
            setError('Failed to load faculty details');
          }
        }

        // Fetch current user data
        const userResponse = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching section details:', error);
        setError(error.response?.data?.message || 'Failed to load section details');
      }
    };

    fetchData();
  }, [programId, sectionId, navigate]);

  // Update the getImagePath function to handle faculty images better
  const getImagePath = (path, isFaculty = false) => {
    if (!path) return null;
    
    // Check if image is already in cache
    if (imageCache[path]) {
      return imageCache[path];
    }

    // If the path is already a full URL, return it as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const fullPath = path;
      setImageCache(prev => ({ ...prev, [path]: fullPath }));
      return fullPath;
    }

    // For faculty images and timetables, ensure we're using the correct path format
    if (isFaculty) {
      // Remove any leading slashes to prevent double slashes
      const cleanPath = path.replace(/^\/+/, '');
      const fullPath = `http://localhost:5000/${cleanPath}`;
      setImageCache(prev => ({ ...prev, [path]: fullPath }));
      return fullPath;
    }

    // For other images (students, etc.)
    const cleanPath = path.replace(/^\/+/, '');
    const fullPath = `http://localhost:5000/${cleanPath}`;
    setImageCache(prev => ({ ...prev, [path]: fullPath }));
    return fullPath;
  };

  // Update the preloadImage function to handle faculty images
  const preloadImage = (path, isFaculty = false) => {
    if (!path) return;
    const img = new Image();
    img.src = getImagePath(path, isFaculty);
  };

  // Update the faculty data effect to preload images immediately
  useEffect(() => {
    if (facultyData?.profile) {
      // Preload profile picture with faculty flag
      preloadImage(facultyData.profile.profilePic, true);
      // Preload timetable if exists with faculty flag
      if (facultyData.profile.timetable) {
        preloadImage(facultyData.profile.timetable, true);
      }
    }
  }, [facultyData]);

  // Preload student images when section changes
  useEffect(() => {
    if (section?.students) {
      section.students.forEach(student => {
        if (student?.profile?.profilePic) {
          preloadImage(student.profile.profilePic);
        }
      });
    }
  }, [section]);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default'
      }}>
        <StudentHeader 
          currentUser={currentUser}
          onTabChange={() => {}}
          tabValue={1}
          onProfileClick={() => {}}
          onLogout={() => {}}
        />
        
        {/* Spacer for fixed header */}
        <Box sx={{ height: { xs: '56px', sm: '64px' } }} />
        
        <Box 
          component="main" 
          sx={{ 
            flex: 1,
            display: 'flex',
            width: '100%',
            maxWidth: '1600px',
            mx: 'auto',
            height: 'calc(100vh - 56px)',
            '@media (min-width: 600px)': {
              height: 'calc(100vh - 64px)'
            }
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              overflow: 'hidden',
              width: '100%'
            }}
          >
            <Box sx={{ 
              height: '100%',
              overflow: 'auto',
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography 
                variant="h5" 
                color="error" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Error Loading Section
              </Typography>
              <Typography 
                color="textSecondary" 
                align="center"
                sx={{ maxWidth: '400px' }}
              >
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(`/student/program/${programId}`)}
                sx={{ mt: 2 }}
              >
                Return to Program
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  if (!section) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default'
      }}>
        <StudentHeader 
          currentUser={currentUser}
          onTabChange={() => {}}
          tabValue={1}
          onProfileClick={() => {}}
          onLogout={() => {}}
        />
        
        {/* Spacer for fixed header */}
        <Box sx={{ height: { xs: '56px', sm: '64px' } }} />
        
        <Box 
          component="main" 
          sx={{ 
            flex: 1,
            display: 'flex',
            width: '100%',
            maxWidth: '1600px',
            mx: 'auto',
            height: 'calc(100vh - 56px)',
            '@media (min-width: 600px)': {
              height: 'calc(100vh - 64px)'
            }
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              overflow: 'hidden',
              width: '100%'
            }}
          >
            <Box sx={{ 
              height: '100%',
              overflow: 'auto',
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Loading Section Details
              </Typography>
              <Typography 
                color="textSecondary" 
                align="center"
                sx={{ maxWidth: '400px' }}
              >
                Please wait while we fetch the section information...
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      bgcolor: 'background.default'
    }}>
      <StudentHeader 
        currentUser={currentUser}
        onTabChange={() => {}}
        tabValue={1}
        onProfileClick={() => {}}
        onLogout={() => {}}
      />
      
      {/* Spacer for fixed header */}
      <Box sx={{ height: { xs: '56px', sm: '64px' } }} />
      
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          display: 'flex',
          width: '100%',
          maxWidth: '1600px',
          mx: 'auto',
          height: 'calc(100vh - 56px)',
          '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px)'
          }
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            overflow: 'hidden',
            width: '100%'
          }}
        >
          <Box sx={{ 
            height: '100%',
            overflow: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 3 },
          }}>
            {/* Back Button */}
            <Box sx={{ mb: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/student/program/${programId}`)}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                Back to Program
              </Button>
            </Box>

            {/* Section Information Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Section Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <GroupIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Section Name"
                          secondary={section.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Total Students"
                          secondary={section.students?.length || 0}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <SchoolIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Faculty Name"
                          secondary={facultyData?.name || 'Not assigned'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Faculty Email"
                          secondary={facultyData?.email || 'N/A'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Faculty Profile Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Profile Picture */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Avatar
                        src={getImagePath(facultyData?.profile?.profilePic, true)}
                        sx={{ 
                          width: 120, 
                          height: 120,
                          border: '2px solid',
                          borderColor: 'primary.main'
                        }}
                        loading="eager"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-avatar.png';
                        }}
                      >
                        {facultyData?.name?.charAt(0)}
                      </Avatar>
                    </Box>
                  </Grid>

                  {/* Main Content */}
                  <Grid item xs={12} md={9}>
                    {/* Faculty ID and Email Header */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {facultyData?.profile?.facultyId || 'Not Available'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {facultyData?.email || 'Not Available'}
                      </Typography>
                    </Box>

                    {/* About Me Section */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        About Me
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {facultyData?.profile?.description || 'No description available'}
                      </Typography>
                    </Box>

                    {/* Required Information */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Required Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                          <Typography variant="body1">{facultyData?.name || 'Not Available'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{facultyData?.email || 'Not Available'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">Faculty ID</Typography>
                          <Typography variant="body1">{facultyData?.profile?.facultyId || 'Not Available'}</Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Additional Information */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Additional Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">College</Typography>
                          <Typography variant="body1">{facultyData?.profile?.college || 'Not Available'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">Branch</Typography>
                          <Typography variant="body1">{facultyData?.profile?.branch || 'Not Available'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                          <Typography variant="body1">{facultyData?.profile?.department || 'Not Available'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">Qualification</Typography>
                          <Typography variant="body1">{facultyData?.profile?.qualification || 'Not Available'}</Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Location Information */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Location Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">Cabin No.</Typography>
                          <Typography variant="body1">{facultyData?.profile?.location?.cabinNo || 'Not Available'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">Floor/Level</Typography>
                          <Typography variant="body1">{facultyData?.profile?.location?.floor || 'Not Available'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">Block Name</Typography>
                          <Typography variant="body1">{facultyData?.profile?.location?.blockName || 'Not Available'}</Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Social Links */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Social Links
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">LinkedIn Profile</Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            href={facultyData?.profile?.socialLinks?.linkedin}
                            target="_blank"
                            disabled={!facultyData?.profile?.socialLinks?.linkedin}
                            sx={{ textTransform: 'none', mt: 0.5 }}
                          >
                            {facultyData?.profile?.socialLinks?.linkedin ? 'View Profile' : 'Not Available'}
                          </Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">GitHub Profile</Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            href={facultyData?.profile?.socialLinks?.github}
                            target="_blank"
                            disabled={!facultyData?.profile?.socialLinks?.github}
                            sx={{ textTransform: 'none', mt: 0.5 }}
                          >
                            {facultyData?.profile?.socialLinks?.github ? 'View Profile' : 'Not Available'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Courses */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Courses
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {facultyData?.profile?.courses && facultyData.profile.courses.length > 0 ? (
                          facultyData.profile.courses.map((course, index) => (
                            <Chip
                              key={index}
                              label={course}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No courses assigned
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Timetable */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 2 
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Timetable
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={showTimetable ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          onClick={() => setShowTimetable(!showTimetable)}
                          sx={{ textTransform: 'none' }}
                        >
                          {showTimetable ? 'Hide Timetable' : 'Show Timetable'}
                        </Button>
                      </Box>
                      <Collapse in={showTimetable}>
                        {facultyData?.profile?.timetable ? (
                          <Box sx={{ 
                            width: '100%',
                            maxWidth: '800px',
                            mx: 'auto',
                            position: 'relative'
                          }}>
                            <img
                              src={getImagePath(facultyData.profile.timetable, true)}
                              alt="Timetable"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease-in-out'
                              }}
                              onLoad={(e) => {
                                e.target.style.opacity = '1';
                              }}
                              onError={(e) => {
                                console.error('Error loading timetable:', e);
                                e.target.style.opacity = '1';
                                e.target.src = '/placeholder-timetable.png';
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No timetable available</Typography>
                        )}
                      </Collapse>
                    </Box>

                    {/* Chat Section */}
                    <Box sx={{ mt: 4 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 2 
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Chat with Faculty
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={showChat ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          onClick={() => setShowChat(!showChat)}
                          sx={{ textTransform: 'none' }}
                        >
                          {showChat ? 'Hide Chat' : 'Show Chat'}
                        </Button>
                      </Box>
                      <Collapse in={showChat}>
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Chat 
                            currentUser={currentUser} 
                            selectedFacultyId={facultyData?._id}
                          />
                        </Paper>
                      </Collapse>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Students List Card */}
            <Card>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 2 
                }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Students in Section
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={showStudents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setShowStudents(!showStudents)}
                    sx={{ textTransform: 'none' }}
                  >
                    {showStudents ? 'Hide Students' : 'Show Students'}
                  </Button>
                </Box>
                <Collapse in={showStudents}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Profile</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Student ID</TableCell>
                          <TableCell>Email</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {section?.students && section.students.length > 0 ? (
                          section.students.map((student) => (
                            <TableRow key={student?._id || 'unknown'} hover>
                              <TableCell>
                                <Avatar
                                  src={getImagePath(student?.profile?.profilePic)}
                                  loading="eager"
                                  sx={{ 
                                    width: 40, 
                                    height: 40,
                                    border: '1px solid',
                                    borderColor: 'primary.main'
                                  }}
                                >
                                  {student?.name?.charAt(0) || '?'}
                                </Avatar>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {student?.name || 'Unknown Student'}
                                </Typography>
                              </TableCell>
                              <TableCell>{student?.profile?.studentId || 'N/A'}</TableCell>
                              <TableCell>{student?.email || 'N/A'}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography color="textSecondary">
                                No students assigned to this section
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default SectionDetails; 