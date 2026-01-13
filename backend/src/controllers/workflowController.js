const Workflow = require('../models/Workflow');

const createWorkflow = async (req, res) => {
  try {
    const { name, description, stages } = req.body;

    if (!name || !stages || !Array.isArray(stages) || stages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide workflow name and stages'
      });
    }

    const orderedStages = stages.map((stage, index) => ({
      name: stage.name || stage,
      order: stage.order !== undefined ? stage.order : index
    }));

    const workflow = await Workflow.create({
      name,
      description,
      stages: orderedStages,
      organizationId: req.organizationId,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating workflow',
      error: error.message
    });
  }
};

const getWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find({ organizationId: req.organizationId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: workflows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workflows'
    });
  }
};

const getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      organizationId: req.organizationId
    }).populate('createdBy', 'name email');

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workflow'
    });
  }
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflow
};

