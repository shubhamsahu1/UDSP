import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Toolbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { labTestService } from '../services/labTestService';

const LabTest = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLabTest, setEditingLabTest] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin role required.');
      setLoading(false);
      return;
    }
    fetchLabTests();
  }, [user]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await labTestService.getAll();
      if (response.success) {
        setLabTests(response.data);
      } else {
        setError(response.message || 'Failed to fetch lab tests');
      }
    } catch (err) {
      setError('Failed to fetch lab tests');
      console.error('Fetch lab tests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (labTest = null) => {
    setEditingLabTest(labTest);
    setFormData(labTest ? { name: labTest.name } : { name: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLabTest(null);
    setFormData({ name: '' });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Lab test name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      let response;
      if (editingLabTest) {
        response = await labTestService.update(editingLabTest._id, formData);
      } else {
        response = await labTestService.create(formData);
      }

      if (response.success) {
        setSuccess(editingLabTest ? 'Lab test updated successfully' : 'Lab test created successfully');
        handleCloseDialog();
        fetchLabTests();
      } else {
        setError(response.message || 'Failed to save lab test');
      }
    } catch (err) {
      setError('Failed to save lab test');
      console.error('Save lab test error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab test?')) {
      return;
    }

    try {
      const response = await labTestService.delete(id);
      if (response.success) {
        setSuccess('Lab test deleted successfully');
        fetchLabTests();
      } else {
        setError(response.message || 'Failed to delete lab test');
      }
    } catch (err) {
      setError('Failed to delete lab test');
      console.error('Delete lab test error:', err);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Box>
        <Alert severity="error">
          Access denied. Admin role required.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ScienceIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Lab Test Management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Lab Tests ({labTests.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Lab Test
          </Button>
        </Toolbar>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {labTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No lab tests found. Click "Add Lab Test" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                labTests.map((labTest) => (
                  <TableRow key={labTest._id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {labTest.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(labTest.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(labTest.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(labTest)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(labTest._id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingLabTest ? 'Edit Lab Test' : 'Add New Lab Test'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Lab Test Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={!formData.name.trim() && formData.name !== ''}
              helperText={!formData.name.trim() && formData.name !== '' ? 'Lab test name is required' : ''}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                editingLabTest ? 'Update' : 'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LabTest;