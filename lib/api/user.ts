import { AdminUsersResponse, UserResponse, UsersResponse } from '@/types/response';
import api from '@/utils/axios';

export const createUser = async (data: { firstName: string; lastName?: string; email: string; password: string; profilePhoto?: string; role?: string }) => {
    const response = await api.post<UserResponse>('/users', data);
    return response.data;
};

export const getUsers = async (page: number = 1, limit: number = 10) => {
    const response = await api.get<AdminUsersResponse>(`/users?page=${page}&limit=${limit}`);
    return response.data;
};

export const getUserById = async (id: string) => {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data;
};

export const updateUser = async (id: string, data: { firstName?: string; lastName?: string; email?: string; password?: string; profilePhoto?: string; role?: string }) => {
    const response = await api.put<UserResponse>(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return response.data;
};