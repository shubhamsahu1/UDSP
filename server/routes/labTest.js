const express = require('express');
const LabTest = require('../models/LabTest');
const { auth, adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware for lab test
const validateLabTest = [
  body('name')
    .notEmpty()
    .withMessage('Lab test name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Lab test name must be between 2 and 100 characters')
    .trim()
];

// @route   GET /api/labtests
// @desc    Get all lab tests
// @access  Private/Admin
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const labTests = await LabTest.find().sort({ name: 1 });
    
    res.json({
      success: true,
      data: labTests,
      count: labTests.length
    });
  } catch (error) {
    console.error('Get lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lab tests',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/labtests/:id
// @desc    Get single lab test
// @access  Private/Admin
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id);
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    res.json({
      success: true,
      data: labTest
    });
  } catch (error) {
    console.error('Get lab test error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lab test',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/labtests
// @desc    Create new lab test
// @access  Private/Admin
router.post('/', validateLabTest, auth, adminAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name } = req.body;
    
    // Check if lab test with same name already exists
    const existingLabTest = await LabTest.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingLabTest) {
      return res.status(400).json({
        success: false,
        message: 'Lab test with this name already exists'
      });
    }
    
    const labTest = new LabTest({ name });
    await labTest.save();
    
    res.status(201).json({
      success: true,
      message: 'Lab test created successfully',
      data: labTest
    });
  } catch (error) {
    console.error('Create lab test error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Lab test with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating lab test',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/labtests/:id
// @desc    Update lab test
// @access  Private/Admin
router.put('/:id', validateLabTest, auth, adminAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name } = req.body;
    
    // Check if lab test with same name already exists (excluding current one)
    const existingLabTest = await LabTest.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    if (existingLabTest) {
      return res.status(400).json({
        success: false,
        message: 'Lab test with this name already exists'
      });
    }
    
    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Lab test updated successfully',
      data: labTest
    });
  } catch (error) {
    console.error('Update lab test error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Lab test with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating lab test',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/labtests/:id
// @desc    Delete lab test
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id);
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    // Check if lab test is being used in test data
    const TestData = require('../models/TestData');
    const testDataCount = await TestData.countDocuments({ labTestId: req.params.id });
    
    if (testDataCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete lab test. It is being used in ${testDataCount} test data entries.`
      });
    }
    
    await LabTest.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Lab test deleted successfully'
    });
  } catch (error) {
    console.error('Delete lab test error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting lab test',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;