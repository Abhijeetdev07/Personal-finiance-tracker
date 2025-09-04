let currentResetToken = "";
let currentIdentifier = "";

// Initialize from sessionStorage on load (survives refresh, cleared on tab close)
try {
  const sToken = sessionStorage.getItem("resetToken") || "";
  const sIdentifier = sessionStorage.getItem("resetIdentifier") || "";
  currentResetToken = sToken;
  currentIdentifier = sIdentifier;
} catch (_) {
  // ignore storage errors
}

export function setResetContext({ token, identifier }) {
  currentResetToken = token || "";
  currentIdentifier = identifier || "";
  try {
    if (token) sessionStorage.setItem("resetToken", token);
    if (identifier) sessionStorage.setItem("resetIdentifier", identifier);
  } catch (_) {
    // ignore storage errors
  }
}

export function getResetToken() {
  if (currentResetToken) return currentResetToken;
  try {
    return sessionStorage.getItem("resetToken") || "";
  } catch (_) {
    return "";
  }
}

export function getResetIdentifier() {
  if (currentIdentifier) return currentIdentifier;
  try {
    return sessionStorage.getItem("resetIdentifier") || "";
  } catch (_) {
    return "";
  }
}

export function clearResetContext() {
  currentResetToken = "";
  currentIdentifier = "";
  try {
    sessionStorage.removeItem("resetToken");
    sessionStorage.removeItem("resetIdentifier");
  } catch (_) {
    // ignore storage errors
  }
}


