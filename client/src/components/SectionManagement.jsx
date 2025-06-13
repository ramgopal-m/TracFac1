import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  OutlinedInput,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    program: '',
    faculty: [],
    students: [],
    academicYear: new Date().getFullYear().toString(),
    semester: 'Fall',
  });

  useEffect(() => {
    fetchSections();
    fetchPrograms();
    fetchUsers();
  }, []);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/sections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSections(response.data);
    } catch (error) {
      setError('Failed to fetch sections');
      console.error('Error fetching sections:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/programs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrograms(response.data);
    } catch (error) {
      setError('Failed to fetch programs');
      console.error('Error fetching programs:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFaculty(response.data.filter(user => user.role === 'faculty'));
      setStudents(response.data.filter(user => user.role === 'student'));
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingSection) {
        await axios.put(`/api/sections/${editingSection._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Section updated successfully');
      } else {
        await axios.post('/api/sections', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Section created successfully');
      }
      handleCloseDialog();
      fetchSections();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save section');
      console.error('Error saving section:', error);
    }
  };

  const handleDelete = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/sections/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Section deleted successfully');
      fetchSections();
    } catch (error) {
      setError('Failed to delete section');
      console.error('Error deleting section:', error);
    }
  };

  const handleOpenDialog = (section = null) => {
    if (section) {
      setFormData({
        name: section.name,
        program: section.program._id,
        faculty: section.faculty.map(f => f._id),
        students: section.students.map(s => s._id),
        academicYear: section.academicYear,
        semester: section.semester,
      });
      setEditingSection(section);
    } else {
      setFormData({
        name: '',
        program: '',
        faculty: [],
        students: [],
        academicYear: new Date().getFullYear().toString(),
        semester: 'Fall',
      });
      setEditingSection(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSection(null);
    setError('');
  };

  const handleFacultyChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({ ...formData, faculty: typeof value === 'string' ? value.split(',') : value });
  };

  const handleStudentChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({ ...formData, students: typeof value === 'string' ? value.split(',') : value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Program Sections</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Section
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid item xs={12} md={6} lg={4} key={section._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{section.name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(section)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(section._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {section.program.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {section.academicYear} - {section.semester}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Faculty:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {section.faculty.map((f) => (
                      <Chip key={f._id} label={f.name} size="small" />
                    ))}
                  </Box>
                  <Typography variant="subtitle2">Students:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {section.students.map((s) => (
                      <Chip key={s._id} label={s.name} size="small" />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingSection ? 'Edit Section' : 'Create New Section'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Section Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Program</InputLabel>
                  <Select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    label="Program"
                  >
                    {programs.map((program) => (
                      <MenuItem key={program._id} value={program._id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    label="Academic Year"
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <MenuItem key={year} value={year.toString()}>
                          {year}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    label="Semester"
                  >
                    {['Fall', 'Spring', 'Summer'].map((sem) => (
                      <MenuItem key={sem} value={sem}>
                        {sem}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Faculty Members</InputLabel>
                  <Select
                    multiple
                    value={formData.faculty}
                    onChange={handleFacultyChange}
                    label="Faculty Members"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={faculty.find(f => f._id === value)?.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {faculty.map((f) => (
                      <MenuItem key={f._id} value={f._id}>
                        {f.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Students</InputLabel>
                  <Select
                    multiple
                    value={formData.students}
                    onChange={handleStudentChange}
                    label="Students"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={students.find(s => s._id === value)?.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {students.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingSection ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SectionManagement; 