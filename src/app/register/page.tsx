'use client';

import { FormEvent, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/constants';
import { apiClient } from '@/utils/api';

type RoleValue = 'admin' | 'resident' | 'security' | 'system_admin';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [creatorRole, setCreatorRole] = useState<RoleValue | null>(null);

  useEffect(() => {
    setCreatorRole(localStorage.getItem('current_role') as RoleValue | null);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.register, {
        full_name: fullName,
        email,
        password,
        role: 'resident',
      });
      setMessage(`User created successfully with role: ${response.role}`);
      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Register User</h1>
        <p className="text-sm text-gray-600 mb-6">
          Register users based on your role permissions.
        </p>

        {!creatorRole && (
          <p className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-800">
            Login required. Please sign in first so the API receives your bearer token.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <button
            type="submit"
            disabled={loading || !creatorRole}
            className="w-full rounded-lg bg-green-600 text-white py-2.5 font-medium hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? 'Creating user...' : 'Create user'}
          </button>
        </form>
      </div>
    </main>
  );
}
