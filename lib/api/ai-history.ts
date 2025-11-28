// lib/api/ai-history.ts
import api from '@/utils/axios';

export const getAIHistory = async (documentId: string) => {
  const res = await api.get('/ai-history', {
    params: { documentId },
  });
  return res.data.data.history;
};

export const acceptSuggestion = async (historyId: string) => {
  return api.post(`/ai-history/${historyId}/accept`);
};

export const rejectSuggestion = async (historyId: string) => {
  return api.post(`/ai-history/${historyId}/reject`);
};