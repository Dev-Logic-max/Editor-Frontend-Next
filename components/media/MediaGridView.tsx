'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Eye, Trash2, ExternalLink, X, Edit2, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatFileSize } from '@/utils/mediaUtils';

interface MediaItem {
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: Date;
}

interface MediaGridViewProps {
  media: MediaItem[];
  selectedItems: Set<string>;
  onToggleSelection: (filename: string) => void;
  onInsert: (url: string) => void;
  onDelete: (filename: string) => void;
  onPreview: (index: number) => void;
  onRemoveFromDoc: (url: string) => void;
  onRename: (filename: string, newName: string) => void;
  isImageInDocument: (url: string) => boolean;
}

export function MediaGridView({
  media,
  selectedItems,
  onToggleSelection,
  onInsert,
  onDelete,
  onPreview,
  onRemoveFromDoc,
  onRename,
  isImageInDocument,
}: MediaGridViewProps) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleStartEdit = (item: MediaItem) => {
    setEditingName(item.filename);
    setNewName(item.originalName);
  };

  const handleSaveEdit = (filename: string) => {
    if (newName.trim()) {
      onRename(filename, newName.trim());
    }
    setEditingName(null);
  };

  const handleUploadClick = () => {
    const input = document.getElementById('media-library-upload') as HTMLInputElement;
    if (input) { input.click() }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {media.map((item, index) => {
        const inDocument = isImageInDocument(item.url);
        const isEditing = editingName === item.filename;

        return (
          <motion.div
            key={item.filename}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`
              relative group rounded-xl overflow-hidden border-2 transition-all
              ${selectedItems.has(item.filename) 
                ? 'border-purple-500 ring-4 ring-purple-200 shadow-xl' 
                : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
              }
            `}
          >
            {/* Media Display */}
            <div 
              className="aspect-square bg-linear-to-br from-gray-100 to-gray-200 relative overflow-hidden cursor-pointer"
              onClick={() => onPreview(index)}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                  alt={item.originalName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
              )}

              {/* Hover Overlay with Action Buttons */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(index);
                  }}
                  className="bg-white/90 hover:bg-white"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {inDocument ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromDoc(item.url);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsert(item.url);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.filename);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Badge */}
            {inDocument && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-green-500 text-white text-xs shadow-lg">
                  <Check className="h-3 w-3 mr-1" />
                  In Doc
                </Badge>
              </div>
            )}

            {/* Checkbox */}
            <div 
              className="absolute top-2 left-2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelection(item.filename);
              }}
            >
              <div className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-lg cursor-pointer
                ${selectedItems.has(item.filename) 
                  ? 'bg-purple-600 border-purple-600' 
                  : 'bg-white/90 border-white backdrop-blur-sm group-hover:border-purple-400'
                }
              `}>
                {selectedItems.has(item.filename) && (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                )}
              </div>
            </div>

            {/* Info Footer */}
            <div className="p-3 bg-white border-t">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(item.filename);
                      if (e.key === 'Escape') setEditingName(null);
                    }}
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSaveEdit(item.filename)}
                    className="h-7 w-7 p-0"
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-900 truncate flex-1">
                    {item.originalName}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(item)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                <span className="font-medium">{formatFileSize(item.size)}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
      <div
    //   onClick={() => document.getElementById('media-library-upload')?.click()}
      onClick={handleUploadClick}
      className="relative group rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all cursor-pointer bg-linear-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50"
    >
      <div className="aspect-square flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="h-8 w-8 text-white" />
        </div>
        <p className="font-semibold text-gray-700 text-center mb-2">Upload More</p>
        <p className="text-xs text-gray-500 text-center">
          Drag & drop or click to browse
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t">
        <p className="text-xs font-semibold text-gray-600 text-center">
          Images & Videos
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          Max 10MB / 25MB
        </p>
      </div>
    </div>
    </div>
  );
}