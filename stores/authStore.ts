import { create } from 'zustand';
import Cookies from 'js-cookie';
import { register, login, refresh, verify, forgotPassword, resetPassword, logout } from '@/lib/api/auth';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthStore {
  // State
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth operations
  loginUser: (data: { email: string; password: string }) => Promise<void>;
  registerUser: (data: { firstName: string; lastName?: string; email: string; password: string }) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  verifyAccessToken: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetUserPassword: (token: string, newPassword: string) => Promise<void>;

  // Utilities
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  clearAuthData: () => void;
  saveAuthData: (accessToken: string, refreshToken: string, userData: User) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  loading: true,
  initialized: false,
  error: null,

  // Setters
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Get tokens
  getAccessToken: () => Cookies.get('access_token') || null,
  getRefreshToken: () => Cookies.get('refresh_token') || null,

  // Save auth data
  saveAuthData: (accessToken: string, refreshToken: string, userData: User) => {
    const username = `${userData.firstName}${userData.lastName ? ` ${userData.lastName}` : ''}`;
    const localStorageUser = { 
      id: userData._id, 
      username, 
      role: userData.role 
    };

    // Save to cookies
    Cookies.set('access_token', accessToken, { 
      expires: 1, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict' 
    });
    Cookies.set('refresh_token', refreshToken, { 
      expires: 7, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict' 
    });

    // Save to localStorage
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(localStorageUser));

    // Update state
    set({ user: userData, error: null });
  },

  // Clear auth data
  clearAuthData: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, error: null });
  },

  // Login
  loginUser: async (data: { email: string; password: string }) => {
    set({ loading: true, error: null });
    try {
      const response = await login(data);
      get().saveAuthData(
        response.data.access_token,
        response.data.refresh_token,
        response.data.user
      );
      toast.success('Login successful!');
      
      // Return success for router.push in component
      return Promise.resolve();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      set({ error: errorMsg });
      toast.error(errorMsg);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Register
  registerUser: async (data: { 
    firstName: string; 
    lastName?: string; 
    email: string; 
    password: string 
  }) => {
    set({ loading: true, error: null });
    try {
      const response = await register(data);
      get().saveAuthData(
        response.data.access_token,
        response.data.refresh_token,
        response.data.user
      );
      toast.success('Registration successful!');
      
      return Promise.resolve();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      set({ error: errorMsg });
      toast.error(errorMsg);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logoutUser: async () => {
    set({ loading: true });
    try {
      await logout();
      get().clearAuthData();
      toast.success('Logged out successfully');
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Logout error:', error);
      // Clear data anyway
      get().clearAuthData();
    } finally {
      set({ loading: false });
    }
  },

  // Refresh access token
  refreshAccessToken: async () => {
    const refreshToken = get().getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    set({ loading: true });
    try {
      const response = await refresh(refreshToken);
      get().saveAuthData(
        response.data.access_token,
        response.data.refresh_token,
        response.data.user
      );
    } catch (error) {
      get().clearAuthData();
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Verify access token
  verifyAccessToken: async () => {
    const token = get().getAccessToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    set({ loading: true });
    try {
      const response = await verify(token);
      const userData = response.data;
      
      // Update localStorage
      const username = `${userData.firstName}${userData.lastName ? ` ${userData.lastName}` : ''}`;
      const localStorageUser = { 
        id: userData._id, 
        username, 
        role: userData.role 
      };
      localStorage.setItem('user', JSON.stringify(localStorageUser));
      
      set({ user: userData, error: null });
    } catch (error) {
      // Try to refresh token
      try {
        await get().refreshAccessToken();
        toast.success('Session refreshed');
      } catch (refreshError) {
        get().clearAuthData();
        throw refreshError;
      }
    } finally {
      set({ loading: false });
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    set({ loading: true, error: null });
    try {
      await forgotPassword(email);
      toast.success('Password reset email sent');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to send reset email';
      set({ error: errorMsg });
      toast.error(errorMsg);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Reset password
  resetUserPassword: async (token: string, newPassword: string) => {
    set({ loading: true, error: null });
    try {
      await resetPassword(token, newPassword);
      toast.success('Password reset successful');
      
      return Promise.resolve();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      set({ error: errorMsg });
      toast.error(errorMsg);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Initialize auth on app load
  initializeAuth: async () => {
    // Prevent multiple initializations
    if (get().initialized) return;
    
    set({ loading: true, initialized: true });
    
    try {
      const storedUser = localStorage.getItem('user');
      const accessToken = get().getAccessToken();
      
      if (storedUser || accessToken) {
        await get().verifyAccessToken();
      } else {
        set({ user: null });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      get().clearAuthData();
    } finally {
      set({ loading: false });
    }
  },
}));