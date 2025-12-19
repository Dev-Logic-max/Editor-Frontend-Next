'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';

import { Paintbrush, Type, Droplet, Check, X, Palette } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import { useEditorSettings } from '@/hooks/useEditorSettings';
import { HiOutlinePaintBrush } from 'react-icons/hi2';
import { RiColorFilterAiLine } from 'react-icons/ri';

interface UnifiedColorPickerProps {
  editor: Editor | null;
}

const PRESET_COLORS = [
  { name: 'Default', value: '#000000', category: 'basic' },
  { name: 'Gray', value: '#6B7280', category: 'basic' },
  { name: 'Red', value: '#EF4444', category: 'basic' },
  { name: 'Orange', value: '#F97316', category: 'basic' },
  { name: 'Amber', value: '#F59E0B', category: 'basic' },
  { name: 'Yellow', value: '#EAB308', category: 'basic' },
  { name: 'Lime', value: '#84CC16', category: 'basic' },
  { name: 'Green', value: '#22C55E', category: 'basic' },
  { name: 'Emerald', value: '#10B981', category: 'basic' },
  { name: 'Teal', value: '#14B8A6', category: 'basic' },
  { name: 'Cyan', value: '#06B6D4', category: 'basic' },
  { name: 'Sky', value: '#0EA5E9', category: 'basic' },
  { name: 'Blue', value: '#3B82F6', category: 'basic' },
  { name: 'Indigo', value: '#6366F1', category: 'basic' },
  { name: 'Violet', value: '#8B5CF6', category: 'basic' },
  { name: 'Purple', value: '#A855F7', category: 'basic' },
  { name: 'Fuchsia', value: '#D946EF', category: 'basic' },
  { name: 'Pink', value: '#EC4899', category: 'basic' },
  { name: 'Rose', value: '#F43F5E', category: 'basic' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FEF08A', textColor: '#854D0E' },
  { name: 'Green', value: '#BBF7D0', textColor: '#166534' },
  { name: 'Blue', value: '#BFDBFE', textColor: '#1E40AF' },
  { name: 'Purple', value: '#DDD6FE', textColor: '#5B21B6' },
  { name: 'Pink', value: '#FBCFE8', textColor: '#9F1239' },
  { name: 'Orange', value: '#FED7AA', textColor: '#9A3412' },
  { name: 'Red', value: '#FECACA', textColor: '#991B1B' },
  { name: 'Gray', value: '#E5E7EB', textColor: '#374151' },
];

export function ColorPicker({ editor }: UnifiedColorPickerProps) {
  const { settings } = useEditorSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'background' | 'highlight'>('text');

  if (!editor) return null;

  const currentTextColor = editor.getAttributes('textStyle').color;
  const currentHighlight = editor.getAttributes('highlight').color;

  const handleTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const handleBackgroundColor = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  };

  const handleHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  };

  const clearTextColor = () => {
    editor.chain().focus().unsetColor().run();
  };

  const clearBackground = () => {
    editor.chain().focus().unsetHighlight().run();
  };

  // Determine button color based on active styles
  const getButtonColor = () => {
    if (currentHighlight) return currentHighlight;
    if (currentTextColor) return currentTextColor;
    return '#6B7280';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100"
          title="Colors & Highlight"
        >
          <div className="relative">
            <Paintbrush className="h-4 w-4" />
            {/* <Palette /> */}
            {(currentTextColor || currentHighlight) && (
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: getButtonColor() }}
              />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="start">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <div className="p-2 bg-linear-to-r from-gray-50 to-gray-100 border-b">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
              <TabsTrigger value="text" className="text-xs flex items-center gap-1.5">
                <HiOutlinePaintBrush className="h-3 w-3" />
                Text
              </TabsTrigger>
              <TabsTrigger value="background" className="text-xs flex items-center gap-1.5">
                <Droplet className="h-3 w-3" />
                Background
              </TabsTrigger>
              <TabsTrigger value="highlight" className="text-xs flex items-center gap-1.5">
                <RiColorFilterAiLine className="h-3 w-3" />
                Highlight
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Text Color Tab */}
          <TabsContent value="text" className="p-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Type className="h-3 w-3" />
                Text Color
              </p>
              <div className="grid grid-cols-9 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleTextColor(color.value);
                      setIsOpen(false);
                    }}
                    className="relative w-7 h-7 rounded-md border-2 border-gray-200 hover:border-gray-400 transition-all shadow-sm"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {currentTextColor === color.value && (
                      <Check 
                        className="h-4 w-4 absolute inset-0 m-auto drop-shadow-lg" 
                        style={{ color: color.value === '#000000' ? '#fff' : '#000' }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearTextColor();
                  setIsOpen(false);
                }}
                className="flex-1 text-xs h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Color
              </Button>
            </div>
          </TabsContent>

          {/* Background Color Tab */}
          <TabsContent value="background" className="p-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Droplet className="h-3 w-3" />
                Background Color
              </p>
              <div className="grid grid-cols-9 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleBackgroundColor(color.value);
                      setIsOpen(false);
                    }}
                    className="relative w-7 h-7 rounded-md border-2 border-gray-200 hover:border-gray-400 transition-all shadow-sm"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {currentHighlight === color.value && (
                      <Check 
                        className="h-4 w-4 absolute inset-0 m-auto drop-shadow-lg"
                        style={{ color: color.value === '#000000' ? '#fff' : '#000' }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearBackground();
                  setIsOpen(false);
                }}
                className="flex-1 text-xs h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Background
              </Button>
            </div>
          </TabsContent>

          {/* Highlight Tab */}
          <TabsContent value="highlight" className="p-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Paintbrush className="h-3 w-3" />
                Quick Highlights
              </p>
              <div className="grid grid-cols-4 gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleHighlight(color.value);
                      setIsOpen(false);
                    }}
                    className="relative h-12 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: color.value, color: color.textColor }}
                    title={`${color.name} Highlight`}
                  >
                    <span className="text-xs font-semibold">{color.name}</span>
                    {currentHighlight === color.value && (
                      <Check className="h-4 w-4 absolute top-1 right-1" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>💡 Tip:</strong> Highlights work great for marking important text!
              </p>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearBackground();
                  setIsOpen(false);
                }}
                className="flex-1 text-xs h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Remove Highlight
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}