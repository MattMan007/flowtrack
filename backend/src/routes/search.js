const express = require('express');
const router = express.Router();
const {
  searchTasks,
  advancedEventSearch,
  getEventAggregations
} = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/tasks', searchTasks);
router.get('/events', advancedEventSearch);
router.get('/aggregations', getEventAggregations);

module.exports = router;

