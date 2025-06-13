import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FacultyHeader from './FacultyHeader';
import Chat from './Chat';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ 
          height: '100%',
          overflow: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function FacultyDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [students, setStudents] = useState([]);
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [timetableFile, setTimetableFile] = useState(null);
  const [timetablePreview, setTimetablePreview] = useState(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [newCourse, setNewCourse] = useState('');
  const [imageCache, setImageCache] = useState({});

  useEffect(() => {
    const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

        setCurrentUser(response.data);
        fetchStudents();
        fetchAssignedPrograms();
    } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
    }
  };

    fetchData();
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/faculty/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch students list');
    }
  };

  const fetchAssignedPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/program-assignments/assigned', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedPrograms(response.data);
    } catch (error) {
      console.error('Error fetching assigned programs:', error);
      setError(error.response?.data?.error || 'Failed to fetch assigned programs');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditedProfile({
      ...currentUser,
      profile: {
        ...currentUser.profile,
        college: currentUser.profile?.college || '',
        branch: currentUser.profile?.branch || '',
        department: currentUser.profile?.department || '',
        qualification: currentUser.profile?.qualification || '',
        description: currentUser.profile?.description || '',
        courses: currentUser.profile?.courses || [],
        location: currentUser.profile?.location || {},
        socialLinks: currentUser.profile?.socialLinks || {},
        timetable: currentUser.profile?.timetable || '',
        profilePic: currentUser.profile?.profilePic || ''
      }
    });
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedProfile(null);
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setTimetableFile(null);
    setTimetablePreview(null);
  };

  const handleProfileChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const handleFileChange = (fileType, event) => {
    const file = event.target.files[0];
    if (file) {
      switch (fileType) {
        case 'profilePic':
          setProfilePicFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfilePicPreview(reader.result);
            setEditedProfile(prev => ({
              ...prev,
              profile: {
                ...prev.profile,
                profilePic: reader.result
              }
            }));
          };
          reader.readAsDataURL(file);
          break;
        case 'timetable':
          setTimetableFile(file);
          const timetableReader = new FileReader();
          timetableReader.onloadend = () => {
            setTimetablePreview(timetableReader.result);
            setEditedProfile(prev => ({
              ...prev,
              profile: {
                ...prev.profile,
                timetable: timetableReader.result
              }
            }));
          };
          timetableReader.readAsDataURL(file);
          break;
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Add profile picture if changed
      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }

      // Add timetable if changed
      if (timetableFile) {
        formData.append('timetable', timetableFile);
      }

      // Create profile data
      const profileData = {
        ...editedProfile.profile,
        facultyId: currentUser.profile?.facultyId, // Preserve facultyId
        profilePic: editedProfile.profile.profilePic || currentUser.profile?.profilePic, // Preserve profile picture
        timetable: editedProfile.profile.timetable || currentUser.profile?.timetable // Preserve timetable
      };

      // Add profile data
      formData.append('profile', JSON.stringify(profileData));

      const response = await axios.put('/api/auth/profile', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      // Update the current user with the new data
      setCurrentUser(response.data);
      setIsEditMode(false);
      setProfilePicFile(null);
      setProfilePicPreview(null);
      setTimetableFile(null);
      setTimetablePreview(null);
      setError('');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.response?.data?.message || 'Failed to save profile');
    }
  };

  const handleAddCourse = () => {
    if (newCourse.trim()) {
      setEditedProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          courses: [...prev.profile.courses, newCourse]
        }
      }));
      setNewCourse('');
    }
  };

  const handleRemoveCourse = (index) => {
    setEditedProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        courses: prev.profile.courses.filter((_, i) => i !== index)
      }
    }));
  };

  const handleViewProgram = (programId) => {
    navigate(`/faculty/program/${programId}`);
  };

  // Add getImagePath function
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

  // Add preloadImage function
  const preloadImage = (path, isFaculty = false) => {
    if (!path) return;
    const img = new Image();
    img.src = getImagePath(path, isFaculty);
  };

  // Add effect to preload images
  useEffect(() => {
    if (currentUser?.profile) {
      // Preload profile picture with faculty flag
      preloadImage(currentUser.profile.profilePic, true);
      // Preload timetable if exists with faculty flag
      if (currentUser.profile.timetable) {
        preloadImage(currentUser.profile.timetable, true);
      }
    }
  }, [currentUser]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      bgcolor: 'background.default',
      position: 'relative',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(25, 118, 210, 0) 100%)',
        borderRadius: 4,
        zIndex: 0,
        transition: 'all 0.3s ease',
      },
      '&:hover:before': {
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0) 100%)',
      }
    }}>
      <FacultyHeader 
        currentUser={currentUser} 
        onTabChange={handleTabChange}
        tabValue={tabValue}
        onProfileClick={handleProfileMenuClick}
        onLogout={handleLogout}
      />
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          Logout
        </MenuItem>
      </Menu>
      
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
          },
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            '& .MuiPaper-root': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }
          }
        }}
      >
        {/* Navigation Sidebar - Hidden on mobile */}
        <Paper 
          elevation={0}
          sx={{ 
            width: { xs: '100%', sm: '240px' },
            display: { xs: 'none', sm: 'block' },
            borderRight: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'background.paper',
            }
          }}
        >
          <List sx={{ 
            p: 0,
            '& .MuiListItemButton-root': {
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(4px)',
                bgcolor: 'action.hover',
              }
            }
          }}>
            <ListItem disablePadding>
              <ListItemButton 
                selected={tabValue === 0}
                onClick={() => handleTabChange(0)}
                sx={{
                  py: 2,
                  px: 3,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      transform: 'translateX(4px)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'inherit',
                      transform: 'scale(1.1)',
                    },
                  },
                  '& .MuiListItemIcon-root': {
                    transition: 'transform 0.3s ease',
                  }
                }}
              >
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="My Profile"
                  primaryTypographyProps={{
                    fontWeight: tabValue === 0 ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                selected={tabValue === 1}
                onClick={() => handleTabChange(1)}
                sx={{
                  py: 2,
                  px: 3,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'inherit',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Assigned Programs"
                  primaryTypographyProps={{
                    fontWeight: tabValue === 1 ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                selected={tabValue === 2}
                onClick={() => handleTabChange(2)}
                sx={{
                  py: 2,
                  px: 3,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'inherit',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <MessageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Messages"
                  primaryTypographyProps={{
                    fontWeight: tabValue === 2 ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>

        {/* Main Content Area */}
        <Paper 
          elevation={0}
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            overflow: 'hidden',
            width: { xs: '100%', sm: 'calc(100% - 240px)' },
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }
          }}
        >
          <TabPanel value={tabValue} index={0}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                fontWeight: 600,
                mb: { xs: 2, sm: 3, md: 4 },
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: '60px',
                  height: '4px',
                  backgroundColor: 'primary.main',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                },
                '&:hover:after': {
                  width: '100%',
                }
              }}
            >
                My Profile
              </Typography>
            {currentUser && (
              <Card sx={{ 
                mb: 4,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  '& .MuiCardContent-root': {
                    '&:before': {
                      opacity: 1,
                    }
                  }
                },
                '& .MuiCardContent-root': {
                  position: 'relative',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 0,
                  }
                }
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Box sx={{ 
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      }
                    }}>
                      <Avatar
                        src={isEditMode ? (profilePicPreview || getImagePath(editedProfile?.profile?.profilePic, true)) : (getImagePath(currentUser.profile?.profilePic, true) || null)}
                        sx={{
                          width: { xs: 100, sm: 120 },
                          height: { xs: 100, sm: 120 },
                          mr: 3,
                          bgcolor: 'primary.main',
                          border: '2px solid',
                          borderColor: 'primary.main',
                          objectFit: 'cover',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'primary.dark',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                          }
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-avatar.png';
                        }}
                      >
                        {(!currentUser.profile?.profilePic && !profilePicPreview) && currentUser.name?.charAt(0)}
                      </Avatar>
                      {isEditMode && (
                        <IconButton
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: 'primary.main',
                            color: 'white',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange('profilePic', e)}
                          />
                          <PhotoCameraIcon />
                        </IconButton>
                      )}
                    </Box>
                    <Box sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(8px)',
                      }
                    }}>
                      <Typography 
                        variant="h5" 
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: 'primary.main',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: 'primary.dark',
                          }
                        }}
                      >
                        {currentUser.name}
                      </Typography>
                      <Typography 
                        color="textSecondary" 
                        gutterBottom
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: 'text.primary',
                          }
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 16 }} />
                        Faculty ID: {currentUser.profile?.facultyId || 'Not assigned'}
                      </Typography>
                      <Typography 
                        color="textSecondary"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: 'text.primary',
                          }
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 16 }} />
                        {currentUser.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ 
                    my: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }} />

                  <Grid container spacing={3}>
                    {/* About Me Section */}
                    <Grid xs={12}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          position: 'relative',
                          display: 'inline-block',
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -4,
                            left: 0,
                            width: '40px',
                            height: '2px',
                            backgroundColor: 'primary.main',
                            transition: 'width 0.3s ease',
                          },
                          '&:hover:after': {
                            width: '100%',
                          }
                        }}
                      >
                        About Me
                      </Typography>
                      <Box sx={{ 
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        minHeight: '100px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }
                      }}>
                        {isEditMode ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            value={editedProfile?.profile?.description || ''}
                            onChange={(e) => handleProfileChange('description', e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.light',
                                  }
                                },
                                '&.Mui-focused': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderWidth: 2,
                                  }
                                }
                              }
                            }}
                          />
                        ) : (
                          <Typography 
                            variant="body1" 
                            color="textPrimary"
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'text.primary',
                              }
                            }}
                          >
                            {currentUser.profile?.description || 'No description provided'}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Required Fields */}
                    <Grid xs={12} md={6}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          position: 'relative',
                          display: 'inline-block',
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -4,
                            left: 0,
                            width: '40px',
                            height: '2px',
                            backgroundColor: 'primary.main',
                            transition: 'width 0.3s ease',
                          },
                          '&:hover:after': {
                            width: '100%',
                          }
                        }}
                      >
                        Required Information
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }
                      }}>
                        <Box sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                          }
                        }}>
                          <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            display="block"
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'primary.main',
                              }
                            }}
                          >
                            Name
                          </Typography>
                          <Typography 
                            variant="body1"
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'primary.main',
                              }
                            }}
                          >
                            {currentUser.name}
                          </Typography>
                        </Box>
                        <Box sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                          }
                        }}>
                          <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            display="block"
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'primary.main',
                              }
                            }}
                          >
                            Email
                          </Typography>
                          <Typography 
                            variant="body1"
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'primary.main',
                              }
                            }}
                          >
                            {currentUser.email}
                          </Typography>
                        </Box>
                        <Box sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                          }
                        }}>
                          <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            display="block"
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'primary.main',
                              }
                            }}
                          >
                            Faculty ID
                          </Typography>
                          <Typography 
                            variant="body1"
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'primary.main',
                              }
                            }}
                          >
                            {currentUser.profile?.facultyId || 'Not assigned'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Optional Fields */}
                    <Grid xs={12} md={6}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          position: 'relative',
                          display: 'inline-block',
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -4,
                            left: 0,
                            width: '40px',
                            height: '2px',
                            backgroundColor: 'primary.main',
                            transition: 'width 0.3s ease',
                          },
                          '&:hover:after': {
                            width: '100%',
                          }
                        }}
                      >
                        Additional Information
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }
                      }}>
                        {isEditMode ? (
                          <>
                            <TextField
                              fullWidth
                              label="College"
                              value={editedProfile?.profile?.college || ''}
                              onChange={(e) => handleProfileChange('college', e.target.value)}
                              sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'primary.light',
                                    }
                                  },
                                  '&.Mui-focused': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderWidth: 2,
                                    }
                                  }
                                }
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Branch"
                              value={editedProfile?.profile?.branch || ''}
                              onChange={(e) => handleProfileChange('branch', e.target.value)}
                              sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'primary.light',
                                    }
                                  },
                                  '&.Mui-focused': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderWidth: 2,
                                    }
                                  }
                                }
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Department"
                              value={editedProfile?.profile?.department || ''}
                              onChange={(e) => handleProfileChange('department', e.target.value)}
                              sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'primary.light',
                                    }
                                  },
                                  '&.Mui-focused': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderWidth: 2,
                                    }
                                  }
                                }
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Qualification"
                              value={editedProfile?.profile?.qualification || ''}
                              onChange={(e) => handleProfileChange('qualification', e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'primary.light',
                                    }
                                  },
                                  '&.Mui-focused': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderWidth: 2,
                                    }
                                  }
                                }
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <Box sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                              }
                            }}>
                              <Typography 
                                variant="caption" 
                                color="textSecondary" 
                                display="block"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                College
                              </Typography>
                              <Typography 
                                variant="body1"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                {currentUser.profile?.college || 'Not specified'}
                              </Typography>
                            </Box>
                            <Box sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                              }
                            }}>
                              <Typography 
                                variant="caption" 
                                color="textSecondary" 
                                display="block"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                Branch
                              </Typography>
                              <Typography 
                                variant="body1"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                {currentUser.profile?.branch || 'Not specified'}
                              </Typography>
                            </Box>
                            <Box sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                              }
                            }}>
                              <Typography 
                                variant="caption" 
                                color="textSecondary" 
                                display="block"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                Department
                              </Typography>
                              <Typography 
                                variant="body1"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                {currentUser.profile?.department || 'Not specified'}
                              </Typography>
                            </Box>
                            <Box sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                              }
                            }}>
                              <Typography 
                                variant="caption" 
                                color="textSecondary" 
                                display="block"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                Qualification
                              </Typography>
                              <Typography 
                                variant="body1"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                {currentUser.profile?.qualification || 'Not specified'}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Grid>

                    {/* Location Information */}
                    <Grid xs={12}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          position: 'relative',
                          display: 'inline-block',
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -4,
                            left: 0,
                            width: '40px',
                            height: '2px',
                            backgroundColor: 'primary.main',
                            transition: 'width 0.3s ease',
                          },
                          '&:hover:after': {
                            width: '100%',
                          }
                        }}
                      >
                        Location Information
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }
                      }}>
                        <Grid container spacing={2}>
                          <Grid xs={12} md={4}>
                            {isEditMode ? (
                              <TextField
                                fullWidth
                                label="Cabin No."
                                value={editedProfile?.profile?.location?.cabinNo || ''}
                                onChange={(e) => handleProfileChange('location', {
                                  ...(editedProfile?.profile?.location || {}),
                                  cabinNo: e.target.value
                                })}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.light',
                                      }
                                    },
                                    '&.Mui-focused': {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderWidth: 2,
                                      }
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <Box sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                }
                              }}>
                                <Typography 
                                  variant="caption" 
                                  color="textSecondary" 
                                  display="block"
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      color: 'primary.main',
                                    }
                                  }}
                                >
                                  Cabin No.
                                </Typography>
                                <Typography 
                                  variant="body1"
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      color: 'primary.main',
                                    }
                                  }}
                                >
                                  {currentUser.profile?.location?.cabinNo || 'Not specified'}
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                          <Grid xs={12} md={4}>
                            {isEditMode ? (
                              <TextField
                                fullWidth
                                label="Floor/Level"
                                value={editedProfile?.profile?.location?.floor || ''}
                                onChange={(e) => handleProfileChange('location', {
                                  ...(editedProfile?.profile?.location || {}),
                                  floor: e.target.value
                                })}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.light',
                                      }
                                    },
                                    '&.Mui-focused': {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderWidth: 2,
                                      }
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <Box sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                }
                              }}>
                                <Typography 
                                  variant="caption" 
                                  color="textSecondary" 
                                  display="block"
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      color: 'primary.main',
                                    }
                                  }}
                                >
                                  Floor/Level
                                </Typography>
                                <Typography 
                                  variant="body1"
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      color: 'primary.main',
                                    }
                                  }}
                                >
                                  {currentUser.profile?.location?.floor || 'Not specified'}
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                          <Grid xs={12} md={4}>
                            {isEditMode ? (
                              <TextField
                                fullWidth
                                label="Block Name"
                                value={editedProfile?.profile?.location?.blockName || ''}
                                onChange={(e) => handleProfileChange('location', {
                                  ...(editedProfile?.profile?.location || {}),
                                  blockName: e.target.value
                                })}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.light',
                                      }
                                    },
                                    '&.Mui-focused': {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderWidth: 2,
                                      }
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <Box sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                }
                              }}>
                                <Typography 
                                  variant="caption" 
                                  color="textSecondary" 
                                  display="block"
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      color: 'primary.main',
                                    }
                                  }}
                                >
                                  Block Name
                                </Typography>
                                <Typography 
                                  variant="body1"
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      color: 'primary.main',
                                    }
                                  }}
                                >
                                  {currentUser.profile?.location?.blockName || 'Not specified'}
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Social Links */}
                    <Grid xs={12}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          position: 'relative',
                          display: 'inline-block',
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -4,
                            left: 0,
                            width: '40px',
                            height: '2px',
                            backgroundColor: 'primary.main',
                            transition: 'width 0.3s ease',
                          },
                          '&:hover:after': {
                            width: '100%',
                          }
                        }}
                      >
                        Social Links
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }
                      }}>
                        <Grid container spacing={2}>
                          <Grid xs={12} md={6}>
                            <Box sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                              }
                            }}>
                              <Typography 
                                variant="caption" 
                                color="textSecondary" 
                                display="block"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                LinkedIn Profile
                              </Typography>
                              {isEditMode ? (
                                <TextField
                                  fullWidth
                                  placeholder="Enter LinkedIn profile URL"
                                  value={editedProfile?.profile?.socialLinks?.linkedin || ''}
                                  onChange={(e) => handleProfileChange('socialLinks', {
                                    ...(editedProfile?.profile?.socialLinks || {}),
                                    linkedin: e.target.value
                                  })}
                                  sx={{ 
                                    mt: 0.5,
                                    '& .MuiOutlinedInput-root': {
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'primary.light',
                                        }
                                      },
                                      '&.Mui-focused': {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderWidth: 2,
                                        }
                                      }
                                    }
                                  }}
                                />
                              ) : (
                                currentUser.profile?.socialLinks?.linkedin ? (
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'translateX(4px)',
                                    }
                                  }}>
                                    <Typography 
                                      variant="body1"
                                      component="a"
                                      href={currentUser.profile.socialLinks.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ 
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          color: 'primary.dark',
                                          textDecoration: 'underline',
                                        }
                                      }}
                                    >
                                      View Profile
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography 
                                    variant="body1" 
                                    color="textSecondary"
                                    sx={{
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        color: 'text.primary',
                                      }
                                    }}
                                  >
                                    Not specified
                                  </Typography>
                                )
                              )}
                            </Box>
                          </Grid>
                          <Grid xs={12} md={6}>
                            <Box sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                              }
                            }}>
                              <Typography 
                                variant="caption" 
                                color="textSecondary" 
                                display="block"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                  }
                                }}
                              >
                                GitHub Profile
                              </Typography>
                              {isEditMode ? (
                                <TextField
                                  fullWidth
                                  placeholder="Enter GitHub profile URL"
                                  value={editedProfile?.profile?.socialLinks?.github || ''}
                                  onChange={(e) => handleProfileChange('socialLinks', {
                                    ...(editedProfile?.profile?.socialLinks || {}),
                                    github: e.target.value
                                  })}
                                  sx={{ 
                                    mt: 0.5,
                                    '& .MuiOutlinedInput-root': {
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'primary.light',
                                        }
                                      },
                                      '&.Mui-focused': {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderWidth: 2,
                                        }
                                      }
                                    }
                                  }}
                                />
                              ) : (
                                currentUser.profile?.socialLinks?.github ? (
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'translateX(4px)',
                                    }
                                  }}>
                                    <Typography 
                                      variant="body1"
                                      component="a"
                                      href={currentUser.profile.socialLinks.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ 
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          color: 'primary.dark',
                                          textDecoration: 'underline',
                                        }
                                      }}
                                    >
                                      View Profile
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography 
                                    variant="body1" 
                                    color="textSecondary"
                                    sx={{
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        color: 'text.primary',
                                      }
                                    }}
                                  >
                                    Not specified
                                  </Typography>
                                )
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Courses */}
                    <Grid xs={12}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          position: 'relative',
                          display: 'inline-block',
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -4,
                            left: 0,
                            width: '40px',
                            height: '2px',
                            backgroundColor: 'primary.main',
                            transition: 'width 0.3s ease',
                          },
                          '&:hover:after': {
                            width: '100%',
                          }
                        }}
                      >
                        Courses
                      </Typography>
                      <Box sx={{ 
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        minHeight: '100px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }
                      }}>
                        {isEditMode ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                              fullWidth
                              label="Add Course"
                              value={newCourse}
                              onChange={(e) => setNewCourse(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && newCourse.trim()) {
                                  handleAddCourse();
                                }
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'primary.light',
                                    }
                                  },
                                  '&.Mui-focused': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderWidth: 2,
                                    }
                                  }
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={handleAddCourse}
                                      disabled={!newCourse.trim()}
                                      sx={{
                                        color: 'primary.main',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          color: 'primary.dark',
                                          transform: 'scale(1.1)',
                                        }
                                      }}
                                    >
                                      <AddIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <Box sx={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: 1
                            }}>
                              {editedProfile.profile.courses.map((course, index) => (
                                <Chip
                                  key={index}
                                  label={course}
                                  onDelete={() => handleRemoveCourse(index)}
                                  sx={{ 
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      transform: 'scale(1.05)',
                                    },
                                    '& .MuiChip-deleteIcon': {
                                      color: 'inherit',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        color: 'error.main',
                                        transform: 'scale(1.2)',
                                      }
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        ) : (
                          currentUser.profile?.courses?.length > 0 ? (
                            <Box sx={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: 1
                            }}>
                              {currentUser.profile.courses.map((course, index) => (
                                <Chip
                                  key={index}
                                  label={course}
                                  sx={{ 
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      transform: 'scale(1.05)',
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: 'center',
                              py: 2
                            }}>
                              <Typography 
                                color="textSecondary" 
                                gutterBottom
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'text.primary',
                                  }
                                }}
                              >
                                No courses added yet
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'text.primary',
                                  }
                                }}
                              >
                                Click "Edit Profile" to add your courses
                              </Typography>
                            </Box>
                          )
                        )}
                      </Box>
                    </Grid>

                    {/* Timetable */}
                    <Grid xs={12}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          position: 'relative',
                          display: 'inline-block',
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -4,
                            left: 0,
                            width: '40px',
                            height: '2px',
                            backgroundColor: 'primary.main',
                            transition: 'width 0.3s ease',
                          },
                          '&:hover:after': {
                            width: '100%',
                          }
                        }}
                      >
                        Timetable
                      </Typography>
                      <Box sx={{ 
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }
                      }}>
                        {isEditMode ? (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2
                          }}>
                            {(timetablePreview || editedProfile?.profile?.timetable) && (
                              <Box sx={{ 
                                width: '100%',
                                maxWidth: '800px',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }
                              }}>
                                <img
                                  src={timetablePreview || getImagePath(editedProfile.profile.timetable, true)}
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
                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    setTimetableFile(null);
                                    setTimetablePreview(null);
                                    handleProfileChange('timetable', '');
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'background.paper',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: 'error.light',
                                      color: 'error.contrastText',
                                      transform: 'scale(1.1)',
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            )}
                            <Button
                              component="label"
                              variant="outlined"
                              startIcon={<AddIcon />}
                              sx={{ 
                                mt: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                }
                              }}
                            >
                              {(timetablePreview || editedProfile?.profile?.timetable) ? 'Change Timetable' : 'Upload Timetable'}
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleFileChange('timetable', e)}
                              />
                            </Button>
                          </Box>
                        ) : (
                          currentUser.profile?.timetable ? (
                            <Box sx={{ 
                              width: '100%',
                              maxWidth: '800px',
                              mx: 'auto',
                              position: 'relative',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }
                            }}>
                              <img
                                src={getImagePath(currentUser.profile.timetable, true)}
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
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: 'center',
                              py: 4
                            }}>
                              <Typography 
                                color="textSecondary" 
                                gutterBottom
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'text.primary',
                                  }
                                }}
                              >
                                No timetable uploaded yet
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: 'text.primary',
                                  }
                                }}
                              >
                                Click "Edit Profile" to upload your timetable
                              </Typography>
                            </Box>
                          )
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ 
                    mt: 3, 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    gap: 2
                  }}>
                    {isEditMode ? (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelEdit}
                          sx={{ 
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveProfile}
                          sx={{ 
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            }
                          }}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleEditProfile}
                        sx={{ 
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                          }
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                fontWeight: 600,
                mb: { xs: 2, sm: 3, md: 4 }
              }}
            >
              Assigned Programs
            </Typography>
            {error && (
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
            )}
            {assignedPrograms.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
                bgcolor: 'background.default',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography color="textSecondary" gutterBottom>
                  No programs assigned yet
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  You will see your assigned programs here
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {assignedPrograms.map((program) => (
                  <Grid item xs={12} md={6} key={program._id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          '& .MuiCardContent-root': {
                            '&:before': {
                              opacity: 1,
                            }
                          }
                        },
                        '& .MuiCardContent-root': {
                          position: 'relative',
                          '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0) 100%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            zIndex: 0,
                          }
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            fontWeight: 600,
                            color: 'primary.main'
                          }}
                        >
                          {program.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          paragraph
                          sx={{ mb: 2 }}
                        >
                          {program.description}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography 
                            variant="subtitle2" 
                            gutterBottom 
                            sx={{ 
                              fontWeight: 600,
                              color: 'text.primary'
                            }}
                          >
                            Assigned Sections
                          </Typography>
                          {program.sections.map((section) => (
                            <Box 
                              key={section._id} 
                              sx={{ 
                                mb: 2,
                                p: 1.5,
                                bgcolor: 'background.default',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  mb: 0.5
                                }}
                              >
                                {section.name}
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="textSecondary">
                                  {section.students?.length || 0} Students
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleViewProgram(program._id)}
                          sx={{
                            mt: 2,
                            bgcolor: 'primary.main',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                fontWeight: 600,
                mb: { xs: 2, sm: 3, md: 4 }
              }}
            >
              Messages
            </Typography>
            <Chat currentUser={currentUser} />
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  );
}

export default FacultyDashboard; 