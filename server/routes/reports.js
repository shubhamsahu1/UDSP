const express = require('express');
const TestData = require('../models/TestData');
const LabTest = require('../models/LabTest');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { query, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware for date range
const validateDateRange = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be in valid ISO format'),
  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be in valid ISO format')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// @route   GET /api/reports/data
// @desc    Get report data by date range
// @access  Private/Admin
router.get('/data', validateDateRange, auth, adminAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate } = req.query;
    
    // Convert dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);
    
    // Get all test data within date range with populated fields
    const testData = await TestData.find({
      date: { $gte: start, $lte: end }
    })
    .populate('userId', 'firstName lastName username')
    .populate('labTestId', 'name')
    .sort({ date: 1, 'userId.firstName': 1 });
    
    // Get all lab tests for column headers
    const labTests = await LabTest.find().sort({ name: 1 });
    
    // Group data by user
    const userDataMap = new Map();
    
    testData.forEach(entry => {
      const userId = entry.userId._id.toString();
      const userName = `${entry.userId.firstName} ${entry.userId.lastName || ''}`.trim();
      const labTestId = entry.labTestId._id.toString();
      
      if (!userDataMap.has(userId)) {
        userDataMap.set(userId, {
          userId,
          userName,
          labTestData: new Map()
        });
      }
      
      const userData = userDataMap.get(userId);
      if (!userData.labTestData.has(labTestId)) {
        userData.labTestData.set(labTestId, {
          labTestName: entry.labTestId.name,
          totalSampleTaken: 0,
          totalSamplePositive: 0
        });
      }
      
      const labData = userData.labTestData.get(labTestId);
      labData.totalSampleTaken += entry.sampleTaken;
      labData.totalSamplePositive += entry.samplePositive;
    });
    
    // Convert to array format for frontend
    const reportData = [];
    
    userDataMap.forEach((userData) => {
      const userRow = {
        userId: userData.userId,
        userName: userData.userName,
        labTests: {}
      };
      
      // Add data for each lab test
      labTests.forEach(labTest => {
        const labTestId = labTest._id.toString();
        const labData = userData.labTestData.get(labTestId);
        
        userRow.labTests[labTestId] = {
          labTestName: labTest.name,
          sampleTaken: labData ? labData.totalSampleTaken : 0,
          samplePositive: labData ? labData.totalSamplePositive : 0
        };
      });
      
      reportData.push(userRow);
    });
    
    res.json({
      success: true,
      data: {
        reportData,
        labTests: labTests.map(test => ({ id: test._id, name: test.name })),
        dateRange: { startDate, endDate },
        totalUsers: reportData.length,
        totalEntries: testData.length
      }
    });
  } catch (error) {
    console.error('Get report data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/reports/export-csv
// @desc    Export report data as CSV
// @access  Private/Admin
router.get('/export-csv', validateDateRange, auth, adminAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate } = req.query;
    
    // Convert dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);
    
    // Get all test data within date range with populated fields
    const testData = await TestData.find({
      date: { $gte: start, $lte: end }
    })
    .populate('userId', 'firstName lastName username')
    .populate('labTestId', 'name')
    .sort({ date: 1, 'userId.firstName': 1 });
    
    // Get all lab tests for column headers
    const labTests = await LabTest.find().sort({ name: 1 });
    
    // Group data by user
    const userDataMap = new Map();
    
    testData.forEach(entry => {
      const userId = entry.userId._id.toString();
      const userName = `${entry.userId.firstName} ${entry.userId.lastName || ''}`.trim();
      const labTestId = entry.labTestId._id.toString();
      
      if (!userDataMap.has(userId)) {
        userDataMap.set(userId, {
          userId,
          userName,
          labTestData: new Map()
        });
      }
      
      const userData = userDataMap.get(userId);
      if (!userData.labTestData.has(labTestId)) {
        userData.labTestData.set(labTestId, {
          labTestName: entry.labTestId.name,
          totalSampleTaken: 0,
          totalSamplePositive: 0
        });
      }
      
      const labData = userData.labTestData.get(labTestId);
      labData.totalSampleTaken += entry.sampleTaken;
      labData.totalSamplePositive += entry.samplePositive;
    });
    
    // Generate CSV content
    let csvContent = '';
    
    // Header row
    const headers = ['User Name'];
    labTests.forEach(labTest => {
      headers.push(`${labTest.name} - Samples Taken`);
      headers.push(`${labTest.name} - Samples Positive`);
    });
    csvContent += headers.join(',') + '\n';
    
    // Data rows
    userDataMap.forEach((userData) => {
      const row = [userData.userName];
      
      labTests.forEach(labTest => {
        const labTestId = labTest._id.toString();
        const labData = userData.labTestData.get(labTestId);
        
        row.push(labData ? labData.totalSampleTaken : 0);
        row.push(labData ? labData.totalSamplePositive : 0);
      });
      
      csvContent += row.join(',') + '\n';
    });
    
    // Set response headers for CSV download
    const filename = `UDSP_Report_${startDate}_to_${endDate}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    res.send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting CSV',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/reports/summary
// @desc    Get summary statistics for date range
// @access  Private/Admin
router.get('/summary', validateDateRange, auth, adminAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate } = req.query;
    
    // Convert dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);
    
    // Get aggregated statistics
    const totalEntries = await TestData.countDocuments({
      date: { $gte: start, $lte: end }
    });
    
    const uniqueUsers = await TestData.distinct('userId', {
      date: { $gte: start, $lte: end }
    });
    
    const totalSamples = await TestData.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalSampleTaken: { $sum: '$sampleTaken' },
          totalSamplePositive: { $sum: '$samplePositive' }
        }
      }
    ]);
    
    const labTestStats = await TestData.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$labTestId',
          totalSampleTaken: { $sum: '$sampleTaken' },
          totalSamplePositive: { $sum: '$samplePositive' },
          entryCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'labtests',
          localField: '_id',
          foreignField: '_id',
          as: 'labTest'
        }
      },
      { $unwind: '$labTest' }
    ]);
    
    const summary = {
      totalEntries,
      uniqueUsers: uniqueUsers.length,
      totalSampleTaken: totalSamples[0]?.totalSampleTaken || 0,
      totalSamplePositive: totalSamples[0]?.totalSamplePositive || 0,
      positivityRate: totalSamples[0] ? 
        ((totalSamples[0].totalSamplePositive / totalSamples[0].totalSampleTaken) * 100).toFixed(2) : 0,
      labTestStats: labTestStats.map(stat => ({
        labTestId: stat._id,
        labTestName: stat.labTest.name,
        totalSampleTaken: stat.totalSampleTaken,
        totalSamplePositive: stat.totalSamplePositive,
        entryCount: stat.entryCount,
        positivityRate: ((stat.totalSamplePositive / stat.totalSampleTaken) * 100).toFixed(2)
      })),
      dateRange: { startDate, endDate }
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching summary',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;