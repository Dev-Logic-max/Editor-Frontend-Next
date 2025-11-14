'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface EmojiPickerProps {
  onEmojiClick: (emoji: any) => void;   // ← NEW prop
}

export function ChatEmojiPicker({ onEmojiClick }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (emoji: any) => {
    onEmojiClick(emoji);
    setShowPicker(false);
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowPicker((v) => !v)}
        className="text-indigo-600 hover:bg-indigo-100"
      >
        <span role="img" aria-label="emoji">Emoji</span>
      </Button>

      {showPicker && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl">
          <Picker
            data={data}
            theme="light"
            onEmojiSelect={handleSelect}
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  );
}