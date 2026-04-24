export const apiClient = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

  getAuthToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  async request(endpoint: string, options: RequestInit = {}, skipAuth = false) {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (!skipAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Request failed');
    }
    return data;
  },

  async get(endpoint: string, skipAuth = false) {
    return this.request(endpoint, { method: 'GET' }, skipAuth);
  },

  async post(endpoint: string, data: unknown, skipAuth = false) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, skipAuth);
  },

  async put(endpoint: string, data: unknown, skipAuth = false) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, skipAuth);
  },

  async delete(endpoint: string, skipAuth = false) {
    return this.request(endpoint, { method: 'DELETE' }, skipAuth);
  },
};
