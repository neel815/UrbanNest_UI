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
  admin: {
    dashboardStats: '/api/admin/dashboard/stats',
    residents: '/api/admin/residents',
    inviteResident: '/api/admin/residents/invite',
    security: '/api/admin/security',
  },
  resident: {
    dashboardStats: '/api/resident/dashboard-stats',
    announcements: '/api/resident/announcements',
    maintenance: '/api/resident/maintenance',
    visitors: '/api/resident/visitors',
    payments: '/api/resident/payments',
    events: '/api/resident/events',
    forumPosts: '/api/resident/forum-posts',
  },
};
