'use client';

import AdminRoleCrudPage from '../../../components/AdminRoleCrudPage';
import { API_ENDPOINTS } from '@/utils/constants';

export default function AdminResidentsPage() {
  const residentsEndpoint = API_ENDPOINTS.admin?.residents || '/api/admin/residents';

  return (
    <AdminRoleCrudPage
      roleTitle="Residents"
      roleDescription="Invite residents with activation links, then manage resident accounts from the admin portal."
      endpoint={residentsEndpoint}
      createMode="invite"
      inviteEndpoint={API_ENDPOINTS.admin.inviteResident}
      showCreateImageUpload={false}
    />
  );
}

