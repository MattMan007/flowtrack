const Task = require('../models/Task');
const Workflow = require('../models/Workflow');
const eventService = require('../services/eventService');
const elasticsearchService = require('../services/elasticsearchService');

const createTask = async (req, res) => {
  try {
    const { title, description, workflowId, currentStage } = req.body;

    if (!title || !workflowId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task title and workflow ID'
      });
    }

    const workflow = await Workflow.findOne({
      _id: workflowId,
      organizationId: req.organizationId
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    const initialStage = currentStage || workflow.stages[0].name;

    const task = await Task.create({
      title,
      description,
      workflowId,
      currentStage: initialStage,
      organizationId: req.organizationId,
      createdBy: req.user._id
    });

    // Index task in Elasticsearch for full-text search
    await elasticsearchService.indexTask(task);

    await eventService.createEvent({
      eventType: 'task_created',
      organizationId: req.organizationId,
      userId: req.user._id,
      taskId: task._id,
      workflowId: workflow._id,
      toStage: initialStage,
      metadata: { title, description }
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const { workflowId, status } = req.query;

    const filter = { organizationId: req.organizationId };
    if (workflowId) filter.workflowId = workflowId;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email')
      .populate('workflowId', 'name stages')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.organizationId
    })
      .populate('createdBy', 'name email')
      .populate('workflowId', 'name stages');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task'
    });
  }
};

const updateTaskStage = async (req, res) => {
  try {
    const { newStage } = req.body;

    if (!newStage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new stage'
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.organizationId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const workflow = await Workflow.findById(task.workflowId);
    const validStage = workflow.stages.find(s => s.name === newStage);

    if (!validStage) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stage for this workflow'
      });
    }

    const oldStage = task.currentStage;
    task.currentStage = newStage;
    task.updatedAt = new Date();
    await task.save();

    // Update task in Elasticsearch
    await elasticsearchService.indexTask(task);

    await eventService.createEvent({
      eventType: 'stage_changed',
      organizationId: req.organizationId,
      userId: req.user._id,
      taskId: task._id,
      workflowId: task.workflowId,
      fromStage: oldStage,
      toStage: newStage,
      metadata: {}
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update task stage error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task stage',
      error: error.message
    });
  }
};

const completeTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.organizationId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.updatedAt = new Date();
    await task.save();

    await eventService.createEvent({
      eventType: 'task_completed',
      organizationId: req.organizationId,
      userId: req.user._id,
      taskId: task._id,
      workflowId: task.workflowId,
      toStage: task.currentStage,
      metadata: { completedAt: task.completedAt }
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing task',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTaskStage,
  completeTask
};

