'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type SystemAdminUser = {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  profile_image: string | null;
};

type SystemAdminUserContextValue = {
  user: SystemAdminUser | null;
  loading: boolean;
  error: string;
};

const SystemAdminUserContext = createContext<SystemAdminUserContextValue | null>(null);

export function SystemAdminUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SystemAdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiClient.get(API_ENDPOINTS.auth.me);
        setUser(data);

        if (typeof window !== 'undefined') {
          window.__URBANNEST_CURRENT_USER = data;
        }
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <SystemAdminUserContext.Provider value={{ user, loading, error }}>
      {children}
    </SystemAdminUserContext.Provider>
  );
}

export function useSystemAdminUser() {
  const context = useContext(SystemAdminUserContext);
  if (!context) {
    throw new Error('useSystemAdminUser must be used within SystemAdminUserProvider');
  }

  return context;
}

declare global {
  interface Window {
    __URBANNEST_CURRENT_USER?: SystemAdminUser;
  }
}