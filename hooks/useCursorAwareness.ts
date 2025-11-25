'use client';

import { useEffect } from 'react';

import * as Y from 'yjs';
import { hashString } from '@/utils/hash';
import { HocuspocusProvider } from '@hocuspocus/provider';
// import '../styles/editor.css';

export function useCursorAwareness(
  editor: any,
  userId: string,
  user: any,
  provider: HocuspocusProvider | null,
  ydoc: Y.Doc | null,
  yTypeName: string = 'document' // default to 'document' (match your Tiptap Transformer)
) {
  useEffect(() => {
    // ✅ Guard: run only when provider, awareness, and editor are ready
    if (!editor || !userId || !provider?.awareness || !ydoc) return;

    const hue = hashString(userId) % 360;
    const color = `hsl(${hue}, 80%, 60%)`;
    const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Unknown';
    const gradient = `linear-gradient(45deg, hsl(${hue}, 80%, 60%), hsl(${(hue + 60) % 360}, 80%, 50%))`;

    // ✅ Ensure Y shared type exists to create relative positions before setting awareness
    const yType = ydoc.get(yTypeName);
    if (!yType) console.warn('[useCursorAwareness] yType not found:', yTypeName);

    // Set base awareness state once (data: user meta)
    provider.awareness.setLocalState({
      user: { name: userName, color },
      userId,
      color,
      name: userName,
      avatar: user?.profilePhoto || '',
      avatarGradient: gradient,
      typing: false,
    });
    // cursor will be set below when selection exists

    console.log(
      `%c[Awareness] Local user joined:`,
      'color: #00cc88',
      { userId, name: userName, color }
    );

    // ✅ Typing detection (simple debounce)
    let typingTimeout: any = null;
    const handleTyping = () => {
      try {
        provider.awareness?.setLocalStateField('typing', true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          provider.awareness?.setLocalStateField('typing', false);
        }, 3000);
      } catch (err) {
        console.warn('[useCursorAwareness] handleTyping error', err);
      }
    };

    editor.on('update', handleTyping);

    // Debug: log awareness state changes (optional)
    const awarenessHandler = () => {
      const states = Array.from(provider.awareness!.getStates().entries());
      console.groupCollapsed('%c[Awareness] All connected users', 'color:#3399ff');
      states.forEach(([clientId, state]: any) => {
        console.log('Client:', clientId, '→', state);
      });
      console.groupEnd();
    };
    provider.awareness.on('update', awarenessHandler);

    // ✅ Cleanup
    return () => {
      editor.off('update', handleTyping);
      provider.awareness!.off('update', awarenessHandler);
      clearTimeout(typingTimeout);
      provider.awareness!.setLocalState(null);
    };
  }, [editor, userId, user, provider, ydoc, yTypeName]);
}
