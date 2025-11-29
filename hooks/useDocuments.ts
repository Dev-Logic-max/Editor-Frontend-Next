// 'use client'

// import { useState, useCallback, useEffect, useRef } from 'react';
// import toast from 'react-hot-toast';
// import { Document } from '@/types';
// import { useAuth } from '@/hooks/useAuth';
// import { getDocuments, createDocument as createDocApi, updateDocument as updateDocApi, deleteDocument as deleteDocApi } from '@/lib/api/documents';

// export function useDocuments() {
//     const [documents, setDocuments] = useState<Document[]>([]);
//     const [loading, setLoading] = useState(false);
//     const { user, loading: authLoading } = useAuth();

//     // Track if initial fetch has happened
//     const hasFetchedRef = useRef(false);

//     const fetchDocuments = useCallback(async (page: number = 1, limit: number = 10) => {
//         if (!user && !authLoading) {
//             toast.error("User not found 404")
//             return
//         };
//         setLoading(true);
//         try {
//             const response = await getDocuments(page, limit);
//             setDocuments(response.data.data);
//             console.log("Documents data fetched", response)
//         } catch (error: any) {
//             toast.error(error.message);
//             toast.error('Failed to fetch documents');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     const createDocument = async (data: { title: string }) => {
//         try {
//             const response = await createDocApi(data);
//             setDocuments((prev: any) => [...prev, response.data.data]);
//             console.log("Document created", response)
//             return response;
//         } catch (error: any) {
//             toast.error(error.message);
//             toast.error('Failed to create document');
//             throw new Error(error.message);
//         }
//     };

//     const updateDocument = async (id: string, data: { title?: string; status?: 'draft' | 'published'; collaborators?: string[] }) => {
//         try {
//             const response = await updateDocApi(id, data);
//             setDocuments((prev) =>
//                 prev.map((doc) => (doc._id === id ? response.data.data : doc))
//             );
//             return response.data.data;
//         } catch (error: any) {
//             toast.error(error.response?.data?.message || 'Failed to update document');
//             throw error;
//         }
//     };

//     const deleteDocument = async (id: string) => {
//         try {
//             await deleteDocApi(id);
//             setDocuments((prev) => prev.filter((doc) => doc._id !== id));
//         } catch (error: any) {
//             toast.error(error.message);
//             toast.error('Failed to delete document');
//             throw new Error(error.message);
//         }
//     };

//     // useEffect(() => {
//     //     if (!authLoading && user) {
//     //         fetchDocuments();
//     //     }
//     // }, [user, authLoading]);
//     // }, [user, authLoading, fetchDocuments]);

//     // useEffect(() => {
//     //     if (!authLoading && user && !hasFetchedRef.current) {
//     //         hasFetchedRef.current = true;
//     //         fetchDocuments();
//     //     }
//     // }, [user, authLoading]);

//     return { documents, setDocuments, fetchDocuments, createDocument, updateDocument, deleteDocument, loading };
// }


// Updated hook code integrated with zustand store

'use client';

import { useEffect, useRef } from 'react';
import { useDocumentStore } from '@/stores/documentStore';
import { useAuth } from './useAuth';

/**
 * Hook to access documents with automatic fetching
 * This is the ONLY way components should access documents
 * DO NOT use useDocumentStore directly in components
 */
export function useDocuments() {
  const { user, loading: authLoading } = useAuth();
  const hasInitialized = useRef(false);
  
  // Get everything from the store
  const {
    documents,
    loading,
    error,
    initialized,
    page,
    total,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
    setDocuments,
  } = useDocumentStore();

  // Auto-fetch on mount - ONLY ONCE when user is ready
  useEffect(() => {
    // Prevent multiple fetches
    if (hasInitialized.current) return;
    if (authLoading) return;
    if (!user) return;
    if (initialized) return;

    hasInitialized.current = true;
    fetchDocuments(1, 10);
  }, [authLoading, user, initialized, fetchDocuments]);

  // Wrapper function to force refresh
  const refetch = async (pageNum?: number, limitNum?: number) => {
    return fetchDocuments(pageNum || page, limitNum || 10, true);
  };

  // Wrapper for pagination
  const loadPage = async (pageNum: number, limitNum?: number) => {
    return fetchDocuments(pageNum, limitNum || 10, false);
  };

  return {
    // Data
    documents,
    loading,
    error,
    page,
    total,
    
    // CRUD operations
    createDocument,
    updateDocument,
    deleteDocument,
    
    // Utilities
    getDocumentById,
    refetch,
    loadPage,
    setDocuments,
    
    // Computed
    hasDocuments: documents.length > 0,
    isEmpty: !loading && documents.length === 0,
  };
}