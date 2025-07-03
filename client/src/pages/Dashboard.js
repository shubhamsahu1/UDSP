import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Save as SaveIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { testDataService } from '../services/testDataService';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // State for test data entry
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [labTests, setLabTests] = useState([]);
  const [selectedLabTest, setSelectedLabTest] = useState('');
  const [sampleTaken, setSampleTaken] = useState('');
  const [samplePositive, setSamplePositive] = useState('');
  const [existingEntries, setExistingEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load lab tests on component mount
  useEffect(() => {
    fetchLabTests();
  }, []);

  // Load existing data when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchExistingData();
    }
  }, [selectedDate]);

  const fetchLabTests = async () => {
    try {
      const response = await testDataService.getLabTests();
      if (response.success) {
        setLabTests(response.data);
      } else {
        setError('Failed to fetch lab tests');
      }
    } catch (err) {
      setError('Failed to fetch lab tests');
      console.error('Fetch lab tests error:', err);
    }
  };

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      const response = await testDataService.getMyDataByDate(selectedDate);
      if (response.success) {
        setExistingEntries(response.data);
        // Clear form if no existing data for current lab test
        const existingEntry = response.data.find(entry => 
          entry.labTestId._id === selectedLabTest
        );
        if (existingEntry) {
          setSampleTaken(existingEntry.sampleTaken.toString());
          setSamplePositive(existingEntry.samplePositive.toString());
        } else if (selectedLabTest) {
          setSampleTaken('');
          setSamplePositive('');
        }
      }
    } catch (err) {
      console.error('Fetch existing data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLabTestChange = (event) => {
    const labTestId = event.target.value;
    setSelectedLabTest(labTestId);
    
    // Pre-fill data if exists for this lab test
    const existingEntry = existingEntries.find(entry => 
      entry.labTestId._id === labTestId
    );
    if (existingEntry) {
      setSampleTaken(existingEntry.sampleTaken.toString());
      setSamplePositive(existingEntry.samplePositive.toString());
    } else {
      setSampleTaken('');
      setSamplePositive('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLabTest || !sampleTaken || !samplePositive) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (parseInt(samplePositive) > parseInt(sampleTaken)) {
      setError('Number of positive samples cannot exceed number of samples taken');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const testData = {
        date: selectedDate,
        labTestId: selectedLabTest,
        sampleTaken: parseInt(sampleTaken),
        samplePositive: parseInt(samplePositive)
      };

      const response = await testDataService.saveTestData(testData);
      
      if (response.success) {
        setSuccess('Test data saved successfully');
        fetchExistingData(); // Refresh existing data
      } else {
        setError(response.message || 'Failed to save test data');
      }
    } catch (err) {
      setError('Failed to save test data');
      console.error('Save test data error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.welcome')}, {user?.firstName}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Daily Test Data Entry */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">
                Daily Test Data Entry
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

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Lab Test</InputLabel>
                    <Select
                      value={selectedLabTest}
                      onChange={handleLabTestChange}
                      label="Lab Test"
                    >
                      {labTests.map((labTest) => (
                        <MenuItem key={labTest._id} value={labTest._id}>
                          {labTest.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Samples Taken"
                    type="number"
                    value={sampleTaken}
                    onChange={(e) => setSampleTaken(e.target.value)}
                    inputProps={{ min: 0 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Positive Samples"
                    type="number"
                    value={samplePositive}
                    onChange={(e) => setSamplePositive(e.target.value)}
                    inputProps={{ min: 0, max: sampleTaken || undefined }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving || !selectedLabTest || !sampleTaken || !samplePositive}
                    size="large"
                  >
                    {saving ? 'Saving...' : 'Update Data'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        
        {/* Today's Entries */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Today's Entries
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : existingEntries.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No entries for this date.
              </Typography>
            ) : (
              <Box>
                {existingEntries.map((entry) => (
                  <Card key={entry._id} sx={{ mb: 1, p: 2 }} variant="outlined">
                    <Typography variant="subtitle2" fontWeight="medium">
                      {entry.labTestId.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Samples Taken: {entry.sampleTaken}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Positive: {entry.samplePositive}
                    </Typography>
                    <Typography variant="caption" color="primary">
                      {entry.sampleTaken > 0 ? 
                        `${((entry.samplePositive / entry.sampleTaken) * 100).toFixed(1)}% positive` : 
                        '0% positive'
                      }
                    </Typography>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 