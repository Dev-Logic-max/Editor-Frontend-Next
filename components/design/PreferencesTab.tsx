'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function PreferencesTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Preferences</h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Email Notifications</Label>
            <p className="text-sm text-gray-500">Receive updates about your documents</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Dark Mode</Label>
            <p className="text-sm text-gray-500">Use dark theme across the app</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}