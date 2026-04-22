'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

export default function SettingsPage() {
  const [appName, setAppName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.systemAdmin.settingsMe)
      .then((data) => {
        setAppName(data.app_name || '');
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setProfileImageUrl(data.profile_image_url || '');
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await apiClient.put(API_ENDPOINTS.systemAdmin.settingsMe, {
        app_name: appName,
        full_name: fullName,
        profile_image_url: profileImageUrl || null,
      });
      setMessage('Settings updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white border rounded-xl p-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Link href="/system-admin/dashboard" className="text-blue-600">Back</Link>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <input className="w-full border rounded-lg px-3 py-2" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Application name" required />
          <input className="w-full border rounded-lg px-3 py-2" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required />
          <input className="w-full border rounded-lg px-3 py-2 bg-gray-100" value={email} disabled />
          <input className="w-full border rounded-lg px-3 py-2" value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} placeholder="Logo/Profile image URL" />
          {profileImageUrl && <img src={profileImageUrl} alt="preview" className="w-16 h-16 rounded-full object-cover border" />}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-700 text-sm">{message}</p>}
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Save</button>
        </form>
      </div>
    </main>
  );
}
