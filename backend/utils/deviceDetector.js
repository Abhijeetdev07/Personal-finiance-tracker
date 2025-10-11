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
  
  // More descriptive device names
  if (deviceType === 'mobile') {
    // For mobile devices, prioritize device model if available
    if (userAgent.includes('iPhone')) {
      const model = extractiPhoneModel(userAgent);
      return model ? `${model} (${browser})` : `iPhone (${browser})`;
    } else if (userAgent.includes('Android')) {
      const model = extractAndroidModel(userAgent);
      return model ? `${model} (${browser})` : `Android Phone (${browser})`;
    } else {
      return `${os} Mobile (${browser})`;
    }
  } else if (deviceType === 'tablet') {
    if (userAgent.includes('iPad')) {
      return `iPad (${browser})`;
    } else if (userAgent.includes('Android')) {
      return `Android Tablet (${browser})`;
    } else {
      return `${os} Tablet (${browser})`;
    }
  } else {
    // For desktop, try to get more specific info
    if (userAgent.includes('Windows')) {
      const windowsVersion = extractWindowsVersion(userAgent);
      return windowsVersion ? `${windowsVersion} (${browser})` : `Windows PC (${browser})`;
    } else if (userAgent.includes('Mac')) {
      return `Mac (${browser})`;
    } else {
      return `${os} Computer (${browser})`;
    }
  }
}

// Helper function to extract iPhone model
function extractiPhoneModel(userAgent) {
  if (userAgent.includes('iPhone')) {
    // Try to extract iPhone model from user agent
    if (userAgent.includes('iPhone14,2')) return 'iPhone 13 Pro';
    if (userAgent.includes('iPhone14,3')) return 'iPhone 13 Pro Max';
    if (userAgent.includes('iPhone13,2')) return 'iPhone 12';
    if (userAgent.includes('iPhone13,3')) return 'iPhone 12 Pro';
    if (userAgent.includes('iPhone12,1')) return 'iPhone 11';
    if (userAgent.includes('iPhone12,3')) return 'iPhone 11 Pro';
    if (userAgent.includes('iPhone12,5')) return 'iPhone 11 Pro Max';
    if (userAgent.includes('iPhone11,2')) return 'iPhone XS';
    if (userAgent.includes('iPhone11,4')) return 'iPhone XS Max';
    if (userAgent.includes('iPhone11,6')) return 'iPhone XS Max';
    if (userAgent.includes('iPhone10,3')) return 'iPhone X';
    if (userAgent.includes('iPhone10,6')) return 'iPhone X';
    return 'iPhone';
  }
  return null;
}

// Helper function to extract Android model
function extractAndroidModel(userAgent) {
  // Look for common Android device patterns
  const androidPatterns = [
    /Samsung[^;)]*/i,
    /Pixel[^;)]*/i,
    /OnePlus[^;)]*/i,
    /Xiaomi[^;)]*/i,
    /Huawei[^;)]*/i,
    /LG[^;)]*/i,
    /Sony[^;)]*/i,
    /Motorola[^;)]*/i,
    /OPPO[^;)]*/i,
    /Vivo[^;)]*/i,
    /Realme[^;)]*/i,
    /Redmi[^;)]*/i
  ];
  
  for (const pattern of androidPatterns) {
    const match = userAgent.match(pattern);
    if (match) {
      let deviceName = match[0].trim();
      // Clean up the device name
      deviceName = deviceName.replace(/[;)]/g, '').trim();
      return deviceName;
    }
  }
  
  // Try to extract from Build information
  const buildMatch = userAgent.match(/Build\/([^;)]*)/i);
  if (buildMatch) {
    return `Android Device (${buildMatch[1].substring(0, 20)}...)`;
  }
  
  return null;
}

// Helper function to extract Windows version
function extractWindowsVersion(userAgent) {
  if (userAgent.includes('Windows NT 10.0')) return 'Windows 10/11';
  if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
  if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
  return 'Windows';
}

// Function to get client IP address with better mobile support
function getClientIP(req) {
  // Try multiple sources to get the real IP, especially for mobile devices
  const possibleIPs = [
    req.ip,
    req.connection.remoteAddress,
    req.socket.remoteAddress,
    req.connection.socket?.remoteAddress,
    req.headers['x-forwarded-for']?.split(',')[0]?.trim(),
    req.headers['x-real-ip'],
    req.headers['x-client-ip'],
    req.headers['cf-connecting-ip'], // Cloudflare
    req.headers['x-cluster-client-ip'],
    req.headers['x-forwarded'],
    req.headers['forwarded-for'],
    req.headers['forwarded']
  ];

  // Find the first valid IP that's not localhost
  for (const ip of possibleIPs) {
    if (ip && ip !== '127.0.0.1' && ip !== '::1' && ip !== '::ffff:127.0.0.1') {
      // Clean up the IP (remove IPv6 prefix if present)
      const cleanIP = ip.replace(/^::ffff:/, '');
      if (cleanIP && cleanIP !== '127.0.0.1') {
        return cleanIP;
      }
    }
  }

  // Fallback to localhost if no valid IP found
  return '127.0.0.1';
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
