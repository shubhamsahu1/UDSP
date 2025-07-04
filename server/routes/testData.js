const express = require('express');
const TestData = require('../models/TestData');
const LabTest = require('../models/LabTest');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware for test data
const validateTestData = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in valid ISO format'),
  body('labTestId')
    .notEmpty()
    .withMessage('Lab test ID is required')
    .isMongoId()
    .withMessage('Lab test ID must be a valid MongoDB ObjectId'),
  body('sampleTaken')
    .notEmpty()
    .withMessage('Number of samples taken is required')
    .isInt({ min: 0 })
    .withMessage('Number of samples taken must be a non-negative integer'),
  body('samplePositive')
    .notEmpty()
    .withMessage('Number of positive samples is required')
    .isInt({ min: 0 })
    .withMessage('Number of positive samples must be a non-negative integer')
    .custom((value, { req }) => {
      if (parseInt(value) > parseInt(req.body.sampleTaken)) {
        throw new Error('Number of positive samples cannot exceed number of samples taken');
      }
      return true;
    })
];

// @route   GET /api/testdata/labtests
// @desc    Get all lab tests for dropdown (accessible to all users)
// @access  Private
router.get('/labtests', auth, async (req, res) => {
  try {
    const labTests = await LabTest.find({ }, 'name').sort({ name: 1 });
    
    res.json({
      success: true,
      data: labTests
    });
  } catch (error) {
    console.error('Get lab tests for dropdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lab tests',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/testdata/my/:date
// @desc    Get user's test data for a specific date
// @access  Private
router.get('/my/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date || !Date.parse(date)) {
      return res.status(400).json({
        success: false,
        message: 'Valid date is required'
      });
    }
    
    const testData = await TestData.find({
      userId: req.user._id,
      date: new Date(date)
    }).populate('labTestId', 'name');
    
    res.json({
      success: true,
      data: testData
    });
  } catch (error) {
    console.error('Get user test data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching test data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/testdata
// @desc    Create or update test data entry
// @access  Private
router.post('/', validateTestData, auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { date, labTestId, sampleTaken, samplePositive } = req.body;
    
    // Verify lab test exists
    const labTest = await LabTest.findById(labTestId);
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    const testDate = new Date(date);
    
    // Check if entry already exists for this user, date, and lab test
    const existingEntry = await TestData.findOne({
      userId: req.user._id,
      date: testDate,
      labTestId: labTestId
    });
    
    if (existingEntry) {
      // Update existing entry
      existingEntry.sampleTaken = sampleTaken;
      existingEntry.samplePositive = samplePositive;
      await existingEntry.save();
      
      const updatedEntry = await TestData.findById(existingEntry._id).populate('labTestId', 'name');
      
      res.json({
        success: true,
        message: 'Test data updated successfully',
        data: updatedEntry
      });
    } else {
      // Create new entry
      const testData = new TestData({
        userId: req.user._id,
        date: testDate,
        labTestId,
        sampleTaken,
        samplePositive
      });
      
      await testData.save();
      
      const newEntry = await TestData.findById(testData._id).populate('labTestId', 'name');
      
      res.status(201).json({
        success: true,
        message: 'Test data created successfully',
        data: newEntry
      });
    }
  } catch (error) {
    console.error('Create/Update test data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving test data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/testdata/:id
// @desc    Update specific test data entry
// @access  Private
router.put('/:id', validateTestData, auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { date, labTestId, sampleTaken, samplePositive } = req.body;
    
    // Verify lab test exists
    const labTest = await LabTest.findById(labTestId);
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    // Find the test data entry
    const testData = await TestData.findOne({
      _id: req.params.id,
      userId: req.user._id // Ensure user can only update their own data
    });
    
    if (!testData) {
      return res.status(404).json({
        success: false,
        message: 'Test data entry not found'
      });
    }
    
    // Update the entry
    testData.date = new Date(date);
    testData.labTestId = labTestId;
    testData.sampleTaken = sampleTaken;
    testData.samplePositive = samplePositive;
    
    await testData.save();
    
    const updatedEntry = await TestData.findById(testData._id).populate('labTestId', 'name');
    
    res.json({
      success: true,
      message: 'Test data updated successfully',
      data: updatedEntry
    });
  } catch (error) {
    console.error('Update test data error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Test data entry not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating test data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/testdata/:id
// @desc    Delete test data entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const testData = await TestData.findOne({
      _id: req.params.id,
      userId: req.user._id // Ensure user can only delete their own data
    });
    
    if (!testData) {
      return res.status(404).json({
        success: false,
        message: 'Test data entry not found'
      });
    }
    
    await TestData.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Test data entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete test data error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Test data entry not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting test data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;