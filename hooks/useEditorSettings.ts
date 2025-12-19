'use client';

import { useState, useEffect } from 'react';

export enum EditorLayout {
  Document = 'document',
  Editor = 'editor',
}

export enum EditorTheme {
  Light = 'light',
  Dark = 'dark',
}

interface EditorSettings {
  toolbar: boolean[];
  floatingToolbar: boolean[];
  ui: {
    showStatusBar: boolean;
    showInfoBar: boolean;
    showSlashMenu: boolean;
    showEmojiPicker: boolean;
    showFloatingToolbar: boolean;
  };
  appearance: {
    layout: EditorLayout;
    theme: EditorTheme;
  };
}

const defaultSettings: EditorSettings = {
  toolbar: new Array(20).fill(true),
  floatingToolbar: new Array(8).fill(true), 
  ui: {
    showStatusBar: true,
    showInfoBar: true,
    showSlashMenu: true,
    showEmojiPicker: true,
    showFloatingToolbar: false,
  },
  appearance: {
    layout: EditorLayout.Document,
    theme: EditorTheme.Light,
  },
};

export type UISettingKey = keyof EditorSettings['ui'];

export function useEditorSettings() {
  const [settings, setSettings] = useState<EditorSettings>(defaultSettings);

  // Load once on mount
  useEffect(() => {
    const saved = localStorage.getItem('editorSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.warn('Failed to parse editorSettings', e);
        setSettings(defaultSettings);
      }
    } else {
      setSettings(defaultSettings);
    }
  }, []);

  // Listen to changes from other tabs OR same tab via custom event
  useEffect(() => {
    const handleChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e && e.key !== 'editorSettings') return;

      const saved = localStorage.getItem('editorSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings({ ...defaultSettings, ...parsed });
        } catch { }
      } else {
        setSettings(defaultSettings);
      }
    };

    window.addEventListener('storage', handleChange as EventListener);
    window.addEventListener('editorSettings:change', handleChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleChange as EventListener);
      window.removeEventListener('editorSettings:change', handleChange as EventListener);
    };
  }, []);

  const updateSetting = (
    category: 'toolbar' | 'floatingToolbar' | 'ui' | 'appearance',
    key: string | number,
    value: any,
  ) => {
    setSettings((prev) => {
      let newSettings: EditorSettings = { ...prev };

      // Update toolbar (array of booleans)
      if (category === 'toolbar' && typeof key === 'number') {
        const toolbar = [...prev.toolbar];
        toolbar[key as number] = value as boolean;
        newSettings.toolbar = toolbar;
      }

      // Update floating toolbar (array of booleans)
      else if (category === 'floatingToolbar' && typeof key === 'number') {
        const floatingToolbar = [...prev.floatingToolbar];
        floatingToolbar[key as number] = value as boolean;
        newSettings.floatingToolbar = floatingToolbar;
      }

      // Update UI toggles (showHeader, etc.)
      else if (category === 'ui') {
        newSettings.ui = { ...prev.ui, [key]: value };
      }

      // Update appearance (layout or theme)
      else if (category === 'appearance') {
        newSettings.appearance = { ...prev.appearance, [key]: value };
      }

      // Save + trigger instant update in same tab
      localStorage.setItem('editorSettings', JSON.stringify(newSettings));

      // Notify all tabs + same tab
      window.dispatchEvent(new CustomEvent('editorSettings:change'));

      return newSettings;
    });
  };

  const resetToDefault = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('editorSettings');
    window.dispatchEvent(new CustomEvent('editorSettings:change'));
  };

  return { settings, updateSetting, resetToDefault };
}