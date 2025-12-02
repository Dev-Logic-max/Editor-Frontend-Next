'use client';

import { useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { AIMenu } from '@/components/commands/AIMenu';
import { LinkModal } from '@/components/services/LinkModal';
import { ToolbarEmojiPicker } from '@/components/common/ToolbarEmojiPicker';
import { ColorPicker } from '@/components/services/ColorPicker';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { ImageUploadModal } from '@/components/services/ImageUploadModal';
import { TableInsertModal } from '@/components/services/TableInsertModal';

import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaUndo, FaRedo, FaEraser, FaHeading, FaQuoteRight, FaCode, FaHighlighter, FaRobot, FaLink, FaImage, FaTable, FaPrint, FaDownload, FaPhotoVideo } from 'react-icons/fa';
import { BsBoxSeamFill } from "react-icons/bs";

import { EditorLayout, useEditorSettings } from '@/hooks/useEditorSettings';

interface EditorToolbarProps {
  editor: any;
  document?: any;
  documentId: string;
  onAIStart?: (originalText: string, action: string) => void;
  onAIComplete?: (originalText: string, result: string, action: string) => void;
}

export function EditorToolbar({ editor, document, documentId, onAIStart, onAIComplete }: EditorToolbarProps) {
  const { settings } = useEditorSettings();
  const [headingLevel, setHeadingLevel] = useState('Paragraph');
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

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

  const IconButton = ({ onClick, active, title, icon: Icon, disabled = false }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    icon: any;
    disabled?: boolean;
  }) => (
    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
      <Button
        variant="ghost"
        size="sm"
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
        className={`p-2 rounded-md transition-all ${active ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300' : 'hover:bg-gray-100 text-gray-700'}`}
      >
        <Icon />
      </Button>
    </motion.div>
  );

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      toast.success('Link added!');
    }
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      toast.success('Image inserted!');
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    toast.success('Table inserted!');
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

  console.log("Document Editor Toolbar", document)

  if (!editor) return null;

  return (
    <>
      <div className={`sticky top-0 z-10 bg-white/95 backdrop-blur-md flex flex-wrap items-center justify-center md:justify-between transition-all ${layout === EditorLayout.Document ? 'rounded-xl border p-2 m-2' : 'shadow-sm md:p-3 border-b'}`}>
        {/* Left Section */}
        <div className="flex flex-wrap items-center gap-1">
          <IconButton
            icon={FaBold}
            title="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          />
          <IconButton
            icon={FaItalic}
            title="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          />
          <IconButton
            icon={FaUnderline}
            title="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          />
          <IconButton
            icon={FaHighlighter}
            title="Highlight"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive('highlight')}
          />
          <ColorPicker editor={editor} type="text" />
          <ColorPicker editor={editor} type="background" />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        {/* 🤖 AI Menu Component */}
        <AIMenu
          editor={editor}
          onAIStart={onAIStart}
          onAIComplete={onAIComplete}
        />

        <ToolbarEmojiPicker editor={editor} />

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FaHeading className="h-4 w-4" />
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
              toast('📚 Manage your media library', {
                icon: '💡',
                duration: 2000,
              });
            }}
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
        </div>

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
          <IconButton icon={FaPrint} title="Print" onClick={handlePrint} />
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

      <MediaLibraryModal
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        documentId={documentId}
        documentTitle={document.title}
        editor={editor}
      />

      {/* <MediaLibraryModal
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        documentId={documentId}
        documentTitle={document.title} // ✅ ADD THIS
        editor={editor}
      /> */}
    </>
  );
}
