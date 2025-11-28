'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { uploadImage } from '@/lib/api/uploads';

interface ImageUploadModalProps {
    editor: Editor | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ImageUploadModal({ editor, isOpen, onClose }: ImageUploadModalProps) {
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Handle URL insertion
    const handleInsertUrl = () => {
        if (!editor || !imageUrl.trim()) {
            toast.error('Please enter a valid URL');
            return;
        }

        editor.chain().focus().setImage({ src: imageUrl }).run();
        toast.success('✅ Image inserted!');
        setImageUrl('');
        onClose();
    };

    // Handle file upload
    const handleFileUpload = async (file: File) => {
        if (!editor) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size should be less than 10MB');
            return;
        }

        setUploading(true);

        // try {
        //     const formData = new FormData();
        //     formData.append('image', file);

        //     // ✅ UPDATED: Call NestJS backend
        //     const token = localStorage.getItem('access_token');
        //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/image`, {
        //         method: 'POST',
        //         headers: {
        //             'Authorization': `Bearer ${token}`,
        //         },
        //         body: formData,
        //     });

        //     if (!response.ok) {
        //         const error = await response.json();
        //         throw new Error(error.message || 'Upload failed');
        //     }

        //     const data = await response.json();
        //     //   const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${data.filename}`;
        //     const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${data.url}`;

        //     // Insert image into editor
        //     editor.chain().focus().setImage({ src: imageUrl }).run();
        //     toast.success('✅ Image uploaded and inserted!');
        //     onClose();
        // } catch (error: any) {
        //     console.error('Upload error:', error);
        //     toast.error(error.message || 'Failed to upload image');
        // } finally {
        //     setUploading(false);
        // }

        try {
            // ✅ Use the API helper
            const data = await uploadImage(file);
            const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${data.url}`;

            // Insert image into editor
            editor.chain().focus().setImage({ src: imageUrl }).run();
            toast.success('✅ Image uploaded and inserted!');
            onClose();
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-purple-600" />
                        Insert Image
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger value="url">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            URL
                        </TabsTrigger>
                    </TabsList>

                    {/* Upload Tab */}
                    <TabsContent value="upload" className="space-y-4">
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
              `}
                        >
                            <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-2">
                                Drag & drop an image here, or click to browse
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                                id="image-upload-input"
                                disabled={uploading}
                            />
                            <label htmlFor="image-upload-input">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={uploading}
                                    className="cursor-pointer"
                                    onClick={() => document.getElementById('image-upload-input')?.click()}
                                >
                                    {uploading ? 'Uploading...' : 'Choose File'}
                                </Button>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">
                                Max size: 5MB • Formats: JPG, PNG, GIF, WebP
                            </p>
                        </div>

                        {uploading && (
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"
                                />
                                Uploading image...
                            </div>
                        )}
                    </TabsContent>

                    {/* URL Tab */}
                    <TabsContent value="url" className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Image URL
                            </label>
                            <Input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleInsertUrl();
                                    }
                                }}
                            />
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-800">
                                <strong>💡 Tip:</strong> Paste a direct link to an image.
                                Make sure the URL ends with .jpg, .png, .gif, or .webp
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleInsertUrl}
                                disabled={!imageUrl.trim()}
                                className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                            >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Insert Image
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}