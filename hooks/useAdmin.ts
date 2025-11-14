'use client';

import { useState, useCallback } from 'react';
import { getUsers } from '@/lib/api/user';
import { getDocumentsByAdmin } from '@/lib/api/documents';
import toast from 'react-hot-toast';
import { AdminDocuments, AdminUsers } from '@/types';

export function useAdmin() {
  const [users, setUsers] = useState<AdminUsers[]>([]);
  const [docs, setDocs] = useState<AdminDocuments[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [docsPage, setDocsPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [docsTotal, setDocsTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);

  const limit = 10;

  const fetchUsers = useCallback(async (page: number) => {
    setUsersLoading(true);
    try {
      const res = await getUsers(page, limit);
      if (res.success) {
        setUsers(res.data);
        setUsersTotal(res.pagination?.total ?? 0);
      }
    } catch {
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async (page: number) => {
    setDocsLoading(true);
    try {
      const res = await getDocumentsByAdmin(page, limit);
      if (res.data.success) {
        setDocs(res.data.data);
        setDocsTotal(res.data.pagination?.total ?? 0);
      }
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setDocsLoading(false);
    }
  }, []);

  const refreshUsers = () => {
    setUsersPage(1);
    fetchUsers(1);
  };

  const refreshDocs = () => {
    setDocsPage(1);
    fetchDocuments(1);
  };

  return {
    users,
    docs,
    usersPage,
    docsPage,
    usersTotal,
    docsTotal,
    usersLoading,
    docsLoading,
    setUsersPage,
    setDocsPage,
    fetchUsers,
    fetchDocuments,
    refreshUsers,
    refreshDocs,
  };
}