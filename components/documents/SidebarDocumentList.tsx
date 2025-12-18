'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AppearanceDocumentModal } from '@/components/documents/AppearanceDocumentModal';
import { SettingsDocumentModal } from '@/components/documents/SettingsDocumentModal';
import { DeleteDocumentModal } from '@/components/documents/DeleteDocumentModal';
import { EditDocumentModal } from '@/components/documents/EditDocumentModal';
import { InviteModal } from '@/components/connection/InviteCollaboratorModal';
import { InviteModal } from '@/components/links/InviteCollaboratorModal';
import { AIAnalysisModal } from '@/components/documents/AIAnalysisModal';
import { Badge } from '@/components/ui/badge';

import { HiOutlineDocumentDuplicate, HiOutlineUserGroup } from 'react-icons/hi2';
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineColorLens } from "react-icons/md";
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaEllipsisV } from 'react-icons/fa';
import { LuSettings } from 'react-icons/lu';
import { TbEdit } from "react-icons/tb";
import { BsStars } from "react-icons/bs";

import { EditorLayout, useEditorSettings } from '@/hooks/useEditorSettings';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/hooks/useAuth';
import { getDocument } from '@/lib/api/documents';

export function SidebarDocumentList({ isSidebar = false }: { isSidebar?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
  const { settings } = useEditorSettings();
  const { documents, loading, deleteDocument } = useDocuments();

  const [selectedDocId, setSelectedDocId] = useState<string>('');

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [appearanceModalOpen, setAppearanceModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [analyzingContent, setAnalyzingContent] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const layout = settings.appearance?.layout;

  const handleDelete = async () => {
    if (selectedDocId) {
      try {
        await deleteDocument(selectedDocId);
        toast.success('Document deleted successfully');
        setDeleteModalOpen(false);
        setSelectedDocId('');
        router.back()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete document');
      }
    }
  };

// ---- inside SidebarDocumentList -----------------------------------------
const handleAnalyzeContent = async (documentId: string) => {
  // 1️⃣  Open the modal immediately (so the user sees the loading UI)
  setModelModalOpen(true);          // <‑‑ NEW – open now
  setAnalysisResult(null);          // reset any previous result

  setAnalyzingContent(true);        // keep the button spinner state

  try {
    // ---- fetch the document ------------------------------------------------
    const response = await getDocument(documentId);
    const documentData = response.data.data;   // adjust if your API shape differs

    if (!documentData) {
      toast.error('Document not found');
      return;
    }
    if (!documentData.content) {
      toast.error('Document has no content to analyze');
      return;
    }

    // ---- extract plain‑text from the Tiptap JSON ---------------------------
    const extractText = (content: any): string => {
      if (!content) return '';
      if (typeof content === 'string') return content;

      let txt = '';
      if (Array.isArray(content?.content)) {
        content.content.forEach((node: any) => {
          if (node.type === 'text') txt += node.text || '';
          else if (node.content) txt += extractText(node) + '\n';
        });
      }
      return txt;
    };

    const textContent = extractText(documentData.content);

    if (!textContent.trim()) {
      toast.error('Document is empty');
      return;
    }

    // ---- call the AI‑analysis endpoint ------------------------------------
    const analyzeResponse = await fetch('/api/analyze-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, content: textContent }),
    });

    if (!analyzeResponse.ok) {
      const err = await analyzeResponse.json();
      throw new Error(err.error ?? 'Analysis failed');
    }

    const result = await analyzeResponse.json();

    // 2️⃣  Store the result – the modal will automatically switch from
    //     “loading” to the result view because `analysisResult` is no longer null.
    setAnalysisResult(result);
  } catch (error: any) {
    toast.error(error.message || 'Failed to analyze content');
    // close the modal if something went really wrong
    setModelModalOpen(false);
  } finally {
    setAnalyzingContent(false);
  }
};

  if (isSidebar) {
    return (
      <div className="space-y-1.5 overflow-y-auto">
        {documents.map((doc) => {
          const isCreator = user?._id === doc.creator._id;
          const hasCollaborators = doc?.collaborators?.length > 0;

          return (
            <div
              key={doc._id}
              className={`group flex justify-between items-center px-2 py-1.5 rounded-lg transition-all duration-300 bg-linear-to-r ${pathname === `/editor/${doc._id}` ? 'from-green-100/80 to-purple-100/80 hover:bg-blue-100 shadow-md' : 'hover:from-blue-100/80 hover:to-purple-100/80'}`}
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
                  {isCreator && layout === EditorLayout.Document && (
                    <DropdownMenuItem
                      className="flex items-center gap-2 hover:bg-cream-100"
                      onClick={() => {
                        setSelectedDocId(doc._id);
                        setInviteModalOpen(true);
                      }}
                    >
                      <HiOutlineUserGroup className="" />
                      {hasCollaborators ? 'Collaborators' : 'Add Collaborator'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="flex items-center gap-2 hover:bg-cream-100"
                    onClick={() => { }}
                  >
                    <HiOutlineDocumentDuplicate className="" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 hover:bg-cream-100 hover:text-indigo-400"
                    onClick={() => {
                      setSelectedDocId(doc._id);
                      handleAnalyzeContent(doc._id); // ✅ Analyze immediately with document content
                    }}
                    disabled={analyzingContent}
                  >
                    <BsStars className={analyzingContent ? "animate-spin" : ""} />
                    <span>{analyzingContent ? 'Analyzing...' : 'AI Content Detection'}</span>

                    {/* Pro Badge */}
                    <Badge className="ml-auto bg-linear-to-r from-purple-500 to-indigo-500 text-white text-xs">
                      Pro
                    </Badge>
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
            </div>
          )
        })}
        <InviteModal
          documentId={selectedDocId}
          isOpen={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false);
            setSelectedDocId('');
          }}
        />
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
          documentId={selectedDocId || null}
        />
        <DeleteDocumentModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
<AIAnalysisModal
  isOpen={modelModalOpen}
  onClose={() => setModelModalOpen(false)}
  analysisResult={analysisResult}
  documentId={selectedDocId}
  editor={null} // or your editor instance
/>

      </div>
    );
  }
}
