'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type MediaLibraryTier = 'basic' | 'pro' | 'ultra';

interface MediaLibraryContextType {
  tier: MediaLibraryTier;
  setTier: (tier: MediaLibraryTier) => void;
  features: {
    bulkOperations: boolean;
    videoSupport: boolean;
    advancedSearch: boolean;
    aiTagging: boolean;
    cloudSync: boolean;
    analytics: boolean;
    customFolders: boolean;
    shareLinks: boolean;
  };
}

const MediaLibraryContext = createContext<MediaLibraryContextType | undefined>(undefined);

const tierFeatures = {
  basic: {
    bulkOperations: false,
    videoSupport: false,
    advancedSearch: false,
    aiTagging: false,
    cloudSync: false,
    analytics: false,
    customFolders: false,
    shareLinks: false,
  },
  pro: {
    bulkOperations: true,
    videoSupport: true,
    advancedSearch: true,
    aiTagging: false,
    cloudSync: true,
    analytics: false,
    customFolders: true,
    shareLinks: true,
  },
  ultra: {
    bulkOperations: true,
    videoSupport: true,
    advancedSearch: true,
    aiTagging: true,
    cloudSync: true,
    analytics: true,
    customFolders: true,
    shareLinks: true,
  },
};

export function MediaLibraryProvider({ children, initialTier = 'pro' }: { children: ReactNode; initialTier?: MediaLibraryTier }) {
  const [tier, setTier] = useState<MediaLibraryTier>(initialTier);

  const value = {
    tier,
    setTier,
    features: tierFeatures[tier],
  };

  return <MediaLibraryContext.Provider value={value}>{children}</MediaLibraryContext.Provider>;
}

export function useMediaLibrary() {
  const context = useContext(MediaLibraryContext);
  if (!context) {
    throw new Error('useMediaLibrary must be used within MediaLibraryProvider');
  }
  return context;
}