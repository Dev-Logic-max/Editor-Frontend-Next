'use client';

import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketRef.current = io('http://localhost:3030', { auth: { token: localStorage.getItem('access_token') } });
      socketRef.current.emit('joinNotifications', user._id);

      socketRef.current.on('newInvite', (data) => {
        toast(`New collab invite from ${data.senderName} for "${data.documentTitle}"!`);
        // Refresh pending invites if needed
      });

      socketRef.current.on('inviteAccepted', (data) => toast(`Invite accepted by ${data.receiverName}!`));

      // Cleanup: Disconnect without returning value
      return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }
    // If no user, cleanup if socket exists
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return socketRef.current;
}