// components/editor/AIToolbar.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import toast from 'react-hot-toast';
import { getAIService, initAIService  } from '@/lib/services/ai-service';
import { Sparkles, Wand2, FileText, Languages, MessageSquare, Check, Zap, Volume2 } from 'lucide-react';

interface AIToolbarProps {
  editor: Editor;
}

export const AIToolbar: React.FC<AIToolbarProps> = ({ editor }) => {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    initAIService();
  }, []);

  const handleAIAction = async (action: string, fn: () => Promise<string>) => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) {
      toast.error('Please select text first');
      return;
    }

    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (!selectedText.trim()) {
      toast.error('No text selected');
      return;
    }

    setLoading(true);
    setActiveAction(action);

    try {
      const result = await fn();
      
      // Replace selected text with AI result
      editor.chain().focus().deleteSelection().insertContent(result).run();
      
      toast.success('✨ Text improved with AI!');
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error(error.message || 'Failed to process text');
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const getSelectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  };

  const aiActions = [
    {
      id: 'improve',
      label: 'Improve',
      icon: Wand2,
      action: () => getAIService().improveText(getSelectedText()),
      color: 'text-purple-600 hover:bg-purple-50',
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: FileText,
      action: () => getAIService().summarize(getSelectedText()),
      color: 'text-blue-600 hover:bg-blue-50',
    },
    {
      id: 'expand',
      label: 'Expand',
      icon: MessageSquare,
      action: () => getAIService().expandText(getSelectedText()),
      color: 'text-green-600 hover:bg-green-50',
    },
    {
      id: 'grammar',
      label: 'Fix Grammar',
      icon: Check,
      action: () => getAIService().fixGrammar(getSelectedText()),
      color: 'text-orange-600 hover:bg-orange-50',
    },
    {
      id: 'translate',
      label: 'Translate',
      icon: Languages,
      action: () => getAIService().translate(getSelectedText(), 'es'),
      color: 'text-pink-600 hover:bg-pink-50',
    },
    {
      id: 'formal',
      label: 'Make Formal',
      icon: Volume2,
      action: () => getAIService().changeTone(getSelectedText(), 'formal'),
      color: 'text-indigo-600 hover:bg-indigo-50',
    },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-purple-50 rounded">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-purple-700">AI Tools</span>
      </div>

      <div className="flex items-center gap-1">
        {aiActions.map((item) => {
          const Icon = item.icon;
          const isActive = activeAction === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleAIAction(item.id, item.action)}
              disabled={loading}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all
                ${item.color}
                ${isActive ? 'bg-gray-100' : ''}
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                hover:shadow-sm
              `}
              title={item.label}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="w-2 h-2 bg-current rounded-full animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="ml-2 text-xs text-gray-500 flex items-center gap-1">
          <Zap className="w-3 h-3 animate-pulse" />
          Processing...
        </div>
      )}
    </div>
  );
};