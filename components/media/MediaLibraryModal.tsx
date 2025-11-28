'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Image as ImageIcon, ExternalLink, Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { uploadImage, deleteImage } from '@/lib/api/uploads';
import { addMediaToDocument, removeMediaFromDocument } from '@/lib/api/documents';
import { Editor } from '@tiptap/react';

interface MediaItem {
  filename: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  editor: Editor | null;
}

export function MediaLibraryModal({ isOpen, onClose, documentId, editor }: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Load media from document
  useEffect(() => {
    if (isOpen && documentId) {
      loadMedia();
    }
  }, [isOpen, documentId]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      // This will come from your document data
      // For now, we'll use the document's media field
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      setMedia(data.data?.media || []);
    } catch (error) {
      console.error('Failed to load media:', error);
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    const uploadedFiles: MediaItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Upload to backend
        const data = await uploadImage(file);
        
        // Add to document media
        const mediaItem = {
          filename: data.filename,
          url: data.url,
          type: 'image',
        };
        
        await addMediaToDocument(documentId, mediaItem);
        
        uploadedFiles.push({
          ...mediaItem,
          uploadedAt: new Date(),
        });
      }

      setMedia([...uploadedFiles, ...media]);
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from backend storage
      await deleteImage(filename);
      
      // Remove from document media list
      await removeMediaFromDocument(documentId, filename);
      
      // Update local state
      setMedia(media.filter(m => m.filename !== filename));
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (!confirm(`Delete ${selectedItems.size} selected image(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      for (const filename of Array.from(selectedItems)) {
        await deleteImage(filename);
        await removeMediaFromDocument(documentId, filename);
      }
      
      setMedia(media.filter(m => !selectedItems.has(m.filename)));
      setSelectedItems(new Set());
      toast.success(`${selectedItems.size} image(s) deleted successfully`);
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast.error(error.message || 'Failed to delete images');
    }
  };

  const handleInsertToEditor = (imageUrl: string) => {
    if (!editor) {
      toast.error('Editor not available');
      return;
    }

    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
    editor.chain().focus().setImage({ src: fullUrl }).run();
    toast.success('✅ Image inserted into editor!');
  };

  const toggleSelection = (filename: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(filename)) {
      newSelection.delete(filename);
    } else {
      newSelection.add(filename);
    }
    setSelectedItems(newSelection);
  };

  const filteredMedia = media.filter(m =>
    m.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              Media Library
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
            id="media-library-upload"
          />
          
          <Button
            onClick={() => document.getElementById('media-library-upload')?.click()}
            disabled={uploading}
            className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>

          {selectedItems.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedItems.size})
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
                <p className="text-gray-600">Loading media...</p>
              </div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No media found</p>
              <p className="text-sm">Upload images to get started</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {filteredMedia.map((item) => (
                <motion.div
                  key={item.filename}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`
                    relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer
                    ${selectedItems.has(item.filename) ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300'}
                  `}
                  onClick={() => toggleSelection(item.filename)}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsertToEditor(item.url);
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Insert
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.filename);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Checkbox */}
                  <div className="absolute top-2 left-2">
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                      ${selectedItems.has(item.filename) 
                        ? 'bg-purple-600 border-purple-600' 
                        : 'bg-white border-gray-300 group-hover:border-purple-400'
                      }
                    `}>
                      {selectedItems.has(item.filename) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Filename */}
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">{item.filename}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {filteredMedia.map((item) => (
                <div
                  key={item.filename}
                  className={`
                    flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors
                    ${selectedItems.has(item.filename) ? 'bg-purple-50' : ''}
                  `}
                  onClick={() => toggleSelection(item.filename)}
                >
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                    ${selectedItems.has(item.filename) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}
                  `}>
                    {selectedItems.has(item.filename) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.filename}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsertToEditor(item.url);
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Insert
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.filename);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex items-center justify-between text-sm text-gray-600">
          <span>{filteredMedia.length} image(s)</span>
          {selectedItems.size > 0 && (
            <span>{selectedItems.size} selected</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}