'use client';

import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { MotionDiv } from '@/components/common/MotionDiv';
import { Header } from '@/components/layout/Header';

import { SettingsProvider } from '@/contexts/SettingsContext';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <Header />
      <main className="mx-auto px-2 md:px-6 py-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <SettingsSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border p-6 md:p-8">
                {children}
              </div>
            </div>
          </div>
        </MotionDiv>
      </main>
    </SettingsProvider>
  );
}