import { Editor } from '@tiptap/react';
import toast from 'react-hot-toast';

import { uploadImage, uploadVideo, deleteImage, deleteVideo } from '@/lib/api/uploads';
import { addMediaToDocument, removeMediaFromDocument, renameMedia } from '@/lib/api/documents';

export interface MediaItem {
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: Date;
}

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

export const isImageInDocument = (editor: Editor | null, imageUrl: string): boolean => {
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

export const removeImageFromDocument = (editor: Editor | null, imageUrl: string): boolean => {
  if (!editor) return false;

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

  return found;
};

export const insertImageToEditor = (editor: Editor | null, imageUrl: string): void => {
  if (!editor) {
    toast.error('Editor not available');
    return;
  }

  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;

  editor.chain().focus().setImage({ src: fullUrl }).run();
  toast.success('✅ Image inserted!');
};

export const handleMediaUpload = async (
  files: FileList,
  documentId: string
): Promise<MediaItem[]> => {
  const uploadedFiles: MediaItem[] = [];

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
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 25MB for videos)`);
        continue;
      }
      uploadResponse = await uploadVideo(file);
    } else {
      toast.error(`${file.name} is not a supported file type`);
      continue;
    }

    const { filename, originalName, url, size } = uploadResponse;

    await addMediaToDocument(documentId, {
      filename,
      originalName, // ✅ Include originalName
      url,
      type,
      size,
    });

    uploadedFiles.push({
      filename,
      originalName,
      url,
      type,
      size,
      uploadedAt: new Date(),
    });
  }

  return uploadedFiles;
};

export const handleMediaRename = async (
  documentId: string,
  filename: string,
  newName: string
): Promise<void> => {
  await renameMedia(documentId, filename, newName);
};

export const handleMediaDelete = async (
  filename: string,
  documentId: string,
  mediaUrl: string,
  mediaType: 'image' | 'video' | 'document',
  editor: Editor | null
): Promise<void> => {
  if (mediaType === 'video') {
    await deleteVideo(filename);
  } else {
    await deleteImage(filename);
  }

  await removeMediaFromDocument(documentId, filename);
  
  if (editor && removeImageFromDocument(editor, mediaUrl)) {
    toast.success('🗑️ Image removed from document');
  }
};