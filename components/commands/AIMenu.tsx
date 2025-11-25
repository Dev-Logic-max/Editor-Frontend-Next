'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';

import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

import { PiSparkle,  PiMagicWandBold,  PiNotePencilBold,  PiArrowsOutBold, PiCheckCircleBold,  PiTranslateBold,  PiBriefcaseBold, PiSmileyBold, PiListBulletsBold, PiLightbulbBold, PiPencilSimpleLineBold, PiChatCenteredTextBold, PiArrowsInSimpleBold } from 'react-icons/pi';
import { ChevronDown } from 'lucide-react';

import { getAIService } from '@/lib/services/ai-service';

interface AIMenuProps {
  editor: Editor | null;
  onAIStart?: (originalText: string, action: string) => void;
  onAIComplete?: (originalText: string, result: string, action: string) => void;
  compact?: boolean;
}

export interface AIAction {
  id: string;
  label: string;
  icon: any;
  action: (text: string) => Promise<string>;
  color: string;
  description: string;
}

export function AIMenu({ editor, onAIStart, onAIComplete, compact = false }: AIMenuProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);

  const getSelectedText = () => {
    if (!editor) return '';
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  };

  // 🎨 AI Actions with Better Icons
  const aiActions: AIAction[] = [
    {
      id: 'improve',
      label: 'Improve Writing',
      icon: PiMagicWandBold,
      action: (text) => getAIService().improveText(text),
      color: 'text-purple-600',
      description: 'Enhance clarity and quality',
    },
    {
      id: 'grammar',
      label: 'Fix Grammar',
      icon: PiCheckCircleBold,
      action: (text) => getAIService().fixGrammar(text),
      color: 'text-green-600',
      description: 'Correct spelling and grammar',
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: PiArrowsInSimpleBold,
      action: (text) => getAIService().summarize(text),
      color: 'text-blue-600',
      description: 'Create a brief summary',
    },
    {
      id: 'expand',
      label: 'Expand',
      icon: PiArrowsOutBold,
      action: (text) => getAIService().expandText(text),
      color: 'text-indigo-600',
      description: 'Add more details',
    },
    {
      id: 'simplify',
      label: 'Simplify',
      icon: PiPencilSimpleLineBold,
      action: (text) => getAIService().changeTone(text, 'casual'),
      color: 'text-teal-600',
      description: 'Make it easier to understand',
    },
    {
      id: 'formal',
      label: 'Make Formal',
      icon: PiBriefcaseBold,
      action: (text) => getAIService().changeTone(text, 'formal'),
      color: 'text-gray-700',
      description: 'Professional tone',
    },
    {
      id: 'emojify',
      label: 'Add Emojis',
      icon: PiSmileyBold,
      action: (text) => getAIService().expandText(`Add relevant emojis to this text: ${text}`),
      color: 'text-yellow-600',
      description: 'Make it fun with emojis',
    },
    {
      id: 'bullets',
      label: 'Convert to List',
      icon: PiListBulletsBold,
      action: (text) => getAIService().expandText(`Convert this to a bullet point list: ${text}`),
      color: 'text-orange-600',
      description: 'Organize as bullet points',
    },
    {
      id: 'elaborate',
      label: 'Explain Better',
      icon: PiLightbulbBold,
      action: (text) => getAIService().expandText(`Explain this in more detail: ${text}`),
      color: 'text-amber-600',
      description: 'Provide more explanation',
    },
    {
      id: 'translate',
      label: 'Translate to Spanish',
      icon: PiTranslateBold,
      action: (text) => getAIService().translate(text, 'es'),
      color: 'text-pink-600',
      description: 'Translate to another language',
    },
    {
      id: 'continue',
      label: 'Continue Writing',
      icon: PiChatCenteredTextBold,
      action: (text) => getAIService().complete(text),
      color: 'text-violet-600',
      description: 'AI continues your text',
    },
  ];

  const handleAIAction = async (aiAction: AIAction) => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) {
      toast.error('Please select text first');
      return;
    }

    const selectedText = getSelectedText();
    if (!selectedText.trim()) {
      toast.error('No text selected');
      return;
    }

    setAiLoading(true);
    setActiveAiAction(aiAction.id);

    // Notify parent that AI processing started
    onAIStart?.(selectedText, aiAction.label);

    try {
      const result = await aiAction.action(selectedText);
      
      // Notify parent with result (for comparison sidebar)
      onAIComplete?.(selectedText, result, aiAction.label);
      
      toast.success(`✨ ${aiAction.label} completed!`);
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error(error.message || 'AI processing failed');
    } finally {
      setAiLoading(false);
      setActiveAiAction(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className="relative group"
          disabled={aiLoading}
        >
          <PiSparkle 
            className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} mr-1 ${aiLoading ? 'animate-spin' : ''} text-purple-600`} 
          />
          <span className="text-purple-600 font-semibold text-sm">AI</span>
          {/* {!compact && <ChevronDown className="h-3 w-3 ml-1 text-purple-600" />} */}
          {aiLoading && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 h-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <PiSparkle className="h-4 w-4 text-purple-600" />
          <span>AI Writing Tools</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {aiActions.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => handleAIAction(item)}
            disabled={aiLoading}
            className="cursor-pointer py-2.5 focus:bg-gray-50"
          >
            <div className="flex items-start gap-3 w-full">
              <item.icon className={`h-5 w-5 mt-0.5 shrink-0 ${item.color}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
              </div>
              {activeAiAction === item.id && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className={`w-4 h-4 border-2 border-t-transparent rounded-full shrink-0 ${item.color}`}
                />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}