export const API_ENDPOINTS = {
  health: '/api/health',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  users: {
    list: '/api/users',
    detail: (id: string) => `/api/users/${id}`,
    create: '/api/users',
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
  },
};
