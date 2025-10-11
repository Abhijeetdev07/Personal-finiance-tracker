import { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { AuthContext as AppAuthContext } from '../App';
import { FiSmartphone, FiMonitor, FiTablet, FiMapPin, FiClock, FiTrash2, FiShield, FiWifi, FiWifiOff, FiGlobe, FiNavigation, FiAlertTriangle, FiEye, FiKey } from 'react-icons/fi';

export default function DeviceManager({ isOpen, onClose }) {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [securityAnalysis, setSecurityAnalysis] = useState(null);
  const [showSecurity, setShowSecurity] = useState(false);
  const { showSuccess, showError } = useNotification();
  const { token } = useContext(AppAuthContext);

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
      fetchSecurityAnalysis();
    }
  }, [isOpen]);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/devices');
      const data = await res.json();
      
      if (data.success) {
        setDevices(data.sessions);
        // Get current device ID from localStorage or generate one
        const storedDeviceId = localStorage.getItem('currentDeviceId');
        if (storedDeviceId) {
          setCurrentDeviceId(storedDeviceId);
        }
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      showError('Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSecurityAnalysis = async () => {
    try {
      const res = await apiFetch('/devices/security');
      const data = await res.json();
      
      if (data.success) {
        setSecurityAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error fetching security analysis:', error);
    }
  };

  const removeDevice = async (deviceId) => {
    try {
      const res = await apiFetch(`/devices/${deviceId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setDevices(devices.filter(device => device.deviceId !== deviceId));
        showSuccess('Device removed successfully');
      } else {
        showError(data.error || 'Failed to remove device');
      }
    } catch (error) {
      console.error('Error removing device:', error);
      showError('Failed to remove device');
    }
  };

  const removeAllOtherDevices = async () => {
    try {
      const res = await apiFetch('/devices/others', { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setDevices(devices.filter(device => device.deviceId === currentDeviceId));
        showSuccess('All other devices removed successfully');
      } else {
        showError(data.error || 'Failed to remove other devices');
      }
    } catch (error) {
      console.error('Error removing other devices:', error);
      showError('Failed to remove other devices');
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return <FiSmartphone className="w-5 h-5" />;
      case 'tablet':
        return <FiTablet className="w-5 h-5" />;
      case 'desktop':
        return <FiMonitor className="w-5 h-5" />;
      default:
        return <FiMonitor className="w-5 h-5" />;
    }
  };

  const formatLastActive = (lastActive) => {
    const now = new Date();
    const activeTime = new Date(lastActive);
    const diffInMinutes = Math.floor((now - activeTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const isCurrentDevice = (deviceId) => {
    return deviceId === currentDeviceId;
  };

  const formatLocationDisplay = (location) => {
    if (!location) return 'Unknown Location';
    
    // Use formatted location if available, otherwise build from components
    if (location.formatted && location.formatted !== 'Unknown Location') {
      return location.formatted;
    }
    
    const parts = [];
    if (location.city && location.city !== 'Unknown') parts.push(location.city);
    if (location.region && location.region !== 'Unknown' && location.region !== location.city) {
      parts.push(location.region);
    }
    if (location.country && location.country !== 'Unknown') parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
  };

  const getLocationIcon = (location) => {
    if (!location || location.country === 'Unknown') return <FiGlobe className="w-3 h-3 sm:w-4 sm:h-4" />;
    return <FiNavigation className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const getLocationColor = (location) => {
    if (!location || location.country === 'Unknown') return 'text-gray-400';
    if (location.country === 'Local') return 'text-blue-500';
    return 'text-green-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Active Devices</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Manage your account sessions across devices</p>
            <p className="text-xs text-gray-600 mt-1 sm:hidden">Manage your sessions</p>
          </div>
          <div className="flex items-center gap-2">
            {securityAnalysis && securityAnalysis.riskLevel !== 'low' && (
              <button
                onClick={() => setShowSecurity(!showSecurity)}
                className={`p-2 rounded-lg transition-colors ${
                  showSecurity 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
                title="Security Analysis"
              >
                <FiAlertTriangle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)]">
          {/* Security Analysis Section */}
          {showSecurity && securityAnalysis && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FiShield className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Security Analysis</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  securityAnalysis.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                  securityAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {securityAnalysis.riskLevel.toUpperCase()} RISK
                </span>
              </div>
              
              {securityAnalysis.alerts && securityAnalysis.alerts.length > 0 && (
                <div className="space-y-2 mb-4">
                  {securityAnalysis.alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <FiAlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-red-700">{alert.message}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {securityAnalysis.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{securityAnalysis.stats.totalSessions}</div>
                    <div className="text-gray-600">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{securityAnalysis.stats.uniqueCountries}</div>
                    <div className="text-gray-600">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{securityAnalysis.stats.uniqueIPs}</div>
                    <div className="text-gray-600">IP Addresses</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{securityAnalysis.stats.activeSessions}</div>
                    <div className="text-gray-600">Active Now</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col sm:flex-row items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Loading devices...</span>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FiMonitor className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No devices found</h3>
              <p className="text-sm text-gray-600">No active sessions found for your account.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {devices.map((device) => (
                <div
                  key={device.deviceId}
                  className={`border rounded-lg p-3 sm:p-4 transition-all duration-200 ${
                    isCurrentDevice(device.deviceId)
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        isCurrentDevice(device.deviceId)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getDeviceIcon(device.deviceType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                              {device.deviceName}
                            </h3>
                            {isCurrentDevice(device.deviceId) && (
                              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-1">
                              {device.isActive ? (
                                <FiWifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                              ) : (
                                <FiWifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            {getLocationIcon(device.location)}
                            <span className={`truncate ${getLocationColor(device.location)}`}>
                              {formatLocationDisplay(device.location)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiClock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{formatLastActive(device.lastActive)}</span>
                          </div>
                        </div>
                        
                        {/* Additional location details for desktop */}
                        <div className="hidden sm:block text-xs text-gray-500 mb-1">
                          {device.location.isp && device.location.isp !== 'Unknown' && (
                            <span>ISP: {device.location.isp}</span>
                          )}
                          {device.location.timezone && device.location.timezone !== 'UTC' && (
                            <span className="ml-2">• {device.location.timezone}</span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <span className="capitalize">{device.deviceType}</span> • {device.browser} • {device.os}
                        </div>
                      </div>
                    </div>
                    
                    {!isCurrentDevice(device.deviceId) && (
                      <button
                        onClick={() => removeDevice(device.deviceId)}
                        className="p-2 sm:p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Remove device"
                        aria-label={`Remove ${device.deviceName}`}
                      >
                        <FiTrash2 className="w-4 h-4 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {devices.length > 1 && (
          <div className="border-t border-gray-200 p-3 sm:p-4 lg:p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <FiShield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Security tip: Remove devices you no longer use</span>
                <span className="sm:hidden">Remove unused devices</span>
              </div>
              <button
                onClick={removeAllOtherDevices}
                className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
              >
                Remove All Others
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
