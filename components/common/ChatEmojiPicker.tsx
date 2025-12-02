'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EmojiPicker from "emoji-picker-react";

interface EmojiPickerProps {
  onEmojiClick: (emoji: any) => void;
}

export function ChatEmojiPicker({ onEmojiClick }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emojiData: any) => {
    onEmojiClick(emojiData);
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
        <span role="img" aria-label="emoji">😊</span>
      </Button>

      {showPicker && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={350}
            height={400}
          />
        </div>
      )}
    </div>
  );
}