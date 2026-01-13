const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTaskStage,
  completeTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.patch('/:id/stage', updateTaskStage);
router.patch('/:id/complete', completeTask);

module.exports = router;

