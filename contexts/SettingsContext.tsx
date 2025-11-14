'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState('editor');

  return (
    <SettingsContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}