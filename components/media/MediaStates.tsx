'use client';

import { motion } from 'framer-motion';
import { FolderOpen, ImageIcon, Video, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-gray-700 font-semibold text-lg">Loading media...</p>
        <p className="text-sm text-gray-500 mt-1">Please wait</p>
      </div>
    </div>
  );
}

export function EmptyState({ activeTab }: { activeTab: string }) {
  const icons = {
    all: FolderOpen,
    images: ImageIcon,
    videos: Video,
  };

  const Icon = icons[activeTab as keyof typeof icons] || FolderOpen;

  return (
    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
      <div className="p-6 bg-linear-to-br from-purple-50 to-blue-50 rounded-full mb-6">
        <Icon className="h-20 w-20 text-purple-400" />
      </div>
      <p className="text-xl font-semibold text-gray-700">
        No {activeTab === 'all' ? 'media' : activeTab} found
      </p>
      <p className="text-sm mt-2 text-gray-500">Upload files to get started</p>
      <Button
        onClick={() => document.getElementById('media-upload')?.click()}
        className="mt-6 bg-linear-to-r from-purple-600 to-blue-600"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>
    </div>
  );
}