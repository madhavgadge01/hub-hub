const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Standard fetch wrapper for backend API calls with credentials and JSON parsing.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("kruu_auth_token") : null;

  const config = {
    ...options,
    credentials: "include", // Send and receive HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

function toQueryString(params = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "undefined" &&
      value !== "null"
    ) {
      clean[key] = value;
    }
  }
  const query = new URLSearchParams(clean).toString();
  return query ? `?${query}` : "";
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

  // Section 1: Tools Directory APIs
  getToolsCategories: () => apiFetch("/api/tools/categories"),
  getLatestTools: (params = {}) => apiFetch(`/api/tools/latest${toQueryString(params)}`),
  getTools: (params = {}) => apiFetch(`/api/tools${toQueryString(params)}`),
  getFilterMetadata: () => apiFetch("/api/tools/filters"),
  getToolBySlug: (slug) => apiFetch(`/api/tools/${slug}`),
  getToolPricing: (slug) => apiFetch(`/api/tools/${slug}/pricing`),
  getToolFeatures: (slug) => apiFetch(`/api/tools/${slug}/features`),
  getToolIntegrations: (slug) => apiFetch(`/api/tools/${slug}/integrations`),
  getToolSpecifications: (slug) => apiFetch(`/api/tools/${slug}/specifications`),
  compareTools: (identifiers = []) => {
    const query = Array.isArray(identifiers) ? identifiers.join(",") : identifiers;
    return apiFetch(`/api/tools/compare?slugs=${encodeURIComponent(query)}`);
  },

  // Admin Catalogue APIs
  adminCreateCategory: (payload) => apiFetch("/api/tools/admin/categories", { method: "POST", body: payload }),
  adminUpdateCategory: (id, payload) => apiFetch(`/api/tools/admin/categories/${id}`, { method: "PUT", body: payload }),
  adminDeleteCategory: (id) => apiFetch(`/api/tools/admin/categories/${id}`, { method: "DELETE" }),
  adminCreateTool: (payload) => apiFetch("/api/tools/admin/tools", { method: "POST", body: payload }),
  adminUpdateTool: (id, payload) => apiFetch(`/api/tools/admin/tools/${id}`, { method: "PUT", body: payload }),
  adminDeleteTool: (id) => apiFetch(`/api/tools/admin/tools/${id}`, { method: "DELETE" }),
  adminAddPlan: (toolId, payload) => apiFetch(`/api/tools/admin/tools/${toolId}/plans`, { method: "POST", body: payload }),
  adminAddFeature: (toolId, payload) => apiFetch(`/api/tools/admin/tools/${toolId}/features`, { method: "POST", body: payload }),
  adminAddSpecification: (toolId, payload) => apiFetch(`/api/tools/admin/tools/${toolId}/specifications`, { method: "POST", body: payload }),

  // Section 2: Marketplace APIs
  getMarketplaceCategories: () => apiFetch("/api/marketplace/categories"),
  getMarketplaceApis: (params = {}) => apiFetch(`/api/marketplace/apis${toQueryString(params)}`),
  getMarketplaceApiBySlug: (slug) => apiFetch(`/api/marketplace/apis/${slug}`),
  getMarketplaceApiPlans: (slug) => apiFetch(`/api/marketplace/apis/${slug}/plans`),
  getMarketplaceApiDocs: (slug) => apiFetch(`/api/marketplace/apis/${slug}/docs`),

  // Section 2: Checkout & Razorpay
  createCheckoutOrder: (payload) =>
    apiFetch("/api/checkout/orders", { method: "POST", body: payload }),
  verifyPayment: (payload) =>
    apiFetch("/api/checkout/verify", { method: "POST", body: payload }),

  // Section 2: User Profile & Account Dashboard
  getProfile: () => apiFetch("/api/profile"),
  updateProfile: (payload) =>
    apiFetch("/api/profile", { method: "PATCH", body: payload }),
  getUserPurchases: () => apiFetch("/api/profile/purchases"),
  getUserPayments: () => apiFetch("/api/profile/payments"),
  getUserEntitlements: () => apiFetch("/api/profile/entitlements"),
  getUserUsageAnalytics: () => apiFetch("/api/profile/usage"),
  getUserRecentActivity: (limit = 20) =>
    apiFetch(`/api/profile/usage/recent?limit=${limit}`),
  rotateKey: (id) => apiFetch(`/api/keys/${id}/rotate`, { method: "POST" }),

  // Internship Certificate System
  getCertificateStatus: () => apiFetch("/api/certificates/status"),
  createCertificateOrder: () => apiFetch("/api/certificates/orders", { method: "POST" }),
  verifyCertificatePayment: (payload) =>
    apiFetch("/api/certificates/verify-payment", { method: "POST", body: payload }),
  getCertificateDownloadUrl: (id = "") =>
    `${API_BASE_URL}/api/certificates/download${id ? `/${id}` : ""}`,
  verifyCertificatePublic: (code) => apiFetch(`/api/certificates/verify/${code}`),
};

export default api;
