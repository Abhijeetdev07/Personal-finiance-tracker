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


