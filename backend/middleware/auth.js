const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { updateSessionActivity, sessionExists } = require("../utils/sessionManager");
const { extractDeviceInfo } = require("../utils/deviceDetector");


async function auth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer token
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure user still exists (e.g., was not deleted)
    const user = await User.findById(payload.id).select("_id");
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = { id: user._id.toString() };
    
    // Check if current session still exists (session validation)
    try {
      const deviceInfo = await extractDeviceInfo(req);
      const sessionStillExists = await sessionExists(user._id, deviceInfo.deviceId);
      
      if (!sessionStillExists) {
        return res.status(401).json({ 
          error: "Session has been terminated. Please log in again.",
          code: "SESSION_TERMINATED"
        });
      }
      
      // Update session activity (non-blocking)
      setImmediate(async () => {
        try {
          await updateSessionActivity(user._id, deviceInfo.deviceId);
        } catch (error) {
          console.error("Error updating session activity:", error);
        }
      });
    } catch (error) {
      console.error("Error validating session:", error);
      return res.status(401).json({ error: "Session validation failed" });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = auth;
