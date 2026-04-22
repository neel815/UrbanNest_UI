'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type Stats = {
  total_users: number;
  total_admins: number;
  total_residents: number;
  total_security: number;
  residents_joined_last_30_days: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.systemAdmin.dashboardStats)
      .then(setStats)
      .catch((err: Error) => setError(err.message));
  }, []);

  const cards = [
    ['Residents Joined (30d)', stats?.residents_joined_last_30_days ?? 0],
    ['Total Residents', stats?.total_residents ?? 0],
    ['Total Admins', stats?.total_admins ?? 0],
    ['Total Security', stats?.total_security ?? 0],
    ['Total Users', stats?.total_users ?? 0],
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">System Admin Dashboard</h1>
          <div className="space-x-3">
            <Link href="/system-admin/admins" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
              Admins
            </Link>
            <Link href="/system-admin/settings" className="px-4 py-2 rounded-lg bg-slate-700 text-white">
              Settings
            </Link>
          </div>
        </div>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map(([title, value]) => (
            <div key={title} className="bg-white border rounded-xl p-4">
              <p className="text-sm text-gray-600">{title}</p>
              <p className="text-3xl font-bold mt-2">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
