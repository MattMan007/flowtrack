require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectElasticsearch } = require('./config/elasticsearch');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectElasticsearch();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

