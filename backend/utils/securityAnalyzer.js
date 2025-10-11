const { formatLocation } = require('./geolocation');

/**
 * Analyze device sessions for security patterns
 * @param {Array} sessions - Array of user sessions
 * @returns {Object} Security analysis results
 */
function analyzeSessionSecurity(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      riskLevel: 'low',
      alerts: [],
      suspiciousActivity: []
    };
  }

  const alerts = [];
  const suspiciousActivity = [];
  let riskLevel = 'low';

  // Check for multiple locations
  const uniqueLocations = new Set();
  const locationCounts = {};
  
  sessions.forEach(session => {
    const locationKey = `${session.location.country}-${session.location.city}`;
    uniqueLocations.add(locationKey);
    locationCounts[locationKey] = (locationCounts[locationKey] || 0) + 1;
  });

  // Alert for multiple countries
  const countries = [...new Set(sessions.map(s => s.location.country).filter(c => c !== 'Unknown'))];
  if (countries.length > 1) {
    alerts.push({
      type: 'multiple_countries',
      severity: 'medium',
      message: `Account accessed from ${countries.length} different countries: ${countries.join(', ')}`,
      countries: countries
    });
    riskLevel = 'medium';
  }

  // Alert for unusual locations
  const recentSessions = sessions.filter(s => {
    const lastActive = new Date(s.lastActive);
    const now = new Date();
    const hoursDiff = (now - lastActive) / (1000 * 60 * 60);
    return hoursDiff <= 24; // Last 24 hours
  });

  if (recentSessions.length > 0) {
    const recentCountries = [...new Set(recentSessions.map(s => s.location.country))];
    if (recentCountries.length > 1) {
      alerts.push({
        type: 'rapid_location_change',
        severity: 'high',
        message: `Rapid location changes detected in last 24 hours: ${recentCountries.join(' → ')}`,
        countries: recentCountries
      });
      riskLevel = 'high';
    }
  }

  // Check for suspicious IP patterns
  const ipCounts = {};
  sessions.forEach(session => {
    ipCounts[session.location.ip] = (ipCounts[session.location.ip] || 0) + 1;
  });

  const uniqueIPs = Object.keys(ipCounts).length;
  if (uniqueIPs > 3) {
    alerts.push({
      type: 'multiple_ips',
      severity: 'medium',
      message: `Account accessed from ${uniqueIPs} different IP addresses`,
      ipCount: uniqueIPs
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // Check for concurrent sessions from different locations
  const activeSessions = sessions.filter(s => s.isActive);
  if (activeSessions.length > 1) {
    const activeCountries = [...new Set(activeSessions.map(s => s.location.country))];
    if (activeCountries.length > 1) {
      alerts.push({
        type: 'concurrent_different_locations',
        severity: 'high',
        message: `Concurrent sessions from different locations: ${activeCountries.join(', ')}`,
        countries: activeCountries
      });
      riskLevel = 'high';
    }
  }

  // Check for unusual timezone patterns
  const timezones = [...new Set(sessions.map(s => s.location.timezone).filter(t => t !== 'UTC'))];
  if (timezones.length > 2) {
    alerts.push({
      type: 'multiple_timezones',
      severity: 'medium',
      message: `Account accessed from ${timezones.length} different timezones`,
      timezones: timezones
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  return {
    riskLevel,
    alerts,
    suspiciousActivity,
    stats: {
      totalSessions: sessions.length,
      uniqueLocations: uniqueLocations.size,
      uniqueCountries: countries.length,
      uniqueIPs: uniqueIPs,
      activeSessions: activeSessions.length
    }
  };
}

/**
 * Get location-based security recommendations
 * @param {Object} analysis - Security analysis results
 * @returns {Array} Array of security recommendations
 */
function getSecurityRecommendations(analysis) {
  const recommendations = [];

  if (analysis.riskLevel === 'high') {
    recommendations.push({
      priority: 'high',
      action: 'immediate_attention',
      message: 'High-risk activity detected. Consider changing password and reviewing all sessions.',
      icon: 'alert-triangle'
    });
  }

  if (analysis.alerts.some(alert => alert.type === 'concurrent_different_locations')) {
    recommendations.push({
      priority: 'high',
      action: 'review_sessions',
      message: 'Review and remove sessions from unfamiliar locations.',
      icon: 'shield'
    });
  }

  if (analysis.alerts.some(alert => alert.type === 'multiple_countries')) {
    recommendations.push({
      priority: 'medium',
      action: 'enable_2fa',
      message: 'Consider enabling two-factor authentication for additional security.',
      icon: 'key'
    });
  }

  if (analysis.stats.uniqueIPs > 5) {
    recommendations.push({
      priority: 'medium',
      action: 'monitor_activity',
      message: 'Monitor account activity regularly and remove unused devices.',
      icon: 'eye'
    });
  }

  return recommendations;
}

/**
 * Check if a new login location is suspicious
 * @param {Object} newLocation - New login location
 * @param {Array} existingSessions - Existing user sessions
 * @returns {Object} Suspicion analysis
 */
function checkNewLocationSuspicion(newLocation, existingSessions) {
  const isSuspicious = {
    isSuspicious: false,
    reasons: [],
    riskLevel: 'low'
  };

  if (!existingSessions || existingSessions.length === 0) {
    return isSuspicious;
  }

  // Check if location is completely new
  const existingCountries = [...new Set(existingSessions.map(s => s.location.country))];
  const existingCities = [...new Set(existingSessions.map(s => s.location.city))];
  
  if (!existingCountries.includes(newLocation.country) && newLocation.country !== 'Unknown') {
    isSuspicious.isSuspicious = true;
    isSuspicious.reasons.push(`New country: ${newLocation.country}`);
    isSuspicious.riskLevel = 'medium';
  }

  if (!existingCities.includes(newLocation.city) && newLocation.city !== 'Unknown') {
    isSuspicious.reasons.push(`New city: ${newLocation.city}`);
    if (isSuspicious.riskLevel === 'low') {
      isSuspicious.riskLevel = 'low';
    }
  }

  // Check for rapid location changes (within last hour)
  const recentSessions = existingSessions.filter(s => {
    const lastActive = new Date(s.lastActive);
    const now = new Date();
    const minutesDiff = (now - lastActive) / (1000 * 60);
    return minutesDiff <= 60; // Last hour
  });

  if (recentSessions.length > 0) {
    const recentCountries = [...new Set(recentSessions.map(s => s.location.country))];
    if (recentCountries.length > 0 && !recentCountries.includes(newLocation.country)) {
      isSuspicious.isSuspicious = true;
      isSuspicious.reasons.push('Rapid location change detected');
      isSuspicious.riskLevel = 'high';
    }
  }

  return isSuspicious;
}

module.exports = {
  analyzeSessionSecurity,
  getSecurityRecommendations,
  checkNewLocationSuspicion
};
