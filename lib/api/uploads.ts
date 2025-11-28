import api from '@/utils/axios';
import { UserResponse } from '@/types/response';

export const uploadProfilePhoto = async (formData: FormData) => {
  const response = await api.post<UserResponse>('/uploads/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteProfilePhoto = async () => {
  const response = await api.delete<UserResponse>('/uploads/profile');
  return response.data;
};

export const uploadImage = async (file: File): Promise<{ filename: string; url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export const deleteImage = async (filename: string) => {
  const response = await api.delete(`/uploads/image/${filename}`);
  return response.data;
};