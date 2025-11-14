'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

import { InviteModal } from '@/components/modal/InviteCollaboratorModal';
import { EditorLayout, useEditorSettings } from '@/hooks/useEditorSettings';
import { useAuth } from '@/hooks/useAuth';

import { GiQueenCrown } from "react-icons/gi";
import { format } from 'date-fns';

interface EditorHeaderProps {
  editor: any;
  title: string;
  document: any;
  activeUsers: any[];
  typingUsers?: string[];
  onTitleChange?: (title: string) => void;
}

export function EditorHeader({ editor, title, onTitleChange, document, activeUsers, typingUsers = [] }: EditorHeaderProps) {
  const { user } = useAuth();
  const { settings } = useEditorSettings();

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
    <div className={`px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3 ${layout === EditorLayout.Document ? '' : 'border-b'}`}>
      {/* Document Title */}
      <Input
        value={title}
        onChange={handleTitleChange}
        placeholder="Document Title"
        className={`max-w-md md:order-1 order-2 ${layout === EditorLayout.Document ? 'border-none shadow-none text-3xl! font-bold' : ''}`}
      />

      <div className={`flex items-center ms-auto order-1 md:order-2 ${hasCollaborators && 'gap-3'}`}>
        {isCreator && layout === EditorLayout.Editor && <InviteModal documentId={document._id} collaborators={hasCollaborators}/>}

        {/* New: Active Users */}
        <div className="flex items-center space-x-1">
          <div className="flex -space-x-2">
            {hasCollaborators && (
              <>
                {activeUsers.map((u) => {
                  const isCreatorUser = u.userId === creatorId;
                  const initials = u.name ? u.name.split(' ').map((n: string) => n.charAt(0).toUpperCase()).slice(0, 2).join('') : 'U';
                  const profilePhotoUrl = u?.avatar && `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${u.avatar}`
                  return (
                    <Avatar key={u.clientId} title={u.name} className="w-10 h-10 border rounded-full relative shadow overflow-visible">
                      <AvatarImage src={profilePhotoUrl} alt={initials} className='rounded-full'/>
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