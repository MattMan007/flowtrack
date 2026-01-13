const elasticsearchService = require('../services/elasticsearchService');
const { isElasticsearchAvailable } = require('../config/elasticsearch');

const searchTasks = async (req, res) => {
  try {
    if (!isElasticsearchAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Search service is not available. Elasticsearch is not configured.'
      });
    }

    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = await elasticsearchService.searchTasks(req.organizationId, q);

    res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Search tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};

const advancedEventSearch = async (req, res) => {
  try {
    if (!isElasticsearchAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Search service is not available. Elasticsearch is not configured.'
      });
    }

    const searchParams = {
      eventType: req.query.eventType,
      workflowId: req.query.workflowId,
      userId: req.query.userId,
      taskId: req.query.taskId,
      fromStage: req.query.fromStage,
      toStage: req.query.toStage,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseInt(req.query.limit) || 100
    };

    const results = await elasticsearchService.searchEvents(req.organizationId, searchParams);

    res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Advanced event search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing advanced search',
      error: error.message
    });
  }
};

const getEventAggregations = async (req, res) => {
  try {
    if (!isElasticsearchAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Analytics service is not available. Elasticsearch is not configured.'
      });
    }

    const { workflowId, startDate, endDate } = req.query;

    const aggregations = await elasticsearchService.getEventAggregationsByType(
      req.organizationId,
      workflowId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: aggregations
    });
  } catch (error) {
    console.error('Get event aggregations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting aggregations',
      error: error.message
    });
  }
};

module.exports = {
  searchTasks,
  advancedEventSearch,
  getEventAggregations
};

