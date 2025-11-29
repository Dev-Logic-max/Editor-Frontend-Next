'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { DocumentsTable } from '@/components/admin/DocumentTable';
import { UsersTable } from '@/components/admin/UserTable';

import { Users, FileText, RefreshCw } from 'lucide-react';
import { AdminDocuments, AdminUsers } from '@/types';
import { getDocumentsByAdmin } from '@/lib/api/documents';
import { getUsers } from '@/lib/api/user';
import { useAuth } from '@/hooks/useAuth';


export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();

  // ----- Users -----
  const [users, setUsers] = useState<AdminUsers[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);

  // ----- Documents -----
  const [docs, setDocs] = useState<AdminDocuments[]>([]);
  const [docsPage, setDocsPage] = useState(1);
  const [docsTotal, setDocsTotal] = useState(0);
  const [docsLoading, setDocsLoading] = useState(false);

  const limit = 10;

  // -------------------------------------------------
  // FETCH USERS
  // -------------------------------------------------
  const fetchUsers = useCallback(async (page: number) => {
    setUsersLoading(true);
    try {
      const res = await getUsers(page, limit);
      if (res.success) {
        setUsers(res.data);
        setUsersTotal(res.pagination?.total ?? 0);
      } else {
        toast.error('Failed to load users');
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async (page: number) => {
    setDocsLoading(true);
    try {
      const res = await getDocumentsByAdmin(page, limit);
      console.log("Response", res)
      if (res.data.success) {
        setDocs(res.data.data);
        setDocsTotal(res.data.pagination?.total ?? 0);
      } else {
        toast.error('Failed to load documents');
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to load documents');
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchUsers(1);
      fetchDocuments(1);
    }
  }, [authLoading, user?.role]);

  useEffect(() => {
    if (user?.role === 'admin' && usersPage > 1) {
      fetchUsers(usersPage);
    }
  }, [usersPage]); // Only when page changes

  useEffect(() => {
    if (user?.role === 'admin' && docsPage > 1) {
      fetchDocuments(docsPage);
    }
  }, [docsPage]);

  // useEffect(() => {
  //   if (!authLoading && user?.role === 'admin') {
  //     fetchUsers(usersPage);
  //     fetchDocuments(docsPage);
  //   }
  // }, [authLoading, user, usersPage, docsPage, fetchUsers, fetchDocuments]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const refreshUsers = () => {
    setUsersPage(1);
    fetchUsers(1);
  };
  const refreshDocs = () => {
    setDocsPage(1);
    fetchDocuments(1);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto p-6 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to view this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and documents in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Users
          </Button>
          <Button variant="outline" size="sm" onClick={refreshDocs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Docs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 py-5 px-2 content-center">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users ({usersTotal})
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents ({docsTotal})
          </TabsTrigger>
        </TabsList>

        {/* ==================== USERS TAB ==================== */}
        <TabsContent value="users" className="space-y-6">
          <Card className='gap-0'>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                List of registered users with their role and join date.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 m-6 border rounded-lg">
              <UsersTable users={users} loading={usersLoading} onCopy={copyToClipboard} />
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {usersPage} of {Math.ceil(usersTotal / limit)}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={usersPage === 1 || usersLoading}
                    onClick={() => {
                      const p = usersPage - 1;
                      setUsersPage(p);
                      fetchUsers(p);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    disabled={
                      usersPage * limit >= usersTotal || usersLoading
                    }
                    onClick={() => {
                      const p = usersPage + 1;
                      setUsersPage(p);
                      fetchUsers(p);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== DOCUMENTS TAB ==================== */}
        <TabsContent value="documents" className="space-y-6">
          <Card className='gap-0'>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>
                Overview of every document, its creator and collaborators.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 m-6 border rounded-lg">
              <DocumentsTable docs={docs} loading={docsLoading} onCopy={copyToClipboard} />
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {docsPage} of {Math.ceil(docsTotal / limit)}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={docsPage === 1 || docsLoading}
                    onClick={() => {
                      const p = docsPage - 1;
                      setDocsPage(p);
                      fetchDocuments(p);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    disabled={docsPage * limit >= docsTotal || docsLoading}
                    onClick={() => {
                      const p = docsPage + 1;
                      setDocsPage(p);
                      fetchDocuments(p);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}