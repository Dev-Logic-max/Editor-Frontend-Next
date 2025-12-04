'use client';

import { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  X, Upload, Trash2, Image as ImageIcon, Search, FolderOpen, 
  Info, Video, FileText, Settings, Users, Globe, Building 
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

import toast from 'react-hot-toast';
import { useMediaProStore } from '@/stores/mediaProStore';
import { getDocumentMedia, getAllUserMedia } from '@/lib/api/documents';
import { handleMediaDelete,  isImageInDocument,  removeImageFromDocument,  insertImageToEditor, handleMediaUploadPro } from '@/utils/mediaUtils';

import { MediaProGridView } from '@/components/media/MediaProGridView';
import { MediaPreviewModal } from '@/components/media/MediaPreviewModal';
import { ConfirmDeleteModal } from '@/components/media/ConfirmDeleteModal';
import { LoadingState } from '@/components/media/LoadingState';
import { EmptyState } from '@/components/media/EmptyState';
import { ComingSoonState } from '@/components/media/ComingSoonState';
import { SettingsPanel } from '@/components/media/SettingsPanel';

interface MediaLibraryProModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle?: string;
  collaborators?: Array<{ _id: string; firstName: string; lastName: string; profilePhoto?: string }>;
  editor: Editor | null;
}

export function MediaLibraryProModal({ 
  isOpen, 
  onClose, 
  documentId, 
  documentTitle,
  collaborators = [],
  editor 
}: MediaLibraryProModalProps) {
  const {
    allMedia,
    selectedItems,
    searchQuery,
    loading,
    viewMode,
    setAllMedia,
    addMedia,
    removeMedia,
    toggleSelection,
    clearSelection,
    setSearchQuery,
    setLoading,
    setViewMode,
    updateMediaName,
  } = useMediaProStore();

  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'documents' | 'collaborators' | 'settings'>('all');
  const [uploading, setUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, index: 0 });
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    filename?: string;
    isBulk: boolean;
  }>({ isOpen: false, isBulk: false });
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, viewMode, documentId]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      if (viewMode === 'all') {
        // ✅ PRO: Load all media from all documents
        const response = await getAllUserMedia();
        setAllMedia(response.data.data || []);
      } else {
        // Standard: Load only current document media
        const response = await getDocumentMedia(documentId);
        setAllMedia(response.data.data || []);
      }
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
      const uploadedFiles = await handleMediaUploadPro(files, documentId);
      uploadedFiles.forEach(file => addMedia({
        ...file,
        documentId,
        documentTitle: documentTitle || 'Untitled',
      }));
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
          const mediaItem = allMedia.find(m => m.filename === fname);
          if (mediaItem) {
            await handleMediaDelete(fname, mediaItem.documentId, mediaItem.url, mediaItem.type, editor);
          }
        });

        await Promise.all(promises);
        selectedItems.forEach(fname => removeMedia(fname));
        clearSelection();
        toast.success(`✅ ${selectedItems.size} file(s) deleted permanently`);
      } else if (filename) {
        const mediaItem = allMedia.find(m => m.filename === filename);
        if (mediaItem) {
          await handleMediaDelete(filename, mediaItem.documentId, mediaItem.url, mediaItem.type, editor);
          removeMedia(filename);
          toast.success('✅ File deleted permanently');
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
      const mediaItem = allMedia.find(m => m.filename === filename);
      if (mediaItem) {
        // TODO: Call API to update
        updateMediaName(filename, newName);
        toast.success('✅ Name updated!');
      }
    } catch (error) {
      toast.error('Failed to update name');
    }
  };

  const checkImageInDocument = (url: string) => isImageInDocument(editor, url);

  // Filter media based on active tab, search, view mode, and collaborator
  const filteredMedia = allMedia.filter(m => {
    // Type filter
    if (activeTab === 'images' && m.type !== 'image') return false;
    if (activeTab === 'videos' && m.type !== 'video') return false;
    if (activeTab === 'documents' && m.type !== 'document') return false;
    
    // Collaborator filter
    if (activeTab === 'collaborators') {
      if (selectedCollaborator && m.uploadedBy?._id !== selectedCollaborator) return false;
    }
    
    // Document filter (only show current document media in document mode)
    if (viewMode === 'document' && m.documentId !== documentId) return false;
    
    // Search filter
    return m?.originalName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = {
    all: allMedia.length,
    images: allMedia.filter(m => m.type === 'image').length,
    videos: allMedia.filter(m => m.type === 'video').length,
    documents: allMedia.filter(m => m.type === 'document').length,
    collaborators: collaborators.length,
  };

  // Group media by collaborator
  const mediaByCollaborator = collaborators.map(collab => ({
    ...collab,
    mediaCount: allMedia.filter(m => m.uploadedBy?._id === collab._id).length,
  }));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="min-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          {/* Header */}
          <DialogHeader className="px-6 py-3 border-b bg-linear-to-r from-purple-50 via-blue-50 to-pink-50">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-purple-600 via-blue-600 to-pink-600 rounded-lg shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">Media Library Pro</p>
                    <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white">
                      PRO
                    </Badge>
                  </div>
                  <p className="text-sm font-normal text-gray-600">
                    {viewMode === 'all' 
                      ? 'All media across your documents' 
                      : `Document: ${documentTitle}`
                    }
                  </p>
                </div>
              </DialogTitle>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border shadow-sm">
                  <Button
                    size="sm"
                    variant={viewMode === 'document' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('document')}
                    className="text-xs"
                  >
                    <Building className="h-3 w-3 mr-1" />
                    This Doc
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'all' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('all')}
                    className="text-xs"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    All Docs
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col gap-0 overflow-hidden">
            <div className="px-4 py-2 border-b bg-linear-to-r from-gray-50 to-white">
              <TabsList className="grid w-full grid-cols-6 bg-transparent gap-2">
                <TabsTrigger 
                  value="all" 
                  className="flex items-center gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">All</span>
                  {stats.all > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-white text-purple-600 font-bold">
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
                    <Badge variant="secondary" className="ml-1 bg-white text-blue-600 font-bold">
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
                    <Badge variant="secondary" className="ml-1 bg-white text-purple-600 font-bold">
                      {stats.videos}
                    </Badge>
                  )}
                </TabsTrigger>

                {/* ✅ NEW: Collaborators Tab */}
                <TabsTrigger 
                  value="collaborators" 
                  className="flex items-center gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                  {stats.collaborators > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-white text-pink-600 font-bold">
                      {stats.collaborators}
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
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Toolbar */}
            {activeTab !== 'settings' && activeTab !== 'collaborators' && (
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
                  accept={
                    activeTab === 'images' ? 'image/*' :
                    activeTab === 'videos' ? 'video/*' :
                    'image/*,video/*'
                  }
                  onChange={(e) => e.target.files && handleUpload(e.target.files)}
                  className="hidden"
                  id="media-library-upload-pro"
                />

                <Button
                  onClick={() => document.getElementById('media-library-upload-pro')?.click()}
                  disabled={uploading}
                  className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 
                    activeTab === 'images' ? 'Upload Images' :
                    activeTab === 'videos' ? 'Upload Videos' :
                    'Upload Files'
                  }
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

            {/* Collaborators Toolbar */}
            {activeTab === 'collaborators' && (
              <div className="px-6 py-4 border-b bg-linear-to-r from-pink-50 to-rose-50">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm font-semibold text-gray-700">Filter by collaborator:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={selectedCollaborator === null ? 'default' : 'outline'}
                      onClick={() => setSelectedCollaborator(null)}
                    >
                      All Team Members
                    </Button>
                    {mediaByCollaborator.map(collab => (
                      <Button
                        key={collab._id}
                        size="sm"
                        variant={selectedCollaborator === collab._id ? 'default' : 'outline'}
                        onClick={() => setSelectedCollaborator(collab._id)}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage 
                            src={collab.profilePhoto ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${collab.profilePhoto}` : undefined} 
                          />
                          <AvatarFallback className="text-xs">
                            {collab.firstName[0]}{collab.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        {collab.firstName}
                        <Badge variant="secondary" className="ml-1">
                          {collab.mediaCount}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
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
              ) : activeTab === 'collaborators' && collaborators.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                  <div className="p-8 bg-linear-to-br from-pink-50 to-rose-50 rounded-full mb-6">
                    <Users className="h-24 w-24 text-pink-400" />
                  </div>
                  <p className="text-xl font-semibold text-gray-700">No Collaborators</p>
                  <p className="text-sm mt-2 text-gray-500">
                    Add collaborators to this document to see their media uploads
                  </p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <EmptyState activeTab={activeTab} />
              ) : (
                <MediaProGridView
                  media={filteredMedia}
                  selectedItems={selectedItems}
                  onToggleSelection={toggleSelection}
                  onInsert={handleInsert}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                  onRemoveFromDoc={handleRemoveFromDoc}
                  onRename={handleRename}
                  isImageInDocument={checkImageInDocument}
                  showDocumentInfo={viewMode === 'all'} // ✅ Show document name in all mode
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
                {viewMode === 'all' && (
                  <Badge variant="outline" className="ml-2">
                    Across all documents
                  </Badge>
                )}
              </span>
              {selectedItems.size > 0 && (
                <Badge className="bg-purple-600 text-white">
                  {selectedItems.size} selected
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-500">
              Pro Plan • Images: 50MB max • Videos: 500MB max
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