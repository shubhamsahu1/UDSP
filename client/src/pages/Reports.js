import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { reportsService } from '../services/reportsService';

const Reports = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // State management
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [labTests, setLabTests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin role required.');
      return;
    }
  }, [user]);

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const [reportResponse, summaryResponse] = await Promise.all([
        reportsService.getReportData(startDate, endDate),
        reportsService.getSummary(startDate, endDate)
      ]);

      if (reportResponse.success) {
        setReportData(reportResponse.data.reportData);
        setLabTests(reportResponse.data.labTests);
      } else {
        setError(reportResponse.message || 'Failed to fetch report data');
      }

      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch report data');
      console.error('Fetch report data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!startDate || !endDate) {
      setError('Please select date range and generate report first');
      return;
    }

    try {
      const response = await reportsService.exportCSV(startDate, endDate);
      if (response.success) {
        setSuccess('CSV file downloaded successfully');
      }
    } catch (err) {
      setError('Failed to export CSV');
      console.error('Export CSV error:', err);
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
        <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          UDSP Reports
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

      {/* Date Range Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Select Date Range</Typography>
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              onClick={fetchReportData}
              disabled={loading}
              size="large"
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Statistics */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary">
                  {summary.totalEntries}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Entries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="info.main">
                  {summary.uniqueUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {summary.totalSampleTaken.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Samples
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {summary.positivityRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Positivity Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Report Table */}
      {reportData && labTests.length > 0 && (
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Report Data ({startDate} to {endDate})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Box>
          <Divider />
          
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>User Name</TableCell>
                  {labTests.map((labTest) => (
                    <TableCell key={labTest.id} align="center" sx={{ fontWeight: 'bold', backgroundColor: 'primary.light', color: 'white' }}>
                      <Box>
                        <Typography variant="subtitle2">{labTest.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip label="Taken" size="small" variant="outlined" />
                          <Chip label="Positive" size="small" variant="outlined" />
                        </Box>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={labTests.length + 1} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No data found for the selected date range.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData.map((userRow) => (
                    <TableRow key={userRow.userId} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        {userRow.userName}
                      </TableCell>
                      {labTests.map((labTest) => {
                        const labData = userRow.labTests[labTest.id];
                        return (
                          <TableCell key={labTest.id} align="center">
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Chip 
                                  label={labData.sampleTaken} 
                                  size="small" 
                                  color={labData.sampleTaken > 0 ? 'primary' : 'default'}
                                />
                                <Chip 
                                  label={labData.samplePositive} 
                                  size="small" 
                                  color={labData.samplePositive > 0 ? 'warning' : 'default'}
                                />
                              </Box>
                              {labData.sampleTaken > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  {((labData.samplePositive / labData.sampleTaken) * 100).toFixed(1)}%
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Lab Test Statistics */}
      {summary?.labTestStats && summary.labTestStats.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lab Test Statistics
          </Typography>
          <Grid container spacing={2}>
            {summary.labTestStats.map((stat) => (
              <Grid item xs={12} sm={6} md={4} key={stat.labTestId}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      {stat.labTestName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Entries: {stat.entryCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Samples: {stat.totalSampleTaken.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Positive: {stat.totalSamplePositive.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="medium">
                      Rate: {stat.positivityRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Reports;