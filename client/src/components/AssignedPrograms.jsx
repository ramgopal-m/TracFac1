import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

function AssignedPrograms() {
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedPrograms();
  }, []);

  const fetchAssignedPrograms = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/program-assignments/assigned', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched assigned programs:', response.data);
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching assigned programs:', error);
      setError(error.response?.data?.error || 'Failed to fetch assigned programs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (programs.length === 0) {
    return (
      <Container>
        <Typography>No programs assigned yet.</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Programs
      </Typography>
      {programs.map((program) => (
        <Paper key={program._id} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6">{program.title}</Typography>
          <Typography color="textSecondary" paragraph>
            {program.description}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Assigned Sections:
          </Typography>
          {program.sections.map((section) => (
            <Box key={section._id} sx={{ mb: 2 }}>
              <Typography variant="body1">
                Section: {section.name}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Faculty: {section.faculty?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Students: {section.students?.length || 0}
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>
      ))}
    </Container>
  );
}

export default AssignedPrograms; 