const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['task_created', 'stage_changed', 'task_completed', 'task_updated']
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  fromStage: {
    type: String,
    default: null
  },
  toStage: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

eventSchema.index({ organizationId: 1 });
eventSchema.index({ workflowId: 1 });
eventSchema.index({ taskId: 1 });
eventSchema.index({ userId: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ timestamp: -1 });
eventSchema.index({ organizationId: 1, timestamp: -1 });

module.exports = mongoose.model('Event', eventSchema);

