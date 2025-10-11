const { cleanupInactiveSessions } = require('./sessionManager');

// Run cleanup every 24 hours
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function startCleanupJob() {
  console.log('Starting session cleanup job...');
  
  // Run cleanup immediately on startup
  cleanupInactiveSessions();
  
  // Schedule regular cleanup
  setInterval(() => {
    console.log('Running scheduled session cleanup...');
    cleanupInactiveSessions();
  }, CLEANUP_INTERVAL);
}

module.exports = {
  startCleanupJob
};
