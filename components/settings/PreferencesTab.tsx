'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

import { Settings, Globe, Keyboard, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export function PreferencesSettings() {
  const [language, setLanguage] = useState('en');
  const [fontSize, setFontSize] = useState('medium');
  const [autoSave, setAutoSave] = useState(true);
  const [spellCheck, setSpellCheck] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('preferences');
    if (saved) {
      const prefs = JSON.parse(saved);
      setLanguage(prefs.language);
      setFontSize(prefs.fontSize);
      setAutoSave(prefs.autoSave);
      setSpellCheck(prefs.spellCheck);
    }
  }, []);

  const save = () => {
    localStorage.setItem('preferences', JSON.stringify({ language, fontSize, autoSave, spellCheck }));
    toast.success('Preferences saved!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Preferences
        </h3>
        <p className="text-gray-600">Fine-tune your editor experience</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold">Language</h4>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold">Font Size</h4>
          </div>
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="autosave" className="flex items-center gap-2 cursor-pointer">
            <Bell className="w-5 h-5 text-green-600" />
            Auto-save every 3 seconds
          </Label>
          <Switch id="autosave" checked={autoSave} onCheckedChange={setAutoSave} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="spellcheck" className="cursor-pointer">
            Enable spell check
          </Label>
          <Switch id="spellcheck" checked={spellCheck} onCheckedChange={setSpellCheck} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} className="bg-linear-to-r from-emerald-500 to-teal-600 text-white">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}