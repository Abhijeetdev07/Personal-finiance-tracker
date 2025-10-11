const userAgent = require('user-agents');
const { getLocationWithCache, formatLocation } = require('./geolocation');

// Function to detect device type from user agent
function detectDeviceType(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// Function to detect browser from user agent
function detectBrowser(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('chrome') && !ua.includes('edg')) {
    return 'Chrome';
  } else if (ua.includes('firefox')) {
    return 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'Safari';
  } else if (ua.includes('edg')) {
    return 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    return 'Opera';
  } else {
    return 'Unknown Browser';
  }
}

// Function to detect OS from user agent
function detectOS(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) {
    return 'Windows';
  } else if (ua.includes('mac os') || ua.includes('macos')) {
    return 'macOS';
  } else if (ua.includes('linux')) {
    return 'Linux';
  } else if (ua.includes('android')) {
    return 'Android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    return 'iOS';
  } else {
    return 'Unknown OS';
  }
}

// Function to generate device name
function generateDeviceName(userAgent, deviceType) {
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  
  if (deviceType === 'mobile') {
    return `${os} Mobile (${browser})`;
  } else if (deviceType === 'tablet') {
    return `${os} Tablet (${browser})`;
  } else {
    return `${os} Desktop (${browser})`;
  }
}

// Function to get client IP address
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         '127.0.0.1';
}

// Main function to extract device information
async function extractDeviceInfo(req) {
  const userAgent = req.get('User-Agent') || '';
  const deviceType = detectDeviceType(userAgent);
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  const deviceName = generateDeviceName(userAgent, deviceType);
  const ip = getClientIP(req);
  
  // Generate unique device ID based on user agent and IP
  const deviceId = require('crypto')
    .createHash('md5')
    .update(userAgent + ip)
    .digest('hex')
    .substring(0, 16);
  
  // Get location information from IP
  let locationData = {
    ip,
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
    timezone: 'UTC',
    isp: 'Unknown'
  };

  try {
    const location = await getLocationWithCache(ip);
    locationData = {
      ip,
      country: location.country || 'Unknown',
      city: location.city || 'Unknown',
      region: location.region || 'Unknown',
      timezone: location.timezone || 'UTC',
      isp: location.isp || 'Unknown',
      latitude: location.latitude,
      longitude: location.longitude,
      formatted: formatLocation(location)
    };
  } catch (error) {
    console.error('Error getting location for IP:', ip, error.message);
  }
  
  return {
    deviceId,
    deviceName,
    deviceType,
    browser,
    os,
    location: locationData
  };
}

module.exports = {
  extractDeviceInfo,
  detectDeviceType,
  detectBrowser,
  detectOS,
  getClientIP
};
