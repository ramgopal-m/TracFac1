import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Grid,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import ProgramManagement from './ProgramManagement';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Add as AddIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Book as BookIcon,
} from '@mui/icons-material';

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

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    programs: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch all data in parallel
        const [profileResponse, usersResponse, statsResponse] = await Promise.all([
          axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setCurrentUser(profileResponse.data);
        setUsers(usersResponse.data);
        
        if (statsResponse.data) {
          setStats({
            students: statsResponse.data.students || 0,
            faculty: statsResponse.data.faculty || 0,
            programs: statsResponse.data.programs || 0
          });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to fetch dashboard data. Please try logging in again.');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleOpenDialog = (type, user = null) => {
    setDialogType(type);
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Password field will be empty for updates
      });
      console.log('Opening edit dialog for user:', user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
      });
      console.log('Opening add dialog for type:', type);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingUser) {
        // Update existing user
        const updateData = {
          name: formData.name,
          ...(formData.password && { password: formData.password }), // Only include password if it's not empty
        };
        
        console.log('Updating user:', {
          userId: editingUser._id,
          updateData: updateData,
          role: editingUser.role
        });

        // Use the general users endpoint instead of role-specific endpoints
        const endpoint = `/api/users/${editingUser._id}`;
        console.log('Using endpoint:', endpoint);

        // Perform the update
        const response = await axios.put(
          endpoint,
          updateData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );

        console.log('Update response:', response.data);
      } else {
        // Add new user
        console.log('Adding new user:', {
          type: dialogType,
          formData: formData
        });

        const response = await axios.post(
        `/api/admin/${dialogType}`,
        formData,
        {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
        }
      );

        console.log('Add response:', response.data);
      }

      handleCloseDialog();
      
      // Refetch users after adding/updating
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        endpoint: error.config?.url,
        headers: error.config?.headers
      });

      let errorMessage = 'Failed to save user';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refetch users after deletion
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const handleProfileMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    // Add profile view/edit functionality here
    // For now, we'll just show an alert
    alert('Profile functionality coming soon!');
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const renderUserTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users
            .filter(user => 
              user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (user.profile?.studentId && user.profile.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (user.profile?.facultyId && user.profile.facultyId.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={
                      user.role === 'admin' ? 'primary' :
                      user.role === 'faculty' ? 'secondary' :
                      'success'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.profile?.studentId || user.profile?.facultyId || 'N/A'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(user.role, user)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteUser(user._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      bgcolor: 'background.default'
    }}>
      <AdminHeader 
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
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
                transform: 'translateX(4px)',
              }
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogout} sx={{ 
          color: 'error.main',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'error.light',
            color: 'error.contrastText',
          }
        }}>
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
          flexDirection: 'column',
          width: { xs: '100%', md: 'calc(100% - 250px)' },
          ml: { xs: 0, md: '250px' },
          height: 'calc(100vh - 56px)',
          '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px)'
          },
          transition: 'all 0.3s ease',
          '&:hover': {
            '& .MuiPaper-root': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }
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
            transition: 'box-shadow 0.3s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
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
              Dashboard Overview
        </Typography>
            <Grid 
              container 
              spacing={2}
              sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
            >
              <Grid 
                xs={12}
                sm={6}
                md={4}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    height: '100%',
                    minHeight: { xs: '160px', sm: '180px', md: '200px' },
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                      zIndex: 1,
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(25, 118, 210, 0.2)',
                      '& .MuiSvgIcon-root': {
                        transform: 'scale(1.2) rotate(5deg)',
                      }
                    },
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.3s ease',
                      position: 'relative',
                      zIndex: 2,
                    }
                  }}
                >
                  <PeopleIcon sx={{ 
                    fontSize: { xs: 36, sm: 42, md: 48 }, 
                    mr: { xs: 2, sm: 3 },
                    transition: 'transform 0.3s ease',
                  }} />
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      sx={{ 
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                        fontWeight: 600,
                        lineHeight: 1.2,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      {stats.students}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                        opacity: 0.9,
                        mt: 0.5,
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                          opacity: 1,
                        }
                      }}
                    >
                      Total Students
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid 
                xs={12}
                sm={6}
                md={4}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: 'secondary.light',
                    color: 'secondary.contrastText',
                    height: '100%',
                    minHeight: { xs: '160px', sm: '180px', md: '200px' },
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                      zIndex: 1,
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(220, 0, 78, 0.2)',
                      '& .MuiSvgIcon-root': {
                        transform: 'scale(1.2) rotate(5deg)',
                      }
                    },
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.3s ease',
                      position: 'relative',
                      zIndex: 2,
                    }
                  }}
                >
                  <SchoolIcon sx={{ 
                    fontSize: { xs: 36, sm: 42, md: 48 }, 
                    mr: { xs: 2, sm: 3 },
                    transition: 'transform 0.3s ease',
                  }} />
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      sx={{ 
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                        fontWeight: 600,
                        lineHeight: 1.2,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      {stats.faculty}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                        opacity: 0.9,
                        mt: 0.5,
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                          opacity: 1,
                        }
                      }}
                    >
                      Total Faculty
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid 
                xs={12}
                sm={6}
                md={4}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    height: '100%',
                    minHeight: { xs: '160px', sm: '180px', md: '200px' },
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                      zIndex: 1,
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(76, 175, 80, 0.2)',
                      '& .MuiSvgIcon-root': {
                        transform: 'scale(1.2) rotate(5deg)',
                      }
                    },
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.3s ease',
                      position: 'relative',
                      zIndex: 2,
                    }
                  }}
                >
                  <BookIcon sx={{ 
                    fontSize: { xs: 36, sm: 42, md: 48 }, 
                    mr: { xs: 2, sm: 3 },
                    transition: 'transform 0.3s ease',
                  }} />
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      sx={{ 
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                        fontWeight: 600,
                        lineHeight: 1.2,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      {stats.programs}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                        opacity: 0.9,
                        mt: 0.5,
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                          opacity: 1,
                        }
                      }}
                    >
                      Total Programs
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 3, md: 4 },
              width: '95%',
              mx: 'auto',
              maxWidth: '1400px',
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
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                width: '100%',
                position: 'relative',
                zIndex: 1,
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                    fontWeight: 600,
                    position: 'relative',
                    display: 'inline-block',
                    color: 'primary.main',
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
                  User Management
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  '& .MuiButton-root': {
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                      zIndex: 1,
                    }
                  }
                }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog('students')}
                    startIcon={<AddIcon />}
                    sx={{ 
                      height: { xs: '40px', sm: '44px', md: '48px' },
                      px: { xs: 2, sm: 3 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        '& .MuiSvgIcon-root': {
                          transform: 'rotate(90deg)',
                        }
                      },
                      '& .MuiSvgIcon-root': {
                        transition: 'transform 0.3s ease',
                      }
                    }}
            >
              Add Student
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog('faculty')}
                    startIcon={<AddIcon />}
                    sx={{ 
                      height: { xs: '40px', sm: '44px', md: '48px' },
                      px: { xs: 2, sm: 3 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        '& .MuiSvgIcon-root': {
                          transform: 'rotate(90deg)',
                        }
                      },
                      '& .MuiSvgIcon-root': {
                        transition: 'transform 0.3s ease',
                      }
                    }}
            >
              Add Faculty
            </Button>
                </Box>
              </Box>

              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ 
                      color: 'text.secondary', 
                      mr: 1,
                      transition: 'all 0.3s ease',
                      transform: 'scale(1)',
                    }} />
                  ),
                }}
                sx={{
                  width: '100%',
                  position: 'relative',
                  zIndex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light',
                      }
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      }
                    }
                  },
                  '& .MuiInputBase-root': {
                    height: { xs: '40px', sm: '44px', md: '48px' },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    transition: 'all 0.3s ease',
                  }
                }}
              />

        {error && (
                <Typography 
                  color="error" 
                  sx={{ 
                    width: '100%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    position: 'relative',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                    }
                  }} 
                  gutterBottom
                >
            {error}
          </Typography>
        )}

              {filteredUsers.length === 0 ? (
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    width: '100%',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: 'text.primary',
                      }
                    }}
                  >
                    {searchQuery ? 'No users found matching your search.' : 'No users available.'}
                  </Typography>
                </Paper>
              ) : (
                <TableContainer 
                  component={Paper}
                  sx={{
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1,
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        bgcolor: 'primary.light',
                        '& .MuiTableCell-head': {
                          color: 'primary.contrastText',
                          fontWeight: 600,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: 'primary.main',
                          }
                        }
                      }}>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>ID</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users
                        .filter(user => 
                          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (user.profile?.studentId && user.profile.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (user.profile?.facultyId && user.profile.facultyId.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((user) => (
                          <TableRow 
                            key={user._id}
                            hover
                            sx={{ 
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                transform: 'scale(1.01)',
                                '& .MuiTableCell-root': {
                                  color: 'primary.main',
                                }
                              },
                              '& .MuiTableCell-root': {
                                transition: 'all 0.3s ease',
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                py: { xs: 1.5, sm: 2 },
                              }
                            }}
                          >
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip 
                                label={user.role} 
                                color={
                                  user.role === 'admin' ? 'primary' :
                                  user.role === 'faculty' ? 'secondary' :
                                  'success'
                                }
                                size="small"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  fontWeight: 500,
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {user.profile?.studentId || user.profile?.facultyId || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ 
                                display: 'flex', 
                                gap: 1,
                                '& .MuiIconButton-root': {
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.2)',
                                  }
                                }
                              }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(user.role, user)}
                                  color="primary"
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.2)',
                                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                      '& .MuiSvgIcon-root': {
                                        transform: 'rotate(15deg)',
                                      }
                                    },
                                    '& .MuiSvgIcon-root': {
                                      transition: 'transform 0.3s ease',
                                    }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteUser(user._id)}
                                  color="error"
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.2)',
                                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                      '& .MuiSvgIcon-root': {
                                        transform: 'rotate(15deg)',
                                      }
                                    },
                                    '& .MuiSvgIcon-root': {
                                      transition: 'transform 0.3s ease',
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ProgramManagement />
          </TabPanel>
        </Paper>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            elevation: 2,
            sx: {
              m: { xs: 2, sm: 3, md: 4 },
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600,
            p: { xs: 2, sm: 3 }
          }}>
            {editingUser ? 'Update User' : `Add New ${dialogType === 'students' ? 'Student' : 'Faculty'}`}
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                autoFocus
                name="name"
                label="Name"
                type="text"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                sx={{
                  '& .MuiInputBase-root': {
                    height: { xs: '40px', sm: '44px', md: '48px' },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                disabled={!!editingUser} // Disable email field when editing
                sx={{
                  '& .MuiInputBase-root': {
                    height: { xs: '40px', sm: '44px', md: '48px' },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
              <TextField
                margin="dense"
                name="password"
                label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleChange}
                sx={{
                  '& .MuiInputBase-root': {
                    height: { xs: '40px', sm: '44px', md: '48px' },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button 
              onClick={handleCloseDialog}
              sx={{ 
                height: { xs: '36px', sm: '40px' },
                px: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              sx={{
                height: { xs: '36px', sm: '40px' },
                px: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {editingUser ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default AdminDashboard; 