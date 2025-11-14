'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { FileText, Palette, Settings, Shield, Bell } from 'lucide-react';
import clsx from 'clsx';

const menuItems = [
  { id: 'editor', label: 'Editor', icon: FileText },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function SettingsSidebar() {
  const { activeSection, setActiveSection } = useSettings();

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border p-4 top-24">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 px-2">Settings</h2>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                activeSection === item.id
                  ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100',
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}