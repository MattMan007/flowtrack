const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  stages: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

workflowSchema.index({ organizationId: 1 });
workflowSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Workflow', workflowSchema);

