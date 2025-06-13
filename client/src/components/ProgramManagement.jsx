import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Collapse,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Add as AddIcon, 
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';

function ProgramManagement() {
  const [programs, setPrograms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSectionDialog, setOpenSectionDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [sectionData, setSectionData] = useState({
    name: '',
    facultyId: '',
    studentIds: [],
  });
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrograms();
    fetchFaculty();
    fetchStudents();
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/programs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrograms(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch programs');
    }
  };

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFaculty(response.data.filter(user => user.role === 'faculty'));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch faculty');
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data.filter(user => user.role === 'student'));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch students');
    }
  };

  const handleOpenDialog = (program = null) => {
    if (program) {
      setFormData({
        title: program.title,
        description: program.description,
      });
      setSelectedProgram(program);
    } else {
      setFormData({ title: '', description: '' });
      setSelectedProgram(null);
    }
    setOpenDialog(true);
  };

  const handleOpenSectionDialog = (program, section = null) => {
    setSelectedProgram(program);
    if (section) {
      setSectionData({
        name: section.name,
        facultyId: section.faculty._id,
        studentIds: section.students.map(s => s._id)
      });
      setSelectedSection(section);
    } else {
      setSectionData({ name: '', facultyId: '', studentIds: [] });
      setSelectedSection(null);
    }
    setOpenSectionDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProgram(null);
    setFormData({ title: '', description: '' });
    setError('');
  };

  const handleCloseSectionDialog = () => {
    setOpenSectionDialog(false);
    setSelectedProgram(null);
    setSelectedSection(null);
    setSectionData({ name: '', facultyId: '', studentIds: [] });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (e) => {
    setSectionData({ ...sectionData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    
    try {
      // Validate form data
      const title = formData.title.trim();
      const description = formData.description.trim();

      if (!title || !description) {
        setError('Title and description are required and cannot be empty');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const programData = {
        title,
        description
      };

      console.log('Submitting program data:', programData);
      
      if (selectedProgram) {
        // Update existing program
        const response = await axios.put(
          `/api/programs/${selectedProgram._id}`,
          programData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Program updated successfully:', response.data);
      } else {
        // Create new program
        const response = await axios.post(
          '/api/programs',
          programData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('New program created:', response.data);
      }
      
      handleCloseDialog();
      fetchPrograms(); // Refresh the programs list
    } catch (error) {
      console.error('Error saving program:', error);
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('duplicate key error')) {
          setError('A program with this title already exists. Please choose a different title.');
        } else {
          setError(`Error: ${error.response.data.error}`);
        }
      } else if (error.response?.data?.details) {
        setError(`Error: ${Object.values(error.response.data.details).join(', ')}`);
      } else {
        setError('Failed to save program. Please try again.');
      }
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedSection) {
        // Update existing section
        await axios.put(
          `/api/programs/${selectedProgram._id}/sections/${selectedSection._id}`,
          sectionData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Create new section
        await axios.post(
          `/api/programs/${selectedProgram._id}/sections`,
          sectionData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      handleCloseSectionDialog();
      fetchPrograms();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save section');
    }
  };

  const handleDeleteProgram = async (programId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/programs/${programId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPrograms();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete program');
    }
  };

  const handleDeleteSection = async (programId, sectionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/programs/${programId}/sections/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPrograms();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete section');
    }
  };

  const toggleProgramSections = (programId) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  const filteredPrograms = programs.filter(program => {
    const searchLower = searchQuery.toLowerCase();
    return (
      program.title.toLowerCase().includes(searchLower) ||
      program.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container maxWidth="xl" sx={{ 
      mt: { xs: 2, sm: 4 }, 
      mb: { xs: 2, sm: 4 }, 
      px: { xs: 1, sm: 3 },
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
      <Paper sx={{ 
        p: { xs: 2, sm: 3 },
        position: 'relative',
        zIndex: 1,
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }
      }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ 
          mb: { xs: 2, sm: 3 },
          position: 'relative',
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
        }}>
          <Typography variant="h4" sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontWeight: 600,
            color: 'primary.main',
            position: 'relative',
            display: 'inline-block',
          }}>
            Program Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
            startIcon={<AddIcon />}
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
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
            Add Program
          </Button>
        </Grid>

        <Box sx={{ 
          mb: { xs: 2, sm: 3 },
          position: 'relative',
          zIndex: 1,
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search programs..."
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
              }
            }}
          />
        </Box>

        {error && (
          <Typography 
            color="error" 
            sx={{ 
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

        {filteredPrograms.length === 0 ? (
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            textAlign: 'center',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            position: 'relative',
            zIndex: 1,
            bgcolor: 'background.paper',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            }
          }}>
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
              {searchQuery ? 'No programs found matching your search.' : 'No programs available.'}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={{ xs: 2, sm: 3 }}>
            {filteredPrograms.map((program) => (
              <Card 
                key={program._id}
                sx={{ 
                  width: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 1,
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)',
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
                <CardContent sx={{ 
                  flexGrow: 1, 
                  p: { xs: 2, sm: 3 },
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '40px',
                      height: '3px',
                      backgroundColor: 'primary.light',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover:after': {
                      width: '60px',
                    }
                  }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      color: 'primary.main',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                      }
                    }}>
                      {program.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => toggleProgramSections(program._id)}
                      sx={{
                        transform: expandedPrograms[program._id] ? 'rotate(180deg)' : 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          transform: expandedPrograms[program._id] ? 'rotate(180deg) scale(1.1)' : 'scale(1.1)',
                        }
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: 'text.primary',
                    }
                  }}>
                    {program.description}
                  </Typography>
                  
                  <Divider sx={{ 
                    my: { xs: 1.5, sm: 2 },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.light',
                    }
                  }} />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 1,
                    position: 'relative',
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: 'primary.main',
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                      }
                    }}>
                      Sections ({program.sections.length})
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenSectionDialog(program)}
                      startIcon={<AddIcon />}
                      sx={{ 
                        display: { xs: 'none', sm: 'flex' },
                        transition: 'all 0.3s ease',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                          '& .MuiSvgIcon-root': {
                            transform: 'rotate(90deg)',
                          }
                        },
                        '& .MuiSvgIcon-root': {
                          transition: 'transform 0.3s ease',
                        }
                      }}
                    >
                      Add Section
                    </Button>
                  </Box>
                  
                  <Collapse in={expandedPrograms[program._id]} timeout={400}>
                    <Grid container spacing={{ xs: 1, sm: 2 }}>
                      {program.sections.map((section) => (
                        <Grid item xs={12} sm={6} md={4} key={section._id}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: { xs: 1.5, sm: 2 },
                              height: '100%',
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                transform: 'translateY(-4px)',
                                borderColor: 'primary.light',
                                '&:before': {
                                  opacity: 1,
                                }
                              },
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
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              position: 'relative',
                              zIndex: 1,
                            }}>
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                color: 'primary.main',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                }
                              }}>
                                {section.name}
                              </Typography>
                              <Box sx={{ 
                                display: 'flex',
                                '& .MuiIconButton-root': {
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.2)',
                                  }
                                }
                              }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenSectionDialog(program, section)}
                                  sx={{ 
                                    mr: 0.5,
                                    '&:hover': {
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
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSection(program._id, section._id)}
                                  color="error"
                                  sx={{
                                    '&:hover': {
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
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1, 
                              mt: 1,
                              position: 'relative',
                              zIndex: 1,
                            }}>
                              <GroupIcon 
                                fontSize="small" 
                                sx={{ 
                                  color: 'primary.light',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.2)',
                                    color: 'primary.main',
                                  }
                                }} 
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  color: 'text.primary',
                                }
                              }}>
                                Faculty: {section.faculty?.name}
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1, 
                              mt: 0.5,
                              position: 'relative',
                              zIndex: 1,
                            }}>
                              <GroupIcon 
                                fontSize="small" 
                                sx={{ 
                                  color: 'primary.light',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.2)',
                                    color: 'primary.main',
                                  }
                                }} 
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  color: 'text.primary',
                                }
                              }}>
                                Students: {section.students?.length || 0}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Collapse>
                </CardContent>
                
                <CardActions sx={{ 
                  justifyContent: 'flex-end', 
                  p: { xs: 1, sm: 2 }, 
                  bgcolor: 'grey.50',
                  display: { xs: 'flex', sm: 'none' },
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  }
                }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenSectionDialog(program)}
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ 
                      mr: 1,
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
                    Add Section
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(program)}
                    sx={{ 
                      mr: 1,
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
                    onClick={() => handleDeleteProgram(program._id)}
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
                </CardActions>

                <CardActions sx={{ 
                  justifyContent: 'flex-end', 
                  p: { xs: 1, sm: 2 }, 
                  bgcolor: 'grey.50',
                  display: { xs: 'none', sm: 'flex' },
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  }
                }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(program)}
                    sx={{ 
                      mr: 1,
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
                    onClick={() => handleDeleteProgram(program._id)}
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
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 },
              width: '100%',
              maxWidth: '500px',
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}>
            {selectedProgram ? 'Edit Program' : 'Add New Program'}
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Title"
              type="text"
              fullWidth
              value={formData.title}
              onChange={handleChange}
              sx={{
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
                }
              }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              sx={{
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
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 },
            borderTop: '1px solid',
            borderColor: 'divider',
          }}>
            <Button 
              onClick={handleCloseDialog}
              sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              sx={{
                transition: 'all 0.3s ease',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                }
              }}
            >
              {selectedProgram ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={openSectionDialog} 
          onClose={handleCloseSectionDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 },
              width: '100%',
              maxWidth: '500px',
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}>
            {selectedSection ? 'Edit Section' : 'Add New Section'}
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Section Name"
              type="text"
              fullWidth
              value={sectionData.name}
              onChange={handleSectionChange}
              sx={{
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
                }
              }}
            />
            <FormControl fullWidth margin="dense" sx={{
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
              }
            }}>
              <InputLabel>Faculty</InputLabel>
              <Select
                name="facultyId"
                value={sectionData.facultyId}
                onChange={handleSectionChange}
                required
              >
                {faculty.map((f) => (
                  <MenuItem key={f._id} value={f._id}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" sx={{
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
              }
            }}>
              <InputLabel>Students</InputLabel>
              <Select
                multiple
                name="studentIds"
                value={sectionData.studentIds}
                onChange={handleSectionChange}
                required
              >
                {students.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 },
            borderTop: '1px solid',
            borderColor: 'divider',
          }}>
            <Button 
              onClick={handleCloseSectionDialog}
              sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSectionSubmit} 
              variant="contained" 
              color="primary"
              sx={{
                transition: 'all 0.3s ease',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                }
              }}
            >
              {selectedSection ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default ProgramManagement; 