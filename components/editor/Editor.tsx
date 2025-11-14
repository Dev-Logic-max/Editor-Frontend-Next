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

  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const providerRef = useRef<HocuspocusProvider | null>(null);

  // const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [providerReady, setProviderReady] = useState(false);

  const token = localStorage.getItem('access_token');

  console.log("🟣 Provider Ready 1", providerReady)

  // ✅ Create and connect Hocuspocus Provider
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = providerRef.current = new HocuspocusProvider({
      url: `${process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234'}?token=${token}&userId=${userId}`,
      name: document._id,
      document: ydoc,
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
      },
      onAuthenticationFailed: ({ reason }) => {
        console.error('Authentication failed', { reason });
        setConnectionStatus('Authentication Failed');
        setProviderReady(false);
        toast.error(`Authentication failed: ${reason}`);
      },
    });

    providerRef.current = provider;

    return () => {
      provider.destroy();
      ydoc.destroy();
      setProviderReady(false);
    };
  }, [document._id, token, userId]);

  console.log("🔵 Provider Ready 2", providerReady)

  // ✅ Initialize TipTap editor with Collaboration + Caret
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      Collaboration.configure({ document: ydocRef.current, field: 'document' }),
      ...(providerReady && providerRef.current ?
        [
          CollaborationCaret.configure({
            provider: providerRef.current! || providerRef?.current || providerRef!,
            user: {
              name: `${user?.firstName} ${user?.lastName || 'Unknown'}`,
              color: `hsl(${hashString(userId) % 360}, 80%, 60%)`,
            },
            render: (userState) => {
              // This is called to render the caret for each remote user
              console.log('[Caret] render called for user:', userState);

              const caret = document.createElement('span');
              caret.style.borderLeft = `2px solid ${userState.color}`;
              caret.style.height = '1em';
              caret.style.position = 'relative';

              const label = document.createElement('div');
              label.textContent = userState.name ?? '';
              label.style.position = 'absolute';
              label.style.top = '-1.5em';
              label.style.left = '0';
              label.style.padding = '2px 4px';
              label.style.background = userState.color;
              label.style.color = 'white';
              label.style.fontSize = '0.75em';
              label.style.whiteSpace = 'nowrap';

              caret.appendChild(label);
              return caret;
            },
            selectionRender: (userState) => {
              // Optional: render selection (highlight) if other users have text selected
              console.log('[Caret] render selection for user:', userState);

              const sel = document.createElement('span');
              sel.style.background = userState.color;
              sel.style.opacity = '0.4';
              return sel;
            },
          }),
        ] : []),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      CharacterCount.configure({ limit: 10000 }), // optional: set max chars or omit
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

  // Awareness -> Track Active Users
  useEffect(() => {
    if (!providerRef.current || !providerRef.current.awareness) return;
    const awareness = providerRef.current.awareness;

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().entries());
      const users = states.map(([clientId, state]: [number, any]) => ({
        clientId,
        ...(state as any),
      }));
      console.log('[Awareness] states users:', users);
      setActiveUsers(users);
    };

    awareness.on('update', updateUsers);
    updateUsers();
    return () => awareness.off('update', updateUsers);
  }, [providerReady]);

  // Use custom awareness hook for cursor + typing
  useCursorAwareness(editor, userId, user, providerRef.current);

  useEffect(() => {
    if (editor && document.content) {
      editor.commands.setContent(document.content);
    }
  }, [editor, document.content]);

  console.log("🟡 Provider Ready 4", providerReady)
  console.log('Extensions loaded:', editor?.extensionManager.extensions.map(e => e.name));

  if (!editor) return <div>Loading editor...</div>;
  if (!providerReady) return <div>Connecting to collaboration server...</div>;

  // console.log("Provider", providerRef)
  // console.log("Active Users", activeUsers)
  // console.log("Document", document)
  // console.log("Editor", editor)

  return (
    <div className="min-h-screen bg-white rounded-lg">
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
        provider={providerRef.current}
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
