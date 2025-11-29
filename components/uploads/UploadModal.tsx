'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, FileText, AlertCircle, CheckCircle2, Loader2, 
  FileCheck, Sparkles, ArrowRight, File, Calendar, Hash 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useDocuments } from '@/hooks/useDocuments';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentType: string | null;
}

interface UploadStats {
  fileName: string;
  fileSize: string;
  characterCount: number;
  wordCount: number;
  documentId?: string;
  title?: string;
}

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

const typeInstructions: Record<string, { title: string; instructions: string[]; accept: string }> = {
  docx: {
    title: 'Upload Word Document',
    instructions: [
      'Select a .docx or .doc file from your computer',
      'The document will be converted to editable format',
      'Formatting and styles will be preserved',
      'Images will be imported automatically',
    ],
    accept: '.docx,.doc',
  },
  txt: {
    title: 'Upload Text File',
    instructions: [
      'Select a .txt file from your computer',
      'Plain text will be imported directly',
      'No formatting will be applied',
      'Perfect for simple notes and drafts',
    ],
    accept: '.txt',
  },
  md: {
    title: 'Upload Markdown File',
    instructions: [
      'Select a .md or .markdown file',
      'Markdown syntax will be converted to rich text',
      'Headings, lists, and formatting preserved',
      'Code blocks and links supported',
    ],
    accept: '.md,.markdown',
  },
};

export function UploadModal({ isOpen, onClose, documentType }: Props) {
  const router = useRouter();
  const { refetch } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'reading', label: 'Reading file', status: 'pending' },
    { id: 'parsing', label: 'Parsing content', status: 'pending' },
    { id: 'converting', label: 'Converting to Tiptap format', status: 'pending' },
    { id: 'uploading', label: 'Creating document', status: 'pending' },
    { id: 'finalizing', label: 'Finalizing', status: 'pending' },
  ]);

  if (!documentType || !typeInstructions[documentType]) return null;

  const config = typeInstructions[documentType];

  const updateStepStatus = (stepId: string, status: ProcessingStep['status']) => {
    setProcessingSteps(prev =>
      prev.map(step => (step.id === stepId ? { ...step, status } : step))
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = config.accept.split(',');
    
    if (!acceptedExtensions.includes(extension)) {
      toast.error(`Please select a valid ${documentType.toUpperCase()} file`);
      return;
    }

    setUploading(true);
    setUploadComplete(false);
    setProgress(0);

    try {
      // Step 1: Reading file
      updateStepStatus('reading', 'processing');
      setProgress(10);
      
      const fileText = await file.text();
      const initialStats: UploadStats = {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        characterCount: fileText.length,
        wordCount: countWords(fileText),
      };
      setStats(initialStats);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus('reading', 'complete');
      setProgress(25);

      // Step 2: Parsing content
      updateStepStatus('parsing', 'processing');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus('parsing', 'complete');
      setProgress(45);

      // Step 3: Converting
      updateStepStatus('converting', 'processing');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);

      console.log('📤 Uploading file:', file.name, 'Type:', documentType);

      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus('converting', 'complete');
      setProgress(65);

      // Step 4: Uploading
      updateStepStatus('uploading', 'processing');
      const response = await fetch('/api/documents/import', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('✅ Upload successful:', data);

      updateStepStatus('uploading', 'complete');
      setProgress(85);

      // Step 5: Finalizing
      updateStepStatus('finalizing', 'processing');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus('finalizing', 'complete');
      setProgress(100);

      // Update stats with document info
      setStats(prev => ({
        ...prev!,
        documentId: data.documentId,
        title: data.title,
      }));

      refetch()

      setUploadComplete(true);
      toast.success(`${file.name} uploaded successfully!`);

    } catch (error: any) {
      console.error('💥 Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
      
      // Mark current step as error
      const currentStep = processingSteps.find(s => s.status === 'processing');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDocument = () => {
    if (stats?.documentId) {
      router.push(`/editor/${stats.documentId}`);
    }
  };

  const handleReset = () => {
    setUploadComplete(false);
    setStats(null);
    setProgress(0);
    setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!uploading ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-linear-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
                  <p className="text-sm text-gray-600">Import and convert to editable format</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={uploading}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!uploadComplete && !uploading && (
                <>
                  {/* Instructions */}
                  <div className="p-4 bg-linear-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="font-semibold text-blue-900 mb-2">What to expect:</p>
                        {config.instructions.map((instruction, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900">{instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Drag & Drop Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-xl p-16 transition-all duration-300 cursor-pointer
                      ${dragActive 
                        ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                      }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={config.accept}
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />

                    <div className="flex flex-col items-center gap-4">
                      <motion.div
                        animate={{ y: dragActive ? -5 : 0 }}
                        className="p-4 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
                      >
                        <Upload className="w-12 h-12 text-white" />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900 mb-2">
                          {dragActive ? 'Drop file here' : 'Drag & drop or click to browse'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Accepted formats: <span className="font-mono font-semibold">{config.accept.toUpperCase()}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Maximum file size: 50MB
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Processing View */}
              {uploading && (
                <div className="space-y-6">
                  {/* File Info Card */}
                  {stats && (
                    <div className="p-4 bg-linear-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <File className="w-8 h-8 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{stats.fileName}</p>
                          <p className="text-sm text-gray-600">{stats.fileSize}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Characters:</span>
                          <span className="font-semibold text-gray-900">{stats.characterCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileCheck className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Words:</span>
                          <span className="font-semibold text-gray-900">{stats.wordCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Processing</span>
                      <span className="font-semibold text-blue-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Processing Steps */}
                  <div className="space-y-3">
                    {processingSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border transition-all
                          ${step.status === 'complete' ? 'bg-green-50 border-green-200' : ''}
                          ${step.status === 'processing' ? 'bg-blue-50 border-blue-200' : ''}
                          ${step.status === 'error' ? 'bg-red-50 border-red-200' : ''}
                          ${step.status === 'pending' ? 'bg-gray-50 border-gray-200 opacity-50' : ''}
                        `}
                      >
                        <div className="shrink-0">
                          {step.status === 'complete' && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                          {step.status === 'processing' && (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          )}
                          {step.status === 'error' && (
                            <X className="w-5 h-5 text-red-600" />
                          )}
                          {step.status === 'pending' && (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <span className={`
                          text-sm font-medium
                          ${step.status === 'complete' ? 'text-green-700' : ''}
                          ${step.status === 'processing' ? 'text-blue-700' : ''}
                          ${step.status === 'error' ? 'text-red-700' : ''}
                          ${step.status === 'pending' ? 'text-gray-500' : ''}
                        `}>
                          {step.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success View */}
              {uploadComplete && stats && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Success Icon */}
                  <div className="flex flex-col items-center gap-4 py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="p-4 bg-linear-to-br from-green-500 to-emerald-600 rounded-full"
                    >
                      <CheckCircle2 className="w-16 h-16 text-white" />
                    </motion.div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Upload Complete!
                      </h3>
                      <p className="text-gray-600">
                        Your document is ready to edit
                      </p>
                    </div>
                  </div>

                  {/* Document Details */}
                  <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 space-y-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 mt-1" />
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Document Title</p>
                          <p className="font-semibold text-gray-900 text-lg">{stats.title}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Characters</p>
                            <p className="font-semibold text-gray-900">{stats.characterCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Words</p>
                            <p className="font-semibold text-gray-900">{stats.wordCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Size</p>
                            <p className="font-semibold text-gray-900">{stats.fileSize}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Another
                    </Button>
                    <Button
                      onClick={handleOpenDocument}
                      className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Open Document
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {!uploadComplete && !uploading && (
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}