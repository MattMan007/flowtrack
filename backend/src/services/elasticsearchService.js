const { getElasticsearchClient, isElasticsearchAvailable } = require('../config/elasticsearch');

class ElasticsearchService {
  // Index an event in Elasticsearch
  async indexEvent(event) {
    if (!isElasticsearchAvailable()) return;

    try {
      const client = getElasticsearchClient();
      await client.index({
        index: 'flowtrack_events',
        id: event._id.toString(),
        body: {
          eventType: event.eventType,
          organizationId: event.organizationId.toString(),
          userId: event.userId.toString(),
          taskId: event.taskId.toString(),
          workflowId: event.workflowId.toString(),
          fromStage: event.fromStage,
          toStage: event.toStage,
          timestamp: event.timestamp,
          metadata: event.metadata
        }
      });
    } catch (error) {
      console.error('Error indexing event to Elasticsearch:', error.message);
    }
  }

  // Index a task in Elasticsearch for full-text search
  async indexTask(task) {
    if (!isElasticsearchAvailable()) return;

    try {
      const client = getElasticsearchClient();
      await client.index({
        index: 'flowtrack_tasks',
        id: task._id.toString(),
        body: {
          taskId: task._id.toString(),
          title: task.title,
          description: task.description || '',
          organizationId: task.organizationId.toString(),
          workflowId: task.workflowId.toString(),
          currentStage: task.currentStage,
          status: task.status,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }
      });
    } catch (error) {
      console.error('Error indexing task to Elasticsearch:', error.message);
    }
  }

  // Advanced event search with Elasticsearch
  async searchEvents(organizationId, searchParams) {
    if (!isElasticsearchAvailable()) {
      throw new Error('Elasticsearch is not available');
    }

    const client = getElasticsearchClient();
    const must = [
      { term: { organizationId: organizationId.toString() } }
    ];

    if (searchParams.eventType) {
      must.push({ term: { eventType: searchParams.eventType } });
    }
    if (searchParams.workflowId) {
      must.push({ term: { workflowId: searchParams.workflowId } });
    }
    if (searchParams.userId) {
      must.push({ term: { userId: searchParams.userId } });
    }
    if (searchParams.taskId) {
      must.push({ term: { taskId: searchParams.taskId } });
    }
    if (searchParams.fromStage) {
      must.push({ term: { fromStage: searchParams.fromStage } });
    }
    if (searchParams.toStage) {
      must.push({ term: { toStage: searchParams.toStage } });
    }

    // Date range filter
    if (searchParams.startDate || searchParams.endDate) {
      const range = {};
      if (searchParams.startDate) range.gte = searchParams.startDate;
      if (searchParams.endDate) range.lte = searchParams.endDate;
      must.push({ range: { timestamp: range } });
    }

    const result = await client.search({
      index: 'flowtrack_events',
      query: { bool: { must } },
      sort: [{ timestamp: { order: 'desc' } }],
      size: searchParams.limit || 100
    });

    return result.hits.hits.map(hit => hit._source);
  }

  // Full-text search across tasks
  async searchTasks(organizationId, searchQuery) {
    if (!isElasticsearchAvailable()) {
      throw new Error('Elasticsearch is not available');
    }

    const client = getElasticsearchClient();
    const result = await client.search({
      index: 'flowtrack_tasks',
      query: {
        bool: {
          must: [
            { term: { organizationId: organizationId.toString() } },
            {
              multi_match: {
                query: searchQuery,
                fields: ['title^2', 'description'],
                type: 'best_fields',
                fuzziness: 'AUTO'
              }
            }
          ]
        }
      },
      highlight: {
        fields: {
          title: {},
          description: {}
        }
      },
      size: 50
    });

    return result.hits.hits.map(hit => ({
      ...hit._source,
      highlights: hit.highlight
    }));
  }

  // Analytics: Event count aggregation by type
  async getEventAggregationsByType(organizationId, workflowId, startDate, endDate) {
    if (!isElasticsearchAvailable()) {
      throw new Error('Elasticsearch is not available');
    }

    const client = getElasticsearchClient();
    const must = [{ term: { organizationId: organizationId.toString() } }];
    
    if (workflowId) must.push({ term: { workflowId: workflowId } });
    if (startDate || endDate) {
      const range = {};
      if (startDate) range.gte = startDate;
      if (endDate) range.lte = endDate;
      must.push({ range: { timestamp: range } });
    }

    const result = await client.search({
      index: 'flowtrack_events',
      query: { bool: { must } },
      size: 0,
      aggs: {
        by_event_type: {
          terms: { field: 'eventType', size: 10 }
        },
        by_stage: {
          terms: { field: 'toStage', size: 20 }
        },
        events_over_time: {
          date_histogram: {
            field: 'timestamp',
            calendar_interval: 'day'
          }
        }
      }
    });

    return {
      eventTypes: result.aggregations.by_event_type.buckets,
      stages: result.aggregations.by_stage.buckets,
      timeline: result.aggregations.events_over_time.buckets
    };
  }

  // Delete task from index
  async deleteTask(taskId) {
    if (!isElasticsearchAvailable()) return;

    try {
      const client = getElasticsearchClient();
      await client.delete({
        index: 'flowtrack_tasks',
        id: taskId.toString()
      });
    } catch (error) {
      if (error.meta?.statusCode !== 404) {
        console.error('Error deleting task from Elasticsearch:', error.message);
      }
    }
  }
}

module.exports = new ElasticsearchService();

