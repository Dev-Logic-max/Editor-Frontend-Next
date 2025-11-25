'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface AIInlineSuggestionProps {
  editor: Editor | null;
  isVisible: boolean;
  originalText: string;
  suggestedText: string;
  action: string;
  onAccept: () => void;
  onReject: () => void;
}

export function AIInlineSuggestion({
  editor,
  isVisible,
  originalText,
  suggestedText,
  action,
  onAccept,
  onReject,
}: AIInlineSuggestionProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Streaming effect
  useEffect(() => {
    if (!suggestedText || !isVisible) {
      setDisplayedText('');
      return;
    }

    setIsStreaming(true);
    setDisplayedText('');
    
    let index = 0;
    const streamInterval = setInterval(() => {
      if (index < suggestedText.length) {
        setDisplayedText(suggestedText.slice(0, index + 1));
        index++;
      } else {
        setIsStreaming(false);
        clearInterval(streamInterval);
      }
    }, 15);

    return () => clearInterval(streamInterval);
  }, [suggestedText, isVisible]);

  const handleAccept = () => {
    if (!editor) return;
    
    // Replace selected text with AI suggestion
    const { from, to } = editor.state.selection;
    editor.chain().focus().deleteRange({ from, to }).insertContent(suggestedText).run();
    
    toast('AI suggestion applied!', {icon: '✨'});
    onAccept();
  };

  const handleReject = () => {
    toast('AI suggestion rejected', {icon: '📋'});
    onReject();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed top-20 right-6 z-50 w-96 bg-white rounded-lg shadow-2xl border-2 border-purple-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-purple-50 to-blue-50 p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AI Suggestion</h3>
              <p className="text-xs text-gray-600">{action}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-3">
          {/* Original Text */}
          <div>
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Original
            </label>
            <div className="p-2 bg-gray-50 rounded border text-sm text-gray-700 line-clamp-3">
              {originalText}
            </div>
          </div>

          {/* AI Suggestion */}
          <div>
            <label className="text-xs font-semibold text-purple-600 flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" />
              AI Suggestion
            </label>
            <div className="p-3 bg-linear-to-br from-purple-50 to-blue-50 rounded border border-purple-200 text-sm text-gray-800 min-h-[60px] relative">
              {displayedText}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-purple-600 ml-0.5"
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-t bg-gray-50 flex gap-2">
          <Button
            onClick={handleReject}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={isStreaming}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button
            onClick={handleAccept}
            size="sm"
            className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isStreaming}
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}