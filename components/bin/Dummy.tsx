'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { EditorToolbar } from './EditorToolbar';
import { EditorHeader } from './EditorHeader';
import { EditorContentComponent } from './EditorContent';
import { debouncedSave } from '@/utils/debounce';
import { updateDocument } from '@/lib/api/documents';
import toast from 'react-hot-toast';

interface EditorProps {
  document: any;
  userId: string | undefined;
  onUpdateTitle?: (title: string) => void;
}

export function Editor({ document, userId, onUpdateTitle }: EditorProps) {
  const [saveStatus, setSaveStatus] = useState('Saved');
  const ydoc = new Y.Doc();

  const provider = new HocuspocusProvider({
    url: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234',
    name: document._id,
    token: localStorage.getItem('access_token') || undefined, // JWT for auth
    onConnect: () => console.log('Connected to Hocuspocus'),
    onDisconnect: () => console.log('Disconnected from Hocuspocus'),
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc,
        field: 'document', // Match backend field
      }),
    ],
    content: document.content || '<p>Start editing...</p>',
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      if (!editor.isFocused) return; // Only save local changes
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

  useEffect(() => {
    if (editor && document.content) {
      editor.commands.setContent(document.content);
    }
    return () => {
      debouncedSave.cancel(); // Cancel pending saves
      provider.destroy();
      ydoc.destroy();
    };
  }, [editor, document.content]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="min-h-screen bg-white">
      <EditorHeader
        editor={editor}
        title={document.title}
        onTitleChange={onUpdateTitle}
        saveStatus={saveStatus}
      />
      <EditorToolbar editor={editor} />
      <EditorContentComponent editor={editor} />
    </div>
  );
}

// Last code updated (Friday)

'use client';

import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

import * as Y from 'yjs';
import { useEditor } from '@tiptap/react';
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Collaboration from '@tiptap/extension-collaboration';
import CharacterCount from '@tiptap/extension-character-count';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { HocuspocusProvider } from '@hocuspocus/provider';

import { useAuth } from '@/hooks/useAuth';
import { useCursorAwareness } from '@/hooks/useCursorAwareness';

import { debouncedSave } from '@/utils/debounce';
import { updateDocument } from '@/lib/api/documents';

import { EditorTabs } from './EditorTabs';
import { EditorHeader } from './EditorHeader';
import { EditorInfoBar } from './EditorInfoBar';
import { EditorToolbar } from './EditorToolbar';
import { FloatingToolbar } from './FloatingToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { SlashCommandMenu } from './SlashCommandMenu';
import { EditorContentComponent } from './EditorContent';
import EmojiPickerFloating from '../common/EmojiPickerFloating';

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

export function Editor({ document, userId, onUpdateTitle }: EditorProps) {
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const [lastSavedAt, setLastSavedAt] = useState<Date>();
  const [activeUsers, setActiveUsers] = useState<AwarenessUser[]>([]);
  
  const [openDocuments, setOpenDocuments] = useState<{ _id: string; title: string }[]>([document]);
  const [activeDocId, setActiveDocId] = useState(document._id);
  
  const ydocRef = useRef(new Y.Doc());
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const [providerReady, setProviderReady] = useState(false);

  const token = localStorage.getItem('access_token');

  console.log("🟣 Provider Ready 1", providerReady)

  const handleSwitchDocument = (docId: string) => {
    setActiveDocId(docId);
    // 🧠 TODO: You can trigger loading from backend if doc not loaded in memory
  };

  const handleCloseDocument = (docId: string) => {
    setOpenDocuments((prev) => prev.filter((d) => d._id !== docId));
    if (activeDocId === docId && openDocuments.length > 1) {
      const nextDoc = openDocuments.find((d) => d._id !== docId);
      if (nextDoc) setActiveDocId(nextDoc._id);
    }
  };

  // ✅ Initialize provider AFTER everything is ready
  useEffect(() => {
    providerRef.current = new HocuspocusProvider({
      url: `${process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234'}?token=${token}&userId=${userId}`,
      name: document._id,
      document: ydocRef.current,
      onConnect: () => {
        console.log('%c[Hocuspocus]', 'color: lime', 'Connected to Hocuspocus');
        setConnectionStatus('Connected');
      },
      onSynced: () => {
        console.log('%c[Hocuspocus]', 'color: cyan', 'Synced with server');
        setProviderReady(true);
      },
      onDisconnect: ({ error }: any) => {
        console.log('%c[Hocuspocus]', 'color: red', 'Disconnected from Hocuspocus', { error });
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

    // ✅ set the provider state here
    setProvider(providerRef.current);

    return () => {
      providerRef.current?.destroy();
      ydocRef.current.destroy();
      setProviderReady(false);
      setProvider(null);
    };
  }, [document._id, token, userId]);

  console.log("🔵 Provider Ready 2", providerReady)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Collaboration.extend().configure({
        document: ydocRef.current,
        field: 'document',
      }),
      ...(providerReady && providerRef.current ?
        [
          CollaborationCaret.extend().configure({
            provider: providerRef.current,
            user: {
              name: `${user?.firstName} ${user?.lastName || 'Unknown'}`,
              color: `hsl(${hashString(userId) % 360}, 80%, 60%)`,
            },
            render: (user) => {
              const caret = document.createElement('span');
              caret.style.borderLeft = `2px solid ${user.color}`;
              caret.style.height = '1em';
              caret.style.position = 'relative';

              const label = document.createElement('div');
              label.textContent = user.name ?? '';
              label.style.position = 'absolute';
              label.style.top = '-1.5em';
              label.style.left = '0';
              label.style.padding = '2px 4px';
              label.style.background = user.color;
              label.style.color = 'white';
              label.style.fontSize = '0.75em';
              label.style.whiteSpace = 'nowrap';
              caret.appendChild(label);

              console.log('[Caret Test] render caret:', user);

              return caret;
            },
          }),
        ] : []),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      CharacterCount.extend().configure({
        limit: 10000, // optional: set max chars or omit
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
          setLastSavedAt(new Date()); // ✅ update live
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

  console.log("🟢 Provider Ready 3", providerReady)

  // Track Active Users
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

  // useCursorAwareness(editor, userId, user, providerRef.current);

  useCursorAwareness(editor, userId, user, providerReady ? providerRef.current! : null);

  useEffect(() => {
    if (editor && document.content) {
      editor.commands.setContent(document.content);
    }
  }, [editor, document.content]);

  console.log("🟡 Provider Ready 4", providerReady)
  console.log('Extensions loaded:', editor?.extensionManager.extensions.map(e => e.name));

  if (!editor) return <div>Loading editor...</div>;
  if (!providerReady) return <div>Connecting to collaborative session...</div>;

  // console.log("Provider", providerRef)
  // console.log("Active Users", activeUsers)
  // console.log("Document", document)
  // console.log("Editor", editor)

  return (
    <div className="min-h-screen bg-white rounded-lg">
      <EditorTabs
        openDocuments={openDocuments}
        activeDocumentId={activeDocId}
        onSwitch={handleSwitchDocument}
        onClose={handleCloseDocument}
      />
      <EditorHeader
        editor={editor}
        document={document}
        title={document.title}
        activeUsers={activeUsers}
        onTitleChange={onUpdateTitle}
      />
      <EditorStatusBar
        editor={editor}
        document={document}
        saveStatus={saveStatus}
        activeUsers={activeUsers}
        connectionStatus={connectionStatus}
      />
      <EditorInfoBar
        userId={userId}
        document={document}
        provider={provider}
        lastSavedAt={lastSavedAt}
      />
      <EditorToolbar editor={editor} />
      <FloatingToolbar editor={editor} />
      <SlashCommandMenu editor={editor} />
      <EmojiPickerFloating editor={editor} />
      <EditorContentComponent editor={editor} />
    </div>
  );
}
