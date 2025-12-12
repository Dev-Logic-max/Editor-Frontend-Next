'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { ChatEmojiPicker } from '@/components/common/ChatEmojiPicker';
import { Send, Smile, Users } from 'lucide-react';
import { format } from 'date-fns';

import { useYChat } from '@/hooks/useYChat';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  message: string;
  timestamp: number;
}

interface ChatModalProps {
  chatModalOpen: boolean;
  documentId: string;
  collaborators: any[];
  ydoc: any;
  provider: any;
}

export function ChatModal({ chatModalOpen, documentId, collaborators, ydoc, provider }: ChatModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, typingUsers } = useYChat({
    ydoc,
    provider,
    documentId,
    userId: user?._id || '',
    userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User',
    avatar: user?.profilePhoto || '',
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message.trim());
    setMessage('');
    setShowEmoji(false);
  };

  const onEmojiClick = (emoji: any) => {
    setMessage((prev) => prev + emoji.emoji);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`${chatModalOpen ? 'block' : 'hidden'} w-80 sm:w-96 h-96 absolute right-4 bottom-14 z-20 border shadow-lg rounded-lg  overflow-auto`}>
      <div className='bg-linear-to-br from-indigo-50 via-white to-purple-50'>
        <div className="flex items-center px-3 py-2 gap-3 bg-white/80 backdrop-blur rounded-t-lg border-b">
          <p className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Document Chat
          </p>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {collaborators.length}
          </Badge>
        </div>

        {/* Messages */}
        <div className="w-full h-full px-2 py-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p className="text-lg">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.userId === user?._id ? 'flex-row-reverse' : ''
                    }`}
                >
                  <Avatar className="w-9 h-9 border shadow-md">
                    <AvatarFallback
                      className="text-xs font-bold"
                      style={{
                        background: msg.avatar
                          ? 'transparent'
                          : `linear-gradient(45deg, ${msg.color}, ${msg.colorLight})`,
                        color: 'white',
                      }}
                    >
                      {msg.avatar ? (
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${msg.avatar}`} alt={msg.name} className="w-full h-full object-cover" />
                      ) : (
                        msg.name.charAt(0).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${msg.userId === user?._id
                      ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white'
                      : 'bg-white border'
                      }`}
                  >
                    <p className="text-sm font-medium">{msg.name}</p>
                    <p className="text-sm wrap-break-words">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))
            )}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                {typingUsers.join(', ')} is typing...
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        {showEmoji && (
          <div className="absolute bottom-16 left-4 z-20">
            <ChatEmojiPicker onEmojiClick={(emoji: any) => {
              setMessage((prev) => prev + emoji.native);
              setShowEmoji(false);
              inputRef.current?.focus();
            }} />
          </div>
        )}

        <div className="flex items-center gap-2 p-2 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowEmoji(!showEmoji)}
            className="bg-blue-100 hover:bg-purple-200"
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border-indigo-200 focus:border-indigo-500"
          />
          <Button
            onClick={handleSend}
            className="bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}