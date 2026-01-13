const express = require('express');
const router = express.Router();
const { getEvents, getTaskEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Query events with filters
 *     description: Get events with multiple filter options. Events are immutable audit logs of all system actions.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workflowId
 *         schema:
 *           type: string
 *         description: Filter by workflow ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user who performed the action
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *         description: Filter by task ID
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [task_created, stage_changed, task_completed, task_updated]
 *         description: Filter by event type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events after this date
 *         example: 2024-01-01T00:00:00Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events before this date
 *         example: 2024-12-31T23:59:59Z
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get('/', getEvents);

/**
 * @swagger
 * /api/events/task/{taskId}:
 *   get:
 *     summary: Get all events for a specific task
 *     description: Returns complete event history for a task, showing all stage transitions and actions
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: 507f1f77bcf86cd799439014
 *     responses:
 *       200:
 *         description: Task event history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get('/task/:taskId', getTaskEvents);

module.exports = router;
