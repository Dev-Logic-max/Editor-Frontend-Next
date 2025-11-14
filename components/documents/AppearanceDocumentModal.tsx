'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useEditorSettings, EditorLayout, EditorTheme } from '@/hooks/useEditorSettings';

import { FiSun, FiMoon, FiCheck, FiFileText, FiMonitor } from 'react-icons/fi'; 
import toast from 'react-hot-toast';

interface DocumentAppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppearanceDocumentModal({ isOpen, onClose }: DocumentAppearanceModalProps) {
  const { settings, updateSetting } = useEditorSettings();

  // Layout Options
  const layouts = [
    {
      id: EditorLayout.Document,
      label: 'Document Layout',
      icon: FiFileText,
      description: 'Full-page, paper-like view',
    },
    {
      id: EditorLayout.Editor,
      label: 'Editor Layout',
      icon: FiMonitor,
      description: 'Compact, focused editor',
    },
  ];

  // Theme Options
  const themes = [
    {
      id: EditorTheme.Light,
      label: 'Light',
      icon: FiSun,
      preview: 'bg-white text-gray-800 border-gray-300',
      description: 'Clean and bright',
    },
    {
      id: EditorTheme.Dark,
      label: 'Dark',
      icon: FiMoon,
      preview: 'bg-gray-900 text-gray-100 border-gray-700',
      description: 'Easy on the eyes',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editor Appearance</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">

          {/* Layout Section */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Layout</h3>
            <div className="space-y-3">
              {layouts.map((l) => {
                const Icon = l.icon;
                const isActive = settings.appearance.layout === l.id;

                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      updateSetting('appearance', 'layout', l.id);
                      toast.success(`Layout: ${l.label}`);
                    }}
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all
                      ${isActive ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <Icon className="w-6 h-6 text-indigo-600" />
                    <div className="text-left flex-1">
                      <p className="font-medium flex items-center gap-2">
                        {l.label}
                        {isActive && <FiCheck className="w-4 h-4 text-indigo-600" />}
                      </p>
                      <p className="text-sm text-gray-500">{l.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Section */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => {
                const Icon = t.icon;
                const isActive = settings.appearance.theme === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      updateSetting('appearance', 'theme', t.id);
                      toast.success(`Theme: ${t.label}`);
                    }}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                      ${isActive ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <div className={`w-12 h-12 rounded-lg ${t.preview} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-medium flex items-center gap-1">
                      {t.label}
                      {isActive && <FiCheck className="w-4 h-4 text-indigo-600" />}
                    </p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}