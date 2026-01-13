const { Client } = require('@elastic/elasticsearch');

let esClient = null;

const connectElasticsearch = async () => {
  try {
    if (!process.env.ELASTICSEARCH_URL) {
      console.warn('⚠️  ELASTICSEARCH_URL not set - Elasticsearch features disabled');
      return null;
    }

    // Support both API Key and Username/Password authentication
    const authConfig = {};
    
    if (process.env.ELASTICSEARCH_API_KEY) {
      // API Key authentication (recommended)
      authConfig.auth = {
        apiKey: process.env.ELASTICSEARCH_API_KEY
      };
    } else if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
      // Username/Password authentication
      authConfig.auth = {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      };
    }

    esClient = new Client({
      node: process.env.ELASTICSEARCH_URL,
      ...authConfig
    });

    // Test connection - different for serverless vs regular
    try {
      // Try regular Elasticsearch health check
      const health = await esClient.cluster.health();
      console.log(`✅ Elasticsearch connected: ${health.cluster_name} (${health.status})`);
    } catch (healthError) {
      // Serverless mode doesn't support cluster health API
      // Try a simpler ping instead
      const ping = await esClient.ping();
      if (ping) {
        console.log(`✅ Elasticsearch connected (Serverless mode)`);
      }
    }

    // Create indexes if they don't exist
    await createIndexes();

    return esClient;
  } catch (error) {
    console.error('⚠️  Elasticsearch connection failed:', error.message);
    console.log('   Continuing without Elasticsearch - search features will be limited');
    return null;
  }
};

const createIndexes = async () => {
  try {
    // Events index
    const eventsIndexExists = await esClient.indices.exists({ index: 'flowtrack_events' });
    if (!eventsIndexExists) {
      await esClient.indices.create({
        index: 'flowtrack_events',
        mappings: {
          properties: {
            eventType: { type: 'keyword' },
            organizationId: { type: 'keyword' },
            userId: { type: 'keyword' },
            taskId: { type: 'keyword' },
            workflowId: { type: 'keyword' },
            fromStage: { type: 'keyword' },
            toStage: { type: 'keyword' },
            timestamp: { type: 'date' },
            metadata: { type: 'object', enabled: false }
          }
        }
      });
      console.log('✅ Created Elasticsearch index: flowtrack_events');
    }

    // Tasks index for full-text search
    const tasksIndexExists = await esClient.indices.exists({ index: 'flowtrack_tasks' });
    if (!tasksIndexExists) {
      await esClient.indices.create({
        index: 'flowtrack_tasks',
        mappings: {
          properties: {
            taskId: { type: 'keyword' },
            title: { type: 'text' },
            description: { type: 'text' },
            organizationId: { type: 'keyword' },
            workflowId: { type: 'keyword' },
            currentStage: { type: 'keyword' },
            status: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      });
      console.log('✅ Created Elasticsearch index: flowtrack_tasks');
    }
  } catch (error) {
    console.error('Error creating Elasticsearch indexes:', error.message);
  }
};

const getElasticsearchClient = () => esClient;

const isElasticsearchAvailable = () => esClient !== null;

module.exports = {
  connectElasticsearch,
  getElasticsearchClient,
  isElasticsearchAvailable
};

