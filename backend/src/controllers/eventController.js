const eventService = require('../services/eventService');

const getEvents = async (req, res) => {
  try {
    const { workflowId, userId, taskId, eventType, startDate, endDate, limit } = req.query;

    const filters = { organizationId: req.organizationId };
    if (workflowId) filters.workflowId = workflowId;
    if (userId) filters.userId = userId;
    if (taskId) filters.taskId = taskId;
    if (eventType) filters.eventType = eventType;

    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    if (limit) options.limit = parseInt(limit);

    const events = await eventService.getEvents(filters, options);

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

const getTaskEvents = async (req, res) => {
  try {
    const events = await eventService.getEventsByTask(req.params.taskId, req.organizationId);

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task events'
    });
  }
};

module.exports = {
  getEvents,
  getTaskEvents
};

