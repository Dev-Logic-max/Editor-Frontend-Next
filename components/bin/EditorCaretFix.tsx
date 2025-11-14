'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { useEditor } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Collaboration from '@tiptap/extension-collaboration';
import CharacterCount from '@tiptap/extension-character-count';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';

import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { TiptapTransformer } from '@hocuspocus/transformer';

import { useAuth } from '@/hooks/useAuth';
import { debouncedSave } from '@/utils/debounce';
import { updateDocument } from '@/lib/api/documents';

import { hashString } from '@/utils/hash';
import { EditorHeader } from '../editor/EditorHeader';
import { EditorInfoBar } from '../editor/EditorInfoBar';
import { EditorToolbar } from '../editor/EditorToolbar';
import { EditorStatusBar } from '../editor/EditorStatusBar';
import { EditorContentComponent } from '../editor/EditorContent';

import { useCursorAwareness } from './useAwareness';
import '../../styles/editor.css';

interface EditorProps {
  docData?: any;
  userId: string;
  onUpdateTitle?: (title: string) => void;
}

export default function Editor({ docData, userId, onUpdateTitle }: EditorProps) {
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [providerReady, setProviderReady] = useState(false);

  // Create provider and ydoc synchronously with useMemo so they exist before useEditor runs
  const token = localStorage.getItem('access_token');

  console.log("🟣 Provider Ready 1", providerReady)
  console.log("Active Users Initially", activeUsers)

  const { provider, ydoc } = useMemo(() => {
    // create ydoc and provider synchronously (client-only)
    const _ydoc = new Y.Doc();
    const _provider = new HocuspocusProvider({
      url: `${process.env.NEXT_PUBLIC_HOCUSPOCUS_URL}?token=${token}&userId=${userId}`,
      name: docData._id,
      document: _ydoc,
      onConnect: () => {
        console.log('%c[Hocuspocus] onConnect', 'color: green');
      },
      onSynced: () => {
        console.log('%c[Hocuspocus] onSynced', 'color: cyan');
      },
      onDisconnect: ({ error }: any) => {
        console.log('%c[Hocuspocus] onDisconnect', 'color: red', error);
      },
      onAuthenticationFailed: ({ reason }: any) => {
        console.warn('%c[Hocuspocus] onAuthenticationFailed', 'color: orange', reason);
      },
    });

    return { provider: _provider, ydoc: _ydoc };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docData._id, token, userId]);

  console.log("🔵 Provider Ready 2", providerReady)
  console.log("Active Users UseMemo", activeUsers)

  // keep refs for provider + ydoc to use across effects/hooks
  const providerRef = useRef<HocuspocusProvider | null>(provider);
  const ydocRef = useRef<Y.Doc | null>(ydoc);

  // place in Editor.tsx after providerRef/ydocRef are initialized (after your provider wiring useEffect)
  useEffect(() => {
    // Ensure provider exists and user is loaded
    if (!providerRef.current || !user) return;

    try {
      const hue = hashString(userId) % 360;
      const color = `hsl(${hue}, 80%, 60%)`;
      const gradient = `linear-gradient(45deg, hsl(${hue}, 80%, 60%), hsl(${(hue + 60) % 360}, 80%, 50%))`;
      const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Unknown';

      // Set base awareness metadata (only once, immediately)
      providerRef.current.awareness!.setLocalState({
        userId,
        name: userName,
        color,
        avatar: user?.profilePhoto || '',
        avatarGradient: gradient,
        typing: false,
        // cursor will be set later by the hook via setLocalStateField
      });

      console.log('%c[Awareness] local state set (editor):', 'color: #0aa', {
        userId,
        name: userName,
        color,
      });
    } catch (err) {
      console.warn('[Awareness] failed to set local state:', err);
    }
    // only run when providerRef.current becomes available or when user changes
  }, [user, userId]);

  console.log("Provider Ref Declaraton", providerRef)
  console.log("Y Doc Ref Declaration", ydocRef)

  // Update refs and wire up provider events (connection / synced) after mount
  useEffect(() => {
    providerRef.current = provider;
    ydocRef.current = ydoc;

    const onConnect = () => {
      setConnectionStatus('Connected');
      console.log('[Hocuspocus] CONNECT event');
    };
    const onSynced = () => {
      setProviderReady(true);
      console.log('[Hocuspocus] SYNCED event');
    };
    const onDisconnect = ({ error }: any) => {
      setConnectionStatus(error ? 'Error' : 'Disconnected');
      setProviderReady(false);
      console.log('[Hocuspocus] DISCONNECT', error);
    };
    const onAuthFailed = ({ reason }: any) => {
      setConnectionStatus('Auth Failed');
      setProviderReady(false);
      console.warn('[Hocuspocus] AUTH FAILED', reason);
      toast.error(`Authentication failed: ${reason}`);
    };

    provider.on('connect', onConnect);
    provider.on('synced', onSynced);
    provider.on('disconnect', onDisconnect);
    provider.on('authenticationFailed', onAuthFailed);

    return () => {
      // cleanup listeners and destroy provider/ydoc
      try {
        provider.off('connect', onConnect);
        provider.off('synced', onSynced);
        provider.off('disconnect', onDisconnect);
        provider.off('authenticationFailed', onAuthFailed);
      } catch (e) {
        /* ignore */
      }
      try { provider.destroy(); } catch (e) { /* ignore */ }
      try { ydoc.destroy(); } catch (e) { /* ignore */ }
      providerRef.current = null;
      ydocRef.current = null;
      setProviderReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, ydoc]);

  console.log("🟡 Provider Ready 3", providerReady)
  console.log("Provider Ref Current Initialization", providerRef.current)
  console.log("Y Doc Ref Current Initialization", ydocRef.current)

  // Create the editor AFTER we have provider & ydoc created (they are created synchronously above)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      Collaboration.configure({
        document: ydocRef.current!,
        field: 'document',
      }),
      CollaborationCaret.configure({
        provider: providerRef.current!,
        render: (user) => {
          const cursor = document.createElement('span');
          cursor.classList.add('collaboration-cursor');
          cursor.style.borderLeft = `2px solid ${user.color}`;
          cursor.style.borderColor = user.color;
          cursor.style.height = '1.2em';
          cursor.style.marginLeft = '-1px';
          cursor.style.display = 'inline-block';
          cursor.style.position = 'relative';
          cursor.style.top = '3px';

          const userLabel = document.createElement('div');
          userLabel.classList.add('collaboration-cursor__label');
          // Use the name from awareness state
          const name = user.user?.name || user.name || 'Anonymous';
          userLabel.textContent = name;
          userLabel.style.backgroundColor = user.color;
          userLabel.style.color = '#fff';
          userLabel.style.padding = '0.1rem 0.3rem';
          userLabel.style.borderRadius = '3px';
          userLabel.style.fontSize = '12px';
          userLabel.style.position = 'absolute';
          userLabel.style.top = '-1.4em';
          userLabel.style.left = '-1px';
          userLabel.style.whiteSpace = 'nowrap';
          userLabel.style.zIndex = '50';

          cursor.appendChild(userLabel);
          return cursor;
        },
        selectionRender: (user) => ({
          nodeName: 'span',
          class: 'collaboration-selection',
          style: `background: ${user.color}; opacity: 0.2`,
          'data-user-name': user.user?.name || user.name || 'Anonymous',
        }),
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      CharacterCount.configure({ limit: 100000 }),
    ],
    immediatelyRender: false,
    content: '', // Start empty, let collaboration handle content
    // content: docData.content ?? '<p></p>',
    editorProps: {
      attributes: { class: 'prose mx-auto focus:outline-none' },
    },
    onUpdate: ({ editor, transaction }) => {
      // Only save if it's a user-initiated change
      if (!transaction) return;
      // Don't save if editor isn't focused (prevents initial content save)
      if (!editor.isFocused) return;

      setSaveStatus('Saving...');
      debouncedSave(async () => {
        try {
          await updateDocument(docData._id, { content: editor.getJSON() });
          setSaveStatus('Saved');
        } catch (err) {
          setSaveStatus('Error');
          toast.error('Failed to save');
        }
      });
    },
  });

  console.log("🟢 Provider Ready 4", providerReady)

  // Awareness tracking: list active users from provider.awareness
  useEffect(() => {
    if (!providerRef.current?.awareness) return;
    const awareness = providerRef.current.awareness;

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().entries());
      const users = states.map(([clientId, state]: [number, any]) => ({
        clientId,
        ...(state as any),
      }));
      console.log('[Awareness] states: Tracking Users:', users, states);
      setActiveUsers(users);
    };

    awareness.on('update', updateUsers);
    updateUsers();
    return () => awareness.off('update', updateUsers);
  }, []);

  // useCursorAwareness to publish local awareness (cursor/typing)
  useCursorAwareness(editor, userId, user, providerRef.current, ydocRef.current, 'document');

  // Important: avoid unconditional editor.commands.setContent() — it duplicates content.
  // Only set content if ydoc appears empty. This helps avoid double inserts.
  // useEffect(() => {
  //   if (!editor || !ydocRef.current) return;

  //   try {
  //     const current = TiptapTransformer.fromYdoc(ydocRef.current, 'document');
  //     const server = docData.content ?? { type: 'doc', content: [] };

  //     const isEmpty =
  //       !current ||
  //       !current.content ||
  //       (Array.isArray(current.content) && current.content.length === 0);

  //     console.log('[Reconcile] isEmpty:', isEmpty, 'current:', current);

  //     if (isEmpty && JSON.stringify(current) !== JSON.stringify(server)) {
  //       console.log('[Reconcile] applying server content once');
  //       editor.commands.setContent(server);
  //     }
  //   } catch (err) {
  //     console.warn('[Reconcile] transformer error', err);
  //   }
  // }, [editor, docData.content]);

  // Replace the content reconciliation effect with this:
  useEffect(() => {
    if (!editor || !ydocRef.current || !providerReady) return;

    try {
      const ytext = ydocRef.current.get('document');
      const isEmpty = ytext.toString().length === 0;

      // Only set initial content if Y.doc is empty
      if (isEmpty && docData.content) {
        const content = typeof docData.content === 'string'
          ? JSON.parse(docData.content)
          : docData.content;

        editor.commands.setContent(content); // false = don't emit update
      }
    } catch (err) {
      console.warn('[Content] Initial sync error:', err);
    }
  }, [editor, providerReady, docData.content]);

  // debug logs
  useEffect(() => {
    console.log('Editor extensions:', editor?.extensionManager.extensions.map((e: any) => e.name));
    console.log('Provider ready:', providerReady, 'Provider present:', !!providerRef.current);
  }, [editor, providerReady]);

  if (!user) return <div>Loading user...</div>;
  if (!editor) return <div>Loading editor...</div>;
  if (!providerReady) return <div>Waiting for initial sync...</div>;
  if (!providerRef.current) return <div>Initializing collaboration...</div>;

  return (
    <div className="min-h-screen bg-white">
      <EditorHeader editor={editor} title={docData.title} onTitleChange={onUpdateTitle} document={docData} activeUsers={activeUsers} />
      <EditorStatusBar editor={editor} saveStatus={saveStatus} connectionStatus={connectionStatus} activeUsers={activeUsers} />
      <EditorInfoBar document={docData} provider={providerRef.current} userId={userId} />
      <EditorToolbar editor={editor} />
      <EditorContentComponent editor={editor} />
    </div>
  );
}