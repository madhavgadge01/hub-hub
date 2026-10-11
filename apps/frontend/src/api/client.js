const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Standard fetch wrapper for backend API calls with credentials and JSON parsing.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    credentials: "include", // Send and receive HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  let data;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => apiFetch("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiFetch("/api/auth/login", { method: "POST", body: payload }),
  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
  getMe: () => apiFetch("/api/auth/me", { method: "GET" }),
  refreshToken: () => apiFetch("/api/auth/refresh-token", { method: "POST" }),

  // API Keys
  listKeys: () => apiFetch("/api/keys", { method: "GET" }),
  createKey: (payload) => apiFetch("/api/keys", { method: "POST", body: payload }),
  revokeKey: (id) => apiFetch(`/api/keys/${id}`, { method: "DELETE" }),

  // Analytics
  getAnalytics: () => apiFetch("/api/analytics", { method: "GET" }),

  // Browser Utilities
  generateQr: (payload) => apiFetch("/api/utilities/qr", { method: "POST", body: payload }),
  extractUrlMetadata: (payload) => apiFetch("/api/utilities/url-metadata", { method: "POST", body: payload }),
  validateJson: (payload) => apiFetch("/api/utilities/json-validator", { method: "POST", body: payload }),
  formatJson: (payload) => apiFetch("/api/utilities/json-formatter", { method: "POST", body: payload }),
  validateCard: (payload) => apiFetch("/api/utilities/card-validator", { method: "POST", body: payload }),
  generatePassword: (payload) => apiFetch("/api/utilities/password", { method: "POST", body: payload }),
  checkPassword: (payload) => apiFetch("/api/utilities/passwordchecker", { method: "POST", body: payload }),

  // Developer APIs (v1 with x-api-key)
  developerCall: (endpoint, payload, apiKey) =>
    apiFetch(`/api/v1${endpoint}`, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: payload,
    }),
};

export default api;
