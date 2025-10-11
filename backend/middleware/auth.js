const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { updateSessionActivity } = require("../utils/sessionManager");
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
    
    // Update session activity (non-blocking)
    setImmediate(async () => {
      try {
        const deviceInfo = await extractDeviceInfo(req);
        await updateSessionActivity(user._id, deviceInfo.deviceId);
      } catch (error) {
        console.error("Error updating session activity:", error);
      }
    });
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = auth;
