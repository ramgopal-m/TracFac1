import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  ArrowBack as ArrowBackIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import FacultyHeader from './FacultyHeader';

function ProgramDetails() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

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
                Error Loading Program
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
                onClick={() => navigate('/faculty')}
                sx={{ mt: 2 }}
              >
                Return to Dashboard
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  if (!program) {
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
                Loading Program Details
              </Typography>
              <Typography 
                color="textSecondary" 
                align="center"
                sx={{ maxWidth: '400px' }}
              >
                Please wait while we fetch the program information...
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  // Filter sections to show only those assigned to current faculty
  const assignedSections = program?.sections.filter(
    section => section.faculty?._id === currentUser?._id
  ) || [];

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
                onClick={() => navigate('/faculty')}
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

            {/* Sections Grid */}
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
              {assignedSections.map((section) => (
                <Grid item xs={12} md={6} key={section._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Total Students"
                            secondary={section.students?.length || 0}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <SchoolIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Faculty"
                            secondary={section.faculty?.name || 'Not assigned'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <EmailIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Faculty Email"
                            secondary={section.faculty?.email || 'N/A'}
                          />
                        </ListItem>
                      </List>

                      {/* Students Grid */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Students
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {section.students?.slice(0, 3).map((student) => (
                            <Chip
                              key={student?._id || 'unknown'}
                              label={student?.name || 'Unknown Student'}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {section.students?.length > 3 && (
                            <Chip
                              label={`+${section.students.length - 3} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<ChevronRightIcon />}
                        onClick={() => navigate(`/faculty/program/${programId}/section/${section._id}`)}
                        sx={{
                          textTransform: 'none',
                          justifyContent: 'space-between'
                        }}
                      >
                        View Section Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default ProgramDetails; 