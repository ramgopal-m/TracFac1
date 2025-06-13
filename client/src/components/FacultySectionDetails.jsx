import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Avatar,
  Divider,
  Collapse,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import FacultyHeader from './FacultyHeader';
import Chat from './Chat';

function FacultySectionDetails() {
  const { programId, sectionId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);

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
                onClick={() => navigate(`/faculty/program/${programId}`)}
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
                onClick={() => navigate(`/faculty/program/${programId}`)}
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
                Back to Program
              </Button>
            </Box>

            {/* Section Information Card */}
            <Card sx={{ 
              mb: 3,
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
                    color: 'primary.main',
                    fontWeight: 600,
                    borderBottom: '2px solid',
                    borderColor: 'primary.light',
                    pb: 1,
                    mb: 2
                  }}
                >
                  Section Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem sx={{ 
                        transition: 'background-color 0.2s ease',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        }
                      }}>
                        <ListItemIcon>
                          <GroupIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Section Name"
                          secondary={section.name}
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
                          <PersonIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Total Students"
                          secondary={section.students?.length || 0}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
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
                          primary="Faculty Name"
                          secondary={section.faculty?.name || 'Not assigned'}
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
                          <EmailIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Faculty Email"
                          secondary={section.faculty?.email || 'N/A'}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card sx={{ 
              mb: 3,
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
                  justifyContent: 'space-between',
                  mb: 2,
                  borderBottom: '2px solid',
                  borderColor: 'primary.light',
                  pb: 1
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main'
                    }}
                  >
                    Chat with Students
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={showChat ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setShowChat(!showChat)}
                    sx={{ 
                      textTransform: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    {showChat ? 'Hide Chat' : 'Show Chat'}
                  </Button>
                </Box>
                <Collapse in={showChat}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <Chat 
                      currentUser={currentUser}
                      assignedStudents={section?.students || []}
                    />
                  </Paper>
                </Collapse>
              </CardContent>
            </Card>

            {/* Students List Card */}
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
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600, 
                    mb: 2,
                    borderBottom: '2px solid',
                    borderColor: 'primary.light',
                    pb: 1
                  }}
                >
                  Students in Section
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Profile</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Student ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {section?.students && section.students.length > 0 ? (
                        section.students.map((student) => (
                          <TableRow 
                            key={student?._id || 'unknown'} 
                            hover
                            sx={{ 
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                              }
                            }}
                          >
                            <TableCell>
                              <Avatar
                                src={student?.profile?.profilePic}
                                loading="eager"
                                sx={{ 
                                  width: 40, 
                                  height: 40,
                                  border: '1px solid',
                                  borderColor: 'primary.main',
                                  transition: 'transform 0.2s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                  }
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
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(`/faculty/student/${student?._id}`)}
                                disabled={!student?._id}
                                sx={{
                                  color: 'primary.main',
                                  borderColor: 'primary.main',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    borderColor: 'primary.dark',
                                    backgroundColor: 'primary.light',
                                    color: 'primary.dark',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                  }
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body1" color="textSecondary">
                              No students enrolled in this section
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default FacultySectionDetails; 