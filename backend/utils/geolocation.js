const axios = require('axios');

/**
 * Get location information from IP address using a free geolocation service
 * @param {string} ip - IP address to get location for
 * @returns {Promise<Object>} Location data with country, city, region, etc.
 */
async function getLocationFromIP(ip) {
  try {
    // Skip geolocation for local/private IPs
    if (isPrivateIP(ip)) {
      return {
        country: 'Local',
        city: 'Local Network',
        region: 'Private Network',
        timezone: 'UTC',
        isp: 'Private Network'
      };
    }

    // Use ipapi.co - free tier allows 1000 requests/day
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 5000, // 5 second timeout
      headers: {
        'User-Agent': 'SmartFinance/1.0'
      }
    });

    if (response.data && !response.data.error) {
      return {
        country: response.data.country_name || 'Unknown',
        city: response.data.city || 'Unknown',
        region: response.data.region || 'Unknown',
        timezone: response.data.timezone || 'UTC',
        isp: response.data.org || 'Unknown ISP',
        latitude: response.data.latitude,
        longitude: response.data.longitude
      };
    }

    // Fallback to ip-api.com if ipapi.co fails
    return await getLocationFromIPFallback(ip);
  } catch (error) {
    console.error('Geolocation error:', error.message);
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'UTC',
      isp: 'Unknown'
    };
  }
}

/**
 * Fallback geolocation service using ip-api.com
 * @param {string} ip - IP address to get location for
 * @returns {Promise<Object>} Location data
 */
async function getLocationFromIPFallback(ip) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'SmartFinance/1.0'
      }
    });

    if (response.data && response.data.status === 'success') {
      return {
        country: response.data.country || 'Unknown',
        city: response.data.city || 'Unknown',
        region: response.data.regionName || 'Unknown',
        timezone: response.data.timezone || 'UTC',
        isp: response.data.isp || 'Unknown ISP',
        latitude: response.data.lat,
        longitude: response.data.lon
      };
    }
  } catch (error) {
    console.error('Fallback geolocation error:', error.message);
  }

  return {
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
    timezone: 'UTC',
    isp: 'Unknown'
  };
}

/**
 * Check if IP address is private/local
 * @param {string} ip - IP address to check
 * @returns {boolean} True if private IP
 */
function isPrivateIP(ip) {
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (localhost)
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
    /^::1$/,                    // IPv6 localhost
    /^fc00:/,                   // IPv6 private
    /^fe80:/                    // IPv6 link-local
  ];

  return privateRanges.some(range => range.test(ip));
}

/**
 * Get location with caching to avoid repeated API calls
 * @param {string} ip - IP address
 * @returns {Promise<Object>} Cached or fresh location data
 */
const locationCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function getLocationWithCache(ip) {
  const cacheKey = ip;
  const cached = locationCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const locationData = await getLocationFromIP(ip);
  
  // Cache the result
  locationCache.set(cacheKey, {
    data: locationData,
    timestamp: Date.now()
  });

  return locationData;
}

/**
 * Format location for display
 * @param {Object} location - Location data object
 * @returns {string} Formatted location string
 */
function formatLocation(location) {
  if (!location) return 'Unknown Location';
  
  const parts = [];
  if (location.city && location.city !== 'Unknown') parts.push(location.city);
  if (location.region && location.region !== 'Unknown') parts.push(location.region);
  if (location.country && location.country !== 'Unknown') parts.push(location.country);
  
  return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
}

/**
 * Get timezone offset for location
 * @param {Object} location - Location data object
 * @returns {string} Timezone offset string
 */
function getTimezoneOffset(location) {
  if (!location || !location.timezone) return 'UTC';
  
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const localTime = new Date(utc.toLocaleString("en-US", { timeZone: location.timezone }));
    const offset = (localTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
    
    return `UTC${offset >= 0 ? '+' : ''}${offset}`;
  } catch (error) {
    return 'UTC';
  }
}

module.exports = {
  getLocationFromIP,
  getLocationWithCache,
  formatLocation,
  getTimezoneOffset,
  isPrivateIP
};
