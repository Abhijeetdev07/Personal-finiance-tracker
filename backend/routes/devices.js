const express = require("express");
const auth = require("../middleware/auth");
const { getUserSessions, removeSession, removeAllOtherSessions, updateSessionActivity } = require("../utils/sessionManager");
const { extractDeviceInfo } = require("../utils/deviceDetector");
const { analyzeSessionSecurity, getSecurityRecommendations } = require("../utils/securityAnalyzer");

const router = express.Router();

// Apply authentication middleware to all device routes
router.use(auth);

// GET /api/devices - Get user's active sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await getUserSessions(req.user.id);
    
    res.json({
      success: true,
      sessions: sessions.map(session => ({
        deviceId: session.deviceId,
        deviceName: session.deviceName,
        deviceType: session.deviceType,
        browser: session.browser,
        os: session.os,
        location: session.location,
        lastActive: session.lastActive,
        isActive: session.isActive,
        loginTime: session.loginTime
      }))
    });
  } catch (error) {
    console.error("Get devices error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/devices/:deviceId - Remove a specific session
router.delete("/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const success = await removeSession(req.user.id, deviceId);
    
    if (success) {
      res.json({ 
        success: true, 
        message: "Session removed successfully" 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: "Session not found" 
      });
    }
  } catch (error) {
    console.error("Remove device error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/devices/others - Remove all other sessions except current
router.delete("/others", async (req, res) => {
  try {
    // Get current device info
    const currentDeviceInfo = extractDeviceInfo(req);
    const success = await removeAllOtherSessions(req.user.id, currentDeviceInfo.deviceId);
    
    if (success) {
      res.json({ 
        success: true, 
        message: "All other sessions removed successfully" 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: "Failed to remove other sessions" 
      });
    }
  } catch (error) {
    console.error("Remove other devices error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/devices/activity - Update current session activity
router.put("/activity", async (req, res) => {
  try {
    const currentDeviceInfo = await extractDeviceInfo(req);
    await updateSessionActivity(req.user.id, currentDeviceInfo.deviceId);
    
    res.json({ 
      success: true, 
      message: "Activity updated" 
    });
  } catch (error) {
    console.error("Update activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/devices/security - Get security analysis for user sessions
router.get("/security", async (req, res) => {
  try {
    const sessions = await getUserSessions(req.user.id);
    const securityAnalysis = analyzeSessionSecurity(sessions);
    const recommendations = getSecurityRecommendations(securityAnalysis);
    
    res.json({
      success: true,
      analysis: securityAnalysis,
      recommendations: recommendations
    });
  } catch (error) {
    console.error("Security analysis error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
