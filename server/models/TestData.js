const mongoose = require('mongoose');

const testDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  labTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest',
    required: [true, 'Lab test ID is required']
  },
  sampleTaken: {
    type: Number,
    required: [true, 'Number of samples taken is required'],
    min: [0, 'Number of samples taken cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Number of samples taken must be an integer'
    }
  },
  samplePositive: {
    type: Number,
    required: [true, 'Number of positive samples is required'],
    min: [0, 'Number of positive samples cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Number of positive samples must be an integer'
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure one entry per user per date per lab test
testDataSchema.index({ userId: 1, date: 1, labTestId: 1 }, { unique: true });

// Index for reporting queries
testDataSchema.index({ date: 1, labTestId: 1 });

// Custom validation to ensure positive samples don't exceed taken samples
testDataSchema.pre('save', function(next) {
  if (this.samplePositive > this.sampleTaken) {
    const error = new Error('Number of positive samples cannot exceed number of samples taken');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

module.exports = mongoose.model('TestData', testDataSchema);