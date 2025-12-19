import { useState } from 'react'
import { Button } from '@/components/ui/button'
import EmojiPicker from "emoji-picker-react";
import { SmilePlus } from 'lucide-react';
import { useEditorSettings } from '@/hooks/useEditorSettings';
import { MdOutlineAddReaction } from 'react-icons/md';

export function ToolbarEmojiPicker({ editor }: { editor: any }) {
  const { settings } = useEditorSettings();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const addEmoji = (emoji: any) => {
    editor?.chain().focus().insertContent(emoji.native).run()
    setShowEmojiPicker(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        className={`${settings.floatingToolbar ? 'py-1.5 h-fit' : ''}`}
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      >
        {settings.ui.showFloatingToolbar ? <SmilePlus /> : <MdOutlineAddReaction />}
      </Button>

      {showEmojiPicker && (
        <div className="absolute z-50 top-10 left-0 bg-white shadow-lg rounded-lg">
          <EmojiPicker
            onEmojiClick={addEmoji}
          />
        </div>
      )}
    </div>
  )
}
