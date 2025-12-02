import { useState } from 'react'
import { Button } from '@/components/ui/button'
import EmojiPicker from "emoji-picker-react";

export function ToolbarEmojiPicker({ editor }: { editor: any }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const addEmoji = (emoji: any) => {
    editor?.chain().focus().insertContent(emoji.native).run()
    setShowEmojiPicker(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      >
        😊 <span className='text-xs'>Emoji</span>
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
