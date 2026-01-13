const express = require('express');
const router = express.Router();
const {
  getAverageTimePerStage,
  getTasksCompletedOverTime,
  getBottlenecks,
  getDashboardStats
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns organization-wide metrics including total tasks, active tasks, completed tasks, and recent activity
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                       example: 150
 *                     activeTasks:
 *                       type: integer
 *                       example: 45
 *                     completedTasks:
 *                       type: integer
 *                       example: 105
 *                     tasksLast7Days:
 *                       type: integer
 *                       example: 12
 *                     tasksLast30Days:
 *                       type: integer
 *                       example: 48
 */
router.get('/dashboard', getDashboardStats);

/**
 * @swagger
 * /api/analytics/workflow/{workflowId}/stage-duration:
 *   get:
 *     summary: Get average time per stage
 *     description: Calculates average time tasks spend in each stage based on event timestamps. Computed dynamically from events.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *         example: 507f1f77bcf86cd799439013
 *     responses:
 *       200:
 *         description: Average time per stage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       averageHours:
 *                         type: number
 *                         example: 24.5
 *                       taskCount:
 *                         type: integer
 *                         example: 15
 *               example:
 *                 success: true
 *                 data:
 *                   "In Progress":
 *                     averageHours: 18.5
 *                     taskCount: 23
 *                   "Code Review":
 *                     averageHours: 6.2
 *                     taskCount: 18
 */
router.get('/workflow/:workflowId/stage-duration', getAverageTimePerStage);

/**
 * @swagger
 * /api/analytics/workflow/{workflowId}/bottlenecks:
 *   get:
 *     summary: Detect workflow bottlenecks
 *     description: Identifies stages with longest average duration, sorted by time. Helps identify process inefficiencies.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *     responses:
 *       200:
 *         description: Stages sorted by average duration (bottlenecks first)
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
 *                     type: object
 *                     properties:
 *                       stage:
 *                         type: string
 *                       averageHours:
 *                         type: number
 *                       taskCount:
 *                         type: integer
 */
router.get('/workflow/:workflowId/bottlenecks', getBottlenecks);

/**
 * @swagger
 * /api/analytics/tasks-completed:
 *   get:
 *     summary: Get tasks completed over time
 *     description: Returns time-series data of completed tasks, grouped by day or week
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analysis
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analysis
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week]
 *           default: day
 *         description: Group results by day or week
 *     responses:
 *       200:
 *         description: Tasks completed time series
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
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       count:
 *                         type: integer
 */
router.get('/tasks-completed', getTasksCompletedOverTime);

module.exports = router;
