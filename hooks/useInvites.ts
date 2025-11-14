'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPendingInvites, acceptInvite, rejectInvite } from '@/lib/api/requests';
import { useSocket } from './useSocket';
import toast from 'react-hot-toast';

export function useInvites() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPendingInvites();
      setInvites(response.data.data);
    } catch (error) {
      toast.error('Failed to load invites');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await acceptInvite(id);
      toast.success('Invite accepted! You can now edit the document.');
      fetchInvites();  // Refresh list
    } catch (error) {
      toast.error('Failed to accept invite');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectInvite(id);
      toast.success('Invite rejected.');
      fetchInvites();
    } catch (error) {
      toast.error('Failed to reject invite');
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  // Listen for new invites via socket
  useEffect(() => {
    if (socket) {
      const handleNewInvite = () => fetchInvites();  // Refresh on new invite
      socket.on('newInvite', handleNewInvite);
      return () => { socket.off('newInvite', handleNewInvite) };
    }
  }, [socket, fetchInvites]);

  return { invites, loading, handleAccept, handleReject, refetch: fetchInvites };
}