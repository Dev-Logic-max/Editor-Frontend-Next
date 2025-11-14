import { AuthResponse } from '@/types/response';
import api from '@/utils/axios';

export const register = async (data: { firstName: string; lastName?: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const login = async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

export const refresh = async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
};

export const verify = async (token: string) => {
    const response = await api.post('/auth/verify', { token });
    return response.data;
};

export const forgotPassword = async (email: string) => {
    const response = await api.post<{ success: boolean; data: { resetToken: string }; message: string }>('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
    const response = await api.post<{ success: boolean; data: { message: string }; message: string }>('/auth/reset-password', { token, newPassword });
    return response.data;
};

export const logout = async () => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/logout');
    return response.data;
};