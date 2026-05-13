'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type AllowedRole = 'system_admin' | 'admin' | 'resident' | 'security';

function getRoleHomePath(role?: string) {
  if (role === 'system_admin') return '/system-admin/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'resident') return '/resident/dashboard';
  if (role === 'security') return '/security/dashboard';
  return '/dashboard';
}

export function useAuthGuard(role: AllowedRole) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const runGuard = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/login');
        setChecking(false);
        return;
      }

      try {
        const me: any = await apiClient.get(API_ENDPOINTS.auth.me);
        setUser(me);
        if (me.role !== role) {
          setChecking(false);
          router.replace(getRoleHomePath(me.role));
          return;
        }
        setChecking(false);
      } catch (guardError) {
        const message = getApiErrorMessage(guardError);
        if (message.includes('Authentication required')) {
          localStorage.removeItem('access_token');
          router.replace('/login');
          return;
        }

        setError(message);
        setChecking(false);
      }
    };

    runGuard();
  }, [role, router]);

  const logout = () => {
    localStorage.removeItem('access_token');
    router.replace('/login');
  };

  return { checking, error, logout, user };
}