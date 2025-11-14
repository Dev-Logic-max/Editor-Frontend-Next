'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

import { DeleteDocumentModal } from '@/components/documents/DeleteDocumentModal';
import { EditDocumentModal } from '@/components/documents/EditDocumentModal';

import { IoDocumentTextOutline } from 'react-icons/io5';
import { FiEdit, FiTrash2 } from "react-icons/fi";

import { useDocuments } from '@/hooks/useDocuments';
import toast from 'react-hot-toast';

export function DashboardDocumentList() {
  const { documents, fetchDocuments, deleteDocument } = useDocuments();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async () => {
    if (selectedDocId) {
      try {
        await deleteDocument(selectedDocId);
        toast.success('Document deleted successfully');
        setDeleteModalOpen(false);
        setSelectedDocId(null);
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete document');
      }
    }
  };


  console.log("Documents", documents)

  return (
    <div className='px-4 py-4 mt-4 rounded-xl border'>
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Documents</h2>
      <div className='border rounded-lg overflow-hidden'>
        <Table>
          <TableHeader className='bg-linear-to-br from-blue-300/40 via-purple-300/40 to-pink-300/40'>
            <TableRow>
              <TableHead className='ps-4'>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Collaborators</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const creator = doc.creator;
              const creatorInitials = `${creator.firstName[0]}${creator?.lastName![0]}`.toUpperCase();
              const statusColor = {
                draft: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                published: 'bg-green-100 text-green-800 border-green-300',
              }[doc.status] || 'bg-gray-100 text-gray-800 border-gray-300';

              return (
                <TableRow key={doc._id} className="">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {creator.profilePhoto ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${creator.profilePhoto}`}
                          alt={creator.firstName}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {creatorInitials}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {creator.firstName} {creator.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/editor/${doc._id}`} className="flex items-center gap-2 font-semibold">
                      <IoDocumentTextOutline className="h-5 w-5" />
                      <span className='hover:underline'>{doc.title.length > 20 ? `${doc.title.slice(0, 20)}...` : doc.title}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {doc.collaborators.length > 0 ? (
                      <div className="flex -space-x-2">
                        {doc.collaborators.slice(0, 3).map((collab) => {
                          const initials = `${collab.firstName[0]}${collab?.lastName![0]}`.toUpperCase();
                          return collab.profilePhoto ? (
                            <img
                              key={collab._id}
                              src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${collab.profilePhoto}`}
                              alt={collab.firstName}
                              className="w-9 h-9 rounded-full border border-white shadow object-cover"
                              title={`${collab.firstName} ${collab.lastName}`}
                            />
                          ) : (
                            <div
                              key={collab._id}
                              className="w-9 h-9 rounded-full bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold border border-white shadow"
                              title={`${collab.firstName} ${collab.lastName}`}
                            >
                              {initials}
                            </div>
                          );
                        })}
                        {doc.collaborators.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            +{doc.collaborators.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">No collaborators</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}
                    >
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className='flex gap-2'>
                    <Button
                      className="group shadow border text-green-800 border-green-300 bg-green-100 hover:bg-green-200"
                      size={'sm'}
                      onClick={() => {
                        setSelectedDocId(doc._id);
                        setEditModalOpen(true);
                      }}
                    >
                      <FiEdit className="group-hover:scale-110" />
                    </Button>
                    <Button
                      className="group shadow border text-red-800 border-red-300 bg-red-100 hover:bg-red-200"
                      size={'sm'}
                      onClick={() => {
                        setSelectedDocId(doc._id);
                        setDeleteModalOpen(true);
                      }}
                    >
                      <FiTrash2 className="group-hover:scale-110" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
      <EditDocumentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        documentId={selectedDocId}
      />
    </div>
  );
}