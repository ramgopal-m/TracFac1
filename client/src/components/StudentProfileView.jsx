import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Link,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  LinkedIn as LinkedInIcon,
  Code as GitHubIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  TableChart as TableChartIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import FacultyHeader from './FacultyHeader';

function StudentProfileView() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [imageCache, setImageCache] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch student details with profile data
        console.log('Fetching student data for ID:', studentId);
        const studentResponse = await axios.get(`/api/student/user/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('Student API Response:', studentResponse.data);
        
        // Ensure we have the complete student data
        if (studentResponse.data) {
          // Transform the data to match the expected structure
          const studentData = {
            ...studentResponse.data,
            profilePic: studentResponse.data.profile?.profilePic || '',
            studentId: studentResponse.data.profile?.studentId || '',
            contact: studentResponse.data.profile?.contact || '',
            address: studentResponse.data.profile?.location || {},
            currentGPA: studentResponse.data.profile?.currentGPA || '',
            academicYear: studentResponse.data.profile?.currentYear || '',
            college: studentResponse.data.profile?.college || '',
            branch: studentResponse.data.profile?.branch || '',
            department: studentResponse.data.profile?.department || '',
            currentSemester: studentResponse.data.profile?.currentSemester || '',
            timetable: studentResponse.data.profile?.timetable || '',
            coursesTable: studentResponse.data.profile?.coursesTable || '',
            socialLinks: studentResponse.data.profile?.socialLinks || {
              linkedin: '',
              github: ''
            }
          };

          // Ensure image URLs are absolute
          if (studentData.profilePic && !studentData.profilePic.startsWith('http')) {
            studentData.profilePic = `http://localhost:5000${studentData.profilePic}`;
          }
          if (studentData.timetable && !studentData.timetable.startsWith('http')) {
            studentData.timetable = `http://localhost:5000${studentData.timetable}`;
          }
          if (studentData.coursesTable && !studentData.coursesTable.startsWith('http')) {
            studentData.coursesTable = `http://localhost:5000${studentData.coursesTable}`;
          }

          console.log('Transformed student data:', studentData);
          setStudent(studentData);
        } else {
          setError('Student data not found');
        }

        // Fetch current user
        const userResponse = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Current user data:', userResponse.data);
        setCurrentUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching student details:', error);
        console.error('Error response:', error.response?.data);
        setError(error.response?.data?.message || 'Failed to load student details');
      }
    };

    fetchData();
  }, [studentId, navigate]);

  // Add console log for student state changes
  useEffect(() => {
    console.log('Current student state:', student);
  }, [student]);

  // Function to handle image paths
  const getImagePath = (path) => {
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

    // For local paths, construct the full URL
    const cleanPath = path.replace(/^\/+/, '');
    const fullPath = `http://localhost:5000/${cleanPath}`;
    setImageCache(prev => ({ ...prev, [path]: fullPath }));
    return fullPath;
  };

  // Preload images
  useEffect(() => {
    if (student?.profilePic) {
      const img = new Image();
      img.src = getImagePath(student.profilePic);
    }
  }, [student]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default'
      }}>
        <FacultyHeader 
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
                Error Loading Student Profile
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
                onClick={() => navigate(-1)}
                sx={{ mt: 2 }}
              >
                Go Back
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default'
      }}>
        <FacultyHeader 
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
                Loading Student Profile
              </Typography>
              <Typography 
                color="textSecondary" 
                align="center"
                sx={{ maxWidth: '400px' }}
              >
                Please wait while we fetch the student information...
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
      <FacultyHeader 
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
                onClick={() => navigate(-1)}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    transform: 'translateX(-4px)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Back
              </Button>
            </Box>

            {/* Profile Header */}
            <Card sx={{ 
              mb: 4, 
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }
            }}>
              <Box sx={{ 
                height: '120px',
                background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                borderRadius: '4px 4px 0 0'
              }} />
              <CardContent sx={{ pt: 8 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm="auto">
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      mb: { xs: 2, sm: 0 }
                    }}>
                      <Avatar
                        src={getImagePath(student.profilePic)}
                        sx={{ 
                          width: 120, 
                          height: 120,
                          border: '4px solid',
                          borderColor: 'background.paper',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                          }
                        }}
                      >
                        {student.name?.charAt(0)}
                      </Avatar>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography 
                        variant="h4" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          display: 'inline-block'
                        }}
                      >
                        {student.name}
                      </Typography>
                      <Typography 
                        variant="subtitle1" 
                        color="textSecondary"
                        gutterBottom
                        sx={{ 
                          fontWeight: 500,
                          letterSpacing: '0.5px'
                        }}
                      >
                        Student ID: {student.studentId || 'Not assigned'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                        <Chip 
                          label={student.role} 
                          color="primary" 
                          size="small"
                          sx={{ 
                            textTransform: 'capitalize',
                            fontWeight: 500,
                            boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            }
                          }}
                        />
                        {student.email && (
                          <Chip 
                            icon={<EmailIcon />}
                            label={student.email}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontWeight: 500,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                transform: 'translateY(-2px)',
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              mb: 3,
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'background.paper',
              pt: 1,
              pb: 0.5
            }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    }
                  },
                  '& .Mui-selected': {
                    fontWeight: 600,
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Tab 
                  icon={<PersonIcon />} 
                  label="Personal Info" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<SchoolIcon />} 
                  label="Academic Info" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<DescriptionIcon />} 
                  label="Documents" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<LinkedInIcon />} 
                  label="Social Links" 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ mt: 3 }}>
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      }
                    }}>
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                            borderBottom: '2px solid',
                            borderColor: 'primary.light',
                            pb: 1,
                            mb: 2
                          }}
                        >
                          Basic Information
                        </Typography>
                        <List>
                          <ListItem sx={{ 
                            transition: 'background-color 0.2s ease',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            }
                          }}>
                            <ListItemIcon>
                              <SchoolIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="College"
                              secondary={student.college || 'Not provided'}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItem>
                          <ListItem sx={{ 
                            transition: 'background-color 0.2s ease',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            }
                          }}>
                            <ListItemIcon>
                              <SchoolIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Branch"
                              secondary={student.branch || 'Not provided'}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItem>
                          <ListItem sx={{ 
                            transition: 'background-color 0.2s ease',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            }
                          }}>
                            <ListItemIcon>
                              <SchoolIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Department"
                              secondary={student.department || 'Not provided'}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      }
                    }}>
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                            borderBottom: '2px solid',
                            borderColor: 'primary.light',
                            pb: 1,
                            mb: 2
                          }}
                        >
                          Contact Information
                        </Typography>
                        <List>
                          <ListItem sx={{ 
                            transition: 'background-color 0.2s ease',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            }
                          }}>
                            <ListItemIcon>
                              <EmailIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Email"
                              secondary={student.email}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItem>
                          {student.contact && (
                            <ListItem sx={{ 
                              transition: 'background-color 0.2s ease',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                              }
                            }}>
                              <ListItemIcon>
                                <PhoneIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Contact"
                                secondary={student.contact}
                                primaryTypographyProps={{ fontWeight: 500 }}
                              />
                            </ListItem>
                          )}
                          {student.address && (
                            <ListItem sx={{ 
                              transition: 'background-color 0.2s ease',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                              }
                            }}>
                              <ListItemIcon>
                                <LocationIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Address"
                                secondary={`${student.address.cabinNo || ''} ${student.address.floor || ''} ${student.address.blockName || ''}`}
                                primaryTypographyProps={{ fontWeight: 500 }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Card sx={{ 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  }
                }}>
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main',
                        borderBottom: '2px solid',
                        borderColor: 'primary.light',
                        pb: 1,
                        mb: 2
                      }}
                    >
                      Academic Details
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            transform: 'translateY(-4px)',
                          }
                        }}>
                          <Typography 
                            variant="h4" 
                            color="primary" 
                            gutterBottom
                            sx={{ fontWeight: 700 }}
                          >
                            {student.currentGPA || 'N/A'}
                          </Typography>
                          <Typography color="textSecondary">Current GPA</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            transform: 'translateY(-4px)',
                          }
                        }}>
                          <Typography 
                            variant="h4" 
                            color="primary" 
                            gutterBottom
                            sx={{ fontWeight: 700 }}
                          >
                            {student.academicYear || 'N/A'}
                          </Typography>
                          <Typography color="textSecondary">Current Year</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            transform: 'translateY(-4px)',
                          }
                        }}>
                          <Typography 
                            variant="h4" 
                            color="primary" 
                            gutterBottom
                            sx={{ fontWeight: 700 }}
                          >
                            {student.currentSemester || 'N/A'}
                          </Typography>
                          <Typography color="textSecondary">Current Semester</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {activeTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          borderBottom: '2px solid',
                          borderColor: 'primary.light',
                          pb: 1
                        }}>
                          <CalendarIcon color="primary" sx={{ mr: 1 }} />
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: 'primary.main'
                            }}
                          >
                            Timetable
                          </Typography>
                        </Box>
                        {student.timetable ? (
                          <Box sx={{ 
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                              transform: 'scale(1.02)',
                            },
                            '&:hover .MuiIconButton-root': {
                              opacity: 1,
                              transform: 'translateY(0)',
                            }
                          }}>
                            <img 
                              src={student.timetable} 
                              alt="Timetable" 
                              style={{ 
                                width: '100%', 
                                height: 'auto',
                                borderRadius: '4px',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = '/images/placeholder.png'; // Fallback image
                              }}
                            />
                            <Tooltip title="View Full Size">
                              <IconButton
                                href={student.timetable}
                                target="_blank"
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'background.paper',
                                  opacity: 0,
                                  transform: 'translateY(-10px)',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                  }
                                }}
                              >
                                <CalendarIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography color="textSecondary">
                            No timetable uploaded
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          borderBottom: '2px solid',
                          borderColor: 'primary.light',
                          pb: 1
                        }}>
                          <TableChartIcon color="primary" sx={{ mr: 1 }} />
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: 'primary.main'
                            }}
                          >
                            Course Table
                          </Typography>
                        </Box>
                        {student.coursesTable ? (
                          <Box sx={{ 
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                              transform: 'scale(1.02)',
                            },
                            '&:hover .MuiIconButton-root': {
                              opacity: 1,
                              transform: 'translateY(0)',
                            }
                          }}>
                            <img 
                              src={student.coursesTable} 
                              alt="Course Table" 
                              style={{ 
                                width: '100%', 
                                height: 'auto',
                                borderRadius: '4px',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = '/images/placeholder.png'; // Fallback image
                              }}
                            />
                            <Tooltip title="View Full Size">
                              <IconButton
                                href={student.coursesTable}
                                target="_blank"
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'background.paper',
                                  opacity: 0,
                                  transform: 'translateY(-10px)',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                  }
                                }}
                              >
                                <TableChartIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography color="textSecondary">
                            No course table uploaded
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {activeTab === 3 && (
                <Card sx={{ 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  }
                }}>
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main',
                        borderBottom: '2px solid',
                        borderColor: 'primary.light',
                        pb: 1,
                        mb: 2
                      }}
                    >
                      Social Media Links
                    </Typography>
                    <Grid container spacing={2}>
                      {student.socialLinks?.linkedin && (
                        <Grid item xs={12} sm={6}>
                          <Button
                            startIcon={<LinkedInIcon />}
                            href={student.socialLinks.linkedin}
                            target="_blank"
                            variant="outlined"
                            fullWidth
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            LinkedIn Profile
                          </Button>
                        </Grid>
                      )}
                      {student.socialLinks?.github && (
                        <Grid item xs={12} sm={6}>
                          <Button
                            startIcon={<GitHubIcon />}
                            href={student.socialLinks.github}
                            target="_blank"
                            variant="outlined"
                            fullWidth
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            GitHub Profile
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default StudentProfileView; 