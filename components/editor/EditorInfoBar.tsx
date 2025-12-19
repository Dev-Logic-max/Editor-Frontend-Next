'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { EditorLayout, useEditorSettings } from '@/hooks/useEditorSettings';

interface EditorInfoBarProps {
  document: any;
  provider: HocuspocusProvider | null;
  userId: string;
  lastSavedAt?: Date | null
}

export function EditorInfoBar({ document, provider, userId, lastSavedAt }: EditorInfoBarProps) {
  const { settings } = useEditorSettings();

  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [updatedTime, setUpdatedTime] = useState<Date>(new Date(document.updatedAt));

  const layout = settings.appearance?.layout ?? EditorLayout.Document;

  useEffect(() => {
    if (lastSavedAt) {
      setUpdatedTime(lastSavedAt);
    }
  }, [lastSavedAt]);

  useEffect(() => {
    if (!provider?.awareness) return;

    const awareness = provider.awareness;

    const updateTypingUsers = () => {
      const users = Array.from(awareness.getStates().values())
        .filter((state: any) => state.userId !== userId && state.typing)
        .map((state: any) => state.name);
      setTypingUsers(users);
    };

    awareness.on('update', updateTypingUsers);
    updateTypingUsers();

    return () => {
      awareness.off('update', updateTypingUsers);
    };
  }, [provider, userId]);

  const createdTime = formatDistanceToNow(new Date(document.createdAt), { addSuffix: true });

  return (
    <div className={`text-[10px] lg:text-xs text-gray-500 w-full py-1 flex flex-wrap px-2 md:px-4 ${layout === EditorLayout.Document ? 'gap-4 justify-center sm:justify-end' : 'border-b justify-between'} items-center`}>
      {typingUsers.length > 0 && (
        <div className="text-blue-500 animate-pulse">
          ✏️ {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
        </div>
      )}

      <div className={`${typingUsers.length > 0 && 'hidden sm:inline-block'}`}>
        <span>Created {createdTime}</span>
        {document.createdBy?.name && <span> by <b>{document.createdBy.name}</b></span>}
      </div>
      <div className={`${typingUsers.length > 0 && 'hidden sm:inline-block'}`}>
        <span>Last updated {formatDistanceToNow(updatedTime, { addSuffix: true })}</span>
        {document.updatedBy?.name && <span> by <b>{document.updatedBy.name}</b></span>}
      </div>
    </div>
  );
}
