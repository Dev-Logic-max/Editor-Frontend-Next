'use client';

import { NotificationsSettings } from '@/components/settings/NotificationsTab';
import { PreferencesSettings } from '@/components/settings/PreferencesTab';
import { AppearanceSettings } from '@/components/settings/AppearanceTab';
import { SecuritySettings } from '@/components/settings/SecurityTab';
import { EditorSettings } from '@/components/settings/EditorTab';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsPage() {
  const { activeSection } = useSettings();

  return (
    <>
      {activeSection === 'editor' && <EditorSettings />}
      {activeSection === 'notifications' && <NotificationsSettings />}
      {activeSection === 'appearance' && <AppearanceSettings />}
      {activeSection === 'preferences' && <PreferencesSettings />}
      {activeSection === 'security' && <SecuritySettings />}
    </>
  );
}