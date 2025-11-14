// 'use client';

// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import toast from 'react-hot-toast';

// interface DeleteDocumentModalProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     documentId: string;
//     onDelete: (id: string) => Promise<void>;
// }

// export function DeleteDocumentModal({ open, onOpenChange, documentId, onDelete }: DeleteDocumentModalProps) {
//     const handleDelete = async () => {
//         try {
//             await onDelete(documentId);
//             onOpenChange(false);
//             toast.success('Document deleted successfully');
//         } catch (error: any) {
//             toast.error(error.message);
//             toast.error('Failed to delete document');
//         }
//     };

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent>
//                 <DialogHeader>
//                     <DialogTitle>Delete Document</DialogTitle>
//                 </DialogHeader>
//                 <p>Are you sure you want to delete this document? This action cannot be undone.</p>
//                 <DialogFooter>
//                     <Button variant="outline" onClick={() => onOpenChange(false)}>
//                         Cancel
//                     </Button>
//                     <Button variant="destructive" onClick={handleDelete}>
//                         Delete
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// }


'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FaTrash } from 'react-icons/fa';

interface DeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDocumentModal({ isOpen, onClose, onConfirm }: DeleteDocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Delete Document</DialogTitle>
        </DialogHeader>
        <p className="text-slate-600">Are you sure you want to delete this document? This action cannot be undone.</p>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-slate-300 text-slate-600 hover:bg-cream-100 hover:text-teal-400"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={onConfirm}
          >
            <FaTrash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}