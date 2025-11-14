'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

interface EmojiPickerFloatingProps {
  editor: any
}

const emojis = ['😊', '😂', '😎', '🤩', '😍', '🤔', '😅', '🤗', '🤖', '❤️', '🔥', '🥳']

export default function EmojiPickerFloating({ editor }: EmojiPickerFloatingProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [currentEmoji, setCurrentEmoji] = useState(emojis[0])
  const pickerRef = useRef<HTMLDivElement | null>(null)

  // ✨ Emoji animation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)])
    }, 2500) // Change every 1 second
    return () => clearInterval(interval)
  }, [])

  // 🧭 Calculate picker position near cursor
  const calculatePosition = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    if (!rect) return

    const pickerWidth = 340
    const pickerHeight = 400

    let x = rect.left + window.scrollX
    let y = rect.bottom + window.scrollY + 8

    if (rect) {
      setPosition({
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 8, // small offset
      })
    }
  }

  const togglePicker = () => {
    if (!showEmojiPicker) calculatePosition()
    setShowEmojiPicker(!showEmojiPicker)
  }

  const addEmoji = (emoji: any) => {
    editor?.chain().focus().insertContent(emoji.native).run()
    setShowEmojiPicker(false)
  }

  // 🚫 Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='relative'>
      {/* 🌈 Animated Emoji Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: showEmojiPicker ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`absolute top-6 right-6 p-2 border rounded-full shadow-sm flex items-center gap-2 hover:bg-gray-50 hover:shadow-lg transition-all cursor-pointer z-10 ${showEmojiPicker ? 'shadow-[0_0_10px_rgba(255,193,7,0.5)] border-yellow-300' : 'bg-white'}`}
        onClick={togglePicker}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={currentEmoji}
            initial={{ opacity: 0, y: 5, rotate: -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -5, rotate: 10 }}
            transition={{ duration: 0.3 }}
            className="text-xl"
          >
            {currentEmoji}
          </motion.span>
        </AnimatePresence>
        {/* <span className="font-medium">Emoji</span> */}
      </motion.button>

      {/* 🪄 Floating Picker near cursor */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            ref={pickerRef}
            key='emoji-picker'
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10"
            style={{
              top: `${position.y - 300}px`,
              left: `${position.x - 300}px`,
              position: 'absolute',
            }}
          >
            <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
