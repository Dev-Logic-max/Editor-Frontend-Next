'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaUndo, FaRedo, FaEraser, FaHeading, FaQuoteRight, FaCode, FaRobot, FaLink, FaImage, FaTable, FaPrint, FaDownload, FaStrikethrough, FaAlignJustify } from 'react-icons/fa';
import { Network, Smile, Palette, Code, Strikethrough, LinkIcon, Underline, Italic, Bold, Sparkles, Heading, Info, Maximize, Type, FileText, LayoutTemplate, Sun, Moon, Ratio, Shapes } from 'lucide-react';
import { BsBoxSeamFill } from "react-icons/bs";
import { Save, RotateCcw } from 'lucide-react';

import { BorderRadius, ButtonSize, EditorLayout, EditorTheme, ToolbarBgColor, useEditorSettings, type UISettingKey } from '@/hooks/useEditorSettings';
import { MdOutlineDocumentScanner } from 'react-icons/md';

const mainToolbarItems = [
  { id: 'bold', label: 'Bold', icon: FaBold },
  { id: 'italic', label: 'Italic', icon: FaItalic },
  { id: 'underline', label: 'Underline', icon: FaUnderline },
  { id: 'strikethrough', label: 'Strikethrough', icon: FaStrikethrough },
  { id: 'textColor', label: 'Text Color', icon: Palette },
  { id: 'aiMenu', label: 'AI Menu', icon: FaRobot },
  { id: 'heading', label: 'Headings', icon: FaHeading },
  { id: 'emoji', label: 'Emoji', icon: Smile },
  { id: 'bulletList', label: 'Bullet List', icon: FaListUl },
  { id: 'orderedList', label: 'Ordered List', icon: FaListOl },
  { id: 'blockquote', label: 'Blockquote', icon: FaQuoteRight },
  { id: 'codeBlock', label: 'Code Block', icon: FaCode },
  { id: 'alignLeft', label: 'Align Left', icon: FaAlignLeft },
  { id: 'alignCenter', label: 'Align Center', icon: FaAlignCenter },
  { id: 'alignRight', label: 'Align Right', icon: FaAlignRight },
  { id: 'alignJustify', label: 'Align Justify', icon: FaAlignJustify },
  { id: 'link', label: 'Link', icon: FaLink },
  { id: 'image', label: 'Image', icon: FaImage },
  { id: 'table', label: 'Table', icon: FaTable },
  { id: 'mediaLibrary', label: 'Media Library', icon: BsBoxSeamFill },
  { id: 'flowDiagram', label: 'Flow Diagram', icon: Network },
  { id: 'AIAnalysis', label: 'AI Document Analysis', icon: MdOutlineDocumentScanner },
  { id: 'undo', label: 'Undo', icon: FaUndo },
  { id: 'redo', label: 'Redo', icon: FaRedo },
  { id: 'clear', label: 'Clear Format', icon: FaEraser },
  { id: 'print', label: 'Print', icon: FaPrint },
  { id: 'download', label: 'Download', icon: FaDownload },
];

const floatingToolbarItems = [
  { id: 'aiMenu', label: 'AI Menu', icon: Sparkles },
  { id: 'heading', label: 'Headings', icon: Heading },
  { id: 'bold', label: 'Bold', icon: Bold },
  { id: 'italic', label: 'Italic', icon: Italic },
  { id: 'underline', label: 'Underline', icon: Underline },
  { id: 'strikethrough', label: 'Strikethrough', icon: Strikethrough },
  { id: 'codeInline', label: 'Code', icon: Code },
  { id: 'link', label: 'Link', icon: LinkIcon },
  { id: 'textColor', label: 'Text Color', icon: Palette },
];

const MAX_TOOLBAR_BUTTONS = 26;
const MAX_FLOATING_BUTTONS = 12;

interface DocumentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDocumentModal({ isOpen, onClose }: DocumentSettingsModalProps) {
  const { settings, updateSetting, resetToDefault } = useEditorSettings();
  const [activeToolbarView, setActiveToolbarView] = useState<'main' | 'floating'>('main');

  const handleSave = () => {
    localStorage.setItem('editorSettings', JSON.stringify(settings));
    toast.success('Document editor settings saved!');
    onClose();
  };

  const handleReset = () => {
    resetToDefault();
    toast.success('Settings reset to default');
  };

  const UIToggle = ({ keyName, label }: { keyName: UISettingKey; label: string }) => (
    <div className="flex items-center justify-between p-2">
      <Label htmlFor={keyName} className="cursor-pointer text-sm">{label}</Label>
      <Switch
        id={keyName}
        checked={settings.ui[keyName]}
        onCheckedChange={(v) => updateSetting('ui', keyName, v)}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full lg:min-w-4xl max-h-[90vh] overflow-y-auto bg-white p-3 sm:p-4.5 lg:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Document Editor Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="toolbar">
          <TabsList className="grid grid-cols-3 w-full rounded-xl border bg-white/80 backdrop-blur-sm shadow-md">
            <TabsTrigger value="toolbar" className="data-[state=active]:bg-linear-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg">
              Toolbar
            </TabsTrigger>
            <TabsTrigger value="ui" className="data-[state=active]:bg-linear-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              UI Elements
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-linear-to-br data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg">
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Toolbar */}
          <TabsContent value="toolbar" className="mt-4 space-y-6">
            {/* Toolbar Type Toggle */}
            <div className="px-3 py-2 lg:p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border">
              <div className='flex items-center justify-between'>
                <h3 className="font-semibold text-slate-800">Active Toolbar</h3>
                <Badge variant={settings.ui.showFloatingToolbar ? 'default' : 'secondary'} className="text-xs lg:text-sm px-2 lg:px-3 lg:py-1 border border-gray-200">
                  {settings.ui.showFloatingToolbar ? '🎯 Floating' : '📌 Main Toolbar'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">
                {settings.ui.showFloatingToolbar ? 'Floating toolbar appears on text selection' : 'Main toolbar is always visible at the top'}
              </p>
            </div>

            {/* View Selector */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
              <Button
                variant={activeToolbarView === 'main' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveToolbarView('main')}
                className="text-xs"
              >
                📌 Main Toolbar ({mainToolbarItems.length})
              </Button>
              <Button
                variant={activeToolbarView === 'floating' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveToolbarView('floating')}
                className="text-xs"
              >
                🎯 Floating Toolbar ({floatingToolbarItems.length})
              </Button>
            </div>

            {/* Toolbar Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Preview</span>
                <Badge variant="outline" className="text-xs">
                  {activeToolbarView === 'main'
                    ? `${settings.toolbar.filter(Boolean).length} / ${MAX_TOOLBAR_BUTTONS} buttons`
                    : `${settings.floatingToolbar.filter(Boolean).length} / ${MAX_FLOATING_BUTTONS} buttons`
                  }
                </Badge>
              </div>

              <div className={`p-2 lg:p-3 bg-white border lg:border-2 rounded-xl ${activeToolbarView === 'floating' ? 'border-blue-300 shadow-lg' : 'border-gray-200'}`}>
                <div className="flex flex-wrap items-center gap-1 lg:gap-2">
                  {activeToolbarView === 'main' ? (
                    mainToolbarItems
                      .filter((item, idx) => settings.toolbar[idx])
                      .map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <div
                            key={item.id}
                            className="p-1 sm:p-2 rounded-md bg-gray-50 border hover:bg-gray-100 transition-colors"
                            title={item.label}
                          >
                            <IconComponent className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
                          </div>
                        );
                      })
                  ) : (
                    floatingToolbarItems
                      .filter((item, idx) => settings.floatingToolbar[idx])
                      .map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <div
                            key={item.id}
                            className="p-1 sm:p-2 rounded-md bg-gray-50 border hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            title={item.label}
                          >
                            <IconComponent className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
                          </div>
                        );
                      })
                  )}

                  {((activeToolbarView === 'main' && settings.toolbar.filter(Boolean).length === 0) ||
                    (activeToolbarView === 'floating' && settings.floatingToolbar.filter(Boolean).length === 0)) && (
                      <p className="text-sm text-gray-400 italic">No buttons enabled for this toolbar</p>
                    )}
                </div>
              </div>
            </div>

            {/* Button Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-indigo-600">
                  {activeToolbarView === 'main' ? 'Main Toolbar Buttons' : 'Floating Toolbar Buttons'}
                </span>
                <Badge variant="secondary" className='border border-gray-200'>
                  {activeToolbarView === 'main'
                    ? settings.toolbar.filter(Boolean).length
                    : settings.floatingToolbar.filter(Boolean).length
                  } active
                </Badge>
              </div>

              {/* Calculate these once, outside the map */}
              {(() => {
                const currentCount = activeToolbarView === 'main'
                  ? settings.toolbar.filter(Boolean).length
                  : settings.floatingToolbar.filter(Boolean).length;

                const maxReached = activeToolbarView === 'main'
                  ? currentCount >= MAX_TOOLBAR_BUTTONS
                  : currentCount >= MAX_FLOATING_BUTTONS;

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
                      {(activeToolbarView === 'main' ? mainToolbarItems : floatingToolbarItems).map((item, idx) => {
                        const IconComponent = item.icon;
                        const isChecked = activeToolbarView === 'main'
                          ? settings.toolbar[idx]
                          : settings.floatingToolbar[idx];

                        const isDisabled = maxReached && !isChecked; // now maxReached is in scope

                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-2 lg:p-3 rounded-lg border transition-all ${isChecked
                              ? 'bg-blue-50 border-blue-200'
                              : isDisabled
                                ? 'bg-gray-100 border-gray-200 opacity-50'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                          >
                            <Label
                              htmlFor={`tb-${activeToolbarView}-${item.id}`}
                              className={`flex items-center gap-2 text-[10px] sm:text-xs lg:text-sm ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{item.label}</span>
                            </Label>
                            <Switch
                              id={`tb-${activeToolbarView}-${item.id}`}
                              checked={isChecked}
                              disabled={isDisabled}
                              onCheckedChange={(v) => {
                                if (activeToolbarView === 'main') {
                                  updateSetting('toolbar', idx, v);
                                } else {
                                  updateSetting('floatingToolbar', idx, v);
                                }
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Warning if max reached */}
                    {maxReached && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <span className="text-amber-600 text-sm">⚠️</span>
                        <p className="text-xs text-amber-700">
                          Maximum number of buttons reached for {activeToolbarView === 'main' ? 'main toolbar' : 'floating toolbar'}.
                          Disable a button to enable another one.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </TabsContent>

          {/* UI Elements */}
          <TabsContent value="ui" className="mt-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-indigo-600">UI Components</span>
              <Badge variant="secondary" className='border border-gray-200'>
                {Object.values(settings.ui).filter(Boolean).length} active
              </Badge>
            </div>

            {/* Status Bar */}
            <div className="border rounded-lg p-4 bg-linear-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex gap-2 font-semibold text-gray-800">Status Bar
                      {settings.ui.showStatusBar && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                          Active
                        </Badge>
                      )}
                    </span>
                    <Switch
                      id="showStatusBar"
                      checked={settings.ui.showStatusBar}
                      onCheckedChange={(v) => updateSetting('ui', 'showStatusBar', v)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Shows document stats and active users
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                    <span className="px-2 py-0.5 bg-blue-100 border rounded-full">📊 Word count</span>
                    <span className="px-2 py-0.5 bg-blue-100 border rounded-full">📝 Letter count</span>
                    <span className="px-2 py-0.5 bg-blue-100 border rounded-full">👥 Active users</span>
                    <span className="px-2 py-0.5 bg-blue-100 border rounded-full">⏱️ Session time</span>
                    <span className="px-2 py-0.5 bg-blue-100 border rounded-full">📍 Cursor position</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Bar */}
            <div className="border rounded-lg p-4 bg-linear-to-br from-purple-50 to-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex gap-2 font-semibold text-gray-800">Info Bar
                      {settings.ui.showInfoBar && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                          Active
                        </Badge>
                      )}
                    </span>
                    <Switch
                      id="showInfoBar"
                      checked={settings.ui.showInfoBar}
                      onCheckedChange={(v) => updateSetting('ui', 'showInfoBar', v)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Displays document metadata and live activity
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                    <span className="px-2 py-0.5 bg-purple-100 rounded-full border">📅 Created date</span>
                    <span className="px-2 py-0.5 bg-purple-100 rounded-full border">🔄 Last updated</span>
                    <span className="px-2 py-0.5 bg-purple-100 rounded-full border">✏️ Typing indicators</span>
                    <span className="px-2 py-0.5 bg-purple-100 rounded-full border">👤 Document owner</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Toolbar */}
            <div className="border rounded-lg p-4 bg-linear-to-br from-amber-50 to-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex gap-2 font-semibold text-gray-800">Floating Toolbar
                      {settings.ui.showFloatingToolbar && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                          Active
                        </Badge>
                      )}
                    </span>
                    <Switch
                      id="showFloatingToolbar"
                      checked={settings.ui.showFloatingToolbar}
                      onCheckedChange={(v) => updateSetting('ui', 'showFloatingToolbar', v)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Quick formatting toolbar on text selection
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                    <span className="px-2 py-0.5 bg-amber-100 border rounded-full">🤖 AI Menu</span>
                    <span className="px-2 py-0.5 bg-amber-100 border rounded-full">📝 Bold/Italic</span>
                    <span className="px-2 py-0.5 bg-amber-100 border rounded-full">🔗 Link</span>
                    <span className="px-2 py-0.5 bg-amber-100 border rounded-full">💻 Code</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slash Commands */}
            <div className="border rounded-lg p-4 bg-linear-to-br from-green-50 to-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex gap-2 font-semibold text-gray-800">Slash Commands
                      {settings.ui.showSlashMenu && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                          Active
                        </Badge>
                      )}
                    </span>
                    <Switch
                      id="showSlashMenu"
                      checked={settings.ui.showSlashMenu}
                      onCheckedChange={(v) => updateSetting('ui', 'showSlashMenu', v)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Type "/" to insert blocks and elements
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                    <span className="px-2 py-0.5 bg-green-100 border rounded-full">📋 Headings</span>
                    <span className="px-2 py-0.5 bg-green-100 border rounded-full">📝 Lists</span>
                    <span className="px-2 py-0.5 bg-green-100 border rounded-full">🖼️ Media</span>
                    <span className="px-2 py-0.5 bg-green-100 border rounded-full">💻 Code blocks</span>
                    <span className="px-2 py-0.5 bg-green-100 border rounded-full">🎨 Templates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emoji Picker */}
            <div className="border rounded-lg p-4 bg-linear-to-br from-pink-50 to-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <span className="flex gap-2 font-semibold text-gray-800">Emoji Picker
                      {settings.ui.showEmojiPicker && (
                        <Badge variant="outline" className="lg:text-xs bg-green-100 text-green-700 border-green-300">
                          Active
                        </Badge>
                      )}
                    </span>
                    <Switch
                      id="showEmojiPicker"
                      checked={settings.ui.showEmojiPicker}
                      onCheckedChange={(v) => updateSetting('ui', 'showEmojiPicker', v)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Quick access to emoji insertion in toolbar
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                    <span className="px-2 py-0.5 bg-pink-100 border rounded-full">😊 Smileys</span>
                    <span className="px-2 py-0.5 bg-pink-100 border rounded-full">🎉 Symbols</span>
                    <span className="px-2 py-0.5 bg-pink-100 border rounded-full">🐱 Animals</span>
                    <span className="px-2 py-0.5 bg-pink-100 border rounded-full">🍕 Food</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="mt-6 p-4 bg-linear-to-r from-indigo-100 to-purple-100 rounded-lg border-2 border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-1 lg:mb-2">💡 Pro Tip</h4>
              <p className="text-xs lg:text-sm text-indigo-800">
                Disable unused UI elements to create a cleaner, more focused writing environment.
                Changes apply instantly across all your documents.
              </p>
            </div>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="mt-4 space-y-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-indigo-600">Editor Appearance</span>
              <Badge variant="secondary">Customize your workspace</Badge>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Ratio className="w-4 h-4" />
                Button Size
                <Badge variant="secondary">{settings.appearance.buttonSize}</Badge>
              </h4>

              <p className="text-xs text-gray-600">
                Choose the size of toolbar buttons. Smaller sizes fit more buttons on screen.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                {/* Extra Small */}
                <div
                  onClick={() => updateSetting('appearance', 'buttonSize', ButtonSize.ExtraSmall)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${settings.appearance.buttonSize === ButtonSize.ExtraSmall
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-6 h-6 bg-indigo-200 rounded flex items-center justify-center">
                        <FaBold className="w-3 h-3 text-indigo-700" />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">Extra Small</span>
                    <span className="text-[10px] text-gray-500 font-mono">24px × 24px</span>
                    {settings.appearance.buttonSize === ButtonSize.ExtraSmall && (
                      <Badge className="bg-indigo-600 text-white text-xs">Active</Badge>
                    )}
                  </div>
                </div>

                {/* Small */}
                <div
                  onClick={() => updateSetting('appearance', 'buttonSize', ButtonSize.Small)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${settings.appearance.buttonSize === ButtonSize.Small
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-7 h-7 bg-blue-200 rounded flex items-center justify-center">
                        <FaBold className="w-3.5 h-3.5 text-blue-700" />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">Small</span>
                    <span className="text-[10px] text-gray-500 font-mono">28px × 28px</span>
                    {settings.appearance.buttonSize === ButtonSize.Small && (
                      <Badge className="bg-blue-600 text-white text-xs">Active</Badge>
                    )}
                  </div>
                </div>

                {/* Medium */}
                <div
                  onClick={() => updateSetting('appearance', 'buttonSize', ButtonSize.Medium)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${settings.appearance.buttonSize === ButtonSize.Medium
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-8 h-8 bg-purple-200 rounded flex items-center justify-center">
                        <FaBold className="w-4 h-4 text-purple-700" />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">Medium</span>
                    <span className="text-[10px] text-gray-500 font-mono">32px × 32px</span>
                    {settings.appearance.buttonSize === ButtonSize.Medium ? (
                      <Badge className="bg-purple-600 text-white text-xs">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-300">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Large */}
                <div
                  onClick={() => updateSetting('appearance', 'buttonSize', ButtonSize.Large)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${settings.appearance.buttonSize === ButtonSize.Large
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-10 h-10 bg-green-200 rounded flex items-center justify-center">
                        <FaBold className="w-5 h-5 text-green-700" />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">Large</span>
                    <span className="text-[10px] text-gray-500 font-mono">40px × 40px</span>
                    {settings.appearance.buttonSize === ButtonSize.Large && (
                      <Badge className="bg-green-600 text-white text-xs">Active</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar Background Color */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Toolbar Background Color
                <Badge variant="secondary">{settings.appearance.toolbarBgColor}</Badge>
              </h4>

              <p className="text-xs text-gray-600">
                Choose a background color for your toolbar to match your workspace style.
              </p>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
                {/* White */}
                <div
                  onClick={() => updateSetting('appearance', 'toolbarBgColor', ToolbarBgColor.White)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.toolbarBgColor === ToolbarBgColor.White
                    ? 'border-gray-500 shadow-md ring-2 ring-gray-300'
                    : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-sm"></div>
                    <span className="text-xs font-semibold text-gray-800">White</span>
                    {settings.appearance.toolbarBgColor === ToolbarBgColor.White && (
                      <Badge className="bg-gray-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Gray */}
                <div
                  onClick={() => updateSetting('appearance', 'toolbarBgColor', ToolbarBgColor.Gray)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.toolbarBgColor === ToolbarBgColor.Gray
                    ? 'border-gray-500 shadow-md ring-2 ring-gray-300'
                    : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 border-2 border-gray-300 rounded-lg shadow-sm"></div>
                    <span className="text-xs font-semibold text-gray-800">Gray</span>
                    {settings.appearance.toolbarBgColor === ToolbarBgColor.Gray && (
                      <Badge className="bg-gray-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Blue */}
                <div
                  onClick={() => updateSetting('appearance', 'toolbarBgColor', ToolbarBgColor.Blue)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.toolbarBgColor === ToolbarBgColor.Blue
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm"></div>
                    <span className="text-xs font-semibold text-gray-800">Blue</span>
                    {settings.appearance.toolbarBgColor === ToolbarBgColor.Blue && (
                      <Badge className="bg-blue-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Purple */}
                <div
                  onClick={() => updateSetting('appearance', 'toolbarBgColor', ToolbarBgColor.Purple)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.toolbarBgColor === ToolbarBgColor.Purple
                    ? 'border-purple-500 shadow-md ring-2 ring-purple-300'
                    : 'border-gray-200 hover:border-purple-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-purple-50 border-2 border-purple-300 rounded-lg shadow-sm"></div>
                    <span className="text-xs font-semibold text-gray-800">Purple</span>
                    {settings.appearance.toolbarBgColor === ToolbarBgColor.Purple && (
                      <Badge className="bg-purple-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Green */}
                <div
                  onClick={() => updateSetting('appearance', 'toolbarBgColor', ToolbarBgColor.Green)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.toolbarBgColor === ToolbarBgColor.Green
                    ? 'border-green-500 shadow-md ring-2 ring-green-300'
                    : 'border-gray-200 hover:border-green-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-green-50 border-2 border-green-300 rounded-lg shadow-sm"></div>
                    <span className="text-xs font-semibold text-gray-800">Green</span>
                    {settings.appearance.toolbarBgColor === ToolbarBgColor.Green && (
                      <Badge className="bg-green-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Amber */}
                <div
                  onClick={() => updateSetting('appearance', 'toolbarBgColor', ToolbarBgColor.Amber)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.toolbarBgColor === ToolbarBgColor.Amber
                    ? 'border-amber-500 shadow-md ring-2 ring-amber-300'
                    : 'border-gray-200 hover:border-amber-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-amber-50 border-2 border-amber-300 rounded-lg shadow-sm"></div>
                    <span className="text-xs font-semibold text-gray-800">Amber</span>
                    {settings.appearance.toolbarBgColor === ToolbarBgColor.Amber && (
                      <Badge className="bg-amber-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Rose */}
                <div
                  onClick={() => updateSetting('appearance', 'toolbarBgColor', ToolbarBgColor.Rose)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.toolbarBgColor === ToolbarBgColor.Rose
                    ? 'border-rose-500 shadow-md ring-2 ring-rose-300'
                    : 'border-gray-200 hover:border-rose-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-rose-50 border-2 border-rose-300 rounded-lg shadow-sm"></div>
                    <span className="text-xs font-semibold text-gray-800">Rose</span>
                    {settings.appearance.toolbarBgColor === ToolbarBgColor.Rose && (
                      <Badge className="bg-rose-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Shapes className="w-4 h-4" />
                Border Radius
                <Badge variant="secondary">rounded-{settings.appearance.borderRadius}</Badge>
              </h4>

              <p className="text-xs text-gray-600">
                Adjust the roundness of toolbar corners and buttons.
              </p>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
                <div
                  onClick={() => updateSetting('appearance', 'borderRadius', BorderRadius.None)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.borderRadius === BorderRadius.None
                    ? 'border-indigo-500 shadow-md ring-2 ring-indigo-300'
                    : 'border-gray-200 hover:border-indigo-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-linear-to-br from-indigo-100 to-indigo-200 border-2 border-indigo-400 rounded-none"></div>
                    <span className="text-xs font-semibold text-gray-800">None</span>
                    <span className="text-[9px] text-gray-500">0px</span>
                    {settings.appearance.borderRadius === BorderRadius.None && (
                      <Badge className="bg-indigo-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Small */}
                <div
                  onClick={() => updateSetting('appearance', 'borderRadius', BorderRadius.Small)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.borderRadius === BorderRadius.Small
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-blue-200 border-2 border-blue-400 rounded-sm"></div>
                    <span className="text-xs font-semibold text-gray-800">Small</span>
                    <span className="text-[9px] text-gray-500">2px</span>
                    {settings.appearance.borderRadius === BorderRadius.Small && (
                      <Badge className="bg-blue-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Medium */}
                <div
                  onClick={() => updateSetting('appearance', 'borderRadius', BorderRadius.Medium)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.borderRadius === BorderRadius.Medium
                    ? 'border-purple-500 shadow-md ring-2 ring-purple-300'
                    : 'border-gray-200 hover:border-purple-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-linear-to-br from-purple-100 to-purple-200 border-2 border-purple-400 rounded-md"></div>
                    <span className="text-xs font-semibold text-gray-800">Medium</span>
                    <span className="text-[9px] text-gray-500">6px</span>
                    {settings.appearance.borderRadius === BorderRadius.Medium && (
                      <Badge className="bg-purple-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Large */}
                <div
                  onClick={() => updateSetting('appearance', 'borderRadius', BorderRadius.Large)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.borderRadius === BorderRadius.Large
                    ? 'border-green-500 shadow-md ring-2 ring-green-300'
                    : 'border-gray-200 hover:border-green-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-linear-to-br from-green-100 to-green-200 border-2 border-green-400 rounded-lg"></div>
                    <span className="text-xs font-semibold text-gray-800">Large</span>
                    <span className="text-[9px] text-gray-500">8px</span>
                    {settings.appearance.borderRadius === BorderRadius.Large && (
                      <Badge className="bg-green-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Extra Large */}
                <div
                  onClick={() => updateSetting('appearance', 'borderRadius', BorderRadius.ExtraLarge)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.borderRadius === BorderRadius.ExtraLarge
                    ? 'border-amber-500 shadow-md ring-2 ring-amber-300'
                    : 'border-gray-200 hover:border-amber-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-linear-to-br from-amber-100 to-amber-200 border-2 border-amber-400 rounded-xl"></div>
                    <span className="text-xs font-semibold text-gray-800">XL</span>
                    <span className="text-[9px] text-gray-500">12px</span>
                    {settings.appearance.borderRadius === BorderRadius.ExtraLarge && (
                      <Badge className="bg-amber-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* 2XL */}
                <div
                  onClick={() => updateSetting('appearance', 'borderRadius', BorderRadius.ExtraLarge2)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.borderRadius === BorderRadius.ExtraLarge2
                    ? 'border-rose-500 shadow-md ring-2 ring-rose-300'
                    : 'border-gray-200 hover:border-rose-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-linear-to-br from-rose-100 to-rose-200 border-2 border-rose-400 rounded-2xl"></div>
                    <span className="text-xs font-semibold text-gray-800">2XL</span>
                    <span className="text-[9px] text-gray-500">16px</span>
                    {settings.appearance.borderRadius === BorderRadius.ExtraLarge2 && (
                      <Badge className="bg-rose-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>

                {/* Full */}
                <div
                  onClick={() => updateSetting('appearance', 'borderRadius', BorderRadius.Full)}
                  className={`relative border-2 rounded-xl p-3 cursor-pointer transition-all ${settings.appearance.borderRadius === BorderRadius.Full
                    ? 'border-pink-500 shadow-md ring-2 ring-pink-300'
                    : 'border-gray-200 hover:border-pink-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-linear-to-br from-pink-100 to-pink-200 border-2 border-pink-400 rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-800">Full</span>
                    <span className="text-[9px] text-gray-500">∞</span>
                    {settings.appearance.borderRadius === BorderRadius.Full && (
                      <Badge className="bg-pink-600 text-white text-[10px]">✓</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Selection */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4" />
                Editor Layout
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Choose how your editor is displayed on the screen
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4">
                {/* Document Layout */}
                <div
                  onClick={() => updateSetting('appearance', 'layout', EditorLayout.Document)}
                  className={`relative border-2 rounded-xl p-2 lg:p-4 cursor-pointer transition-all ${settings.appearance.layout === EditorLayout.Document
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold text-gray-800">Document Mode</span>
                    </div>
                    {settings.appearance.layout === EditorLayout.Document && (
                      <Badge className="bg-indigo-600 text-white">Active</Badge>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-full"></div>
                      <div className="h-32 bg-linear-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">Content Area</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600">
                    Clean, focused layout with rounded borders. Perfect for writing documents and articles.
                  </p>
                </div>

                {/* Editor Layout */}
                <div
                  onClick={() => updateSetting('appearance', 'layout', EditorLayout.Editor)}
                  className={`relative border-2 rounded-xl p-2 lg:p-4 cursor-pointer transition-all ${settings.appearance.layout === EditorLayout.Editor
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-800">Editor Mode</span>
                    </div>
                    {settings.appearance.layout === EditorLayout.Editor && (
                      <Badge className="bg-purple-600 text-white">Active</Badge>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="bg-white border border-gray-200 rounded-none p-3 mb-3">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 w-full"></div>
                      <div className="h-32 bg-linear-to-br from-gray-50 to-white border-t border-b border-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-400">Content Area</span>
                      </div>
                      <div className="h-4 bg-gray-100 w-full"></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600">
                    Full-width layout with sharp edges. Ideal for code editing and technical documentation.
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color Theme
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Select your preferred color scheme
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4">
                {/* Light Theme */}
                <div
                  onClick={() => updateSetting('appearance', 'theme', EditorTheme.Light)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${settings.appearance.theme === EditorTheme.Light
                    ? 'border-yellow-500 bg-yellow-50 shadow-md'
                    : 'border-gray-200 hover:border-yellow-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-gray-800">Light Theme</span>
                    </div>
                    {settings.appearance.theme === EditorTheme.Light && (
                      <Badge className="bg-yellow-600 text-white">Active</Badge>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-400 rounded w-full"></div>
                      <div className="h-2 bg-gray-400 rounded w-5/6"></div>
                      <div className="h-2 bg-gray-400 rounded w-4/6"></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600">
                    Clean and bright interface. Easy on the eyes during daytime.
                  </p>
                </div>

                {/* Dark Theme */}
                <div
                  onClick={() => updateSetting('appearance', 'theme', EditorTheme.Dark)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${settings.appearance.theme === EditorTheme.Dark
                    ? 'border-slate-500 bg-slate-50 shadow-md'
                    : 'border-gray-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-slate-600" />
                      <span className="font-semibold text-gray-800">Dark Theme</span>
                    </div>
                    {settings.appearance.theme === EditorTheme.Dark && (
                      <Badge className="bg-slate-600 text-white">Active</Badge>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-3">
                    <div className="space-y-2">
                      <div className="h-3 bg-white rounded w-3/4"></div>
                      <div className="h-2 bg-slate-400 rounded w-full"></div>
                      <div className="h-2 bg-slate-400 rounded w-5/6"></div>
                      <div className="h-2 bg-slate-400 rounded w-4/6"></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600">
                    Reduces eye strain in low-light environments. Coming soon!
                  </p>

                  <Badge variant="outline" className="mt-2 text-xs bg-amber-100 text-amber-700 border-amber-300">
                    🚧 In Development
                  </Badge>
                </div>
              </div>
            </div>

            {/* Additional Settings Preview */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Coming Soon
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3">
                <div className="p-3 border-2 border-dashed rounded-lg text-center bg-gray-50">
                  <Type className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-medium text-gray-600">Custom Fonts</p>
                </div>
                <div className="p-3 border-2 border-dashed rounded-lg text-center bg-gray-50">
                  <Palette className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-medium text-gray-600">Color Schemes</p>
                </div>
                <div className="p-3 border-2 border-dashed rounded-lg text-center bg-gray-50">
                  <Maximize className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-medium text-gray-600">Spacing Options</p>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="p-4 bg-linear-to-r from-blue-100 to-indigo-100 rounded-lg border-2 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                About Themes
              </h4>
              <p className="text-xs lg:text-sm text-blue-800">
                Your appearance settings are saved automatically and will persist across all your editing sessions.
                Dark theme support is currently in development and will be available soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 flex justify-between">
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 text-white">
            <Save className="w-4 h-4" />
            Save & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}