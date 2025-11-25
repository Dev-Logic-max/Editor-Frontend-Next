'use client';

import { CreateDocumentForm } from '@/components/dashboard/CreateDocumentForm';
import { useSocket } from '@/hooks/useSocket';

export default function DashboardPage() {
  useSocket();
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <CreateDocumentForm />
    </>
  );
}