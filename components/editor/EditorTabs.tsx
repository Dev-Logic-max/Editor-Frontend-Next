'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorTabsProps {
  openDocuments: { _id: string; title: string }[];
  activeDocumentId: string;
  onSwitch: (docId: string) => void;
  onClose: (docId: string) => void;
}

export function EditorTabs({ openDocuments, activeDocumentId, onSwitch, onClose }: EditorTabsProps) {
  if (!openDocuments || openDocuments.length <= 1) return null; // show only when >1 docs open

  return (
    <div className="border-b bg-gray-100 flex items-center px-2 overflow-x-auto">
      {openDocuments.map((doc) => {
        const isActive = doc._id === activeDocumentId;
        return (
          <div
            key={doc._id}
            onClick={() => onSwitch(doc._id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 cursor-pointer border-b-2 transition-all whitespace-nowrap',
              isActive
                ? 'border-blue-500 bg-white text-blue-600 font-semibold'
                : 'border-transparent hover:bg-gray-200 text-gray-700'
            )}
          >
            <span className="truncate max-w-[150px]">{doc.title || 'Untitled'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(doc._id);
              }}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
