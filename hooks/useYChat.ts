'use client';

import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  color: string;
  colorLight: string;
  message: string;
  timestamp: number;
}

export function useYChat({
  ydoc,
  provider,
  documentId,
  userId,
  userName,
  avatar,
}: {
  ydoc: any;
  provider: any;
  documentId: string;
  userId: string;
  userName: string;
  avatar: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!ydoc || !provider) return;

    const yChat = ydoc.getArray('chat') as Y.Array<ChatMessage>;
    const yTyping = ydoc.getMap('typing');

    // Load initial messages
    setMessages(yChat.toArray());

    // Observe messages
    const observeMessages = () => {
      setMessages([...yChat.toArray()]);
    };
    yChat.observe(observeMessages);

    // Observe typing
    const observeTyping = () => {
      const users = Array.from(yTyping.keys())
        .filter((id) => yTyping.get(id)?.timestamp > Date.now() - 3000)
        .map((id) => yTyping.get(id)?.name || 'User');
      setTypingUsers(users);
    };
    yTyping.observe(observeTyping);

    // Set up awareness for typing
    const awareness = provider.awareness;
    const handleTyping = (e: any) => {
      if (e.added?.length > 0 || e.updated?.length > 0 || e.removed?.length > 0) {
        observeTyping();
      }
    };
    awareness.on('change', handleTyping);

    return () => {
      yChat.unobserve(observeMessages);
      yTyping.unobserve(observeTyping);
      awareness.off('change', handleTyping);
    };
  }, [ydoc, provider]);

  const sendMessage = (text: string) => {
    if (!ydoc) return;
    // const yChat = ydoc.getArray('chat');
    
    const yChat = ydoc.getArray('chat') as Y.Array<ChatMessage>;
    const hue = Math.abs(userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360;
    const message: ChatMessage = {
      id: uuidv4(),
      userId,
      name: userName,
      avatar,
      color: `hsl(${hue}, 80%, 60%)`,
      colorLight: `hsl(${hue}, 80%, 70%)`,
      message: text,
      timestamp: Date.now(),
    };
    yChat.push([message]);
  };

  const setTyping = (isTyping: boolean) => {
    if (!provider?.awareness) return;
    const current = provider.awareness.getLocalState();
    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      provider.awareness.setLocalStateField('typing', {
        name: userName,
        timestamp: Date.now(),
      });
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      const newState = { ...current };
      delete newState.typing;
      provider.awareness.setLocalState(newState);
    }
  };

  return { messages, sendMessage, typingUsers, setTyping };
}