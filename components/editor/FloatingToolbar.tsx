'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@tiptap/react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

import { Bold, Italic, Underline, Strikethrough, Link as LinkIcon, Code, X, Check } from 'lucide-react';

import { AIMenu } from '@/components/commands/AIMenu';
import { MotionDiv } from '@/components/common/MotionDiv';

interface FloatingToolbarProps {
  editor: Editor | null;
  onAIStart?: (originalText: string, action: string) => void;
  onAIComplete?: (originalText: string, result: string, action: string) => void;
}

export function FloatingToolbar({ editor, onAIStart, onAIComplete }: FloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { state, view } = editor;
      const { from, to } = state.selection;

      if (from === to) {
        setIsVisible(false);
        setShowLinkInput(false);
        return;
      }

      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      const box = {
        top: Math.min(start.top, end.top),
        left: (start.left + end.left) / 2,
      };

      setCoords({
        top: box.top - 80 + window.scrollY,
        left: box.left - 320 + window.scrollX,
      });

      setIsVisible(true);
    };

    editor.on('selectionUpdate', update);
    document.addEventListener('scroll', () => setIsVisible(false));

    return () => {
      editor.off('selectionUpdate', update);
      document.removeEventListener('scroll', () => setIsVisible(false));
    };
  }, [editor]);

  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const applyLink = () => {
    if (linkValue.trim()) {
      editor?.chain().focus().setLink({ href: linkValue.trim() }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
  };

  if (!isVisible) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <AnimatePresence>
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute z-20 flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-md px-2 py-1"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
        >
          {!showLinkInput ? (
            <>
              {/* 🤖 AI Menu */}
              <AIMenu
                editor={editor}
                onAIStart={onAIStart}
                onAIComplete={onAIComplete}
                compact
              />

              <div className="w-px h-6 bg-gray-300 mx-0.5" />

              {[
                { icon: <Bold className="w-4 h-4" />, action: 'toggleBold', name: 'Bold' },
                { icon: <Italic className="w-4 h-4" />, action: 'toggleItalic', name: 'Italic' },
                { icon: <Underline className="w-4 h-4" />, action: 'toggleUnderline', name: 'Underline' },
                { icon: <Strikethrough className="w-4 h-4" />, action: 'toggleStrike', name: 'Strike' },
                { icon: <Code className="w-4 h-4" />, action: 'toggleCode', name: 'Code' },
              ].map(({ icon, action, name }) => (
                <Tooltip key={name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor?.isActive(name.toLowerCase()) ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => {
                        const command = (editor?.chain().focus() as any)[action];
                        if (typeof command === 'function') {
                          command.call(editor?.chain().focus()).run();
                        }
                      }}
                    >
                      {icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{name}</TooltipContent>
                </Tooltip>
              ))}

              {/* Link button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editor?.isActive('link') ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => {
                      const currentLink = editor?.getAttributes('link').href || '';
                      setLinkValue(currentLink);
                      setShowLinkInput(true);
                    }}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert link</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <input
                ref={linkInputRef}
                type="url"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyLink();
                  if (e.key === 'Escape') setShowLinkInput(false);
                }}
                placeholder="https://example.com"
                className="w-40 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={applyLink}
                title="Apply link"
              >
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  editor?.chain().focus().unsetLink().run();
                  setShowLinkInput(false);
                }}
                title="Remove link"
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </motion.div>
          )}
        </MotionDiv>
      </AnimatePresence>
    </TooltipProvider>
  );
}
