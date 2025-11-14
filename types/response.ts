import { AdminUsers, User } from '@/types';

export interface AuthUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        access_token: string;
        refresh_token: string;
        user: AuthUser;
    };
    message: string;
}

export interface VerifyResponse {
    success: boolean;
    data: AuthUser;
    message: string;
}

export interface UserResponse {
    success: boolean;
    data: User;
    message: string;
}

export interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

export interface AdminUsersResponse {
    success: boolean;
    data: AdminUsers[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}