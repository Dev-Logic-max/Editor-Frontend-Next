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
import { MediaLibraryProModal } from '@/components/media/MediaLibraryProModal';
import { AIAnalysisModal } from '../documents/AIAnalysisModal';

import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaUndo, FaRedo, FaEraser, FaHeading, FaQuoteRight, FaCode, FaHighlighter, FaLink, FaImage, FaTable, FaPrint, FaDownload, FaPhotoVideo } from 'react-icons/fa';
import { BsBoxSeamFill } from "react-icons/bs";
import { Wand2, Settings } from 'lucide-react';

import { EditorLayout, useEditorSettings } from '@/hooks/useEditorSettings';

interface EditorToolbarProps {
  plan: string;
  editor: any;
  document?: any;
  documentId: string;
  onAIStart?: (originalText: string, action: string) => void;
  onAIComplete?: (originalText: string, result: string, action: string) => void;
}

export function EditorToolbar({ plan, editor, document, documentId, onAIStart, onAIComplete }: EditorToolbarProps) {
  const { settings } = useEditorSettings();
  const [headingLevel, setHeadingLevel] = useState('Paragraph');
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<'analysis' | 'humanize' | 'settings'>('humanize');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

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
        className={`p-2 rounded-md transition-all ${active ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300' : 'hover:bg-gray-100 text-gray-700'} ${custom}`}
      >
        <Icon />
      </Button>
    </motion.div>
  );

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

  // Open AIAnalysisModal with Analysis tab (triggered from AI dropdown)
  const handleAnalyzeContent = async () => {
    if (!editor) return;

    setAnalyzing(true);
    setAnalysisResult(null);
    setAiModalTab('analysis');
    setAiModalOpen(true);

    try {
      const textContent = editor.getText();

      if (!textContent.trim()) {
        throw new Error('Document is empty');
      }

      const response = await fetch('/api/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          content: textContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);

    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('Failed to analyze content');
    } finally {
      setAnalyzing(false);
    }
  };

  // Open AIAnalysisModal with Humanize tab (triggered from toolbar)
  const handleOpenHumanize = () => {
    setAiModalTab('humanize');
    setAiModalOpen(true);
  };

  // Open AIAnalysisModal with Settings tab (triggered from toolbar)
  const handleOpenSettings = () => {
    setAiModalTab('settings');
    setAiModalOpen(true);
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
          onAnalyzeContent={handleAnalyzeContent}
        />

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 mx-1" />

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
              toast('Manage your media 📚', {
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
          <IconButton icon={FaPrint} title="Print" custom="hidden lg:block" onClick={handlePrint} />
          <IconButton icon={FaDownload} title="Download HTML" onClick={handleDownload} />
          
          {/* Humanize Content Button */}
          <div className="relative">
            <IconButton
              icon={Wand2}
              title="Humanize Content"
              onClick={handleOpenHumanize}
            />
            <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5
                           rounded-full bg-gradient-to-r from-purple-500 to-indigo-500
                           text-white font-bold">
              PRO
            </span>
          </div>
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

      <AIAnalysisModal
        isOpen={aiModalOpen}
        onClose={() => {
          setAiModalOpen(false);
          setAnalysisResult(null);
        }}
        analysisResult={analysisResult}
        documentId={documentId}
        editor={editor}
        defaultTab={aiModalTab}
        showAnalysisTab={aiModalTab === 'analysis'}
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
    </>
  );
}