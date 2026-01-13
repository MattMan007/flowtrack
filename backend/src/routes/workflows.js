const express = require('express');
const router = express.Router();
const {
  createWorkflow,
  getWorkflows,
  getWorkflow
} = require('../controllers/workflowController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/workflows:
 *   post:
 *     summary: Create a new workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - stages
 *             properties:
 *               name:
 *                 type: string
 *                 example: Software Development
 *               description:
 *                 type: string
 *                 example: Standard development workflow
 *               stages:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: string
 *                     - type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         order:
 *                           type: integer
 *                 example: ["Backlog", "In Progress", "Code Review", "Testing", "Done"]
 *     responses:
 *       201:
 *         description: Workflow created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workflow'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', createWorkflow);

/**
 * @swagger
 * /api/workflows:
 *   get:
 *     summary: Get all workflows for the organization
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workflows
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workflow'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getWorkflows);

/**
 * @swagger
 * /api/workflows/{id}:
 *   get:
 *     summary: Get a specific workflow by ID
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *         example: 507f1f77bcf86cd799439013
 *     responses:
 *       200:
 *         description: Workflow details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workflow'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workflow not found
 */
router.get('/:id', getWorkflow);

module.exports = router;

