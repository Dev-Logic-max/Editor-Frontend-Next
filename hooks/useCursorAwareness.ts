'use client';

import { useEffect } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { hashString } from '@/utils/hash';
import '../styles/editor.css';

export function useCursorAwareness(editor: any, userId: string, user: any, provider: HocuspocusProvider | null) {
  useEffect(() => {
    if (!editor || !userId || !provider?.awareness) return;

    const hue = hashString(userId) % 360;
    const color = `hsl(${hue}, 80%, 60%)`;
    const gradient = `linear-gradient(45deg, hsl(${hue}, 80%, 60%), hsl(${(hue + 60) % 360}, 80%, 50%))`;
    const userName = `${user?.firstName} ${user?.lastName || ''}`.trim() || 'Unknown';

    // Set awareness data
    provider.awareness.setLocalState({
      userId,
      name: userName,
      color,
      avatar: user?.profilePhoto || ``,
      avatarGradient: gradient,
      typing: false,
    });

    // Update cursor position on selection change
    const updateCursor = () => {
      if (!editor.isFocused) return;
      const { from } = editor.state.selection;
      provider.awareness!.setLocalStateField('cursor', { from, to: from });
      console.log('Cursor updated:', { userId, from, name: userName });
    };

    // 🟢 Track Typing Activity
    let typingTimeout: any;
    const handleTyping = () => {
      provider.awareness!.setLocalStateField('typing', true);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        provider.awareness!.setLocalStateField('typing', false);
      }, 9000);
    };

    editor.on('selectionUpdate', updateCursor);
    editor.on('transaction', updateCursor); // Additional trigger for robustness
    editor.on('update', handleTyping);

    // Debug awareness state
    provider.awareness.on('update', () => {
      console.log('Awareness state:', Array.from(provider.awareness!.getStates().entries()));
    });

    // ✅ Proper cleanup
    return () => {
      editor.off('selectionUpdate', updateCursor);
      editor.off('transaction', updateCursor);
      editor.off('update', handleTyping);
      provider.awareness!.setLocalState(null);
    };
  }, [editor, userId, user, provider]);
}