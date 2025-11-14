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