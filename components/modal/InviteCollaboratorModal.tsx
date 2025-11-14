'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { sendInvite } from '@/lib/api/requests';
import toast from 'react-hot-toast';

interface InviteModalProps {
  documentId: string;
  collaborators?: boolean;
}

export function InviteModal({ documentId, collaborators }: InviteModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    try {
      await sendInvite({ receiverEmail: email, documentId, message });
      toast.success('Invite sent!');
      setOpen(false);
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send invite');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className='me-0'>
        <Button size={'sm'} className='shadow bg-linear-to-r from-blue-400/80 to-purple-400/80'>
          {collaborators ? "Collaborators" : "Add Collaborator"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
        </DialogHeader>
        <Input placeholder="Recipient Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Optional Message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button onClick={handleSend}>Send Invite</Button>
      </DialogContent>
    </Dialog>
  );
}