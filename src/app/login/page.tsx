'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HomeIcon from '@/assets/icons/home.svg';
import { API_ENDPOINTS } from '@/utils/constants';
import { apiClient, getApiErrorMessage } from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getRolePath = (role?: string) => {
    if (role === 'system_admin') return '/system-admin/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'resident') return '/resident/dashboard';
    if (role === 'security') return '/security/dashboard';
    return '/dashboard';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.login, {
        email,
        password,
      });
      localStorage.setItem('access_token', response.access_token);
      router.replace(getRolePath(response.role));
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F1E8] px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-[860px] rounded-[30px] border border-[#E3DDCF] bg-[#F8F5EC] px-5 pt-5 pb-3 shadow-[0_26px_70px_-42px_rgba(6,63,36,0.55)] sm:px-8 sm:pt-6 sm:pb-4 lg:-translate-y-2">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00552D] text-[#F8F5EC]">
            <HomeIcon className="h-5 w-5" fill="none" aria-hidden="true" />
          </div>
          <span className="text-[34px] font-serif text-4xl tracking-tight text-[#0D2A1F]">UrbanNest</span>
        </div>

        <div className="mb-6 inline-flex items-center rounded-full border border-[#D6D0C2] px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#575D53]">
          <span className="mr-2 h-2 w-2 rounded-full bg-[#D2A75C]" aria-hidden="true" />
          Sign In
        </div>

        <h1 className="text-[44px] leading-[0.98] tracking-tight text-[#0D2A1F] sm:text-[58px]">
          <span className="font-serif font-semibold">Welcome </span>
          <span className="font-serif font-semibold italic text-[#045A34]">back,</span>
        </h1>
        <p className="mt-6 text-base text-[#2E5141]">Use your UrbanNest account credentials to continue to your workspace.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold uppercase tracking-[0.24em] text-[#304E40]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@urbannest.app"
              required
              className="w-full rounded-[16px] border border-[#CFC7B7] bg-[#FCFAF5] px-4 py-2.5 text-[16px] text-[#163126] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none transition placeholder:text-[#798579] focus:border-[#2A6B4B] focus:ring-2 focus:ring-[#2A6B4B]/15"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold uppercase tracking-[0.24em] text-[#304E40]">
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-[16px] border border-[#CFC7B7] bg-[#FCFAF5] px-4 py-2.5 text-[16px] text-[#163126] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none transition focus:border-[#2A6B4B] focus:ring-2 focus:ring-[#2A6B4B]/15"
            />
          </div>

          {error && <p className="rounded-xl border border-[#E2B8B6] bg-[#FFF1F0] px-3 py-2 text-sm text-[#9A342E]">{error}</p>}

          <div className="flex items-center gap-2 text-[#3D564A]">
            <input id="keep-signed-in" type="checkbox" className="h-4 w-4 rounded border-[#AAA795] text-[#055A32] focus:ring-[#055A32]/20" />
            <label htmlFor="keep-signed-in" className="text-base font-medium">Keep me signed in</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[18px] bg-gradient-to-r from-[#045D34] via-[#06512F] to-[#013B24] py-3 text-lg font-semibold text-white shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

      </div>
    </main>
  );
}
