const User = require('../models/User');

// Function to add or update user session
async function addOrUpdateSession(userId, deviceInfo) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { deviceId, deviceName, deviceType, browser, os, location } = deviceInfo;
    
    // Check if session already exists
    const existingSessionIndex = user.activeSessions.findIndex(
      session => session.deviceId === deviceId
    );

    const sessionData = {
      deviceId,
      deviceName,
      deviceType,
      browser,
      os,
      location,
      lastActive: new Date(),
      isActive: true,
      loginTime: existingSessionIndex >= 0 ? user.activeSessions[existingSessionIndex].loginTime : new Date()
    };

    if (existingSessionIndex >= 0) {
      // Update existing session
      user.activeSessions[existingSessionIndex] = sessionData;
    } else {
      // Add new session
      user.activeSessions.push(sessionData);
    }

    // Limit to 5 active sessions per user
    if (user.activeSessions.length > 5) {
      user.activeSessions = user.activeSessions
        .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
        .slice(0, 5);
    }

    await user.save();
    return sessionData;
  } catch (error) {
    console.error('Error adding/updating session:', error);
    throw error;
  }
}

// Function to update session activity
async function updateSessionActivity(userId, deviceId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const session = user.activeSessions.find(s => s.deviceId === deviceId);
    if (session) {
      session.lastActive = new Date();
      session.isActive = true;
      await user.save();
    }
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

// Function to get user's active sessions
async function getUserSessions(userId) {
  try {
    const user = await User.findById(userId).select('activeSessions');
    if (!user) return [];

    // Mark sessions as inactive if not active for more than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    user.activeSessions.forEach(session => {
      if (new Date(session.lastActive) < thirtyMinutesAgo) {
        session.isActive = false;
      }
    });

    await user.save();
    
    return user.activeSessions.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
}

// Function to remove a specific session
async function removeSession(userId, deviceId) {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    user.activeSessions = user.activeSessions.filter(
      session => session.deviceId !== deviceId
    );

    await user.save();
    return true;
  } catch (error) {
    console.error('Error removing session:', error);
    return false;
  }
}

// Function to remove all sessions except current one
async function removeAllOtherSessions(userId, currentDeviceId) {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    user.activeSessions = user.activeSessions.filter(
      session => session.deviceId === currentDeviceId
    );

    await user.save();
    return true;
  } catch (error) {
    console.error('Error removing other sessions:', error);
    return false;
  }
}

// Function to check if a session exists for a device
async function sessionExists(userId, deviceId) {
  try {
    const user = await User.findById(userId).select('activeSessions');
    if (!user) return false;

    return user.activeSessions.some(session => session.deviceId === deviceId);
  } catch (error) {
    console.error('Error checking session existence:', error);
    return false;
  }
}

// Function to clean up inactive sessions (older than 7 days)
async function cleanupInactiveSessions() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    await User.updateMany(
      {},
      {
        $pull: {
          activeSessions: {
            lastActive: { $lt: sevenDaysAgo }
          }
        }
      }
    );
    
    console.log('Cleaned up inactive sessions');
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
}

module.exports = {
  addOrUpdateSession,
  updateSessionActivity,
  getUserSessions,
  removeSession,
  removeAllOtherSessions,
  sessionExists,
  cleanupInactiveSessions
};
