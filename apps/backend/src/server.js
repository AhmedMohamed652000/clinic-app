const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
