const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const workflowRoutes = require('./routes/workflows');
const taskRoutes = require('./routes/tasks');
const eventRoutes = require('./routes/events');
const analyticsRoutes = require('./routes/analytics');
const searchRoutes = require('./routes/search');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'FlowTrack API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);

app.use(errorHandler);

module.exports = app;

