'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Laptop } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-xl ${currentTheme === 'light' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      >
        <Sun className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-xl ${currentTheme === 'dark' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      >
        <Moon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-xl ${theme === 'system' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      >
        <Laptop className="w-5 h-5" />
      </button>
    </div>
  )
}
