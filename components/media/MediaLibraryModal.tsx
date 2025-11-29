'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Editor } from '@tiptap/react';

import { X, Upload, Trash2, Image as ImageIcon, ExternalLink, Search, Grid, List, FileText, Video, FolderOpen, Info, Check, Settings } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImagePreviewModal } from '@/components/media/ImagePreviewModal';
import { ConfirmDeleteModal } from '@/components/media/ConfirmDeleteModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import toast from 'react-hot-toast';
import { uploadImage, deleteImage, uploadVideo } from '@/lib/api/uploads';
import { addMediaToDocument, removeMediaFromDocument, getDocumentMedia } from '@/lib/api/documents';

interface MediaItem {
    filename: string;
    url: string;
    size: number,
    type: 'image' | 'video' | 'document';
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
    const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'documents' | 'settings'>('all');
    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        filename?: string;
        isBulk: boolean;
    }>({ isOpen: false, isBulk: false });
    const [previewModal, setPreviewModal] = useState<{
        isOpen: boolean;
        index: number;
    }>({ isOpen: false, index: 0 });


    useEffect(() => {
        if (isOpen && documentId) {
            loadMedia();
        }
    }, [isOpen, documentId]);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const response = await getDocumentMedia(documentId);
            console.log('📚 Media loaded:', response.data);
            setMedia(response.data.data || []);
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

                let type: 'image' | 'video' | 'document' = 'image';
                let uploadResponse: any;

                if (file.type.startsWith('image/')) {
                    type = 'image';

                    if (file.size > 10 * 1024 * 1024) {
                        toast.error(`${file.name} is too large (max 10MB for images)`);
                        continue;
                    }

                    uploadResponse = await uploadImage(file);
                } else if (file.type.startsWith('video/')) {
                    type = 'video';

                    if (file.size > 100 * 1024 * 1024) {
                        toast.error(`${file.name} is too large (max 100MB for videos)`);
                        continue;
                    }

                    uploadResponse = await uploadVideo(file);
                } else {
                    toast.error(`${file.name} is not a supported file type`);
                    continue;
                }

                console.log('📤 Uploading:', file.name);

                const { filename, url, size } = uploadResponse;

                await addMediaToDocument(documentId, {
                    filename,
                    url,
                    type,
                    size,
                });

                uploadedFiles.push({
                    filename,
                    url,
                    type,
                    size,
                    uploadedAt: new Date(),
                });

                console.log('✅ Uploaded:', filename);
            }

            setMedia([...uploadedFiles, ...media]);
            toast.success(`✅ ${uploadedFiles.length} file(s) uploaded!`);
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handlePreview = (index: number) => {
        setPreviewModal({ isOpen: true, index });
    };

    const handleDelete = async (filename: string) => {
        setConfirmDelete({ isOpen: true, filename, isBulk: false });
    };

    const handleBulkDelete = () => {
        if (selectedItems.size === 0) return;
        setConfirmDelete({ isOpen: true, isBulk: true });
    };

    const confirmDeleteAction = async () => {
        const { filename, isBulk } = confirmDelete;

        try {
            if (isBulk) {
                const promises = Array.from(selectedItems).map(async fname => {
                    const mediaItem = media.find(m => m.filename === fname);

                    // ✅ Delete from storage
                    await deleteImage(fname);

                    // ✅ Remove from document's media array
                    await removeMediaFromDocument(documentId, fname);

                    // ✅ Remove from editor if present
                    if (mediaItem && editor) {
                        removeImageFromDocument(mediaItem.url);
                    }
                });

                await Promise.all(promises);
                setMedia(media.filter(m => !selectedItems.has(m.filename)));
                setSelectedItems(new Set());
                toast.success(`✅ ${selectedItems.size} image(s) deleted permanently from storage and document`);
            } else if (filename) {
                const mediaItem = media.find(m => m.filename === filename);

                // ✅ Delete from storage
                await deleteImage(filename);

                // ✅ Remove from document's media array
                await removeMediaFromDocument(documentId, filename);

                // ✅ Remove from editor if present
                if (mediaItem && editor) {
                    removeImageFromDocument(mediaItem.url);
                }

                setMedia(media.filter(m => m.filename !== filename));
                setSelectedItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(filename);
                    return newSet;
                });
                toast.success('✅ Image deleted permanently from storage and document');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Failed to delete');
        }

        // try {
        //     if (isBulk) {
        //         // Bulk delete logic
        //         const promises = Array.from(selectedItems).map(async fname => {
        //             await deleteImage(fname);
        //             await removeMediaFromDocument(documentId, fname);
        //         });

        //         await Promise.all(promises);
        //         setMedia(media.filter(m => !selectedItems.has(m.filename)));
        //         setSelectedItems(new Set());
        //         toast.success(`✅ ${selectedItems.size} image(s) deleted permanently`);
        //     } else if (filename) {
        //         // Single delete logic
        //         await deleteImage(filename);
        //         await removeMediaFromDocument(documentId, filename);
        //         setMedia(media.filter(m => m.filename !== filename));
        //         setSelectedItems(prev => {
        //             const newSet = new Set(prev);
        //             newSet.delete(filename);
        //             return newSet;
        //         });
        //         toast.success('✅ Image deleted permanently');
        //     }
        // } catch (error: any) { }
    };

    const handleDeleteV0 = async (filename: string) => {
        if (!confirm('Delete this image permanently? This will remove it from storage.')) {
            return;
        }

        try {
            await deleteImage(filename);
            await removeMediaFromDocument(documentId, filename);
            setMedia(media.filter(m => m.filename !== filename));
            setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(filename);
                return newSet;
            });
            toast.success('✅ Image deleted permanently');
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Failed to delete image');
        }
    };

    const handleBulkDeleteV0 = async () => {
        if (selectedItems.size === 0) return;

        if (!confirm(`Delete ${selectedItems.size} selected image(s) permanently?`)) {
            return;
        }

        try {
            const promises = Array.from(selectedItems).map(async filename => {
                await deleteImage(filename);
                await removeMediaFromDocument(documentId, filename);
            });

            await Promise.all(promises);
            setMedia(media.filter(m => !selectedItems.has(m.filename)));
            setSelectedItems(new Set());
            toast.success(`✅ ${selectedItems.size} image(s) deleted`);
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

        const fullUrl = imageUrl.startsWith('http')
            ? imageUrl
            : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;

        editor.chain().focus().setImage({ src: fullUrl }).run();
        toast.success('✅ Image inserted!');
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

    const isImageInDocument = (imageUrl: string): boolean => {
        if (!editor) return false;

        const content = editor.getJSON();
        let found = false;

        const searchImages = (node: any): void => {
            if (node.type === 'image' && node.attrs?.src) {
                if (node.attrs.src.includes(imageUrl)) {
                    found = true;
                }
            }
            if (node.content && !found) {
                node.content.forEach(searchImages);
            }
        };

        searchImages(content);
        return found;
    };

    const removeImageFromDocument = (imageUrl: string) => {
        if (!editor) return;

        const fullUrl = imageUrl.startsWith('http')
            ? imageUrl
            : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;

        const { state } = editor;
        const { doc } = state;

        let found = false;
        doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.src) {
                if (node.attrs.src.includes(imageUrl) || node.attrs.src === fullUrl) {
                    editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
                    found = true;
                    return false;
                }
            }
        });

        if (found) {
            toast.success('🗑️ Image removed from document');
        } else {
            toast.error('Image not found in document');
        }
    };

    const filteredMedia = media.filter(m => {
        // if (activeTab !== 'all' && m.type !== activeTab.slice(0, -1)) return false;

        if (activeTab === 'images' && m.type !== 'image') return false;
        if (activeTab === 'videos' && m.type !== 'video') return false;
        if (activeTab === 'documents' && m.type !== 'document') return false;

        return m.filename.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const stats = {
        all: media.length,
        images: media.filter(m => m.type === 'image').length,
        videos: media.filter(m => m.type === 'video').length,
        documents: media.filter(m => m.type === 'document').length,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b bg-linear-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <div className="p-2 bg-linear-to-br from-purple-600 to-blue-600 rounded-lg">
                                <FolderOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p>Media Library</p>
                                <p className="text-sm font-normal text-gray-600">
                                    Manage and reuse all media files for this document
                                </p>
                            </div>
                        </DialogTitle>
                        {/* <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 hover:bg-gray-200">
                            <X className="h-5 w-5" />
                        </Button> */}
                    </div>
                </DialogHeader>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col overflow-hidden gap-0">
                    <div className="p-2 border-b">
                        <TabsList className="grid w-full grid-cols-5 content-center bg-gray-100">
                            <TabsTrigger value="all" className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                All Media
                                <Badge variant="secondary" className="ml-1 bg-white">{stats.all}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="images" className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Images
                                <Badge variant="secondary" className="ml-1 bg-white">{stats.images}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="videos" className="flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                Videos
                                <Badge variant="outline" className="ml-1 text-xs">Soon</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Documents
                                <Badge variant="outline" className="ml-1 text-xs">Pro</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Settings
                                <Badge variant="outline" className="ml-1 text-xs">Soon</Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Toolbar */}
                    <div className={`px-6 py-4 border-b bg-gray-50 flex items-center gap-3 flex-wrap ${activeTab === 'settings' ? 'hidden' : ''}`}>
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search media files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="shrink-0"
                        >
                            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                        </Button>

                        <input
                            type="file"
                            multiple
                            accept="image/*, video/*"
                            onChange={(e) => e.target.files && handleUpload(e.target.files)}
                            className="hidden"
                            id="media-library-upload"
                        />

                        <Button
                            onClick={() => document.getElementById('media-library-upload')?.click()}
                            disabled={uploading}
                            className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shrink-0"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Upload to Library'}
                        </Button>

                        {selectedItems.size > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                className="shrink-0"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete ({selectedItems.size})
                            </Button>
                        )}
                    </div>

                    {/* Content */}
                    <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-6 m-0">
                        {loading ? (
                            <LoadingState />
                        ) : activeTab === 'documents' ? (
                            <ComingSoonState type={activeTab} />
                        ) : activeTab === 'settings' ? (
                            <SettingsPanel activeTab={activeTab} />
                        ) : filteredMedia.length === 0 ? (
                            <EmptyState activeTab={activeTab} />
                        ) : viewMode === 'grid' ? (
                            <GridView
                                media={filteredMedia}
                                selectedItems={selectedItems}
                                onToggleSelection={toggleSelection}
                                onInsert={handleInsertToEditor}
                                onDelete={handleDelete}
                                onRemoveFromDoc={removeImageFromDocument}
                                isImageInDocument={isImageInDocument}
                                onPreview={handlePreview}
                            />
                        ) : (
                            <ListView
                                media={filteredMedia}
                                selectedItems={selectedItems}
                                onToggleSelection={toggleSelection}
                                onInsert={handleInsertToEditor}
                                onDelete={handleDelete}
                                onRemoveFromDoc={removeImageFromDocument}
                                isImageInDocument={isImageInDocument}
                                onPreview={handlePreview}
                            />
                        )}
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-linear-to-r from-gray-50 to-white flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                        <span className="flex items-center gap-1">
                            <Info className="h-4 w-4" />
                            {filteredMedia.length} file(s)
                        </span>
                        {selectedItems.size > 0 && (
                            <span className="text-purple-600 font-semibold">
                                {selectedItems.size} selected
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-500">
                        Max file size: 10MB per image
                    </span>
                </div>
            </DialogContent>

            <ConfirmDeleteModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, isBulk: false })}
                onConfirm={confirmDeleteAction}
                title={confirmDelete.isBulk ? 'Delete Multiple Images?' : 'Delete Image?'}
                message={
                    confirmDelete.isBulk
                        ? `Are you sure you want to permanently delete ${selectedItems.size} selected image(s)? This will remove them from storage and all documents.`
                        : 'Are you sure you want to permanently delete this image? This will remove it from storage and all documents.'
                }
                itemCount={confirmDelete.isBulk ? selectedItems.size : undefined}
            />

            <ImagePreviewModal
                isOpen={previewModal.isOpen}
                onClose={() => setPreviewModal({ isOpen: false, index: 0 })}
                images={filteredMedia}
                currentIndex={previewModal.index}
                onDelete={(filename) => {
                    handleDelete(filename);
                    setPreviewModal({ isOpen: false, index: 0 });
                }}
            />
        </Dialog>
    );
}

function SettingsPanel({ activeTab }: { activeTab: string }) {
  const limits = {
    free: {
      tier: 'Free',
      color: 'from-gray-500 to-gray-600',
      storage: '1 GB',
      images: { maxSize: '10 MB', maxCount: '100 files' },
      videos: { maxSize: '50 MB', maxCount: '10 files' },
      documents: { maxSize: '25 MB', maxCount: '50 files' },
    },
    pro: {
      tier: 'Pro',
      color: 'from-purple-500 to-blue-500',
      storage: '50 GB',
      images: { maxSize: '50 MB', maxCount: 'Unlimited' },
      videos: { maxSize: '500 MB', maxCount: 'Unlimited' },
      documents: { maxSize: '100 MB', maxCount: 'Unlimited' },
    },
    enterprise: {
      tier: 'Enterprise',
      color: 'from-amber-500 to-orange-500',
      storage: 'Unlimited',
      images: { maxSize: 'Unlimited', maxCount: 'Unlimited' },
      videos: { maxSize: '2 GB', maxCount: 'Unlimited' },
      documents: { maxSize: '500 MB', maxCount: 'Unlimited' },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Storage & Limits</h3>
        <p className="text-gray-600">Manage your media storage and upload limits</p>
      </div>

      {/* Current Plan */}
      <div className="p-6 bg-linear-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900">Free Tier</p>
          </div>
          <Button className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Upgrade to Pro
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Storage Used</span>
            <span className="font-semibold text-gray-900">324 MB / 1 GB</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-purple-600 to-blue-600" style={{ width: '32%' }} />
          </div>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(limits).map(([key, plan]) => (
          <div
            key={key}
            className={`p-6 rounded-xl border-2 ${
              key === 'free' ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className={`inline-block px-3 py-1 rounded-full bg-linear-to-r ${plan.color} text-white text-sm font-semibold mb-4`}>
              {plan.tier}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{plan.storage}</p>
                <p className="text-xs text-gray-500">Total Storage</p>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Images</p>
                  <p className="text-sm text-gray-600">Max: {plan.images.maxSize}</p>
                  <p className="text-sm text-gray-600">Limit: {plan.images.maxCount}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Videos</p>
                  <p className="text-sm text-gray-600">Max: {plan.videos.maxSize}</p>
                  <p className="text-sm text-gray-600">Limit: {plan.videos.maxCount}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Documents</p>
                  <p className="text-sm text-gray-600">Max: {plan.documents.maxSize}</p>
                  <p className="text-sm text-gray-600">Limit: {plan.documents.maxCount}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Settings */}
      <div className="p-6 bg-white rounded-xl border">
        <h4 className="font-semibold text-gray-900 mb-4">Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-compress images</p>
              <p className="text-sm text-gray-500">Automatically optimize images on upload</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Generate video thumbnails</p>
              <p className="text-sm text-gray-500">Create preview thumbnails for videos</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading State
function LoadingState() {
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

// ✅ ADD: Coming Soon State
function ComingSoonState({ type }: { type: 'videos' | 'documents' }) {
    const config = {
        videos: {
            icon: Video,
            title: 'Video Support Coming Soon',
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
            title: 'Document Support Coming Soon',
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
        <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="p-8 bg-linear-to-br from-purple-50 to-blue-50 rounded-full mb-6 relative">
                <Icon className="h-24 w-24 text-purple-400" />
                <Badge className="absolute -top-2 -right-2 bg-linear-to-r from-purple-600 to-blue-600 text-white">
                    Soon
                </Badge>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">{description}</p>

            <div className="bg-white rounded-lg p-6 shadow-sm border max-w-md w-full">
                <p className="text-sm font-semibold text-gray-700 mb-3">Upcoming Features:</p>
                <ul className="space-y-2">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <p className="mt-6 text-sm text-gray-500">
                🚀 Expected release: <span className="font-semibold text-purple-600">Coming in next update</span>
            </p>
        </div>
    );
}

// Empty State
function EmptyState({ activeTab }: { activeTab: string }) {
    const icons = {
        all: FolderOpen,
        images: ImageIcon,
        videos: Video,
        documents: FileText,
    };

    const Icon = icons[activeTab as keyof typeof icons] || FolderOpen;

    return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <div className="p-6 bg-linear-to-br from-purple-50 to-blue-50 rounded-full mb-6">
                <Icon className="h-20 w-20 text-purple-400" />
            </div>
            <p className="text-xl font-semibold text-gray-700">No {activeTab === 'all' ? 'media' : activeTab} found</p>
            <p className="text-sm mt-2 text-gray-500">Upload files to get started</p>
            <Button
                onClick={() => document.getElementById('media-library-upload')?.click()}
                className="mt-6 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
            </Button>
        </div>
    );
}

// Grid View
function GridView({
    media,
    selectedItems,
    onToggleSelection,
    onInsert,
    onDelete,
    onPreview,
    onRemoveFromDoc,
    isImageInDocument
}: {
    media: MediaItem[];
    selectedItems: Set<string>;
    onToggleSelection: (filename: string) => void;
    onInsert: (url: string) => void;
    onDelete: (filename: string) => void;
    onPreview: (index: number) => void;
    onRemoveFromDoc: (url: string) => void;
    isImageInDocument: (url: string) => boolean;
}) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((item, index) => {
                const inDocument = isImageInDocument(item.url);

                return (
                    <motion.div
                        key={item.filename}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selectedItems.has(item.filename) ? 'border-purple-500 ring-4 ring-purple-200 shadow-xl' : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'}`}
                        onClick={() => onToggleSelection(item.filename)}
                    >
                        {/* Image */}
                        <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                            {item.type === 'video' ? (
                                <>
                                    <video
                                        src={item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                                        className="w-full h-full object-cover"
                                        muted
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                            <Video className="h-6 w-6 text-gray-800" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                                    alt={item.filename}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPreview(index);
                                    }}
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder-image.jpg';
                                    }}
                                />
                            )}
                        </div>

                        {/* Status Badge */}
                        {inDocument && (
                            <div className="absolute top-3 right-3 z-10">
                                <Badge className="bg-green-500 text-white text-xs shadow-lg flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    In Document
                                </Badge>
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                            {inDocument ? (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFromDoc(item.url);
                                    }}
                                    className="bg-orange-500 hover:bg-orange-600 text-white w-full shadow-lg"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Remove from Doc
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onInsert(item.url);
                                    }}
                                    className="bg-white hover:bg-gray-100 w-full shadow-lg"
                                >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Insert to Doc
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.filename);
                                }}
                                className="w-full shadow-lg"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete Forever
                            </Button>
                        </div>

                        {/* Checkbox */}
                        <div className="absolute top-3 left-3 z-10">
                            <div className={` w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-lg ${selectedItems.has(item.filename) ? 'bg-purple-600 border-purple-600' : 'bg-white/90 border-white backdrop-blur-sm group-hover:border-purple-400'}`}>
                                {selectedItems.has(item.filename) && (
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-3">
                            <p className="text-white text-xs font-semibold truncate">{item.filename}</p>
                            <p className="text-white/80 text-xs mt-0.5">
                                {new Date(item.uploadedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

// List View
function ListView({
    media,
    selectedItems,
    onToggleSelection,
    onInsert,
    onDelete,
    onPreview,
    onRemoveFromDoc,
    isImageInDocument
}: {
    media: MediaItem[];
    selectedItems: Set<string>;
    onToggleSelection: (filename: string) => void;
    onInsert: (url: string) => void;
    onDelete: (filename: string) => void;
    onPreview: (index: number) => void;
    onRemoveFromDoc: (url: string) => void;
    isImageInDocument: (url: string) => boolean;
}) {
    return (
        <div className="divide-y border rounded-lg overflow-hidden bg-white shadow-sm">
            {media.map((item, index) => {
                const inDocument = isImageInDocument(item.url);

                return (
                    <div
                        key={item.filename}
                        className={` flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedItems.has(item.filename) ? 'bg-purple-50' : ''}`}
                        onClick={() => onToggleSelection(item.filename)}
                    >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selectedItems.has(item.filename) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                            {selectedItems.has(item.filename) && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                        </div>

                        {/* Thumbnail */}
                        <div
                            className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview(index);  // ✅ Add preview on click
                            }}
                        >
                            <img
                                src={item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                                alt={item.filename}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 truncate">{item.filename}</p>
                                {inDocument && (
                                    <Badge className="bg-green-500 text-white text-xs shrink-0">
                                        In Document
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500">
                                    {new Date(item.uploadedAt).toLocaleDateString()}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    {item.type}
                                </Badge>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {inDocument ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFromDoc(item.url);
                                    }}
                                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Remove
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onInsert(item.url);
                                    }}
                                >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Insert
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.filename);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}