import api from '@/utils/axios';

export const getDocuments = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/documents?page=${page}&limit=${limit}`);
    return response;
};

export const getDocumentsByAdmin = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/documents/admin?page=${page}&limit=${limit}`);
    return response;
};

export const createDocument = async (data: { title: string }) => {
    const response = await api.post('/documents', data);
    return response;
};

export const getDocument = async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response;
};

export const updateDocument = async (id: string, data: { title?: string; content?: any; status?: 'draft' | 'published'; collaborators?: string[] }) => {
    const response = await api.put(`/documents/${id}`, data);
    return response;
};

export const deleteDocument = async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response;
};

export const addMediaToDocument = async (
  documentId: string,
  media: { filename: string; originalName: string; url: string; type: string; size: number }
) => {
  const response = await api.post(`/documents/${documentId}/media`, media);
  return response;
};

export const removeMediaFromDocument = async (documentId: string, filename: string) => {
  const response = await api.delete(`/documents/${documentId}/media/${filename}`);
  return response;
};

export const getDocumentMedia = async (documentId: string) => {
  const response = await api.get(`/documents/${documentId}/media`);
  return response;
};

export const getAllUserMedia = async () => {
  const response = await api.get('/documents/user/media');
  return response;
};

export const renameMedia = async (documentId: string, filename: string, originalName: string) => {
  const response = await api.put(`/documents/${documentId}/media/${filename}/rename`, { originalName });
  return response;
};