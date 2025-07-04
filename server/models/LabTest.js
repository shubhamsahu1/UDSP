const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lab test name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Lab test name must be at least 2 characters long'],
    maxlength: [100, 'Lab test name cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

// Index for faster queries
labTestSchema.index({ name: 1 });

module.exports = mongoose.model('LabTest', labTestSchema);