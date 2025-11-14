'use client'

import { useState, useCallback, useEffect } from 'react';
import { getDocuments, createDocument as createDocApi, updateDocument as updateDocApi, deleteDocument as deleteDocApi } from '@/lib/api/documents';
import { Document } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';

export function useDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const { user, loading: authLoading } = useAuth();

    const fetchDocuments = useCallback(async (page: number = 1, limit: number = 10) => {
        if (!user && !authLoading) {
            toast.error("User not found 12")
            return
        };
        setLoading(true);
        try {
            const response = await getDocuments(page, limit);
            setDocuments(response.data.data);
            console.log("Documents data fetched", response)
        } catch (error: any) {
            toast.error(error.message);
            toast.error('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    }, []);
    // }, [user, authLoading]);

    const createDocument = async (data: { title: string }) => {
        try {
            const response = await createDocApi(data);
            setDocuments((prev: any) => [...prev, response]);
            return response;
        } catch (error: any) {
            toast.error(error.message);
            toast.error('Failed to create document');
            throw new Error(error.message);
        }
    };

    const updateDocument = async (id: string, data: { title?: string; status?: 'draft' | 'published'; collaborators?: string[] }) => {
        try {
            const response = await updateDocApi(id, data);
            setDocuments((prev) =>
                prev.map((doc) => (doc._id === id ? response.data.data : doc))
            );
            return response.data.data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update document');
            throw error;
        }
    };

    const deleteDocument = async (id: string) => {
        try {
            await deleteDocApi(id);
            setDocuments((prev) => prev.filter((doc) => doc._id !== id));
        } catch (error: any) {
            toast.error(error.message);
            toast.error('Failed to delete document');
            throw new Error(error.message);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchDocuments();
        }
    }, [user, authLoading, fetchDocuments]);
    // }, [user, authLoading, fetchDocuments]);

    return { documents, setDocuments, fetchDocuments, createDocument, updateDocument, deleteDocument, loading };
}