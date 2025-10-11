const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

let onUnauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorizedHandler = typeof handler === "function" ? handler : null;
}

export async function apiFetch(path, options = {}) {
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : `${BASE_URL}${path}`;

  const storedToken = localStorage.getItem("token");

  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (storedToken && !mergedHeaders.Authorization) {
    mergedHeaders.Authorization = `Bearer ${storedToken}`;
  }

  const response = await fetch(url, { ...options, headers: mergedHeaders });

  if (response.status === 401) {
    try {
      localStorage.removeItem("token");
      if (onUnauthorizedHandler) {
        onUnauthorizedHandler();
      } else {
        window.location.assign("/login");
      }
    } catch (_) {
      // noop
    }
    throw new Error("Unauthorized");
  }

  return response;
}


// Profile API helpers
export async function getProfile() {
  const res = await apiFetch("/profile", { method: "GET" });
  return res.json();
}

export async function updateUserProfile(profileUpdates) {
  const res = await apiFetch("/profile", {
    method: "PUT",
    body: JSON.stringify(profileUpdates),
  });
  return res.json();
}

// Phone number formatting utilities
export function formatPhoneNumber(phone, countryCode) {
  if (!phone) return '';
  
  // If country code is provided, format as "countryCode phone"
  if (countryCode) {
    return `${countryCode} ${phone}`;
  }
  
  // Fallback to just phone number for backward compatibility
  return phone;
}

export function parsePhoneNumber(formattedPhone) {
  if (!formattedPhone) return { countryCode: '', phone: '' };
  
  // Check if phone number already has country code format
  const countryCodeMatch = formattedPhone.match(/^(\+\d{1,4})\s+(.+)$/);
  if (countryCodeMatch) {
    return {
      countryCode: countryCodeMatch[1],
      phone: countryCodeMatch[2]
    };
  }
  
  // Default to India country code for existing phone numbers
  return {
    countryCode: '+91',
    phone: formattedPhone
  };
}

export function validatePhoneFormat(phone, countryCode) {
  if (!phone) return { isValid: true, error: '' };
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Basic validation based on country code
  switch (countryCode) {
    case '+91': // India
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return { isValid: false, error: 'Indian mobile number must be 10 digits starting with 6, 7, 8, or 9' };
      }
      break;
    case '+1': // US/Canada
      if (!/^\d{10}$/.test(cleanPhone)) {
        return { isValid: false, error: 'US/Canada number must be 10 digits' };
      }
      break;
    case '+44': // UK
      if (!/^\d{10,11}$/.test(cleanPhone)) {
        return { isValid: false, error: 'UK number must be 10-11 digits' };
      }
      break;
    default:
      // Generic validation for other countries
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        return { isValid: false, error: 'Phone number must be 7-15 digits' };
      }
  }
  
  return { isValid: true, error: '' };
}

// Date formatting utilities for Kolkata timezone (IST)
export function formatDateToIST(dateString) {
  if (!dateString) return 'Invalid Date';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatDateTimeToIST(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Device management API helpers
export async function getDevices() {
  const res = await apiFetch("/devices", { method: "GET" });
  return res.json();
}

export async function removeDevice(deviceId) {
  const res = await apiFetch(`/devices/${deviceId}`, { method: "DELETE" });
  return res.json();
}

export async function removeAllOtherDevices() {
  const res = await apiFetch("/devices/others", { method: "DELETE" });
  return res.json();
}

export async function updateDeviceActivity() {
  const res = await apiFetch("/devices/activity", { method: "PUT" });
  return res.json();
}

export async function getSecurityAnalysis() {
  const res = await apiFetch("/devices/security", { method: "GET" });
  return res.json();
}

