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
        const message = getApiErrorMessage(data);
        if (response.status === 401) {
          // If skipAuth is true (e.g., login endpoint), don't perform an automatic redirect.
          if (!skipAuth) {
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
          }
          // For skipAuth requests, surface the API's message instead of redirecting
          throw new Error(message || 'Authentication required. Please log in again.');
        } else if (response.status === 404) {
          throw new Error(message || 'Endpoint not found. Please check the API configuration.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(message || `Request failed with status ${response.status}`);
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

function formatValidationDetails(details: unknown): string | null {
  if (!Array.isArray(details)) return null;

  const toFriendlyLabel = (raw: string): string => {
    const dictionary: Record<string, string> = {
      full_name: 'Full name',
      phone_number: 'Phone number',
      profile_image: 'Profile image',
      due_date: 'Due date',
      event_date: 'Event date',
      move_in_date: 'Move in date',
      lease_end_date: 'Lease end date',
      reset_token: 'Reset token',
      email: 'Email',
      password: 'Password',
      title: 'Title',
      content: 'Description',
      description: 'Description',
      category: 'Category',
      priority: 'Priority',
      amount: 'Amount',
      type: 'Type',
      status: 'Status',
      message: 'Message',
      token: 'Token',
    };

    if (dictionary[raw]) return dictionary[raw];

    return raw
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const toFriendlyValidationMessage = (rawMessage: string): string => {
    const minLengthMatch = rawMessage.match(/^String should have at least (\d+) characters?$/i);
    if (minLengthMatch) {
      return `must be at least ${minLengthMatch[1]} characters.`;
    }

    const maxLengthMatch = rawMessage.match(/^String should have at most (\d+) characters?$/i);
    if (maxLengthMatch) {
      return `must be at most ${maxLengthMatch[1]} characters.`;
    }

    const lower = rawMessage.toLowerCase();
    if (lower === 'field required') {
      return 'is required.';
    }

    return rawMessage;
  };

  const messages = details
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const rawMessage = typeof record.msg === 'string' ? record.msg : null;
      const locParts = Array.isArray(record.loc)
        ? (record.loc as unknown[])
            .filter((part) => typeof part === 'string' || typeof part === 'number')
            .map((part) => String(part))
        : [];

      if (!rawMessage) return null;
      const message = toFriendlyValidationMessage(rawMessage);

      const filtered = locParts.filter((part) => !['body', 'query', 'path'].includes(part));
      const fieldKey = filtered.length ? filtered[filtered.length - 1] : '';
      if (!fieldKey) return message;

      const fieldLabel = toFriendlyLabel(fieldKey);
      return `${fieldLabel} ${message}`;
    })
    .filter((entry): entry is string => Boolean(entry));

  return messages.length ? messages.join(' | ') : null;
}

export function getApiErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      const parsedMessage: string = getApiErrorMessage(parsed);
      if (parsedMessage && parsedMessage !== 'Something went wrong. Please try again.') {
        return parsedMessage;
      }
    } catch {
      // non-JSON string, return as-is
    }
    return error;
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;

    const formattedDetails = formatValidationDetails(record.detail);
    if (formattedDetails) {
      return formattedDetails;
    }

    const detail = record.detail ?? record.message ?? record.error;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const formattedArrayDetails = formatValidationDetails(detail);
      if (formattedArrayDetails) {
        return formattedArrayDetails;
      }

      const firstMessage = detail.find((item) => typeof item === 'string' && item.trim());
      if (typeof firstMessage === 'string') {
        return firstMessage;
      }
    }

    if ('response' in record && record.response && typeof record.response === 'object') {
      const response = record.response as Record<string, unknown>;
      const responseDetail = response.detail ?? response.message ?? response.error;
      if (typeof responseDetail === 'string' && responseDetail.trim()) {
        return responseDetail;
      }
    }

    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== '{}') {
        return serialized;
      }
    } catch {
      // ignore serialization failures and fall back below
    }
  }

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
