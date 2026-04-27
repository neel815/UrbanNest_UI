'use client';

import { useEffect, useState } from 'react';

import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

export default function ResidentDashboardPage() {
  const [name, setName] = useState('Resident');

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.auth.me)
      .then((me: { full_name: string }) => setName(me.full_name || 'Resident'))
      .catch(() => {
        // Layout auth guard handles redirects.
      });
  }, []);

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Resident</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Welcome, {name}</h1>
          <p className="mt-2 text-slate-600">
            Your account is active. This resident module is ready for upcoming features like announcements,
            maintenance requests, and visitor management.
          </p>
        </div>
      </div>
    </main>
  );
}