'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';
import { AdminDocuments } from '@/types';
import toast from 'react-hot-toast';

interface DocumentsTableProps {
  docs: AdminDocuments[];
  loading: boolean;
  onCopy: (id: string) => void;
}

export const DocumentsTable = ({ docs, loading, onCopy }: DocumentsTableProps) => {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (docs.length === 0) {
    return <p className="p-6 text-center text-muted-foreground">No documents found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Collaborators</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((d) => (
            <TableRow key={d._id}>
              <TableCell className="font-medium max-w-xs truncate">{d.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{d.creator.firstName[0]}</AvatarFallback>
                  </Avatar>
                  <span>
                    {d.creator.firstName} {d.creator.lastName}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {d.collaborators.length > 0 ? (
                  <div className="flex -space-x-2">
                    {d.collaborators.slice(0, 4).map((c) => (
                      <Avatar
                        key={c._id}
                        className="h-6 w-6 border-2 border-background"
                      >
                        <AvatarFallback>{c.firstName[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    {d.collaborators.length > 4 && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        +{d.collaborators.length - 4}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={d.status === 'published' ? 'default' : 'secondary'}>
                  {d.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(d.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right font-mono text-xs">
                <Button variant="ghost" size="sm" onClick={() => onCopy(d._id)}>
                  <Copy className="h-3 w-3 mr-1" />
                  {d._id.slice(-6)}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}