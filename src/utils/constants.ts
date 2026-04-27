export const API_ENDPOINTS = {
  health: '/api/health',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
    updateProfile: '/api/auth/me/profile',
    logout: '/api/auth/logout',
    resetPassword: '/api/auth/reset-password',
  },
  systemAdmin: {
    dashboardStats: '/api/system-admin/dashboard/stats',
    settingsMe: '/api/system-admin/settings/me',
    admins: '/api/system-admin/admins',
    inviteAdmin: '/api/system-admin/admins/invite',
  },
};
