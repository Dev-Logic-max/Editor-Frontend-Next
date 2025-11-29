import { create } from 'zustand';
import {  getDocuments,  getDocumentsByAdmin, createDocument as createDocApi,  updateDocument as updateDocApi,  deleteDocument as deleteDocApi } from '@/lib/api/documents';
import { Document } from '@/types';
import toast from 'react-hot-toast';

interface DocumentStore {
  // State
  documents: Document[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Pagination
  page: number;
  limit: number;
  total: number;

  // Actions
  setDocuments: (documents: Document[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Fetch documents (regular user)
  fetchDocuments: (page?: number, limit?: number, force?: boolean) => Promise<void>;
  
  // Fetch documents (admin)
  fetchDocumentsByAdmin: (page?: number, limit?: number, force?: boolean) => Promise<void>;
  
  // CRUD operations
  createDocument: (data: { title: string }) => Promise<Document>;
  updateDocument: (id: string, data: { title?: string; status?: string; collaborators?: string[] }) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Utility
  reset: () => void;
  getDocumentById: (id: string) => Document | undefined;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  // Initial state
  documents: [],
  loading: false,
  error: null,
  initialized: false,
  page: 1,
  limit: 10,
  total: 0,

  // Setters
  setDocuments: (documents) => set({ documents }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch documents for regular users
  fetchDocuments: async (page = 1, limit = 10, force = false) => {
    const state = get();
    
    // Prevent duplicate fetches unless forced
    if (state.loading) return;
    if (state.initialized && !force && page === state.page) return;

    set({ loading: true, error: null });
    
    try {
      const response = await getDocuments(page, limit);
      const data = response.data.data;
      
      set({ 
        documents: data.documents || data,
        total: data.total || data.length,
        page,
        limit,
        initialized: true,
        loading: false 
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch documents';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      console.error('Fetch documents error:', error);
    }
  },

  // Fetch documents for admin
  fetchDocumentsByAdmin: async (page = 1, limit = 10, force = false) => {
    const state = get();
    
    if (state.loading) return;
    if (state.initialized && !force && page === state.page) return;

    set({ loading: true, error: null });
    
    try {
      const response = await getDocumentsByAdmin(page, limit);
      const data = response.data.data;
      
      set({ 
        documents: data.documents || data,
        total: data.total || data.length,
        page,
        limit,
        initialized: true,
        loading: false 
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch documents';
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      console.error('Fetch admin documents error:', error);
    }
  },

  // Create document
  createDocument: async (data: { title: string }) => {
    try {
      const response = await createDocApi(data);
      const newDoc = response.data.data;
      
      // Optimistic update
      set((state) => ({
        documents: [newDoc, ...state.documents],
        total: state.total + 1
      }));
      
    //   toast.success('Document created successfully');
      return newDoc;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create document';
      toast.error(errorMsg);
      throw error;
    }
  },

  // Update document
  updateDocument: async (id: string, data: any) => {
    try {
      const response = await updateDocApi(id, data);
      const updatedDoc = response.data.data;
      
      // Optimistic update
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc._id === id ? updatedDoc : doc
        )
      }));
      
    //   toast.success('Document updated successfully');
      return updatedDoc;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update document';
      toast.error(errorMsg);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (id: string) => {
    try {
      await deleteDocApi(id);
      
      // Optimistic update
      set((state) => ({
        documents: state.documents.filter((doc) => doc._id !== id),
        total: state.total - 1
      }));
      
    //   toast.success('Document deleted successfully');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete document';
      toast.error(errorMsg);
      throw error;
    }
  },

  // Reset store
  reset: () => set({
    documents: [],
    loading: false,
    error: null,
    initialized: false,
    page: 1,
    limit: 10,
    total: 0
  }),

  // Get document by ID
  getDocumentById: (id: string) => {
    return get().documents.find((doc) => doc._id === id);
  }
}));