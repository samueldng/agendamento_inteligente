/**
 * Render deployment entry file
 */
import app from './app';

/**
 * start server with port for Render
 */
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Render server ready on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Available routes:');
  console.log('- GET /');
  console.log('- GET /api/health');
  console.log('- GET /api/professionals/by-user');
  console.log('- GET /api/hotel/notifications');
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;