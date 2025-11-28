'use client';

import { CollaboratorInvitesList } from '@/components/dashboard/CollaboratorInvitesList';
import { useSocket } from '@/hooks/useSocket';

export default function CollaboratorPage() {
  useSocket();
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Collaborators</h1>
      <CollaboratorInvitesList />
    </>
  );
}