'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { register, login, refresh, verify, forgotPassword, resetPassword, logout } from '@/lib/api/auth';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  registerUser: (data: { firstName: string; lastName?: string; email: string; password: string }) => Promise<void>;
  loginUser: (data: { email: string; password: string }) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  verifyAccessToken: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetUserPassword: (token: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const saveAuthData = (accessToken: string, refreshToken: string, userData: User) => {
    const username = `${userData.firstName}${userData.lastName ? ` ${userData.lastName}` : ''}`;
    const localStorageUser = { id: userData._id, username, role: userData.role };

    Cookies.set('access_token', accessToken, { expires: 1, secure: true, sameSite: 'Strict' });
    Cookies.set('refresh_token', refreshToken, { expires: 7, secure: true, sameSite: 'Strict' });
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(localStorageUser));

    // console.log("User", userData);
    setUser(userData)
  };

  const clearAuthData = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getAccessToken = () => Cookies.get('access_token') || null;
  const getRefreshToken = () => Cookies.get('refresh_token') || null;

  const loginUser = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await login(data);
      saveAuthData(response.data.access_token, response.data.refresh_token, response.data.user);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data: { firstName: string; lastName?: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await register(data);
      saveAuthData(response.data.access_token, response.data.refresh_token, response.data.user);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await logout();
      clearAuthData();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    setLoading(true);
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');
      const response = await refresh(refreshToken);
      saveAuthData(response.data.access_token, response.data.refresh_token, response.data.user);
    } finally {
      setLoading(false);
    }
  };

  const verifyAccessToken = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error('No token');
      const response = await verify(token);
      const username = `${response.data.firstName}${response.data.lastName ? ` ${response.data.lastName}` : ''}`;
      const localStorageUser = { id: response.data._id, username, role: response.data.role };
      localStorage.setItem('user', JSON.stringify(localStorageUser));
      setUser(response.data);
    } catch {
      try {
        await refreshAccessToken();
        toast.success("Token Refreshed")
      } catch {
        clearAuthData();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    try {
      await forgotPassword(email);
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser || getAccessToken()) {
          await verifyAccessToken();
        } else {
          // clearAuthData();
        }
      } catch {
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        refreshAccessToken,
        verifyAccessToken,
        requestPasswordReset,
        resetUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}