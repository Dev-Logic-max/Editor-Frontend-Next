'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { DocumentsTable } from '@/components/admin/DocumentTable';
import { UsersTable } from '@/components/admin/UserTable';

import { Users, FileText, RefreshCw } from 'lucide-react';

import { getUsers } from '@/lib/api/user';

import { useDocumentStore } from '@/stores/documentStore';
import { useAuth } from '@/hooks/useAuth';
import { AdminUsers } from '@/types';


export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { documents: docs, loading: docsLoading, total: docsTotal, page: docsPage, fetchDocumentsByAdmin } = useDocumentStore();

  // ----- Users -----
  const [users, setUsers] = useState<AdminUsers[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);

  const hasInitialized = useRef(false);

  const [currentDocsPage, setCurrentDocsPage] = useState(1);
  const limit = 10;

  const fetchUsers = async (page: number) => {
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
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    if (authLoading) return;
    if (user?.role !== 'admin') return;

    hasInitialized.current = true;
    fetchUsers(1);
    fetchDocumentsByAdmin(1, limit);
  }, [authLoading, user?.role, fetchDocumentsByAdmin]);

  // Handle users pagination change
  useEffect(() => {
    if (!hasInitialized.current) return;
    if (user?.role !== 'admin') return;
    if (usersPage === 1) return; // Skip initial load

    fetchUsers(usersPage);
  }, [usersPage, user?.role]);

  // Handle docs pagination change
  useEffect(() => {
    if (!hasInitialized.current) return;
    if (user?.role !== 'admin') return;
    if (currentDocsPage === 1) return; // Skip initial load

    fetchDocumentsByAdmin(currentDocsPage, limit);
  }, [currentDocsPage, user?.role, fetchDocumentsByAdmin]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const refreshUsers = () => {
    setUsersPage(1);
    fetchUsers(1);
  };

  const refreshDocs = () => {
    setCurrentDocsPage(1);
    fetchDocumentsByAdmin(1, limit, true);
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
                      setCurrentDocsPage(p);
                      fetchDocumentsByAdmin(p);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    disabled={docsPage * limit >= docsTotal || docsLoading}
                    onClick={() => {
                      const p = docsPage + 1;
                      setCurrentDocsPage(p);
                      fetchDocumentsByAdmin(p);
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