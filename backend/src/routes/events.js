const express = require('express');
const router = express.Router();
const { getEvents, getTaskEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getEvents);
router.get('/task/:taskId', getTaskEvents);

module.exports = router;

