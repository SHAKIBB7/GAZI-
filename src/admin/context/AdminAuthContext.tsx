import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { adminApi } from '../services/adminApi';

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gazi_admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('gazi_admin_token');
      if (storedToken) {
        const res = await adminApi.getMe();
        if (res.data?.authenticated && res.data.user) {
          setUser(res.data.user);
        } else {
          // Token invalid
          localStorage.removeItem('gazi_admin_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    const res = await adminApi.login(username, password);
    setIsLoading(false);

    if (res.data?.success && res.data.token && res.data.user) {
      localStorage.setItem('gazi_admin_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch {}
    localStorage.removeItem('gazi_admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: Boolean(user && token),
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
