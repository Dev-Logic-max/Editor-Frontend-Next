'use client';

import { useEffect, useState, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import TextAlign from '@tiptap/extension-text-align';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { EditorToolbar } from './EditorToolbar';
import { EditorHeader } from './EditorHeader';
import { EditorContentComponent } from './EditorContent';
import { debouncedSave } from '@/utils/debounce';
import { updateDocument } from '@/lib/api/documents';
import { useCursorAwareness } from '@/hooks/useCursorAwareness';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { hashString } from '@/utils/hash';
import "../../styles/editor.css"

interface EditorProps {
  document: any;
  userId: string;
  onUpdateTitle?: (title: string) => void;
}

interface AwarenessUser {
  clientId: number;
  userId?: string;
  name?: string;
  color?: string;
  avatar?: string;
  avatarGradient?: string;
}

export function Editor0({ document, userId, onUpdateTitle }: EditorProps) {
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [activeUsers, setActiveUsers] = useState<AwarenessUser[]>([]);
  const [providerReady, setProviderReady] = useState(false);
  const ydocRef = useRef(new Y.Doc());
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const { user } = useAuth();

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    providerRef.current = new HocuspocusProvider({
      url: `${process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234'}?token=${token}&userId=${userId}`,
      name: document._id,
      document: ydocRef.current,
      onConnect: () => {
        console.log('Connected to Hocuspocus');
        setConnectionStatus('Connected');
        setProviderReady(true);
      },
      onDisconnect: ({ error }: any) => {
        console.log('Disconnected from Hocuspocus', { error });
        setConnectionStatus(error ? 'Error' : 'Disconnected');
        setProviderReady(false);
        if (error) {
          toast.error(`Connection error: ${error.message}`);
          providerRef.current?.destroy(); // Destroy provider and Y.Doc on disconnect
          ydocRef.current.destroy();
          ydocRef.current = new Y.Doc(); // Create new Y.Doc for next connection
        }
      },
      onAuthenticationFailed: ({ reason }) => {
        console.error('Authentication failed', { reason });
        setConnectionStatus('Authentication Failed');
        setProviderReady(false);
        toast.error(`Authentication failed: ${reason}`);
      },
    });

    return () => {
      providerRef.current?.destroy();
      ydocRef.current.destroy();
      setProviderReady(false);
    };
  }, [document._id, token, userId]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydocRef.current,
        field: 'document',
      }),
      ...(providerReady && providerRef.current ?
        [
          CollaborationCursor.configure({
            provider: providerRef.current,
            user: {
              name: `${user?.firstName} ${user?.lastName}`.trim() || 'Unknown',
              color: `hsl(${hashString(userId) % 360}, 80%, 60%)`,
              avatar: user?.profilePhoto || ``,
              avatarGradient: `linear-gradient(45deg, hsl(${hashString(userId) % 360}, 80%, 60%), hsl(${(hashString(userId) + 60) % 360}, 80%, 50%))`, // New
            },
            render: (user) => {
                const cursor = document.createElement('span');
                cursor.classList.add('collaboration-cursor');
                cursor.style.setProperty('--cursor-color', user.color);

                const caret = document.createElement('span');
                caret.classList.add('collaboration-cursor__caret');

                const name = document.createElement('span');
                name.classList.add('collaboration-cursor__label');
                name.textContent = user.name;
                name.style.background = user.avatarGradient;

                const avatar = document.createElement('img');
                avatar.src = user.avatar || ``;
                avatar.classList.add('collaboration-cursor__avatar');
                avatar.alt = user.name;

                cursor.appendChild(caret);
                cursor.appendChild(avatar);
                cursor.appendChild(name);
                return cursor;
              },
          }),
        ] : []), // Only add CollaborationCursor when provider is ready
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: document.content || '<p>Start editing...</p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!editor.isFocused) return;
      setSaveStatus('Saving...');
      debouncedSave(async () => {
        try {
          await updateDocument(document._id, { content: editor.getJSON() });
          setSaveStatus('Saved');
        } catch (error) {
          setSaveStatus('Error');
          toast.error('Failed to save document');
        }
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  // Track active users
  useEffect(() => {
    if (!providerRef.current || !providerRef.current.awareness || !providerReady) return;
    const awareness = providerRef.current.awareness;
    const updateUsers = () => {
      const states = Array.from(awareness.getStates().entries());
      const users = states
        .filter(([clientId]) => clientId !== awareness.clientID)
        .map(([clientId, state]) => ({ clientId, ...state }))
        // .filter((u) => u.name);
        .filter((u): u is AwarenessUser => !!u.name); // Type guard
      setActiveUsers(users);
      console.log('Active users updated:', users);
    };
    awareness.on('update', updateUsers);
    updateUsers();
    return () => awareness.off('update', updateUsers);
  }, [providerReady]);

  useCursorAwareness(editor, userId, user, providerReady ? providerRef.current! : null);

  useEffect(() => {
    if (editor && document.content) {
      editor.commands.setContent(document.content);
    }
  }, [editor, document.content]);

  if (!editor) return <div>Loading editor...</div>;

  console.log("Active Users", activeUsers)

  return (
    <div className="min-h-screen bg-stone-50">
      <EditorHeader
        editor={editor}
        title={document.title}
        onTitleChange={onUpdateTitle}
        saveStatus={saveStatus}
        connectionStatus={connectionStatus}
        document={document}
        activeUsers={activeUsers}
      />
      <EditorToolbar editor={editor} />
      <EditorContentComponent editor={editor} />
    </div>
  );
}


// Last code monday


interface EditorProps {
  document: any;
  userId: string;
  onUpdateTitle?: (title: string) => void;
}

interface AwarenessUser {
  clientId: number;
  userId?: string;
  name?: string;
  color?: string;
  avatar?: string;
  avatarGradient?: string;
}

export function Editor({ document, userId, onUpdateTitle }: EditorProps) {
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [activeUsers, setActiveUsers] = useState<AwarenessUser[]>([]);
  const [providerReady, setProviderReady] = useState(false);
  const ydocRef = useRef(new Y.Doc());
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const { user } = useAuth();

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    providerRef.current = new HocuspocusProvider({
      url: `${process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234'}?token=${token}&userId=${userId}`,
      name: document._id,
      document: ydocRef.current,
      onConnect: () => {
        console.log('Connected to Hocuspocus');
        setConnectionStatus('Connected');
        setProviderReady(true);
      },
      onDisconnect: ({ error }: any) => {
        console.log('Disconnected from Hocuspocus', { error });
        setConnectionStatus(error ? 'Error' : 'Disconnected');
        setProviderReady(false);
        if (error) {
          toast.error(`Connection error: ${error.message}`);
          providerRef.current?.destroy(); // Destroy provider and Y.Doc on disconnect
          ydocRef.current.destroy();
          ydocRef.current = new Y.Doc(); // Create new Y.Doc for next connection
        }
      },
      onAuthenticationFailed: ({ reason }) => {
        console.error('Authentication failed', { reason });
        setConnectionStatus('Authentication Failed');
        setProviderReady(false);
        toast.error(`Authentication failed: ${reason}`);
      },
    });

    return () => {
      providerRef.current?.destroy();
      ydocRef.current.destroy();
      setProviderReady(false);
    };
  }, [document._id, token, userId]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydocRef.current,
        field: 'document',
      }),
      ...(providerReady && providerRef.current ?
        [
          CollaborationCursor.configure({
            provider: providerRef.current,
          }),
        ] : []), 
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: document.content || '<p>Start editing...</p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!editor.isFocused) return;
      setSaveStatus('Saving...');
      debouncedSave(async () => {
        try {
          await updateDocument(document._id, { content: editor.getJSON() });
          setSaveStatus('Saved');
        } catch (error) {
          setSaveStatus('Error');
          toast.error('Failed to save document');
        }
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  // Track active users
  useEffect(() => {
    if (!providerRef.current || !providerRef.current.awareness || !providerReady) return;
    const awareness = providerRef.current.awareness;
    const updateUsers = () => {
      const states = Array.from(awareness.getStates().entries());
      const users = states
        .filter(([clientId]) => clientId !== awareness.clientID)
        .map(([clientId, state]: [number, any]) => ({ clientId, ...(state as any) }))
        .filter((u): u is AwarenessUser => !!(u as any).name); // Type guard
      setActiveUsers(users);
      console.log('Active users updated:', users);
    };
    awareness.on('update', updateUsers);
    updateUsers();
    return () => awareness.off('update', updateUsers);
  }, [providerReady]);

  useCursorAwareness(editor, userId, user, providerReady ? providerRef.current! : null);

  useEffect(() => {
    if (editor && document.content) {
      editor.commands.setContent(document.content);
    }
  }, [editor, document.content]);

  if (!editor) return <div>Loading editor...</div>;

  console.log("Active Users", activeUsers)

  return (
    <div className="min-h-screen bg-stone-50">
      <EditorHeader
        editor={editor}
        title={document.title}
        onTitleChange={onUpdateTitle}
        saveStatus={saveStatus}
        connectionStatus={connectionStatus}
        document={document}
        activeUsers={activeUsers}
      />
      <EditorToolbar editor={editor} />
      <EditorContentComponent editor={editor} />
    </div>
  );
}
