'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import * as Y from 'yjs';
import { useEditor } from '@tiptap/react';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TableCell from '@tiptap/extension-table-cell';
import DragHandle from '@tiptap/extension-drag-handle';
import TableHeader from '@tiptap/extension-table-header';
import Collaboration from '@tiptap/extension-collaboration';
import CharacterCount from '@tiptap/extension-character-count';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';

import { useAuth } from '@/hooks/useAuth';
import { useCursorAwareness } from './useAwareness';
import { EditorLayout, useEditorSettings } from '@/hooks/useEditorSettings';

import { hashString } from '@/utils/hash';
import { debouncedSave } from '@/utils/debounce';
import { updateDocument } from '@/lib/api/documents';

import { TextStyle } from '@tiptap/extension-text-style';

import { EditorHeader } from '@/components/editor/EditorHeader';
import { EditorInfoBar } from '@/components/editor/EditorInfoBar';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorStatusBar } from '@/components/editor/EditorStatusBar';
import { FloatingToolbar } from '@/components/editor/FloatingToolbar';
import { SlashCommandMenu } from '@/components/editor/SlashCommandMenu';
import { EditorContentComponent } from '@/components/editor/EditorContent';

import { ChatModal } from '@/components/chat/ChatModal';
import { AIToolbar } from '@/components/editor/AIToolbar';
import { MotionDiv } from '@/components/common/MotionDiv';
import { AIComparisonSidebar } from '@/components/layout/AISidebar';
import { AINotionStyle } from '@/components/extensions/AINotionStyle';
import { CustomParagraph } from '@/components/extensions/CustomParagraph';
import EmojiPickerFloating from '@/components/common/EmojiPickerFloating';
import { AIInlineSuggestion } from '@/components/extensions/AIInlineSuggestion';

import { HocuspocusProvider } from '@hocuspocus/provider';
import { PiChatCircleTextBold } from 'react-icons/pi';
import '../../styles/editor.css';
import { FaHistory } from 'react-icons/fa';

interface EditorProps {
  docData?: any;
  userId: string;
  onUpdateTitle?: (title: string) => void;
}

export default function Editor({ docData, userId, onUpdateTitle }: EditorProps) {
  const { user } = useAuth();
  const { settings } = useEditorSettings();
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [providerReady, setProviderReady] = useState(false);

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);

  const [showNotionAI, setShowNotionAI] = useState(false);
  const [currentAISuggestion, setCurrentAISuggestion] = useState({
    text: '',
    action: ''
  });

  const [showInlineSuggestion, setShowInlineSuggestion] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState({
    original: '',
    suggested: '',
    action: ''
  });

  const [aiHistory, setAiHistory] = useState<Array<{
    original: string;
    improved: string;
    action: string;
    timestamp: Date;
    model: string;
    status: 'pending' | 'accepted' | 'rejected' | 'error';
  }>>([]);

  const layout = settings.appearance?.layout ?? EditorLayout.Document;

  // 🔑 Token for provider auth (client-only)
  const token = localStorage.getItem('access_token');

  const handleUpdateTitle = async (newTitle: string) => {
    try {
      await updateDocument(docData._id, { title: newTitle }); // Call API to update title
      // Optionally, you can also update local state if needed
    } catch (error) {
      console.error('Failed to update title:', error);
      toast.error('Failed to update title');
    }
  };

  // 🧱 1. Create provider + Y.Doc (synchronously with useMemo) so they exist before useEditor runs
  const { provider, ydoc } = useMemo(() => {
    // create ydoc and provider synchronously (client-only)
    const _ydoc = new Y.Doc();
    const _provider = new HocuspocusProvider({
      url: `${process.env.NEXT_PUBLIC_HOCUSPOCUS_URL}?token=${token}&userId=${userId}`,
      name: docData._id,
      document: _ydoc,
      onConnect: () => {
        console.log('🟢 [Hocuspocus] onConnect');
      },
      onSynced: () => {
        console.log('🔄 [Hocuspocus] onSynced (initial sync complete)');
      },
      onDisconnect: ({ error }: any) => {
        console.log('🔴 [Hocuspocus] onDisconnect', 'color: red', error);
      },
      onAuthenticationFailed: ({ reason }: any) => {
        console.warn('⚠️ [Hocuspocus] onAuthenticationFailed', reason);
      },
    });

    return { provider: _provider, ydoc: _ydoc };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docData._id, token, userId]);

  // keep refs for provider + ydoc to use across effects/hooks
  const providerRef = useRef<HocuspocusProvider | null>(provider);
  const ydocRef = useRef<Y.Doc | null>(ydoc);

  // 🛠️ 2. Set local awareness metadata (once user + provider exist)
  useEffect(() => {
    // Ensure provider exists & user is loaded
    if (!providerRef.current || !user) return;

    try {
      const hue = hashString(userId) % 360;
      const color = `hsl(${hue}, 80%, 60%)`;
      const gradient = `linear-gradient(45deg, hsl(${hue}, 80%, 60%), hsl(${(hue + 60) % 360}, 80%, 50%))`;
      const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Unknown';

      // 📣 Publish local presence, Set awareness metadata only once immediately (used by caret + active user list)
      providerRef.current.awareness!.setLocalState({
        userId,
        name: userName,
        color,
        avatar: user?.profilePhoto || '',
        avatarGradient: gradient,
        typing: false,
      });
      // cursor will be set later by the hook via setLocalStateField

      console.log('🟦 [Awareness] local state set (editor):', { userId, name: userName, color });
    } catch (err) {
      console.warn('⚠️ [Awareness] failed to set local state:', err);
    }
    // only run when providerRef.current becomes available or when user changes
  }, [user, userId]);

  // 🔁 3. Update refs and wire provider lifecycle events (connection / synced / disconnect) after mount
  useEffect(() => {
    providerRef.current = provider;
    ydocRef.current = ydoc;

    const onConnect = () => {
      setConnectionStatus('Connected');
      console.log('🟢 [Hocuspocus] CONNECT event');
    };
    const onSynced = () => {
      setProviderReady(true);
      console.log('🔄 [Hocuspocus] SYNCED event — providerReady = true');
    };
    const onDisconnect = ({ error }: any) => {
      setConnectionStatus(error ? 'Error' : 'Disconnected');
      setProviderReady(false);
      console.log('🔴 [Hocuspocus] DISCONNECT', error);
    };
    const onAuthFailed = ({ reason }: any) => {
      setConnectionStatus('Auth Failed');
      setProviderReady(false);
      console.warn('⚠️ [Hocuspocus] AUTH FAILED', reason);
      toast.error(`Authentication failed: ${reason}`);
    };

    provider.on('connect', onConnect);
    provider.on('synced', onSynced);
    provider.on('disconnect', onDisconnect);
    provider.on('authenticationFailed', onAuthFailed);

    return () => {
      // cleanup listeners and destroy provider/ydoc safely
      try {
        provider.off('connect', onConnect);
        provider.off('synced', onSynced);
        provider.off('disconnect', onDisconnect);
        provider.off('authenticationFailed', onAuthFailed);
      } catch (e) { /* ignore */ }
      try { provider.destroy(); } catch (e) { /* ignore */ }
      try { ydoc.destroy(); } catch (e) { /* ignore */ }
      providerRef.current = null;
      ydocRef.current = null;
      setProviderReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, ydoc]);

  // 📝 4. Create Tiptap editor (collaboration + caret) AFTER we have provider & ydoc created above
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
          // Render caret DOM node (label uses awareness-provided name)
          const cursor = document.createElement('span');
          cursor.classList.add('collaboration-cursor');
          cursor.style.borderLeft = `2px solid ${user.color}`;
          cursor.style.borderColor = user.color;
          cursor.style.height = '1em';
          cursor.style.marginLeft = '-1px';
          cursor.style.display = 'inline-block';
          cursor.style.position = 'relative';
          cursor.style.top = '8px';

          const userLabel = document.createElement('div');
          userLabel.classList.add('collaboration-cursor__label');

          // 💬 Use name from awareness state
          // const isCurrentUser = user.clientID === providerRef.current?.awareness?.clientID;
          // const name = isCurrentUser ? 'You' : user.user?.name || user.name || 'Anonymous';
          const name = user.user?.name || user.name || 'Anonymous';
          userLabel.textContent = name;
          userLabel.style.backgroundColor = user.color;
          userLabel.style.color = '#fff';
          userLabel.style.padding = '0.1rem 0.3rem';
          userLabel.style.borderRadius = '3px';
          userLabel.style.fontSize = '12px';
          userLabel.style.position = 'absolute';
          userLabel.style.top = '-1.6em';
          userLabel.style.left = '2px';
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
      DragHandle.configure({
        render: () => {
          const element = document.createElement('div');
          element.className = 'drag-handle cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100';
          element.setAttribute('draggable', 'true');
          element.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/></svg>`;
          return element;
        },
      }),
      Color,
      TextStyle,
      Underline,
      CustomParagraph,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount.configure({ limit: 100000 }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    immediatelyRender: false,
    content: '',
    editorProps: {
      attributes: { class: '' },
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
          toast.error('⚠️ Failed to save 📄');
        }
      });
    },
  });
  // 💾 5. Save document updated content above onUpdate.

  // 👥 6. Awareness tracking: Maintain list of active users from provider.awareness
  useEffect(() => {
    if (!providerRef.current?.awareness) return;
    const awareness = providerRef.current.awareness;

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().entries());
      const users = states.map(([clientId, state]: [number, any]) => ({
        clientId,
        ...(state as any),
      }));
      console.log('🟪 [Awareness] Connected Users:', users, states);
      setActiveUsers(users);
    };

    awareness.on('update', updateUsers);
    updateUsers();
    return () => awareness.off('update', updateUsers);
  }, []);

  // 🧭 7. Publish local awareness (cursor + typing) by use of useCursorAwareness
  useCursorAwareness(editor, userId, user, providerRef.current, ydocRef.current, 'document');

  // 🔁 8. Initial content reconciliation (apply server content only when Y.Doc empty)
  useEffect(() => {
    if (!editor || !ydocRef.current || !providerReady) return;

    try {
      const ytext = ydocRef.current.get('document');
      const isEmpty = ytext.toString().length === 0;

      // Only set initial content if Y.doc has no content
      if (isEmpty && docData.content) {
        const content = typeof docData.content === 'string' ? JSON.parse(docData.content) : docData.content;

        // 🛑 This sets content once — collaboration will then keep Y.Doc authoritative
        editor.commands.setContent(content); // false = don't emit update
        console.log('🔁 [Content] Applied initial server content to editor (once)');
      }
    } catch (err) {
      console.warn('⚠️[Content] Initial sync error:', err);
    }
  }, [editor, providerReady, docData.content]);

  // 🔎 Debug: extension list + provider state
  useEffect(() => {
    console.log(' 📦 Editor extensions:', editor?.extensionManager.extensions.map((e: any) => e.name));
    console.log(' 🔌 Provider ready:', providerReady, 'Provider present:', !!providerRef.current);
  }, [editor, providerReady]);

  // ✨ UPDATED: AI handlers with history tracking
  const handleAIStart = (text: string, action: string) => {
    console.log('🎨 AI Processing started:', action);
  };

  const handleAIComplete = (original: string, result: string, action: string) => {
    console.log('🎯 AI Complete called with:', { original, result, action });

    // Show Notion-style inline suggestion
    setCurrentAISuggestion({
      text: result,
      action
    });
    setShowNotionAI(true);

    // Show inline suggestion
    setCurrentSuggestion({
      original,
      suggested: result,
      action
    });
    setShowInlineSuggestion(false);

    // Add to history
    // Version 0
    // setAiHistory(prev => [{
    //   original,
    //   improved: result,
    //   action,
    //   timestamp: new Date()
    // }, ...prev]);

    // Add to history
    const newHistoryItemV0 = {
      original,
      improved: result,
      action,
      timestamp: new Date()
    };

    // Add to history with model and pending status
    const newHistoryItem = {
      original,
      improved: result,
      action,
      timestamp: new Date(),
      model: 'llama-3.3-70b-versatile', // Get from settings if available
      status: 'pending' as const
    };

    setAiHistory(prev => {
      const updated = [newHistoryItem, ...prev];
      console.log('📝 History updated to:', updated);
      return updated;
    });

    console.log('✅ AI Processing complete');
  };

  const handleAcceptInlineSuggestion = () => {
    // Update the most recent history item to 'accepted'
    setAiHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], status: 'accepted' as const };
      return updated;
    });

    setShowInlineSuggestion(false);
    setCurrentSuggestion({ original: '', suggested: '', action: '' });
  };

  const handleRejectInlineSuggestion = () => {
    // Update the most recent history item to 'rejected'
    setAiHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], status: 'rejected' as const };
      return updated;
    });

    setShowInlineSuggestion(false);
    setCurrentSuggestion({ original: '', suggested: '', action: '' });
  };

  const handleAcceptNotionAI = () => {
    // Update the most recent history item to 'accepted'
    setAiHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], status: 'accepted' as const };
      return updated;
    });

    setShowNotionAI(false);
    setCurrentAISuggestion({ text: '', action: '' });
  };

  const handleRejectNotionAI = () => {
    // Update the most recent history item to 'rejected'
    setAiHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], status: 'rejected' as const };
      return updated;
    });

    setShowNotionAI(false);
    setCurrentAISuggestion({ text: '', action: '' });
  };

  // NEW: Choose toolbar based on setting
  const showFloating = settings.ui.showFloatingToolbar;
  const ToolbarComponent = showFloating ? FloatingToolbar : EditorToolbar;

  const documentContent = editor ? editor.getText() : '';

  if (!user) return <div>Loading user...</div>;
  if (!editor) return <div>Loading editor...</div>;
  if (!providerReady) return <div>Waiting for initial sync...</div>;
  if (!providerRef.current) return <div>Initializing collaboration...</div>;

  console.log("Settings", settings)
  console.log("Layout:", layout);
  console.log("Editor Ai History", aiHistory)

  return (
    <div className={`${layout === EditorLayout.Document ? '' : 'rounded-lg'} bg-white relative transition-all duration-300`}>
      <EditorHeader
        editor={editor}
        document={docData}
        aiHistory={aiHistory}
        title={docData.title}
        activeUsers={activeUsers}
        // onTitleChange={onUpdateTitle}
        onTitleChange={handleUpdateTitle}
      />

      {settings.ui.showStatusBar && (
        <EditorStatusBar
          editor={editor}
          document={docData}
          saveStatus={saveStatus}
          activeUsers={activeUsers}
          connectionStatus={connectionStatus}
        />
      )}

      {settings.ui.showInfoBar && (
        <EditorInfoBar
          userId={userId}
          document={docData}
          // lastSavedAt={lastSavedAt}
          provider={providerRef.current}
        />
      )}

      <ToolbarComponent
        editor={editor}
        onAIStart={handleAIStart}
        onAIComplete={handleAIComplete}
      />

      {settings.ui.showFloatingToolbar && <FloatingToolbar editor={editor} />}

      <SlashCommandMenu editor={editor} />

      {settings.ui.showEmojiPicker && <EmojiPickerFloating editor={editor} />}

      <EditorContentComponent editor={editor} />

      {editor && (
        <>
          {/* <div className="sticky top-16 z-10 p-2 bg-white border-b">
            <AIToolbar editor={editor} />
          </div> */}
        </>
      )}

      <span
        onClick={() => setChatModalOpen(!chatModalOpen)}
        className="flex items-center rounded-full p-2 text-green-600 bg-gray-100 absolute bottom-0 right-5 cursor-pointer hover:bg-green-200 border z-20"
      >
        <PiChatCircleTextBold className="w-7 h-7" />
      </span>

      <span
        onClick={() => { setAiSidebarOpen(true) }}
        className="flex items-center rounded-full p-2 text-purple-600 bg-gray-100 absolute bottom-0 right-20 cursor-pointer hover:bg-purple-200 border z-20"
      >
        <FaHistory className="w-7 h-7" />
      </span>

      <MotionDiv
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: chatModalOpen ? 1 : 0, scale: chatModalOpen ? 1 : 0.8, y: chatModalOpen ? 0 : 20 }}
        transition={{ duration: 0.25, type: "spring", stiffness: 300 }}
        className="absolute bottom-0 right-0 z-20"
        style={{ pointerEvents: chatModalOpen ? 'auto' : 'none' }}
      >
        {ydoc && provider && (
          <ChatModal
            chatModalOpen={chatModalOpen}
            // onClose={() => setChatModalOpen(false)}
            documentId={docData._id}
            collaborators={activeUsers}
            ydoc={ydoc}
            provider={provider}
          />
        )}
      </MotionDiv>

      <AINotionStyle
        editor={editor}
        isActive={showNotionAI}
        suggestedText={currentAISuggestion.text}
        action={currentAISuggestion.action}
        onAccept={handleAcceptNotionAI}
        onReject={handleRejectNotionAI}
      />

      {/* <AIInlineSuggestion
        editor={editor}
        isVisible={showInlineSuggestion}
        originalText={currentSuggestion.original}
        suggestedText={currentSuggestion.suggested}
        action={currentSuggestion.action}
        onAccept={handleAcceptInlineSuggestion}
        onReject={handleRejectInlineSuggestion}
      /> */}

      <AIComparisonSidebar
        editor={editor}
        history={aiHistory}
        isOpen={aiSidebarOpen}
        onClose={() => setAiSidebarOpen(false)}
        documentContent={documentContent}
      />
    </div>
  );
}