'use client';

import AdminRoleCrudPage from '../../../components/AdminRoleCrudPage';
import { API_ENDPOINTS } from '@/utils/constants';

export default function AdminSecurityPage() {
  const securityEndpoint = API_ENDPOINTS.admin?.security || '/api/admin/security';

  return (
    <AdminRoleCrudPage
      roleTitle="Security"
      roleDescription="Manage security staff accounts with full CRUD actions from admin login."
      endpoint={securityEndpoint}
      createMode="invite"
      inviteEndpoint={API_ENDPOINTS.admin.inviteSecurity}
      showCreateImageUpload={false}
    />
  );
}

