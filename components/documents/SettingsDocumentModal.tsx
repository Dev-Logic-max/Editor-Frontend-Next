'use client';

import { useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

import { AppearanceDocumentModal } from './AppearanceDocumentModal';
import { useEditorSettings, type UISettingKey } from '@/hooks/useEditorSettings';
import { Save, RotateCcw, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const toolbarItems = [
  { id: 'bold', label: 'Bold', icon: 'B' },
  { id: 'italic', label: 'Italic', icon: 'I' },
  { id: 'underline', label: 'Underline', icon: 'U' },
  { id: 'highlight', label: 'Highlight', icon: 'H' },
  { id: 'heading', label: 'Headings', icon: 'H1' },
  { id: 'bulletList', label: 'Bullet List', icon: '• List' },
  { id: 'orderedList', label: 'Ordered List', icon: '1. List' },
  { id: 'blockquote', label: 'Blockquote', icon: '""' },
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

const availableImageModels = [
  { id: 'pollinations-flux', name: 'Pollinations Flux', description: 'FREE - High quality, no API key', provider: 'Pollinations', cost: 'Free' },
  { id: 'pollinations-flux-realism', name: 'Pollinations Flux Realism', description: 'FREE - Photorealistic', provider: 'Pollinations', cost: 'Free' },
  { id: 'pollinations-flux-anime', name: 'Pollinations Flux Anime', description: 'FREE - Anime style', provider: 'Pollinations', cost: 'Free' },
  { id: 'pollinations-turbo', name: 'Pollinations Turbo', description: 'FREE - Fast generation', provider: 'Pollinations', cost: 'Free' },
  { id: 'hf-sdxl', name: 'Stable Diffusion XL', description: 'FREE - Queue-based', provider: 'Hugging Face', cost: 'Free (slower)' },
  { id: 'hf-flux-schnell', name: 'FLUX.1 Schnell', description: 'FREE - Fast, good quality', provider: 'Hugging Face', cost: 'Free (slower)' },
  { id: 'replicate-flux-pro', name: 'FLUX.1 Pro', description: 'Best quality available', provider: 'Replicate', cost: '$0.05/img (50 free)' },
  { id: 'replicate-flux-dev', name: 'FLUX.1 Dev', description: 'High quality, faster', provider: 'Replicate', cost: '$0.003/img' },
];

interface DocumentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDocumentModal({ isOpen, onClose }: DocumentSettingsModalProps) {
  const { settings, updateSetting, resetToDefault } = useEditorSettings();
  const [appearanceModalOpen, setAppearanceModalOpen] = useState(false);
  
  // ✅ State for selected model
  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem('selectedAIModel') || 'pollinations-flux'
  );

  const handleSave = () => {
    localStorage.setItem('editorSettings', JSON.stringify(settings));
    // ✅ Save selected model
    localStorage.setItem('selectedAIModel', selectedModel);
    toast.success('Document editor settings saved!');
    onClose();
  };

const handleReset = () => {
  resetToDefault();
  setSelectedModel('pollinations-flux');
  localStorage.setItem('selectedAIModel', 'pollinations-flux');
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
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Document Editor Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="toolbar" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full rounded-xl border bg-white/80 backdrop-blur-sm shadow-md">
            <TabsTrigger value="model" className="data-[state=active]:bg-linear-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg">
              Choose Model
            </TabsTrigger>
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

          {/* ✅ UPDATED Model Selection Tab */}
          <TabsContent value="model" className="mt-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-700 text-lg">Select Image Model</h4>
              <Badge variant="secondary" className="text-xs">
                Selected: {availableImageModels.find(m => m.id === selectedModel)?.name}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableImageModels.map((model) => {
                const isSelected = selectedModel === model.id;
                
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`
                      relative p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                        : 'border-gray-200 hover:border-indigo-300 bg-white'
                      }
                    `}
                  >
                    {/* ✅ Checkmark for selected model */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-semibold text-slate-800">{model.name}</h5>
                      <Badge className={`text-xs ${isSelected ? 'bg-indigo-500 text-white' : ''}`}>
                        {model.cost}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">{model.description}</p>
                    <p className="text-xs text-gray-400">Provider: {model.provider}</p>
                  </div>
                );
              })}
            </div>

            {/* ✅ Model Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Free models are great for testing. Premium models offer better quality but require API keys.
              </p>
            </div>
          </TabsContent>

          {/* Toolbar */}
          <TabsContent value="toolbar" className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-indigo-600">Toolbar Buttons</span>
              <Badge variant="secondary">{settings.toolbar.filter(Boolean).length} active</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {toolbarItems.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border bg-gray-50 hover:bg-gray-100">
                  <Label htmlFor={`tb-${item.id}`} className="flex items-center gap-2 cursor-pointer text-sm">
                    <span className="font-mono">{item.icon}</span>
                    <span>{item.label}</span>
                  </Label>
                  <Switch
                    id={`tb-${item.id}`}
                    checked={settings.toolbar[idx]}
                    onCheckedChange={(v) => updateSetting('toolbar', idx, v)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* UI Elements */}
          <TabsContent value="ui" className="mt-4 space-y-2">
            <h4 className="font-medium text-slate-700">Show / Hide Elements</h4>
            <UIToggle keyName="showStatusBar" label="Status Bar" />
            <UIToggle keyName="showInfoBar" label="Info Bar" />
            <UIToggle keyName="showFloatingToolbar" label="Floating Toolbar" />
            <UIToggle keyName="showSlashMenu" label="Slash Commands" />
            <UIToggle keyName="showEmojiPicker" label="Emoji Picker" />
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="mt-4">
            <div className="text-center py-8">
              <p className="text-lg font-medium text-gray-700 mb-4">
                Choose how your editor looks
              </p>
              <Button
                onClick={() => setAppearanceModalOpen(true)}
                className="bg-linear-to-r from-indigo-500 to-purple-600 text-white"
              >
                Open Appearance Settings
              </Button>
            </div>
            <div className="p-6 text-center text-gray-500 border-2 border-dashed rounded-xl">
              <p>Custom fonts, themes, and colors coming soon...</p>
            </div>
            <AppearanceDocumentModal
              isOpen={appearanceModalOpen}
              onClose={() => setAppearanceModalOpen(false)}
            />
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