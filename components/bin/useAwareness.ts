// hooks/useCursorAwareness.ts
'use client';

import { useEffect } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { hashString } from '@/utils/hash';
// import '../styles/editor.css';

type EditorAny = any;

export function useCursorAwareness(
  editor: EditorAny,
  userId: string,
  user: any,
  provider: HocuspocusProvider | null,
  ydoc: Y.Doc | null,
  yTypeName: string = 'document' // default to 'document' (match your Tiptap Transformer)
) {
  useEffect(() => {
    if (!editor || !userId || !provider?.awareness || !ydoc) return;

    const hue = hashString(userId) % 360;
    const color = `hsl(${hue}, 80%, 60%)`;
    const gradient = `linear-gradient(45deg, hsl(${hue}, 80%, 60%), hsl(${(hue + 60) % 360}, 80%, 50%))`;
    const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Unknown';

    // Ensure we have the Y shared type to create relative positions
    const yType = ydoc.get(yTypeName);
    if (!yType) {
      console.warn('[useCursorAwareness] yType not found:', yTypeName);
    }

    // Set base awareness data (user meta)
    provider.awareness.setLocalState({
      user: {
        name: userName,
        color,
      },
      userId,
      color,
      name: userName,
      avatar: user?.profilePhoto || '',
      avatarGradient: gradient,
      typing: false,
      // cursor will be set below when selection exists
    });

    console.log(
      `%c[Awareness] Local user joined:`,
      'color: #00cc88',
      {
        userId,
        name: userName,
        color,
        profilePhoto: user?.profilePhoto,
      }
    );

    // Helper: create relative position JSON for an absolute index (index = number)
    const makeRelative = (index: number | null) => {
      try {
        if (index == null || !yType) return null;
        // Use Y.createRelativePositionFromTypeIndex to create a RelativePosition tied to the shared type
        const rel = (Y as any).createRelativePositionFromTypeIndex(yType, index);
        // It's safe to store the plain object (JSON) in awareness
        return rel;
      } catch (err) {
        console.warn('[useCursorAwareness] createRelative error', err);
        return null;
      }
    };

    // Update awareness cursor (anchor/head) using relative positions
    // const updateCursor = () => {
    //   try {
    //     // const { from, to } = editor.state.selection;
    //     // When there's no selection, from === to (caret)
    //     // const anchorRel = makeRelative(from ?? null);
    //     // const headRel = makeRelative(to ?? from ?? null);
    //     // store anchor/head (naming like ProseMirror: anchor/head)
    //     // CollaborationCaret expects a JSON relative position structure
    //     // provider.awareness!.setLocalStateField('cursor', {
    //     //   anchor: anchorRel,
    //     //   head: headRel,
    //     // });
    //     // debug
    //     // console.debug('[useCursorAwareness] setLocalStateField cursor', { from, to, anchorRel, headRel });
    //   } catch (err) {
    //     // console.warn('[useCursorAwareness] updateCursor error', err);
    //   }
    // };

    // Typing detection (simple debounce)
    let typingTimeout: any = null;
    const handleTyping = () => {
      try {
        provider.awareness!.setLocalStateField('typing', true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          provider.awareness!.setLocalStateField('typing', false);
        }, 1500);
      } catch (err) {
        console.warn('[useCursorAwareness] handleTyping error', err);
      }
    };

    // Bind events
    // editor.on('selectionUpdate', updateCursor);
    // editor.on('transaction', updateCursor); // additional robustness
    editor.on('update', handleTyping);

    // Also call once initially to publish cursor if editor has selection
    // updateCursor();

    // Debug: log awareness state changes (optional)
    const awarenessHandler = () => {
      const states = Array.from(provider.awareness!.getStates().entries());
      console.groupCollapsed('%c[Awareness] All connected users', 'color:#3399ff');
      states.forEach(([clientId, state]: any) => {
        console.log('Client:', clientId, '→', state);
      });
      console.groupEnd();
      // try {
      //   console.debug('[useCursorAwareness] awareness states:', Array.from(provider.awareness!.getStates().entries()));
      // } catch (e) { /* ignore */ }
    };
    provider.awareness.on('update', awarenessHandler);

    // Cleanup
    return () => {
      //   editor.off('selectionUpdate', updateCursor);
      //   editor.off('transaction', updateCursor);
      editor.off('update', handleTyping);
      provider.awareness!.off('update', awarenessHandler);
      provider.awareness!.setLocalState(null);
      clearTimeout(typingTimeout);
    };
  }, [editor, userId, user, provider, ydoc, yTypeName]);
}


'use client';

import { useState, useEffect } from 'react';

interface EditorSettings {
  toolbar: boolean[];
  ui: {
    showHeader: boolean;
    showStatusBar: boolean;
    showInfoBar: boolean;
    showSlashMenu: boolean;
    showEmojiPicker: boolean;
    showFloatingToolbar: boolean;
  };
}

const defaultSettings: EditorSettings = {
  toolbar: new Array(20).fill(true), // all on by default
  ui: {
    showHeader: true,
    showStatusBar: true,
    showInfoBar: true,
    showSlashMenu: true,
    showEmojiPicker: true,
    showFloatingToolbar: false,
  },
};

export type UISettingKey = keyof EditorSettings['ui'];

export function useEditorSettings() {
  const [settings, setSettings] = useState<EditorSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('editorSettings');
    if (saved) {
      setSettings({ ...defaultSettings, ...JSON.parse(saved) });
    } else {
      setSettings(defaultSettings);
    }
  }, []);

  const updateSetting = (
    category: 'toolbar' | 'ui',
    key:  number | UISettingKey,
    value: boolean,
  ) => {
    setSettings((prev) => {
      if (category === 'toolbar') {
        const toolbar = [...prev.toolbar];
        toolbar[key as number] = value;
        return { ...prev, toolbar };
      } else {
        return { ...prev, ui: { ...prev.ui, [key as UISettingKey]: value } };
      }
    });
  };

  const resetToDefault = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('editorSettings');
  };

  return { settings, updateSetting, resetToDefault };
}
