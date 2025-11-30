'use client';

import { Upload, FolderOpen, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  activeTab: string;
}

export function EmptyState({ activeTab }: EmptyStateProps) {
  const config = {
    all: {
      icon: FolderOpen,
      title: 'No media files',
      description: 'Upload images and videos to get started',
      buttonText: 'Upload Files',
      accept: 'image/*,video/*',
    },
    images: {
      icon: ImageIcon,
      title: 'No images',
      description: 'Upload images to see them here',
      buttonText: 'Upload Images',
      accept: 'image/*',
    },
    videos: {
      icon: Video,
      title: 'No videos',
      description: 'Upload videos to see them here',
      buttonText: 'Upload Videos',
      accept: 'video/*',
    },
    documents: {
      icon: FileText,
      title: 'No documents',
      description: 'Upload documents to see them here',
      buttonText: 'Upload Documents',
      accept: '.pdf,.doc,.docx',
    },
  };

  const current = config[activeTab as keyof typeof config] || config.all;
  const Icon = current.icon;

  const handleClick = () => {
    const input = document.getElementById('media-library-upload') as HTMLInputElement;
    if (input) {
      input.accept = current.accept;
      input.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
      <div className="p-8 bg-linear-to-br from-purple-50 to-blue-50 rounded-full mb-6">
        <Icon className="h-24 w-24 text-purple-400" />
      </div>
      <p className="text-xl font-semibold text-gray-700">{current.title}</p>
      <p className="text-sm mt-2 text-gray-500">{current.description}</p>
      <Button
        onClick={handleClick}
        className="mt-6 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        <Upload className="h-4 w-4 mr-2" />
        {current.buttonText}
      </Button>
    </div>
  );
}