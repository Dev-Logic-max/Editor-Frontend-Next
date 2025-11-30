'use client';

import { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { X, Upload, Trash2, Image as ImageIcon, Search, FolderOpen, Info, Video, FileText, Settings } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import toast from 'react-hot-toast';
import { useMediaStore } from '@/stores/mediaStore';
import { getDocumentMedia } from '@/lib/api/documents';
import { handleMediaUpload, handleMediaDelete, isImageInDocument, removeImageFromDocument, insertImageToEditor } from '@/utils/mediaUtils';

import { MediaGridView } from '@/components/media/MediaGridView';
import { MediaPreviewModal } from '@/components/media/MediaPreviewModal';
import { ConfirmDeleteModal } from '@/components/media/ConfirmDeleteModal';
import { LoadingState } from '@/components/media/LoadingState';
import { EmptyState } from '@/components/media/EmptyState';
import { ComingSoonState } from '@/components/media/ComingSoonState';
import { SettingsPanel } from '@/components/media/SettingsPanel';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    documentTitle?: string;
    editor: Editor | null;
}

export function MediaLibraryModal({
    isOpen,
    onClose,
    documentId,
    documentTitle,
    editor
}: MediaLibraryModalProps) {
    const {
        media,
        selectedItems,
        searchQuery,
        loading,
        setMedia,
        addMedia,
        removeMedia,
        toggleSelection,
        clearSelection,
        setSearchQuery,
        setLoading,
        updateMediaName,
    } = useMediaStore();

    const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'documents' | 'settings'>('all');
    const [uploading, setUploading] = useState(false);
    const [previewModal, setPreviewModal] = useState({ isOpen: false, index: 0 });
    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        filename?: string;
        isBulk: boolean;
    }>({ isOpen: false, isBulk: false });

    // Load media when modal opens
    useEffect(() => {
        if (isOpen && documentId) {
            loadMedia();
        }
    }, [isOpen, documentId]);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const response = await getDocumentMedia(documentId);
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

        try {
            const uploadedFiles = await handleMediaUpload(files, documentId);
            uploadedFiles.forEach(file => addMedia(file));
            toast.success(`✅ ${uploadedFiles.length} file(s) uploaded!`);
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (filename: string) => {
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
                    if (mediaItem) {
                        await handleMediaDelete(fname, documentId, mediaItem.url, mediaItem.type, editor);
                    }
                });

                await Promise.all(promises);
                selectedItems.forEach(fname => removeMedia(fname));
                clearSelection();
                toast(`✅ ${selectedItems.size} file(s) deleted permanently`);
            } else if (filename) {
                const mediaItem = media.find(m => m.filename === filename);
                if (mediaItem) {
                    await handleMediaDelete(filename, documentId, mediaItem.url, mediaItem.type, editor);
                    removeMedia(filename);
                    toast.success('File deleted permanently', { icon: '🗑️' });
                }
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Failed to delete');
        }
    };

    const handlePreview = (index: number) => {
        setPreviewModal({ isOpen: true, index });
    };

    const handleInsert = (url: string) => {
        insertImageToEditor(editor, url);
    };

    const handleRemoveFromDoc = (url: string) => {
        if (removeImageFromDocument(editor, url)) {
            toast('🗑️ Removed from document');
        } else {
            toast.error('Image not found in document');
        }
    };

    const handleRename = async (filename: string, newName: string) => {
        try {
            // TODO: Add API call to update name in backend
            updateMediaName(filename, newName);
            toast.success('✅ Name updated!');
        } catch (error) {
            toast.error('Failed to update name');
        }
    };

    const checkImageInDocument = (url: string) => isImageInDocument(editor, url);

    // Filter media based on active tab and search
    const filteredMedia = media.filter(m => {
        if (activeTab === 'images' && m.type !== 'image') return false;
        if (activeTab === 'videos' && m.type !== 'video') return false;
        if (activeTab === 'documents' && m.type !== 'document') return false;

        return m?.originalName?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const stats = {
        all: media.length,
        images: media.filter(m => m.type === 'image').length,
        videos: media.filter(m => m.type === 'video').length,
        documents: media.filter(m => m.type === 'document').length,
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="min-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                    {/* Header */}
                    <DialogHeader className="px-6 py-3 border-b bg-linear-to-r from-purple-50 to-blue-50">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-3">
                                <div className="p-2 bg-linear-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg">
                                    <FolderOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">Media Library</p>
                                    <p className="text-sm font-normal text-gray-600">
                                        {documentTitle ? `Document: ${documentTitle}` : 'Manage your media files'}
                                    </p>
                                </div>
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col gap-0 overflow-hidden">
                        <div className="px-4 py-2 border-b bg-linear-to-r from-gray-50 to-white">
                            <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2">
                                <TabsTrigger
                                    value="all"
                                    className="flex items-center gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                                >
                                    <FolderOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">All</span>
                                    {stats.all > 0 && (
                                        <Badge variant="secondary" className="active:bg-white text-purple-600 border border-purple-400 font-bold">
                                            {stats.all}
                                        </Badge>
                                    )}
                                </TabsTrigger>

                                <TabsTrigger
                                    value="images"
                                    className="flex items-center gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Images</span>
                                    {stats.images > 0 && (
                                        <Badge variant="secondary" className="active:bg-white text-blue-600 border border-blue-400 font-bold">
                                            {stats.images}
                                        </Badge>
                                    )}
                                </TabsTrigger>

                                <TabsTrigger
                                    value="videos"
                                    className="flex items-center gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                                >
                                    <Video className="h-4 w-4" />
                                    <span className="hidden sm:inline">Videos</span>
                                    {stats.videos > 0 && (
                                        <Badge variant="secondary" className="active:bg-white text-purple-600 border border-purple-400 font-bold">
                                            {stats.videos}
                                        </Badge>
                                    )}
                                </TabsTrigger>

                                <TabsTrigger
                                    value="documents"
                                    className="flex items-center gap-2 relative data-[state=active]:bg-linear-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Docs</span>
                                    <Badge className="ml-1 bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs border-none shadow-md">
                                        Pro
                                    </Badge>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="settings"
                                    className="flex items-center gap-2 relative data-[state=active]:bg-linear-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Settings</span>
                                    <Badge className="ml-1 bg-linear-to-r from-green-500 to-emerald-500 text-white text-xs border-none shadow-md animate-pulse">
                                        New
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Toolbar */}
                        {activeTab !== 'settings' && (
                            <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-3 flex-wrap">
                                <div className="flex-1 min-w-[250px] relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-white"
                                    />
                                </div>

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
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
                                    {uploading ? 'Uploading...' : 'Upload Files'}
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
                        )}

                        {/* Content */}
                        <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-6 m-0">
                            {loading ? (
                                <LoadingState />
                            ) : activeTab === 'documents' ? (
                                <ComingSoonState type="documents" />
                            ) : activeTab === 'settings' ? (
                                <SettingsPanel />
                            ) : filteredMedia.length === 0 ? (
                                <EmptyState activeTab={activeTab} />
                            ) : (
                                <MediaGridView
                                    media={filteredMedia}
                                    selectedItems={selectedItems}
                                    onToggleSelection={toggleSelection}
                                    onInsert={handleInsert}
                                    onDelete={handleDelete}
                                    onPreview={handlePreview}
                                    onRemoveFromDoc={handleRemoveFromDoc}
                                    onRename={handleRename}
                                    isImageInDocument={checkImageInDocument}
                                />
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t bg-linear-to-r from-gray-50 to-white flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Info className="h-4 w-4" />
                                {filteredMedia.length} file(s)
                            </span>
                            {selectedItems.size > 0 && (
                                <Badge className="bg-purple-600 text-white">
                                    {selectedItems.size} selected
                                </Badge>
                            )}
                        </div>
                        <span className="text-xs text-gray-500">
                            Images: 10MB max • Videos: 25MB max
                        </span>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modals */}
            <ConfirmDeleteModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, isBulk: false })}
                onConfirm={confirmDeleteAction}
                title={confirmDelete.isBulk ? 'Delete Multiple Files?' : 'Delete File?'}
                message={confirmDelete.isBulk
                    ? `Permanently delete ${selectedItems.size} selected file(s)? They will be removed from storage and all documents.`
                    : 'Permanently delete this file? It will be removed from storage and all documents.'
                }
                itemCount={confirmDelete.isBulk ? selectedItems.size : undefined}
            />

            <MediaPreviewModal
                isOpen={previewModal.isOpen}
                onClose={() => setPreviewModal({ isOpen: false, index: 0 })}
                media={filteredMedia}
                currentIndex={previewModal.index}
                documentTitle={documentTitle}
                onDelete={(filename) => {
                    handleDelete(filename);
                    setPreviewModal({ isOpen: false, index: 0 });
                }}
            />
        </>
    );
}