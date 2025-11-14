import api from '@/utils/axios';

export const sendInvite = async (data: { receiverEmail: string; documentId: string; message?: string }) => api.post('/requests/invite', data);

export const acceptInvite = async (id: string) => {
  const response = await api.post(`/requests/${id}/accept`);
  return response;
};

export const rejectInvite = async (id: string) => {
  const response = await api.post(`/requests/${id}/reject`);
  return response;
};

export const getPendingInvites = async () => {
  const response = await api.post('/requests/pending');
  return response;
};