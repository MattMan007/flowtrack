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

router.get('/dashboard', getDashboardStats);
router.get('/workflow/:workflowId/stage-duration', getAverageTimePerStage);
router.get('/workflow/:workflowId/bottlenecks', getBottlenecks);
router.get('/tasks-completed', getTasksCompletedOverTime);

module.exports = router;

