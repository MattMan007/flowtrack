const Event = require('../models/Event');
const elasticsearchService = require('./elasticsearchService');

class EventService {
  async createEvent(eventData) {
    const event = await Event.create(eventData);
    
    // Index event in Elasticsearch for fast searching
    await elasticsearchService.indexEvent(event);
    
    return event;
  }

  async getEvents(filters = {}, options = {}) {
    const query = Event.find(filters);

    if (options.startDate || options.endDate) {
      const dateFilter = {};
      if (options.startDate) dateFilter.$gte = new Date(options.startDate);
      if (options.endDate) dateFilter.$lte = new Date(options.endDate);
      query.where('timestamp', dateFilter);
    }

    if (options.sort) {
      query.sort(options.sort);
    } else {
      query.sort({ timestamp: -1 });
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    const events = await query.populate('userId', 'name email').populate('taskId', 'title');
    return events;
  }

  async getEventsByTask(taskId, organizationId) {
    return await Event.find({ taskId, organizationId })
      .sort({ timestamp: 1 })
      .populate('userId', 'name');
  }

  async getEventsByWorkflow(workflowId, organizationId, options = {}) {
    const filters = { workflowId, organizationId };
    return await this.getEvents(filters, options);
  }
}

module.exports = new EventService();

