'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50 p-6" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await apiClient.post(API_ENDPOINTS.auth.resetPassword, { token, password });
      setMessage('Password set. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white border rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-2">Set Password</h1>
        <p className="text-sm text-gray-600 mb-6">Use the invite link from System Admin.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="password" className="w-full border rounded-lg px-3 py-2" placeholder="New password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" className="w-full border rounded-lg px-3 py-2" placeholder="Confirm password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <button className="w-full rounded-lg bg-blue-600 text-white py-2.5">Set Password</button>
        </form>
      </div>
    </main>
  );
}
