'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AppearanceDocumentModal } from '@/components/documents/AppearanceDocumentModal';
import { SettingsDocumentModal } from '@/components/documents/SettingsDocumentModal';
import { DeleteDocumentModal } from '@/components/documents/DeleteDocumentModal';
import { EditDocumentModal } from '@/components/documents/EditDocumentModal';
import { InviteModal } from '@/components/modal/InviteCollaboratorModal';
import { Badge } from '@/components/ui/badge';

import { HiOutlineDocumentDuplicate, HiOutlineUserGroup } from 'react-icons/hi2';
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineColorLens } from "react-icons/md";
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaEllipsisV } from 'react-icons/fa';
import { LuSettings } from 'react-icons/lu';
import { TbEdit } from "react-icons/tb";

import { EditorLayout, useEditorSettings } from '@/hooks/useEditorSettings';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/hooks/useAuth';

export function SidebarDocumentList({ isSidebar = false }: { isSidebar?: boolean }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { settings } = useEditorSettings();
  const { documents, fetchDocuments, deleteDocument } = useDocuments();

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [appearanceModalOpen, setAppearanceModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const layout = settings.appearance?.layout;

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

  console.log("Hello Impossible", documents)

  if (isSidebar) {
    return (
      <div className="space-y-1.5">
        {documents.map((doc) => {
          // const isCreator = user?._id === documents.creator._id;
          // const hasCollaborators = documents?.collaborators?.length > 0;
          return (
            <div
              key={doc._id}
              className={`group flex justify-between items-center px-2 py-1.5 rounded-lg transition-all duration-300 bg-linear-to-r ${pathname === `/editor/${doc._id}`
                ? 'from-green-100/80 to-purple-100/80 hover:bg-blue-100 shadow-md'
                : 'hover:from-blue-100/80 hover:to-purple-100/80'
                } transition-all duration-300`}
            >
              <Link href={`/editor/${doc._id}`} className="flex items-center gap-2 truncate">
                <IoDocumentTextOutline className='w-5 h-5' />
                <span className="text-slate-600 group-hover:truncate">{doc.title}</span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge className="opacity-0 bg-transparent cursor-pointer group-hover:opacity-100 text-slate-600 hover:text-indigo-400">
                    <FaEllipsisV />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white shadow-lg">
                  {layout === EditorLayout.Document && (
                    <DropdownMenuItem
                      className="flex items-center gap-2 hover:bg-cream-100"
                      onClick={() => { }}
                    >
                      <HiOutlineUserGroup className="" />
                      Collaborators
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="flex items-center gap-2 hover:bg-cream-100"
                    onClick={() => {
                      setSelectedDocId(doc._id);
                      setInviteModalOpen(true);
                    }}
                  >
                    <HiOutlineDocumentDuplicate className="" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 hover:bg-cream-100 hover:text-indigo-400"
                    onClick={() => {
                      setSelectedDocId(doc._id);
                      setAppearanceModalOpen(true);
                    }}
                  >
                    <MdOutlineColorLens className="" />
                    Appearance
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 hover:bg-cream-100 hover:text-indigo-400"
                    onClick={() => {
                      setSelectedDocId(doc._id);
                      setSettingsModalOpen(true);
                    }}
                  >
                    <LuSettings className="" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 hover:bg-cream-100 hover:text-indigo-400"
                    onClick={() => {
                      setSelectedDocId(doc._id);
                      setEditModalOpen(true);
                    }}
                  >
                    <TbEdit className="" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 hover:bg-cream-100 hover:text-indigo-400"
                    onClick={() => {
                      setSelectedDocId(doc._id);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <RiDeleteBin6Line className="" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* {isCreator && <InviteModal documentId={selectedDocId!} collaborators={hasCollaborators} />} */}
            </div>
          )
        })}
        <AppearanceDocumentModal
          isOpen={appearanceModalOpen}
          onClose={() => setAppearanceModalOpen(false)}
        />
        <SettingsDocumentModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
        />
        <EditDocumentModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          documentId={selectedDocId}
        />
        <DeleteDocumentModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      </div>
    );
  }
}