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

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token and redirect to login for client-side sessions
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            try {
              window.location.href = '/login';
              // stop further execution — the browser will navigate away
              return;
            } catch (e) {
              // If redirect fails, still throw so callers can handle it
              throw new Error('Authentication required. Please log in again.');
            }
          }
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 404) {
          throw new Error(data?.detail || data || 'Endpoint not found. Please check the API configuration.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(data?.detail || data || `Request failed with status ${response.status}`);
        }
      }
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Unable to connect to the server.');
      }
      throw error;
    }
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

  async patch(endpoint: string, data: unknown, skipAuth = false) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, skipAuth);
  },

  async delete(endpoint: string, skipAuth = false) {
    return this.request(endpoint, { method: 'DELETE' }, skipAuth);
  },
};

export function getApiErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('Authentication required')) {
      return 'Authentication required. Please log in again.';
    }
    if (error.message.includes('Network error')) {
      return 'Network error. Unable to connect to the server.';
    }
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export const adminUnitApi = {
  list: '/api/admin/units',
  create: '/api/admin/units',
  update: (id: string) => `/api/admin/units/${id}`,
  delete: (id: string) => `/api/admin/units/${id}`,
};
