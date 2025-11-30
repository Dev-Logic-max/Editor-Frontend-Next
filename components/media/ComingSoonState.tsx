'use client';

import { Video, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ComingSoonStateProps {
  type: 'videos' | 'documents';
}

export function ComingSoonState({ type }: ComingSoonStateProps) {
  const config = {
    videos: {
      icon: Video,
      title: 'Video Support',
      description: 'Upload and manage video files directly in your documents',
      features: [
        'MP4, WebM, and MOV support',
        'Video thumbnails and preview',
        'Automatic compression',
        'Embed videos in documents',
      ],
    },
    documents: {
      icon: FileText,
      title: 'Document Support',
      description: 'Attach PDF, Word, and other document files',
      features: [
        'PDF, DOCX, XLSX support',
        'Document previews',
        'Version control',
        'Download and share',
      ],
    },
  };

  const { icon: Icon, title, description, features } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <div className="p-8 bg-linear-to-br from-purple-50 to-blue-50 rounded-full mb-6 relative">
        <Icon className="h-28 w-28 text-purple-400" />
        <Badge className="absolute -top-2 -right-2 bg-linear-to-r from-purple-600 to-blue-600 text-white text-sm px-3 py-1">
          {type === 'videos' ? 'Available!' : 'Pro'}
        </Badge>
      </div>

      <h3 className="text-3xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 text-center max-w-md">{description}</p>

      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 max-w-md w-full">
        <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-purple-600 rounded-full" />
          {type === 'videos' ? 'Fully Supported Features:' : 'Upcoming Features:'}
        </p>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">✓</span>
              </div>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        {type === 'videos' ? (
          <>
            🎉 <span className="font-semibold text-purple-600">Ready to use!</span> Upload your first video
          </>
        ) : (
          <>
            🚀 Expected release: <span className="font-semibold text-purple-600">Q2 2025</span>
          </>
        )}
      </p>
    </div>
  );
}