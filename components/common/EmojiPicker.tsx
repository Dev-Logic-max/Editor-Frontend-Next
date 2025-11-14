import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

export function EmojiPicker({ editor }: { editor: any }) {
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
          <Picker
            data={data}
            theme="light"
            onEmojiSelect={addEmoji}
            skinTonePosition="none"
            previewPosition="none"
          />
        </div>
      )}
    </div>
  )
}
