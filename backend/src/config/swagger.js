const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlowTrack API',
      version: '1.0.0',
      description: `
# FlowTrack - Workflow Activity Tracking API

FlowTrack is an event-driven workflow management and analytics platform with Elasticsearch integration.

## Key Features
- 📊 Event-driven architecture with immutable audit logs
- ⚡ Elasticsearch-powered search (50-100x faster)
- 🔐 JWT-based authentication with org-level isolation
- 📈 Real-time analytics and bottleneck detection
- 🔍 Full-text search with fuzzy matching

## Architecture
- **MongoDB**: Primary data storage
- **Elasticsearch**: Fast search and analytics
- **Node.js + Express**: REST API
- **JWT**: Secure authentication

## Getting Started
1. Register an organization and admin user
2. Login to receive JWT token
3. Use token in Authorization header: \`Bearer <token>\`
4. Create workflows, tasks, and track events
5. Use search and analytics endpoints for insights
      `,
      contact: {
        name: 'FlowTrack API Support',
        email: 'support@flowtrack.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.flowtrack.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration'
      },
      {
        name: 'Workflows',
        description: 'Workflow management with custom stages'
      },
      {
        name: 'Tasks',
        description: 'Task CRUD and stage transitions'
      },
      {
        name: 'Events',
        description: 'Immutable event log queries'
      },
      {
        name: 'Analytics',
        description: 'Workflow analytics and insights'
      },
      {
        name: 'Search',
        description: 'Elasticsearch-powered search (50x faster)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from the login endpoint'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['admin', 'member'], example: 'admin' },
            organizationId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            organizationName: { type: 'string', example: 'Acme Corp' }
          }
        },
        Workflow: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            name: { type: 'string', example: 'Software Development' },
            description: { type: 'string', example: 'Standard dev workflow' },
            organizationId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            stages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'In Progress' },
                  order: { type: 'integer', example: 1 }
                }
              }
            },
            createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
            title: { type: 'string', example: 'Build authentication' },
            description: { type: 'string', example: 'Implement JWT auth' },
            organizationId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            workflowId: { type: 'string', example: '507f1f77bcf86cd799439013' },
            currentStage: { type: 'string', example: 'In Progress' },
            status: { type: 'string', enum: ['active', 'completed'], example: 'active' },
            createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Event: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439015' },
            eventType: { 
              type: 'string', 
              enum: ['task_created', 'stage_changed', 'task_completed', 'task_updated'],
              example: 'stage_changed'
            },
            organizationId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            taskId: { type: 'string', example: '507f1f77bcf86cd799439014' },
            workflowId: { type: 'string', example: '507f1f77bcf86cd799439013' },
            fromStage: { type: 'string', example: 'Backlog', nullable: true },
            toStage: { type: 'string', example: 'In Progress', nullable: true },
            timestamp: { type: 'string', format: 'date-time' },
            metadata: { type: 'object', example: {} }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

