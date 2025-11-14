'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvites } from '@/hooks/useInvites';
import { FcDiploma1, FcDocument } from 'react-icons/fc';

export function CollaboratorInvitesList() {
  const { invites, loading: invitesLoading, handleAccept, handleReject } = useInvites();

  return (
    <Card className="bg-stone-50 p-4 gap-4 shadow-none">
      <CardHeader className='px-0 border-b pb-0!'>
        <CardTitle className='flex items-center gap-2'><FcDiploma1 className='w-6 h-6' />Pending Collaboration Invites</CardTitle>
        {invitesLoading && <p>Loading invites...</p>}
      </CardHeader>
      <CardContent className='px-0'>
        {invites.length === 0 ? (
          <p className='text-center'>No pending invites.</p>
        ) : (
          invites.map((invite) => (
            <div key={invite._id} className={`flex justify-between items-center p-4 border rounded-lg bg-linear-to-r from-blue-100 to-pink-100 ${invites.length > 1 && 'border-b'}`}>
              <div className='flex items-center gap-6'>
                <p><strong>From:</strong> {invite.sender.firstName} {invite.sender.lastName}</p>
                <p className='flex items-center gap-1'>
                  <strong className='flex items-center gap-2'>Document : <FcDocument className='w-5 h-5' /></strong> 
                  {invite.document.title}
                </p>
                <p className='flex bg-teal-50 rounded-lg px-3 py-1'> 💬 {invite.message && <p><em>{invite.message}</em></p>}</p>
              </div>
              <div className="space-x-2">
                <Button className='text-gray-800 border border-green-300 bg-green-200 hover:bg-green-300' onClick={() => handleAccept(invite._id)}>Accept</Button>
                <Button className='text-gray-800 border border-red-300 bg-red-200 hover:bg-red-300' onClick={() => handleReject(invite._id)}>Reject</Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}