'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Copy } from 'lucide-react';
import { AdminUsers } from '@/types';
import toast from 'react-hot-toast';

interface UsersTableProps {
  users: AdminUsers[];
  loading: boolean;
  onCopy: (id: string) => void;
}

export const UsersTable = ({ users, loading, onCopy }: UsersTableProps) => {
  const getRoleGradient = (role: string) => {
    return role === 'admin'
      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
      : 'bg-gradient-to-r from-blue-500 to-cyan-500';
  };

  const getActiveBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return <p className="p-6 text-center text-muted-foreground">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Role</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.profilePhoto} />
                  <AvatarFallback>{u.firstName[0]}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">
                {u.firstName} {u.lastName}
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell className="text-center">
                <Badge className={`${getRoleGradient(u.role)} text-white`}>
                  {u.role.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{getActiveBadge(u.isActive)}</TableCell>
              <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right font-mono text-xs">
                <Button variant="ghost" size="sm" onClick={() => onCopy(u._id)}>
                  <Copy className="h-3 w-3 mr-1" />
                  {u._id.slice(-6)}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}