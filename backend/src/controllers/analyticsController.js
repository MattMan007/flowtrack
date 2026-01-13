const analyticsService = require('../services/analyticsService');

const getAverageTimePerStage = async (req, res) => {
  try {
    const { workflowId } = req.params;

    if (!workflowId) {
      return res.status(400).json({
        success: false,
        message: 'Workflow ID is required'
      });
    }

    const averages = await analyticsService.getAverageTimePerStage(
      workflowId,
      req.organizationId
    );

    res.status(200).json({
      success: true,
      data: averages
    });
  } catch (error) {
    console.error('Get average time per stage error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating stage averages',
      error: error.message
    });
  }
};

const getTasksCompletedOverTime = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    const data = await analyticsService.getTasksCompletedOverTime(
      req.organizationId,
      startDate,
      endDate,
      groupBy || 'day'
    );

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get tasks completed over time error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completion data',
      error: error.message
    });
  }
};

const getBottlenecks = async (req, res) => {
  try {
    const { workflowId } = req.params;

    if (!workflowId) {
      return res.status(400).json({
        success: false,
        message: 'Workflow ID is required'
      });
    }

    const bottlenecks = await analyticsService.detectBottlenecks(
      workflowId,
      req.organizationId
    );

    res.status(200).json({
      success: true,
      data: bottlenecks
    });
  } catch (error) {
    console.error('Get bottlenecks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting bottlenecks',
      error: error.message
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.organizationId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

module.exports = {
  getAverageTimePerStage,
  getTasksCompletedOverTime,
  getBottlenecks,
  getDashboardStats
};

