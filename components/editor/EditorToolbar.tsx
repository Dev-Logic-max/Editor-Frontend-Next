'use client';

import { useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { AIMenu } from '@/components/commands/AIMenu';
import { LinkModal } from '@/components/services/LinkModal';
import { ColorPicker } from '@/components/services/ColorPicker';
import { FlowDiagramModal } from '@/components/links/FlowDiagramModal';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { ImageUploadModal } from '@/components/services/ImageUploadModal';
import { TableInsertModal } from '@/components/services/TableInsertModal';
import { ToolbarEmojiPicker } from '@/components/common/ToolbarEmojiPicker';
import { MediaLibraryProModal } from '@/components/media/MediaLibraryProModal';

import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaUndo, FaRedo, FaEraser, FaQuoteRight, FaCode, FaLink, FaImage, FaTable, FaPrint, FaDownload, FaStrikethrough, FaNetworkWired, FaAlignJustify } from 'react-icons/fa';
import { BsBoxSeamFill } from "react-icons/bs";

import { EditorLayout, useEditorSettings, ButtonSize } from '@/hooks/useEditorSettings';
import { AIAnalysisModal } from '@/components/extensions/aiAnalysisModal';
import { MdOutlineDocumentScanner } from 'react-icons/md';

interface EditorToolbarProps {
  plan: string;
  editor: any;
  document?: any;
  documentId: string;
  onAIStart?: (originalText: string, action: string) => void;
  onAIComplete?: (originalText: string, result: string, action: string) => void;
}

const TOOLBAR_BUTTON_MAP = {
  0: 'bold',
  1: 'italic',
  2: 'underline',
  3: 'highlight',
  4: 'textColor',
  5: 'bgColor',
  6: 'aiMenu',
  7: 'emoji',
  8: 'heading',
  9: 'bulletList',
  10: 'orderedList',
  11: 'blockquote',
  12: 'codeBlock',
  13: 'flowDiagram',
  14: 'link',
  15: 'image',
  16: 'table',
  17: 'mediaLibrary',
  18: 'alignLeft',
  19: 'alignCenter',
  20: 'alignRight',
  21: 'undo',
  22: 'redo',
  23: 'clear',
  24: 'print',
  25: 'download',
};

export function EditorToolbar({ plan, editor, document, documentId, onAIStart, onAIComplete }: EditorToolbarProps) {
  const { settings } = useEditorSettings();
  const [headingLevel, setHeadingLevel] = useState('Paragraph');
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);

  const layout = settings.appearance.layout;

  // ✅ Keep headingLevel in sync with editor selection
  useEffect(() => {
    if (!editor) return;

    const updateHeadingLevel = () => {
      if (editor.isActive("heading", { level: 1 })) setHeadingLevel("Heading 1");
      else if (editor.isActive("heading", { level: 2 })) setHeadingLevel("Heading 2");
      else if (editor.isActive("heading", { level: 3 })) setHeadingLevel("Heading 3");
      else setHeadingLevel("Paragraph");
    };

    editor.on("selectionUpdate", updateHeadingLevel);
    editor.on("transaction", updateHeadingLevel);

    // Cleanup listener
    return () => {
      editor.off("selectionUpdate", updateHeadingLevel);
      editor.off("transaction", updateHeadingLevel);
    };
  }, [editor]);

  const setHeading = (level: string) => {
    if (level === 'Paragraph') editor.chain().focus().setParagraph().run();
    else if (level === 'Heading 1') editor.chain().focus().setHeading({ level: 1 }).run();
    else if (level === 'Heading 2') editor.chain().focus().setHeading({ level: 2 }).run();
    else if (level === 'Heading 3') editor.chain().focus().setHeading({ level: 3 }).run();
    setHeadingLevel(level);
  };

  const buttonVariants = {
    hover: { scale: 1.08, transition: { duration: 0.15 } },
    tap: { scale: 0.92, transition: { duration: 0.1 } },
  };

  const getButtonSize = () => {
    const buttonSize = settings.appearance.buttonSize;
    switch (buttonSize) {
      case 'extra-small':
        return 'icon-sm';
      case 'small':
        return 'sm';
      case 'medium':
        return 'default';
      case 'large':
        return 'lg';
      default:
        return 'icon-lg';
    }
  };

  const getToolbarColor = (active?: boolean) => {
    const bgColor = settings.appearance.toolbarBgColor;
    switch (bgColor) {
      case 'white':
        return `bg-white/50 ${active && 'border-black-200 bg-black-100/50'}`;
      case 'gray':
        return `bg-gray-50/50 ${active && 'border-gray-200 bg-gray-100/50'}`;
      case 'blue':
        return `bg-blue-50/50 ${active && 'border-blue-200 bg-blue-100/50'}`;
      case 'purple':
        return `bg-purple-50/50 ${active && 'border-purple-200 bg-purple-100/50'}`;
      case 'green':
        return `bg-green-50/50 ${active && 'border-green-200 bg-green-100/50'}`;
      case 'amber':
        return `bg-amber-50/50 ${active && 'border-amber-200 bg-amber-100/50'}`;
      case 'rose':
        return `bg-rose-50/50 ${active && 'border-rose-200 bg-rose-100/50'}`;
      default:
        return 'bg-white';
    }
  };

  const getBorderRadius = () => {
    const radius = settings.appearance.borderRadius;
    switch (radius) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case 'xl':
        return 'rounded-xl';
      case '2xl':
        return 'rounded-2xl';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-lg';
    }
  };

  const IconButton = ({ onClick, active, title, icon: Icon, custom, disabled = false }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    icon: any;
    custom?: string;
    disabled?: boolean;
  }) => (
    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
      <Button
        variant="ghost"
        size={`${getButtonSize()}`}
        disabled={disabled}
        onMouseDown={(e) => {
          // Prevent button from stealing focus
          e.preventDefault();
        }}
        onClick={() => {
          editor.chain().focus().run(); // ensure focus first
          onClick();
        }}
        title={title}
        className={`${getToolbarColor(active)} transition-all ${active ? 'border shadow' : 'hover:bg-gray-100 text-gray-700'} ${custom}`}
      >
        <Icon />
      </Button>
    </motion.div>
  );

  const getExistingFlowData = () => {
    if (!editingFlowId) return undefined;

    const flows = JSON.parse(localStorage.getItem(`flows-${documentId}`) || '[]');
    const flowData = flows.find((f: any) => f.id === editingFlowId);
    return flowData;
  };

  const openLinkModal = () => {
    setLinkModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = editor.getHTML();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document downloaded!');
  };

  const isButtonEnabled = (index: number) => {
    return settings.toolbar[index] !== false;
  };

  console.log("Document Editor Toolbar", document)

  if (!editor) return null;

  return (
    <>
      <div className={`sticky top-0 z-10 bg-white/95 backdrop-blur-md flex flex-wrap items-center justify-center md:justify-between transition-all ${layout === EditorLayout.Document ? `${getBorderRadius()} border p-1 m-2` : 'shadow-sm md:p-3 border-b'}`}>
        {/* Left Section */}
        <div className="flex flex-wrap items-center gap-1">
          {isButtonEnabled(0) && (
            <IconButton
              icon={FaBold}
              title="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
            />
          )}
          {isButtonEnabled(1) && (
            <IconButton
              icon={FaItalic}
              title="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
            />
          )}
          {isButtonEnabled(2) && (
            <IconButton
              icon={FaUnderline}
              title="Underline"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
            />
          )}
          {isButtonEnabled(3) && (
            <IconButton
              icon={FaStrikethrough}
              title="Strikethrough"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strikethrough')}
            />
          )}
          {isButtonEnabled(3) && (
            <ColorPicker editor={editor} />
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        {/* 🤖 AI Menu Component */}
        <AIMenu
          editor={editor}
          onAIStart={onAIStart}
          onAIComplete={onAIComplete}
        />

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {headingLevel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setHeading('Paragraph')}>
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHeading('Heading 1')}>
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHeading('Heading 2')}>
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHeading('Heading 3')}>
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarEmojiPicker editor={editor} />

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        {/* Lists / Block / Code */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={FaListUl}
            title="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          />
          <IconButton
            icon={FaListOl}
            title="Ordered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          />
          <IconButton
            icon={FaQuoteRight}
            title="Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
          />
          <IconButton
            icon={FaCode}
            title="Code Block"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <div className="flex gap-1">
          <IconButton
            icon={FaAlignLeft}
            title="Align Left"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
          />
          <IconButton
            icon={FaAlignCenter}
            title="Align Center"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
          />
          <IconButton
            icon={FaAlignRight}
            title="Align Right"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
          />
          <IconButton
            icon={FaAlignJustify}
            title="Align Justify"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            active={editor.isActive({ textAlign: 'justify' })}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        {/* Media & Extras */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={FaLink}
            title="Add Link"
            onClick={openLinkModal}
          />
          <IconButton
            icon={FaImage}
            title="Insert Image"
            onClick={() => {
              setImageModalOpen(true);
              toast('📸 Upload an image or paste a URL!', {
                icon: '💡',
                duration: 3000,
              });
            }}
          />
          <IconButton
            icon={FaTable}
            title="Insert Table"
            onClick={() => {
              setTableModalOpen(true);
              toast('📊 Select table size by hovering over the grid!', {
                icon: '💡',
                duration: 3000,
              });
            }}
          />
          <IconButton
            icon={BsBoxSeamFill}
            title="Media Library"
            onClick={() => {
              setMediaLibraryOpen(true);
              toast('Manage your media 📚', {
                icon: '💡',
                duration: 2000,
              });
            }}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        <div className="flex items-center gap-1">
          <IconButton
            icon={FaNetworkWired}
            title="Insert Flow Diagram"
            onClick={() => setFlowModalOpen(true)}
          />
        </div>

        {/* AI Analysis Button */}
        <IconButton
          icon={MdOutlineDocumentScanner}
          title="AI Content Analysis & Humanization"
          onClick={() => setAnalysisModalOpen(true)}
        />

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={FaUndo}
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
          <IconButton
            icon={FaRedo}
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={FaEraser}
            title="Clear Formatting"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
          />
          <IconButton icon={FaPrint} title="Print" custom="hidden lg:block" onClick={handlePrint} />
          <IconButton icon={FaDownload} title="Download HTML" onClick={handleDownload} />
        </div>
      </div>

      <LinkModal
        editor={editor}
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
      />

      <ImageUploadModal
        editor={editor}
        documentId={documentId}
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
      />

      <TableInsertModal
        editor={editor}
        isOpen={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
      />

      {plan === "Basic" ? (
        <>
          <MediaLibraryModal
            isOpen={mediaLibraryOpen}
            onClose={() => setMediaLibraryOpen(false)}
            documentId={documentId}
            documentTitle={document.title}
            editor={editor}
          />
        </>
      ) : (
        <>
          <MediaLibraryProModal
            isOpen={mediaLibraryOpen}
            onClose={() => setMediaLibraryOpen(false)}
            documentId={documentId}
            documentTitle={document.title}
            collaborators={document.collaborators}
            editor={editor}
          />
        </>)
      }

      <AIAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        editor={editor}
        documentContent={editor?.getText() || ''}
        plan={'ultra'}
      />

      <FlowDiagramModal
        isOpen={flowModalOpen}
        onClose={() => {
          setFlowModalOpen(false);
          setEditingFlowId(null);
        }}
        initialNodes={getExistingFlowData()?.nodes}
        initialEdges={getExistingFlowData()?.edges}
        onSave={(nodes, edges) => {
          let flowId = editingFlowId;

          // If editing existing flow, update it
          if (flowId) {
            const flows = JSON.parse(localStorage.getItem(`flows-${documentId}`) || '[]');
            const updatedFlows = flows.map((f: any) =>
              f.id === flowId ? { ...f, nodes, edges, updatedAt: new Date().toISOString() } : f
            );
            localStorage.setItem(`flows-${documentId}`, JSON.stringify(updatedFlows));
            toast.success('✅ Flow diagram updated!');
          } else {
            // Create new flow
            flowId = `flow-${Date.now()}`;

            editor.chain().focus().insertContent(
              `<p><span data-flow-id="${flowId}" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); background-color: lightGray; border: 1px solid black;  border-radius: 6px; font-weight: 500; cursor: pointer; font-size: 14px;">📊 Flow Diagram (${nodes.length} nodes, ${edges.length} connections)</span></p>`
            ).run();

            const flowData = { id: flowId, nodes, edges, createdAt: new Date().toISOString() };
            const existingFlows = JSON.parse(localStorage.getItem(`flows-${documentId}`) || '[]');
            localStorage.setItem(`flows-${documentId}`, JSON.stringify([...existingFlows, flowData]));

            toast.success('✅ Flow diagram inserted! Click it to edit.');
          }

          setEditingFlowId(null);
        }}
      />

    </>
  );
}
