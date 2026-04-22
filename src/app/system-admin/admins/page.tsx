'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type AdminItem = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  must_reset_password: boolean;
};

export default function AdminListPage() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const loadAdmins = async () => {
    const data = await apiClient.get(API_ENDPOINTS.systemAdmin.admins);
    setAdmins(data);
  };

  useEffect(() => {
    loadAdmins().catch((err: Error) => setError(err.message));
  }, []);

  const onAddAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setResetLink('');
    try {
      const data = await apiClient.post(API_ENDPOINTS.systemAdmin.inviteAdmin, {
        full_name: fullName,
        email,
      });
      setMessage(data.message);
      setResetLink(data.reset_link);
      setFullName('');
      setEmail('');
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add admin failed');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Users</h1>
          <Link href="/system-admin/dashboard" className="text-blue-600">Back</Link>
        </div>

        <div className="bg-white border rounded-xl p-5 mb-6">
          <form onSubmit={onAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="border rounded-lg px-3 py-2" placeholder="Admin full name" required />
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded-lg px-3 py-2" placeholder="Admin email" type="email" required />
            <button className="rounded-lg bg-indigo-600 text-white px-4 py-2">Add Admin</button>
          </form>
          {message && <p className="text-green-700 text-sm mt-2">{message}</p>}
          {resetLink && <p className="text-sm mt-1 break-all">Password setup link: {resetLink}</p>}
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-3">{a.full_name}</td>
                  <td className="px-4 py-3">{a.email}</td>
                  <td className="px-4 py-3">{new Date(a.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{a.must_reset_password ? 'Pending setup' : 'Active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
