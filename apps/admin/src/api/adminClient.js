// API Client for Kruu Admin Control Center
const BASE_URL = import.meta.env.VITE_API_URL || '';

class AdminApiClient {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = localStorage.getItem('kruu_admin_token') || localStorage.getItem('kruu_auth_token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('kruu_admin_token');
      localStorage.removeItem('kruu_admin_user');
      throw new Error('Authentication expired or unauthorized. Please sign in again.');
    }

    if (response.status === 403) {
      throw new Error('Forbidden: You do not possess administrator credentials.');
    }

    if (!response.ok) {
      let errorMsg = `Server returned HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorMsg);
    }

    // For file downloads or blobs
    if (options.responseType === 'blob') {
      return await response.blob();
    }

    return await response.json();
  }

  // Auth Operations
  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.user?.role !== 'admin') {
      throw new Error('Access denied: Account does not have administrative permissions.');
    }

    const token = res.accessToken || res.token;
    if (token) {
      localStorage.setItem('kruu_admin_token', token);
      localStorage.setItem('kruu_admin_user', JSON.stringify(res.user));
    }
    return res;
  }

  async getMe() {
    const res = await this.request('/api/auth/me');
    if (res.user?.role !== 'admin') {
      throw new Error('Unauthorized: Admin role required');
    }
    localStorage.setItem('kruu_admin_user', JSON.stringify(res.user));
    return res.user;
  }

  logout() {
    localStorage.removeItem('kruu_admin_token');
    localStorage.removeItem('kruu_admin_user');
  }

  // Dashboard Telemetry
  async getDashboard() {
    return this.request('/api/admin/dashboard');
  }

  // User Management
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/users?${query}`);
  }

  async getUserDetail(userId) {
    return this.request(`/api/admin/users/${userId}`);
  }

  async updateUserStatus(userId, status, reason = '') {
    return this.request(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  }

  async revokeApiKey(userId, keyId) {
    return this.request(`/api/admin/users/${userId}/keys/${keyId}/revoke`, {
      method: 'POST',
    });
  }

  // Internship Certificate Management
  async grantCertificateEligibility(userId, data) {
    return this.request(`/api/admin/users/${userId}/certificate-eligibility`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async revokeCertificateEligibility(userId, reason) {
    return this.request(`/api/admin/users/${userId}/certificate-eligibility/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getCertificates(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/certificates?${query}`);
  }

  // Catalogue Management
  async getApis(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/apis?${query}`);
  }

  async updateApi(apiId, data) {
    return this.request(`/api/admin/apis/${apiId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Payments Management
  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/payments?${query}`);
  }

  // Audit Logs
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/audit-logs?${query}`);
  }

  // Reports & Exports
  async downloadExport(reportType) {
    const blob = await this.request(`/api/admin/export/${reportType}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kruu_admin_export_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const adminApi = new AdminApiClient();
export default adminApi;
