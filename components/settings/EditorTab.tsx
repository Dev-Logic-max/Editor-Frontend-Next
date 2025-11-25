'use client';

import { useEditorSettings, type UISettingKey } from '@/hooks/useEditorSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const toolbarItems = [
  { id: 'bold', label: 'Bold', icon: 'B' },
  { id: 'italic', label: 'Italic', icon: 'I' },
  { id: 'underline', label: 'Underline', icon: 'U' },
  { id: 'highlight', label: 'Highlight', icon: 'H' },
  { id: 'heading', label: 'Headings', icon: 'H1' },
  { id: 'bulletList', label: 'Bullet List', icon: '• List' },
  { id: 'orderedList', label: 'Ordered List', icon: '1. List' },
  { id: 'blockquote', label: 'Blockquote', icon: '“”' },
  { id: 'codeBlock', label: 'Code Block', icon: '</>' },
  { id: 'link', label: 'Link', icon: 'Link' },
  { id: 'image', label: 'Image', icon: 'Image' },
  { id: 'table', label: 'Table', icon: 'Table' },
  { id: 'alignLeft', label: 'Align Left', icon: 'Left' },
  { id: 'alignCenter', label: 'Align Center', icon: 'Center' },
  { id: 'alignRight', label: 'Align Right', icon: 'Right' },
  { id: 'undo', label: 'Undo', icon: 'Undo' },
  { id: 'redo', label: 'Redo', icon: 'Redo' },
  { id: 'clear', label: 'Clear Format', icon: 'Clear' },
  { id: 'print', label: 'Print', icon: 'Print' },
  { id: 'download', label: 'Download', icon: 'Download' },
];

export function EditorSettings() {
  const { settings, updateSetting, resetToDefault } = useEditorSettings();

  const handleSave = () => {
    localStorage.setItem('editorSettings', JSON.stringify(settings));
    toast.success('Editor settings saved!');
  };

  const handleReset = () => {
    resetToDefault();
    toast.success('Settings reset to default');
  };

  const UIToggle = ({ keyName, label }: { keyName: UISettingKey; label: string }) => {
    return (
      <div className="flex items-center justify-between">
        <Label htmlFor={keyName} className="cursor-pointer">{label}</Label>
        <Switch
          id={keyName}
          checked={settings.ui[keyName]}
          onCheckedChange={(checked) => updateSetting('ui', keyName, checked)}
        />
      </div>
    );
  };

  return (
    <Tabs defaultValue="toolbar" className="w-full">
      <TabsList className="grid grid-cols-3 w-full rounded-xl border bg-white/80 backdrop-blur-sm shadow-md mb-6">
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

      <TabsContent value="toolbar" className="space-y-6">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-indigo-600">Toolbar Buttons</span>
          <Badge variant="secondary">{settings.toolbar.filter(Boolean).length} active</Badge>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {toolbarItems.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-all">
              <Label htmlFor={item.id} className="flex items-center gap-2 cursor-pointer">
                <span className="font-mono text-sm">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Label>
              <Switch
                id={item.id}
                checked={settings.toolbar[idx]}
                onCheckedChange={(checked) => updateSetting('toolbar', idx, checked)}
              />
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="ui" className="space-y-6">
        <h4 className="text-lg font-semibold">UI Elements</h4>
        <div className="space-y-4">
          <UIToggle keyName="showStatusBar" label="Show Status Bar" />
          <UIToggle keyName="showInfoBar" label="Show Info Bar" />
          <UIToggle keyName="showFloatingToolbar" label="Floating Toolbar" />
          <UIToggle keyName="showSlashMenu" label="Slash Commands" />
          <UIToggle keyName="showEmojiPicker" label="Emoji Picker" />
        </div>
      </TabsContent>

      <TabsContent value="appearance" className="space-y-6">
        <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-xl">
          <p className="text-lg">Editor theme & colors coming soon...</p>
        </div>
      </TabsContent>

      <Separator className='my-6'/>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </Button>
        <Button onClick={handleSave} className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 text-white">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </Tabs>
  );
}