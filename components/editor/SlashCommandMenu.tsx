'use client';

import { useEffect, useState, useRef, JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading1, Heading2, Heading3, List, Quote, Code, Minus, Text, ImageIcon, LayoutTemplate, FileText, Database, Network } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface SlashCommandMenuProps {
  editor: Editor | null;
}

interface CommandItem {
  title: string;
  description: string;
  icon: JSX.Element;
  shortcut?: string;
  command: (editor: Editor) => void;
}

interface CommandGroup {
  name: string;
  items: CommandItem[];
}

export function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slashPos, setSlashPos] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const groups: CommandGroup[] = [
    {
      name: 'Basic Blocks',
      items: [
        {
          title: 'Text',
          description: 'Start writing plain text.',
          icon: <Text className="w-4 h-4" />,
          shortcut: 'T',
          command: (editor) => editor.chain().focus().clearNodes().run(),
        },
        {
          title: 'Heading 1',
          description: 'Big section heading.',
          icon: <Heading1 className="w-4 h-4" />,
          shortcut: 'H1',
          command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          title: 'Heading 2',
          description: 'Medium section heading.',
          icon: <Heading2 className="w-4 h-4" />,
          shortcut: 'H2',
          command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          title: 'Heading 3',
          description: 'Small section heading.',
          icon: <Heading3 className="w-4 h-4" />,
          shortcut: 'H3',
          command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
      ],
    },
    {
      name: 'Lists & Quotes',
      items: [
        {
          title: 'Bullet List',
          description: 'Create a simple bullet list.',
          icon: <List className="w-4 h-4" />,
          shortcut: '⌘ + L',
          command: (editor) => editor.chain().focus().toggleBulletList().run(),
        },
        {
          title: 'Quote',
          description: 'Add a blockquote.',
          icon: <Quote className="w-4 h-4" />,
          shortcut: '⌘ + Q',
          command: (editor) => editor.chain().focus().toggleBlockquote().run(),
        },
        {
          title: 'Divider',
          description: 'Add a horizontal line.',
          icon: <Minus className="w-4 h-4" />,
          shortcut: '---',
          command: (editor) => editor.chain().focus().setHorizontalRule().run(),
        },
      ],
    },
    {
      name: 'Media & Code',
      items: [
        {
          title: 'Image',
          description: 'Upload or paste an image link.',
          icon: <ImageIcon className="w-4 h-4" />,
          shortcut: '⌘ + I',
          command: (editor) => {
            const url = prompt('Enter image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          },
        },
        {
          title: 'Code Block',
          description: 'Insert formatted code.',
          icon: <Code className="w-4 h-4" />,
          shortcut: '⌘ + /',
          command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
        },
      ],
    },
    {
      name: 'Templates',
      items: [
        {
          title: '2-Column Layout',
          description: 'Split your content into two columns.',
          icon: <LayoutTemplate className="w-4 h-4" />,
          shortcut: '⌘ + 2',
          command: () => alert('Feature coming soon!'),
        },
        {
          title: 'Page',
          description: 'Insert a nested document or link.',
          icon: <FileText className="w-4 h-4" />,
          shortcut: '⌘ + P',
          command: () => alert('Feature coming soon!'),
        },
        {
          title: 'Database Table',
          description: 'Add a small embedded data grid.',
          icon: <Database className="w-4 h-4" />,
          shortcut: '⌘ + D',
          command: () => alert('Feature coming soon!'),
        },
        {
          title: 'Flow Diagram',
          description: 'Insert visual workflow or mind map',
          icon: <Network className="w-4 h-4" />,
          command: (editor) => {
            // Insert a placeholder that indicates where flow will go
            editor.chain()
              .focus()
              .insertContent(`
        <div style="padding: 16px; border: 2px dashed #3b82f6; border-radius: 8px; background: #eff6ff; text-align: center;">
          <p>📊 <strong>Flow Diagram Placeholder</strong></p>
          <p style="font-size: 14px; color: #666;">Use toolbar button to create your flow</p>
        </div>
      `)
              .run();
          }
        }
      ],
    },
  ];

  const allCommands = groups.flatMap((g) => g.items);

  // Filter based on query (typed after /)
  const filtered = allCommands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  // Auto-select first matching item when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 🔍 1. Detect slash and track query
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { state, view } = editor;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(Math.max(0, from - 50), from, '\n', '\0');

      // Find last slash in the text before cursor
      const lastSlashIndex = textBefore.lastIndexOf('/');

      if (lastSlashIndex !== -1) {
        const afterSlash = textBefore.substring(lastSlashIndex + 1);

        // Only show menu if slash is at start of line or after space
        const beforeSlash = textBefore.substring(0, lastSlashIndex);
        const isValidSlash = beforeSlash.length === 0 || beforeSlash.endsWith(' ') || beforeSlash.endsWith('\n');

        if (isValidSlash && !afterSlash.includes(' ') && !afterSlash.includes('\n')) {
          const slashAbsolutePos = from - afterSlash.length - 1;
          const pos = view.coordsAtPos(from);
          setCoords({
            top: pos.top + 25 + window.scrollY,
            left: pos.left + window.scrollX
          });
          setSlashPos(slashAbsolutePos);
          setQuery(afterSlash);
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
    };

    editor.on('transaction', handleUpdate);
    return () => {
      editor.off('transaction', handleUpdate);
    };
  }, [editor]);

  // 🎮 2. Keyboard navigation + Enter to execute
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen || !editor) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedCommand = filtered[selectedIndex];
        if (selectedCommand) {
          // Delete the slash and query text
          editor.chain()
            .focus()
            .deleteRange({ from: slashPos, to: slashPos + query.length + 1 })
            .run();

          // Execute command
          selectedCommand.command(editor);
        }
        setIsOpen(false);
        setQuery('');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, filtered, selectedIndex, editor, slashPos, query]);

  if (!isOpen || filtered.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute z-50 bg-white border border-gray-200 shadow-lg rounded-xl w-80 overflow-hidden"
        style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
      >
        <div className="max-h-72 overflow-y-auto">
          {groups.map((group, gIndex) => {
            const visibleItems = group.items.filter((item) =>
              item.title.toLowerCase().includes(query.toLowerCase())
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIndex}>
                <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-gray-400 font-semibold bg-gray-50">
                  {group.name}
                </div>
                {visibleItems.map((item) => {
                  const actualIndex = filtered.indexOf(item);
                  return (
                    <div
                      key={item.title}
                      className={`flex items-start justify-between px-3 py-2 cursor-pointer text-sm ${actualIndex === selectedIndex
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                        }`}
                      onClick={() => {
                        if (!editor) return;
                        // Delete slash and query
                        editor.chain()
                          .focus()
                          .deleteRange({ from: slashPos, to: slashPos + query.length + 1 })
                          .run();

                        // Execute command
                        item.command(editor);
                        setIsOpen(false);
                        setQuery('');
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-gray-600 mt-0.5">{item.icon}</div>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-gray-500 text-xs">{item.description}</div>
                        </div>
                      </div>
                      {item.shortcut && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          {item.shortcut}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50 flex justify-between items-center">
          <span>
            {query ? `Searching: "${query}"` : 'Type to filter...'}
          </span>
          <button
            className="text-blue-600 hover:underline"
            onClick={() => {
              setIsOpen(false);
              setQuery('');
            }}
          >
            Esc
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}