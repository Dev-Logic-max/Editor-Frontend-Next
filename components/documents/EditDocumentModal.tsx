'use client';

import { useState, useEffect } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { FaEdit } from 'react-icons/fa';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
}

export function EditDocumentModal({ isOpen, onClose, documentId }: EditDocumentModalProps) {
  const { documents, updateDocument } = useDocuments();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documentId) {
      const doc = documents.find((d) => d._id === documentId);
      if (doc) setTitle(doc.title);
    }
  }, [documentId, documents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId) return;

    setLoading(true);
    try {
      await updateDocument(documentId, { title });
      toast.success('Document updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Edit Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-600">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-slate-300 focus:border-blue-500"
                placeholder="Enter document title"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="border-slate-300 text-slate-600 hover:bg-cream-100 hover:text-teal-400"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-teal-400 text-white"
              disabled={loading}
            >
              <FaEdit className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}