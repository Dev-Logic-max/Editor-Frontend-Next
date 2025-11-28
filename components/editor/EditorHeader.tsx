'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { AIComparisonSidebar } from '@/components/layout/AISidebar';
import { InviteModal } from '@/components/links/InviteCollaboratorModal';

import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";

import { useAuth } from '@/hooks/useAuth';
import { EditorLayout, useEditorSettings } from '@/hooks/useEditorSettings';

import { format } from 'date-fns';

interface EditorHeaderProps {
  editor: any;
  title: string;
  document: any;
  activeUsers: any[];
  typingUsers?: string[];
  onTitleChange?: (title: string) => void;
  aiHistory?: Array<{
    original: string;
    improved: string;
    action: string;
    timestamp: Date;
    model?: string;
    status?: 'pending' | 'accepted' | 'rejected' | 'error';
  }>;
}

export function EditorHeader({ editor, title, onTitleChange, document, activeUsers, typingUsers = [], aiHistory = [], }: EditorHeaderProps) {
  const { user } = useAuth();
  const { settings } = useEditorSettings();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isCreator = user?._id === document.creator._id;
  const creatorId = document.creator._id;
  const hasCollaborators = document?.collaborators?.length > 0;

  const layout = settings.appearance?.layout;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    onTitleChange?.(newTitle); // Call the onTitleChange function to update the title
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMM, yyyy hh:mm a');
    } catch {
      return date;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row justify-between items-center gap-3 ${layout === EditorLayout.Document ? '' : 'px-3 py-2 border-b'}`}>
      {/* Document Title */}
      <Input
        value={title}
        onChange={handleTitleChange}
        placeholder="Document Title"
        className={`max-w-md md:order-1 order-2 ${layout === EditorLayout.Document ? 'border-none shadow-none text-3xl! font-bold' : ''}`}
      />

      <div className={`flex items-center ms-auto order-1 md:order-2 ${hasCollaborators && 'gap-3'}`}>
        {isCreator && layout === EditorLayout.Editor && (
          <>
            <Button size={'sm'} onClick={() => setInviteModalOpen(true)} className='shadow bg-linear-to-r from-blue-400/80 to-purple-400/80'>
              {hasCollaborators ? "Manage Collaborators" : "Add Collaborator"}
            </Button>
            <InviteModal documentId={document._id} isOpen={inviteModalOpen} onClose={() => { setInviteModalOpen(false) }} />
          </>
        )}

        {/* New: Active Users */}
        <div className="flex items-center space-x-1">
          <div className='p-1 me-2 rounded-md cursor-pointer hover:bg-gray-100' onClick={() => setSidebarOpen(true)}>
            <TbLayoutSidebarLeftCollapse className='w-6 h-6'/>
          </div>
          <AIComparisonSidebar editor={editor} history={aiHistory} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} documentContent={editor?.getText() || ''}/>
          <div className="flex -space-x-2">
            {hasCollaborators && (
              <>
                {activeUsers.map((u) => {
                  const isCreatorUser = u.userId === creatorId;
                  const initials = u.name ? u.name.split(' ').map((n: string) => n.charAt(0).toUpperCase()).slice(0, 2).join('') : 'U';
                  const profilePhotoUrl = u?.avatar && `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${u.avatar}`
                  return (
                    <Avatar key={u.clientId} title={u.name} className="w-10 h-10 border rounded-full relative shadow overflow-visible">
                      <AvatarImage src={profilePhotoUrl} alt={initials} className='rounded-full' />
                      <AvatarFallback className="bg-transparent text-xs" style={{ background: u.avatarGradient }}>{initials}</AvatarFallback>
                    </Avatar>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}