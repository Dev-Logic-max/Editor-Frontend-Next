'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface MediaItem {
  filename: string;
  url: string;
  type: string;
  uploadedAt: Date;
  size?: number; // ✅ ADD size
}

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: MediaItem[];
  currentIndex: number;
  onDelete: (filename: string) => void;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  images,
  currentIndex: initialIndex,
  onDelete,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const currentImage = images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(prev => prev - 1);
      setZoom(1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(prev => prev + 1);
      setZoom(1);
    }
  };

  const handleDownload = async () => {
    try {
      const url = currentImage.url.startsWith('http')
        ? currentImage.url
        : `${process.env.NEXT_PUBLIC_API_URL}${currentImage.url}`;

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = currentImage.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('✅ Image downloaded!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0 overflow-hidden bg-black">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-linear-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="font-semibold text-lg">{currentImage.filename}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-300 mt-1">
                <span>{formatFileSize(currentImage.size)}</span>
                <span>•</span>
                <span>{new Date(currentImage.uploadedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{currentIndex + 1} of {images.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                className="text-white hover:bg-white/20"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                className="text-white hover:bg-white/20"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-white hover:bg-white/20"
              >
                <Download className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(currentImage.filename)}
                className="text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center w-full h-full overflow-hidden p-16">
          <motion.img
            key={currentIndex}
            src={
              currentImage.url.startsWith('http')
                ? currentImage.url
                : `${process.env.NEXT_PUBLIC_API_URL}${currentImage.url}`
            }
            alt={currentImage.filename}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: zoom }}
            transition={{ duration: 0.3 }}
            className="max-w-full max-h-full object-contain"
            style={{ transformOrigin: 'center' }}
          />
        </div>

        {/* Navigation Arrows */}
        {hasPrevious && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Thumbnails */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={img.filename}
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoom(1);
                }}
                className={`
                  shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                  ${idx === currentIndex ? 'border-purple-500 ring-2 ring-purple-300' : 'border-white/30 hover:border-white/60'}
                `}
              >
                <img
                  src={img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_API_URL}${img.url}`}
                  alt={img.filename}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}