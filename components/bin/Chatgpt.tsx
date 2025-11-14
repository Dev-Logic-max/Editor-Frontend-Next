'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import TextAlign from '@tiptap/extension-text-align';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { TiptapTransformer } from '@hocuspocus/transformer';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCursorAwareness } from '@/hooks/useCursorAwareness';
import { updateDocument } from '@/lib/api/documents';
import { debouncedSave } from '@/utils/debounce';

import { EditorHeader } from './EditorHeader';
import { EditorToolbar } from './EditorToolbar';
import { EditorContentComponent } from './EditorContent';
import { EditorStatusBar } from './EditorStatusBar';
import { EditorInfoBar } from './EditorInfoBar';

interface EditorProps {
  document: any;
  userId: string;
  onUpdateTitle?: (title: string) => void;
}

export function Editor({ document, userId, onUpdateTitle }: EditorProps) {
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const [providerReady, setProviderReady] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') ?? '' : '';

  // 1️⃣ Setup Y.Doc + Provider — only when document._id changes
  useEffect(() => {
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }

    const ydoc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: `${process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234'}?token=${token}&userId=${userId}`,
      name: document._id,
      document: ydoc,
      onConnect: () => {
        console.log('✅ Connected');
        setConnectionStatus('Connected');
        setProviderReady(true);
      },
      onDisconnect: () => {
        console.log('❌ Disconnected');
        setConnectionStatus('Disconnected');
        setProviderReady(false);
      },
      onAuthenticationFailed: ({ reason }: any) => {
        console.error('Auth failed:', reason);
        setConnectionStatus('Auth Failed');
        toast.error(`Authentication failed: ${reason}`);
      },
    });

    ydocRef.current = ydoc;
    providerRef.current = provider;

    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [document._id, token, userId]);

  // 2️⃣ Initialize TipTap editor with collaboration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydocRef.current || new Y.Doc(),
        field: 'document',
      }),
      ...(providerReady && providerRef.current
        ? [
          CollaborationCursor.configure({
            provider: providerRef.current,
          }),
        ]
        : []),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setSaveStatus('Saving...');
      debouncedSave(async () => {
        try {
          await updateDocument(document._id, { content: editor.getJSON() });
          setSaveStatus('Saved');
        } catch {
          setSaveStatus('Error');
          toast.error('Failed to save');
        }
      });
    },
    editorProps: {
      attributes: { class: 'prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none' },
    },
  });

  // 3️⃣ Awareness users
  useEffect(() => {
    if (!providerRef.current || !providerRef.current.awareness) return;
    const awareness = providerRef.current.awareness;

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().entries());
      const users = states.map(([clientId, state]: [number, any]) => ({
        clientId,
        ...(state as any),
      }));
      setActiveUsers(users);
    };

    awareness.on('update', updateUsers);
    updateUsers();
    return () => awareness.off('update', updateUsers);
  }, [providerReady]);

  useCursorAwareness(editor, userId, user, providerRef.current);

  // 4️⃣ Fix duplication: only set content from DB when Y.Doc is empty
  useEffect(() => {
    if (!editor || !ydocRef.current) return;
    const ydoc = ydocRef.current;
    const current = TiptapTransformer.fromYdoc(ydoc, 'document');
    const server = document.content ?? { type: 'doc', content: [] };

    const isEmpty =
      !current ||
      (Array.isArray(current.content) && current.content.length === 0) ||
      (typeof current === 'object' && Object.keys(current).length === 0);

    if (isEmpty && JSON.stringify(current) !== JSON.stringify(server)) {
      editor.commands.setContent(server);
    }
  }, [editor, document._id]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="min-h-screen bg-white rounded-lg">
      <EditorHeader
        editor={editor}
        title={document.title}
        onTitleChange={onUpdateTitle}
        document={document}
        activeUsers={activeUsers}
      />
      <EditorStatusBar
        editor={editor}
        saveStatus={saveStatus}
        connectionStatus={connectionStatus}
        activeUsers={activeUsers}
      />
      <EditorInfoBar document={document} />
      <EditorToolbar editor={editor} />
      <EditorContentComponent editor={editor} />
    </div>
  );
}

export default Editor;
