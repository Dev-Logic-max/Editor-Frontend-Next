// components/services/ColorPicker.tsx
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { Paintbrush, Type, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  editor: Editor | null;
  type: 'text' | 'background';
}

export function ColorPicker({ editor, type }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#374151' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Pink', value: '#EC4899' },
  ];

  const handleColorSelect = (color: string) => {
    if (!editor) return;

    if (type === 'text') {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().setHighlight({ color }).run();
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    if (!editor) return;

    if (type === 'text') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
    setIsOpen(false);
  };

  const currentColor = type === 'text' 
    ? editor?.getAttributes('textStyle').color 
    : editor?.getAttributes('highlight').color;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          title={type === 'text' ? 'Text Color' : 'Background Color'}
        >
          {type === 'text' ? (
            <Type className="h-4 w-4" />
          ) : (
            <Paintbrush className="h-4 w-4" />
          )}
          {currentColor && (
            <div 
              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded"
              style={{ backgroundColor: currentColor }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium flex items-center gap-2">
            {type === 'text' ? <Type className="h-4 w-4" /> : <Paintbrush className="h-4 w-4" />}
            {type === 'text' ? 'Text Color' : 'Background Color'}
          </div>
          
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <motion.button
                key={color.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorSelect(color.value)}
                className="relative w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {currentColor === color.value && (
                  <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow" />
                )}
              </motion.button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="w-full text-xs"
          >
            Clear {type === 'text' ? 'Color' : 'Background'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}