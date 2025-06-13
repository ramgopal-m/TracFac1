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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon,
  Group as GroupIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import StudentHeader from './StudentHeader';

function StudentProgramDetails() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch program details
        const programResponse = await axios.get(`/api/programs/${programId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProgram(programResponse.data);

        // Fetch current user data
        const userResponse = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching program details:', error);
        setError(error.response?.data?.message || 'Failed to load program details');
      }
    };

    fetchData();
  }, [programId, navigate]);

  // Filter sections to show only those where the student is enrolled
  const enrolledSections = program?.sections.filter(section => 
    section.students?.some(student => student?._id === currentUser?._id)
  ) || [];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!program) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
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
                onClick={() => navigate('/student')}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                Back to Dashboard
              </Button>
            </Box>

            {/* Program Header */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                >
                  {program.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  paragraph
                >
                  {program.description}
                </Typography>
              </CardContent>
            </Card>

            {/* Sections List */}
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                mb: 3
              }}
            >
              Your Sections
            </Typography>
            <Grid container spacing={3}>
              {enrolledSections.map((section) => (
                <Grid item xs={12} md={6} key={section._id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => navigate(`/student/program/${programId}/section/${section._id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <GroupIcon color="primary" sx={{ mr: 1 }} />
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: 'primary.main'
                            }}
                          >
                            {section.name}
                          </Typography>
                        </Box>
                        <IconButton>
                          <ChevronRightIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          icon={<PersonIcon />}
                          label={`${section.students?.length || 0} Students`}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          icon={<SchoolIcon />}
                          label={section.faculty?.name || 'No Faculty'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {enrolledSections.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  You are not enrolled in any sections of this program.
                </Typography>
              </Box>
            )}

            {/* Section Details */}
            {selectedSection && (
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setSelectedSection(null)}
                    sx={{ mr: 2 }}
                  >
                    Back to Sections
                  </Button>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main'
                    }}
                  >
                    Section Details: {selectedSection.name}
                  </Typography>
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
                              secondary={selectedSection.name}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <PersonIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Total Students"
                              secondary={selectedSection.students?.length || 0}
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
                              secondary={selectedSection.faculty?.name || 'Not assigned'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <EmailIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Faculty Email"
                              secondary={selectedSection.faculty?.email || 'N/A'}
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
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Faculty Profile
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          <Avatar
                            src={selectedSection.faculty?.profile?.profilePic}
                            sx={{ 
                              width: 120, 
                              height: 120,
                              border: '2px solid',
                              borderColor: 'primary.main'
                            }}
                          >
                            {selectedSection.faculty?.name?.charAt(0)}
                          </Avatar>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <PersonIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Name"
                              secondary={selectedSection.faculty?.name || 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <EmailIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Email"
                              secondary={selectedSection.faculty?.email || 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <PhoneIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Contact"
                              secondary={selectedSection.faculty?.profile?.contact || 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <SchoolIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Department"
                              secondary={selectedSection.faculty?.profile?.department || 'N/A'}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Students List Card */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Students in Section
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Profile</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Student ID</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedSection.students && selectedSection.students.length > 0 ? (
                            selectedSection.students.map((student) => (
                              <TableRow key={student._id} hover>
                                <TableCell>
                                  <Avatar
                                    src={student.profile?.profilePic}
                                    sx={{ 
                                      width: 40, 
                                      height: 40,
                                      border: '1px solid',
                                      borderColor: 'primary.main'
                                    }}
                                  >
                                    {student.name?.charAt(0)}
                                  </Avatar>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {student.name}
                                  </Typography>
                                </TableCell>
                                <TableCell>{student.profile?.studentId || 'N/A'}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => navigate(`/student/profile/${student._id}`)}
                                    sx={{
                                      color: 'primary.main',
                                      borderColor: 'primary.main',
                                      '&:hover': {
                                        borderColor: 'primary.dark',
                                        backgroundColor: 'primary.light',
                                        color: 'primary.dark',
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
                                <Typography color="textSecondary">
                                  No students assigned to this section
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
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default StudentProgramDetails; 