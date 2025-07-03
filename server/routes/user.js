const express = require('express');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { validateUserRegistration, validateProfileUpdate, handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');
const { USER_ROLES, isValidRole } = require('../../constants/roles');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', validateProfileUpdate, auth, async (req, res) => {
  try {
    const { firstName, lastName, mobile, email } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (mobile && mobile !== user.mobile) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number already exists'
        });
      }
    }
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.mobile = mobile || user.mobile;
    user.email = email || user.email;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/user/all
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/all', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/user/create
// @desc    Create new user (admin only)
// @access  Private/Admin
router.post('/create', validateUserRegistration, adminAuth, async (req, res) => {
  try {
    const { username, mobile, password, firstName, lastName, role, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ mobile }, { username }, ...(email ? [{ email }] : [])] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this mobile, email, or username already exists'
      });
    }

    // Validate role
    if (role && !isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be ${Object.values(USER_ROLES).join(' or ')}`
      });
    }

    // Create new user
    const user = new User({
      username,
      mobile,
      password,
      firstName,
      lastName,
      role: role || USER_ROLES.STAFF,
      email: email || undefined
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user creation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/user/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', validateProfileUpdate, adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, mobile, role, email } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (mobile && mobile !== user.mobile) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number already exists'
        });
      }
    }
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    // Validate role
    if (role && !isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be ${Object.values(USER_ROLES).join(' or ')}`
      });
    }
    
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.mobile = mobile || user.mobile;
    user.role = role || user.role;
    user.email = email || user.email;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/user/:id/password
// @desc    Change user password (admin only)
// @access  Private/Admin
router.put('/:id/password', [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
], adminAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'User password changed successfully'
    });
    
  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/user/:id/status
// @desc    Toggle user status (admin only)
// @access  Private/Admin
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status toggle',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/user/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router; 