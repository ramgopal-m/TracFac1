import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  PictureAsPdf as PictureAsPdfIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import StudentHeader from './StudentHeader';
import Chat from './Chat';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function StudentDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [timetableFile, setTimetableFile] = useState(null);
  const [timetablePreview, setTimetablePreview] = useState(null);
  const [coursesTableFile, setCoursesTableFile] = useState(null);
  const [coursesTablePreview, setCoursesTablePreview] = useState(null);
  const [gpaFile, setGpaFile] = useState(null);
  const [imageCache, setImageCache] = useState({});

  const getImagePath = (path) => {
    if (!path) return null;
    
    if (imageCache[path]) {
      return imageCache[path];
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      const fullPath = path;
      setImageCache(prev => ({ ...prev, [path]: fullPath }));
      return fullPath;
    }

    const cleanPath = path.replace(/^\/+/, '');
    const fullPath = `http://localhost:5000/${cleanPath}`;
    setImageCache(prev => ({ ...prev, [path]: fullPath }));
    return fullPath;
  };

  const preloadImage = (path) => {
    if (!path) return;
    const img = new Image();
    img.src = getImagePath(path);
  };

  useEffect(() => {
    if (currentUser?.profile?.profilePic) {
      preloadImage(currentUser.profile.profilePic);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    fetchFaculty();
    fetchAssignedPrograms();
  }, []);

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/student/faculty', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFaculty(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch faculty list');
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleEditProfile = () => {
    setEditedProfile({
      ...currentUser.profile,
      college: currentUser.profile?.college || '',
      branch: currentUser.profile?.branch || '',
      department: currentUser.profile?.department || '',
      currentYear: currentUser.profile?.currentYear || '',
      currentSemester: currentUser.profile?.currentSemester || '',
      currentGPA: currentUser.profile?.currentGPA || '',
      socialLinks: {
        linkedin: currentUser.profile?.socialLinks?.linkedin || '',
        github: currentUser.profile?.socialLinks?.github || ''
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
    setCoursesTableFile(null);
    setCoursesTablePreview(null);
    setGpaFile(null);
  };

  const handleProfileChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setEditedProfile(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
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
              profilePic: reader.result
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
              timetable: timetableReader.result
            }));
          };
          timetableReader.readAsDataURL(file);
          break;
        case 'coursesTable':
          setCoursesTableFile(file);
          const coursesReader = new FileReader();
          coursesReader.onloadend = () => {
            setCoursesTablePreview(coursesReader.result);
            setEditedProfile(prev => ({
              ...prev,
              coursesTable: coursesReader.result
            }));
          };
          coursesReader.readAsDataURL(file);
          break;
        case 'gpa':
          setGpaFile(file);
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

      // Add course table if changed
      if (coursesTableFile) {
        formData.append('coursesTable', coursesTableFile);
      }

      // Add profile data with proper structure
      const profileData = {
        profile: {
          college: editedProfile.college || '',
          branch: editedProfile.branch || '',
          department: editedProfile.department || '',
          currentYear: editedProfile.currentYear || '',
          currentSemester: editedProfile.currentSemester || '',
          currentGPA: editedProfile.currentGPA || '',
          socialLinks: {
            linkedin: editedProfile.socialLinks?.linkedin || '',
            github: editedProfile.socialLinks?.github || ''
          },
          location: {}, // Empty location object to satisfy schema
          profilePic: editedProfile.profilePic || currentUser.profile?.profilePic,
          timetable: editedProfile.timetable || currentUser.profile?.timetable,
          coursesTable: editedProfile.coursesTable || currentUser.profile?.coursesTable
        }
      };

      formData.append('profile', JSON.stringify(profileData.profile));

      const response = await axios.put('/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update current user with the response data
      setCurrentUser(response.data);
      setIsEditMode(false);
      setEditedProfile(null);
      setProfilePicFile(null);
      setProfilePicPreview(null);
      setTimetableFile(null);
      setTimetablePreview(null);
      setCoursesTableFile(null);
      setCoursesTablePreview(null);
      setGpaFile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.response?.data?.error || 'Failed to save profile');
    }
  };

  const drawer = (
    <Box sx={{ width: 240 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={tabValue === 0}
            onClick={() => {
              setTabValue(0);
              if (isMobile) setMobileOpen(false);
            }}
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
            onClick={() => {
              setTabValue(1);
              if (isMobile) setMobileOpen(false);
            }}
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
              primary="My Programs"
              primaryTypographyProps={{
                fontWeight: tabValue === 1 ? 600 : 400
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={tabValue === 2}
            onClick={() => {
              setTabValue(2);
              if (isMobile) setMobileOpen(false);
            }}
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
    </Box>
  );

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
      <StudentHeader 
        currentUser={currentUser}
        onTabChange={setTabValue}
        tabValue={tabValue}
        onProfileClick={handleProfileClick}
      />

      <Box sx={{ display: 'flex', flex: 1, mt: 8 }}>
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: 240,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 240,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider',
                mt: 8
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <TabPanel value={tabValue} index={0}>
        <Typography variant="h4" gutterBottom>
              My Profile
        </Typography>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}

            {currentUser && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Profile Header */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 3,
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={isEditMode ? (profilePicPreview || getImagePath(currentUser.profile?.profilePic)) : getImagePath(currentUser.profile?.profilePic)}
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: 'primary.main',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        objectFit: 'cover',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
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
                      <Button
                        component="label"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          minWidth: 'auto',
                          p: 1,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        }}
                      >
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleFileChange('profilePic', e)}
                        />
                        <EditIcon />
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" gutterBottom>
                      {currentUser.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {currentUser.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Student ID: {currentUser.profile?.studentId || 'Not assigned'}
                    </Typography>
                  </Box>
                  {!isEditMode && (
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

                {/* Required Information */}
                <Paper sx={{ 
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }
                }}>
              <Typography variant="h6" gutterBottom>
                    Required Information
              </Typography>
              <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {currentUser.name}
                      </Typography>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {currentUser.email}
                      </Typography>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Student ID
                      </Typography>
                      <Typography variant="body1">
                        {currentUser.profile?.studentId || 'Not assigned'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Academic Information */}
                <Paper sx={{ 
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }
                }}>
                  <Typography variant="h6" gutterBottom>
                    Academic Information
                  </Typography>
                  <Grid container spacing={2}>
                    {isEditMode ? (
                      <>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="College"
                            value={editedProfile?.college || ''}
                            onChange={(e) => handleProfileChange('college', e.target.value)}
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
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Branch"
                            value={editedProfile?.branch || ''}
                            onChange={(e) => handleProfileChange('branch', e.target.value)}
                          />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Department"
                            value={editedProfile?.department || ''}
                            onChange={(e) => handleProfileChange('department', e.target.value)}
                          />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Current Year"
                            value={editedProfile?.currentYear || ''}
                            onChange={(e) => handleProfileChange('currentYear', e.target.value)}
                          />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Current Semester"
                            value={editedProfile?.currentSemester || ''}
                            onChange={(e) => handleProfileChange('currentSemester', e.target.value)}
                          />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Current GPA"
                            value={editedProfile?.currentGPA || ''}
                            onChange={(e) => handleProfileChange('currentGPA', e.target.value)}
                          />
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            College
                          </Typography>
                          <Typography variant="body1">
                            {currentUser.profile?.college || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Branch
                          </Typography>
                          <Typography variant="body1">
                            {currentUser.profile?.branch || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Department
                          </Typography>
                          <Typography variant="body1">
                            {currentUser.profile?.department || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Current Year
                          </Typography>
                          <Typography variant="body1">
                            {currentUser.profile?.currentYear || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Current Semester
                          </Typography>
                          <Typography variant="body1">
                            {currentUser.profile?.currentSemester || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Current GPA
                          </Typography>
                          <Typography variant="body1">
                            {currentUser.profile?.currentGPA || 'Not specified'}
                          </Typography>
                        </Grid>
                      </>
                    )}
                </Grid>
                </Paper>

                {/* Timetable & Course Information */}
                <Paper sx={{ 
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }
                }}>
                  <Typography variant="h6" gutterBottom>
                    Timetable & Course Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Timetable
                      </Typography>
                      {isEditMode ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {timetablePreview && (
                            <Box sx={{ 
                              width: '100%',
                              maxWidth: '800px',
                              position: 'relative',
                              mx: 'auto'
                            }}>
                              <img
                                src={timetablePreview}
                                alt="Timetable Preview"
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  borderRadius: '8px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  objectFit: 'contain'
                                }}
                              />
                              <IconButton
                                color="error"
                                onClick={() => {
                                  setTimetableFile(null);
                                  setTimetablePreview(null);
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'background.paper',
                                  '&:hover': {
                                    bgcolor: 'error.light',
                                    color: 'error.contrastText'
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<UploadIcon />}
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            {timetablePreview ? 'Change Timetable' : 'Upload Timetable'}
                            <input
                              type="file"
                              hidden
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange('timetable', e)}
                            />
                          </Button>
                        </Box>
                      ) : (
                        currentUser.profile?.timetable && (
                          <Box sx={{ mt: 1 }}>
                            {currentUser.profile.timetable.endsWith('.pdf') ? (
                              <Button
                                variant="outlined"
                                startIcon={<PictureAsPdfIcon />}
                                href={currentUser.profile.timetable}
                                target="_blank"
                                fullWidth
                              >
                                View Timetable PDF
                              </Button>
                            ) : (
                              <Box sx={{ 
                                width: '100%',
                                maxWidth: '800px',
                                mx: 'auto'
                              }}>
                                <img
                                  src={currentUser.profile?.timetable}
                                  alt="Timetable"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    objectFit: 'contain'
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        )
                      )}
                    </Grid>

                    <Grid xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Course Table
                      </Typography>
                      {isEditMode ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {coursesTablePreview && (
                            <Box sx={{ 
                              width: '100%',
                              maxWidth: '800px',
                              position: 'relative',
                              mx: 'auto'
                            }}>
                              <img
                                src={coursesTablePreview}
                                alt="Course Table Preview"
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  borderRadius: '8px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  objectFit: 'contain'
                                }}
                              />
                              <IconButton
                                color="error"
                                onClick={() => {
                                  setCoursesTableFile(null);
                                  setCoursesTablePreview(null);
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'background.paper',
                                  '&:hover': {
                                    bgcolor: 'error.light',
                                    color: 'error.contrastText'
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<UploadIcon />}
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            {coursesTablePreview ? 'Change Course Table' : 'Upload Course Table'}
                            <input
                              type="file"
                              hidden
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange('coursesTable', e)}
                            />
                          </Button>
                        </Box>
                      ) : (
                        currentUser.profile?.coursesTable && (
                          <Box sx={{ mt: 1 }}>
                            {currentUser.profile.coursesTable.endsWith('.pdf') ? (
                              <Button
                                variant="outlined"
                                startIcon={<PictureAsPdfIcon />}
                                href={currentUser.profile.coursesTable}
                                target="_blank"
                                fullWidth
                              >
                                View Course Table PDF
                              </Button>
                            ) : (
                              <Box sx={{ 
                                width: '100%',
                                maxWidth: '800px',
                                mx: 'auto'
                              }}>
                                <img
                                  src={currentUser.profile?.coursesTable}
                                  alt="Course Table"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    objectFit: 'contain'
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        )
                      )}
                </Grid>
              </Grid>
                </Paper>

                {/* Social Links */}
                <Paper sx={{ 
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }
                }}>
                  <Typography variant="h6" gutterBottom>
                    Social Links
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        LinkedIn Profile
                      </Typography>
                      {isEditMode ? (
                        <TextField
                          fullWidth
                          label="LinkedIn URL"
                          value={editedProfile?.socialLinks?.linkedin || ''}
                          onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/your-profile"
                        />
                      ) : (
                        currentUser.profile?.socialLinks?.linkedin ? (
                          <Button
                            variant="outlined"
                            startIcon={<LinkedInIcon />}
                            href={currentUser.profile.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            fullWidth
                            sx={{ 
                              mt: 1,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            Open LinkedIn Profile
                          </Button>
                        ) : (
                          <Typography variant="body1" color="text.secondary">
                            Not specified
                          </Typography>
                        )
                      )}
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        GitHub Profile
                      </Typography>
                      {isEditMode ? (
                        <TextField
                          fullWidth
                          label="GitHub URL"
                          value={editedProfile?.socialLinks?.github || ''}
                          onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                          placeholder="https://github.com/your-username"
                        />
                      ) : (
                        currentUser.profile?.socialLinks?.github ? (
                          <Button
                            variant="outlined"
                            startIcon={<GitHubIcon />}
                            href={currentUser.profile.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            fullWidth
                            sx={{ 
                              mt: 1,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            Open GitHub Profile
                          </Button>
                        ) : (
                          <Typography variant="body1" color="text.secondary">
                            Not specified
                          </Typography>
                        )
                      )}
            </Grid>
        </Grid>
      </Paper>

                {/* Edit Mode Actions */}
                {isEditMode && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'flex-end',
                    mt: 3,
                    '& .MuiButton-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }
                    }
                  }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveProfile}
                      startIcon={<SaveIcon />}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>
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
              Programs
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
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
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
                        <Box sx={{ mt: 'auto' }}>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate(`/student/program/${program._id}`)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h4" gutterBottom>
              Messages
            </Typography>
            <Chat currentUser={currentUser} />
          </TabPanel>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default StudentDashboard; 