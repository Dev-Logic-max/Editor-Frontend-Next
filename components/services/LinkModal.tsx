'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { X, Link as LinkIcon, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface LinkModalProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LinkModal({ editor, isOpen, onClose }: LinkModalProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen && editor) {
      // Check if there's an existing link
      const { href } = editor.getAttributes('link');
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      );

      if (href) {
        setUrl(href);
        setText(selectedText);
        setIsEditing(true);
      } else {
        setUrl('');
        setText(selectedText);
        setIsEditing(false);
      }
    }
  }, [isOpen, editor]);

  const handleInsertLink = () => {
    if (!editor || !url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Validate URL format
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    const finalUrl = url.startsWith('http') ? url : `https://${url}`;

    if (text.trim()) {
      // Insert new text with link
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${finalUrl}">${text}</a>`)
        .run();
    } else {
      // Apply link to selected text
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: finalUrl })
        .run();
    }

    toast.success('✅ Link inserted!');
    handleClose();
  };

  const handleRemoveLink = () => {
    if (!editor) return;

    editor.chain().focus().unsetLink().run();
    toast.success('Link removed');
    handleClose();
  };

  const handleClose = () => {
    setUrl('');
    setText('');
    setIsEditing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            {isEditing ? 'Edit Link' : 'Insert Link'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Link Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Link Text (Optional)
            </label>
            <Input
              placeholder="Enter link text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Leave empty to apply link to selected text
            </p>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              URL
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInsertLink();
                }
              }}
            />
          </div>

          {/* Preview */}
          {url && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900 mb-1">Preview:</p>
                  <p className="text-sm text-blue-700 break-all">
                    {text || 'Selected text'} → {url.startsWith('http') ? url : `https://${url}`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tips */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>💡 Tips:</strong>
            </p>
            <ul className="text-xs text-gray-600 mt-1 space-y-1 list-disc list-inside">
              <li>URLs are automatically prefixed with https:// if missing</li>
              <li>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to insert quickly</li>
              <li>Leave link text empty to use selected text</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isEditing && (
              <Button
                variant="destructive"
                onClick={handleRemoveLink}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Link
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsertLink}
              disabled={!url.trim()}
              className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              {isEditing ? 'Update' : 'Insert'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}