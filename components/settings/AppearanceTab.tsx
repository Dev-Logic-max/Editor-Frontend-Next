'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

import { Moon, Sun, Monitor, Palette, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const themes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

const accentColors = [
  { name: 'Indigo', value: 'indigo' },
  { name: 'Purple', value: 'purple' },
  { name: 'Pink', value: 'pink' },
  { name: 'Emerald', value: 'emerald' },
  { name: 'Amber', value: 'amber' },
  { name: 'Rose', value: 'rose' },
];

export function AppearanceSettings() {
  const [theme, setTheme] = useState('system');
  const [accent, setAccent] = useState('indigo');
  const [animations, setAnimations] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('appearance');
    if (saved) {
      const { theme, accent, animations, highContrast } = JSON.parse(saved);
      setTheme(theme);
      setAccent(accent);
      setAnimations(animations);
      setHighContrast(highContrast);
    }
  }, []);

  const save = () => {
    const settings = { theme, accent, animations, highContrast };
    localStorage.setItem('appearance', JSON.stringify(settings));
    toast.success('Appearance saved!');
    applyTheme(theme);
  };

  const applyTheme = (t: string) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-600" />
          Appearance
        </h3>
        <p className="text-gray-600">Customize how the app looks and feels</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Theme */}
        <Card className="p-6 bg-linear-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <h4 className="font-semibold mb-4 text-indigo-800">Theme</h4>
          <div className="space-y-3">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <label
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                  style={{
                    backgroundColor: theme === t.id ? 'rgba(99, 102, 241, 0.1)' : '',
                    borderColor: theme === t.id ? '#6366f1' : '#e5e7eb',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{t.label}</span>
                  </div>
                  <input
                    type="radio"
                    name="theme"
                    value={t.id}
                    checked={theme === t.id}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                </label>
              );
            })}
          </div>
        </Card>

        {/* Accent Color */}
        <Card className="p-6 bg-linear-to-br from-pink-50 to-rose-50 border-pink-200">
          <h4 className="font-semibold mb-4 text-pink-800">Accent Color</h4>
          <div className="grid grid-cols-3 gap-3">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccent(color.value)}
                className={`p-3 rounded-lg font-medium transition-all ${
                  accent === color.value
                    ? 'ring-2 ring-offset-2 ring-pink-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                style={{
                  backgroundColor: accent === color.value ? `hsl(var(--${color.value}))` : '',
                  color: accent === color.value ? 'white' : '',
                }}
              >
                {color.name}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Toggles */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="animations" className="flex items-center gap-2 cursor-pointer">
              <Sparkles className="w-5 h-5 text-amber-600" />
              Enable Animations
            </Label>
            <Switch
              id="animations"
              checked={animations}
              onCheckedChange={setAnimations}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="contrast" className="cursor-pointer">
              High Contrast Mode
            </Label>
            <Switch
              id="contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} className="bg-linear-to-r from-indigo-500 to-purple-600 text-white">
          Save Appearance
        </Button>
      </div>
    </div>
  );
}