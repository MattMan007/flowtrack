const express = require('express');
const router = express.Router();
const {
  createWorkflow,
  getWorkflows,
  getWorkflow
} = require('../controllers/workflowController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createWorkflow);
router.get('/', getWorkflows);
router.get('/:id', getWorkflow);

module.exports = router;

