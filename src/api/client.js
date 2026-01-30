const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry the request with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  async tryRefreshToken() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    return false;
  }

  async get(endpoint) {
    const response = await this.request(endpoint);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  async post(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  async put(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  async delete(endpoint) {
    const response = await this.request(endpoint, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();

// Auth API
export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => {
    const result = apiClient.post('/auth/logout', { refreshToken: apiClient.refreshToken });
    apiClient.clearTokens();
    return result;
  },
  getMe: () => apiClient.get('/auth/me'),
};

// Leads API
export const leadsApi = {
  getAll: () => apiClient.get('/leads'),
  getById: (id) => apiClient.get(`/leads/${id}`),
  create: (data) => apiClient.post('/leads', data),
  update: (id, data) => apiClient.put(`/leads/${id}`, data),
  delete: (id) => apiClient.delete(`/leads/${id}`),
  refreshNearbySales: (id) => apiClient.post(`/leads/${id}/nearby-sales/refresh`),
  refreshValue: (id) => apiClient.post(`/leads/${id}/value/refresh`),
  getValueHistory: (id) => apiClient.get(`/leads/${id}/value-history`),
  getNearbySales: (id) => apiClient.get(`/leads/${id}/nearby-sales`),
};

// Notifications API
export const notificationsApi = {
  getAll: (options = {}) => {
    const params = new URLSearchParams();
    if (options.unreadOnly) params.append('unreadOnly', 'true');
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    return apiClient.get(`/notifications?${params}`);
  },
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.post('/notifications/mark-all-read'),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
};

// Organization API
export const organizationApi = {
  get: () => apiClient.get('/organization'),
  update: (data) => apiClient.put('/organization', data),
  getUsers: () => apiClient.get('/organization/users'),
  inviteUser: (data) => apiClient.post('/organization/users/invite', data),
  removeUser: (userId) => apiClient.delete(`/organization/users/${userId}`),
  getUsage: () => apiClient.get('/organization/usage'),
};
