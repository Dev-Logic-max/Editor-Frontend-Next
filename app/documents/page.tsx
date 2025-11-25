'use client';

import { DashboardDocumentList } from '@/components/dashboard/DashboardDocumentList';
import { CollaboratorInvitesList } from '@/components/dashboard/CollaboratorInvitesList';
import { useSocket } from '@/hooks/useSocket';

export default function DashboardPage() {
  useSocket();
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Documents</h1>
      <CollaboratorInvitesList />
      <DashboardDocumentList />
    </>
  );
}