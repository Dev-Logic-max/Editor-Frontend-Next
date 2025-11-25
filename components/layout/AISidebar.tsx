'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Editor } from '@tiptap/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PiSparkle, PiRobot } from 'react-icons/pi';
import { X, History, MessageSquare, Image as ImageIcon, Settings, Send, FileText, Sparkles } from 'lucide-react';

import toast from 'react-hot-toast';
import { LuCopy } from 'react-icons/lu';

interface AISidebarTabsProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  history?: Array<{
    original: string;
    improved: string;
    action: string;
    timestamp: Date;
    model?: string;
    status?: 'pending' | 'accepted' | 'rejected' | 'error';
  }>;
  documentContent?: string;
}

export function AIComparisonSidebar({
  editor,
  isOpen,
  onClose,
  history = [],
  documentContent = '',
}: AISidebarTabsProps) {
  const [activeTab, setActiveTab] = useState('tracking');

  // Chat state
  const [chatPrompt, setChatPrompt] = useState('');
  const [includeDocument, setIncludeDocument] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);

  // Settings state
  const [toolbarModel, setToolbarModel] = useState('llama-3.3-70b-versatile');
  const [chatModel, setChatModel] = useState('llama-3.3-70b-versatile');

  // Expand states per item
  const [expandedIndex, setExpandedIndex] = useState<{ [key: number]: { original: boolean; improved: boolean } }>({});

  console.log("History Initial", history)

  useEffect(() => {
    console.log('📊 Sidebar history updated:', history);
  }, [history]);

  useEffect(() => {
    if (isOpen) {
      console.log('👀 Sidebar opened with history:', history);
    }
  }, [isOpen, history]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const availableModels = [
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B',
      description: 'Best quality, balanced speed',
      limit: '6000 requests/day',
      provider: 'Groq'
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B',
      description: 'Ultra fast, lighter tasks',
      limit: '14000 requests/day',
      provider: 'Groq'
    },
    {
      id: 'gemma2-9b-it',
      name: 'Gemma 2 9B',
      description: 'Good balance',
      limit: '14000 requests/day',
      provider: 'Groq'
    },
  ];

  const handleChatSubmit = async () => {
    if (!chatPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setChatLoading(true);

    // Add user message
    const userMessage = { role: 'user' as const, content: chatPrompt };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chatPrompt,
          documentContext: includeDocument ? documentContent : undefined,
          model: chatModel,
        }),
      });

      const data = await response.json();

      if (data.result) {
        setChatMessages(prev => [...prev, { role: 'ai', content: data.result }]);
        setChatPrompt('');
        toast.success('✨ Response received!');
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || 'Failed to process chat');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-screen w-[420px] bg-white border-l shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-linear-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-2">
              <PiSparkle className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 p-1 bg-gray-100 shrink-0">
              <TabsTrigger value="tracking" className="text-xs">
                <History className="h-3.5 w-3.5 mr-1" />
                History
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="images" className="text-xs">
                <ImageIcon className="h-3.5 w-3.5 mr-1" />
                Images
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="h-3.5 w-3.5 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="flex-1 overflow-y-auto p-4 pt-0 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-gray-700">AI Suggestions History</div>
                <Badge variant="secondary" className="text-xs border border-purple-400 bg-blue-50">{history.length} total</Badge>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History className="h-16 w-16 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No history yet</p>
                  <p className="text-xs mt-1">AI suggestions will appear here</p>
                </div>
              ) : (
                <>
                  {history.map((item, idx) => {
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                      accepted: 'bg-green-100 text-green-700 border-green-300',
                      rejected: 'bg-red-100 text-red-700 border-red-300',
                      error: 'bg-gray-100 text-gray-700 border-gray-300',
                    };

                    const statusIcons = {
                      pending: '⏳',
                      accepted: '✅',
                      rejected: '❌',
                      error: '⚠️',
                    };

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 bg-linear-to-br from-gray-50 to-white rounded-lg border shadow-sm hover:shadow-md transition-shadow space-y-2"
                      >
                        {/* Header Row */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs font-medium border bg-linear-to-br from-indigo-50 to-blue-50 border-blue-200">
                            <Sparkles className="h-3 w-3 mr-1 inline" />
                            {item.action}
                          </Badge>

                          <div className="flex items-center gap-2">
                            {item.model && (
                              <Badge variant="outline" className="text-xs">
                                🤖 {item.model.split('-')[0]}
                              </Badge>
                            )}
                            <Badge
                              className={`text-xs border ${statusColors[item.status || 'pending']}`}
                            >
                              {statusIcons[item.status || 'pending']} {item.status || 'pending'}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="text-xs space-y-2">
                          <div className='group'>
                            <div className='flex'>
                              <strong className="text-gray-600">Original:</strong>
                              <button
                                onClick={() => copyText(item.original)}
                                className="text-xs ms-auto p-1 rounded hover:bg-gray-200"
                              >
                                <LuCopy />
                              </button>
                            </div>
                            <div
                              className={`relative bg-gray-100 p-2 rounded text-gray-700 mt-0.5 ${expandedIndex[idx]?.original ? "" : "line-clamp-2"}`}
                              onMouseEnter={() =>
                                setExpandedIndex((prev) => ({
                                  ...prev,
                                  [idx]: { ...prev[idx], original: prev[idx]?.original || false }
                                }))
                              }
                            >
                              {item.original}

                              {/* Show More / Less */}
                              {item.original.length > 120 && (
                                <button
                                  onClick={() =>
                                    setExpandedIndex((prev) => ({
                                      ...prev,
                                      [idx]: {
                                        ...prev[idx],
                                        original: !prev[idx]?.original
                                      }
                                    }))
                                  }
                                  className="absolute hidden group-hover:block bottom-1 right-1 px-2 py-0.5 text-[10px] rounded-md backdrop-blur-md bg-white/50 shadow-sm border text-gray-700 hover:text-purple-600"
                                >
                                  {expandedIndex[idx]?.original ? "Show less" : "Show more"}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className='group'>
                            <div className='flex'>
                              <strong className="text-purple-600">Improved:</strong>
                              <button
                                onClick={() => copyText(item.improved)}
                                className="text-xs ms-auto p-1 rounded hover:bg-gray-200"
                              >
                                <LuCopy />
                              </button>
                            </div>
                            <div
                              className={`relative bg-purple-50 p-2 rounded border border-purple-100 text-gray-700 mt-0.5 ${expandedIndex[idx]?.improved ? "" : "line-clamp-3"}`}
                              onMouseEnter={() =>
                                setExpandedIndex((prev) => ({
                                  ...prev,
                                  [idx]: { ...prev[idx], improved: prev[idx]?.improved || false }
                                }))
                              }
                            >
                              {item.improved}

                              {/* Show More / Less */}
                              {item.improved.length > 200 && (
                                <button
                                  onClick={() =>
                                    setExpandedIndex((prev) => ({
                                      ...prev,
                                      [idx]: {
                                        ...prev[idx],
                                        improved: !prev[idx]?.improved
                                      }
                                    }))
                                  }
                                  className="absolute hidden group-hover:block bottom-1 right-1 px-2 py-0.5 text-[10px] rounded-md backdrop-blur-md bg-white/50 shadow-sm border text-gray-700 hover:text-purple-600"
                                >
                                  {expandedIndex[idx]?.improved ? "Show less" : "Show more"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            🕒 {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            🗓️ {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Last Updated Footer */}
                  <div className="mt-4 pt-3 border-t text-center">
                    <p className="text-xs text-gray-500">
                      Last updated: {history.length > 0 ? new Date(history[0].timestamp).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <PiRobot className="h-16 w-16 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">Start a conversation</p>
                    <p className="text-xs mt-1">Ask anything about your document</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${msg.role === 'user'
                        ? 'bg-blue-50 border border-blue-200 ml-8'
                        : 'bg-purple-50 border border-purple-200 mr-8'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'ai' && <PiSparkle className="h-3 w-3 text-purple-600" />}
                        <span className="text-xs font-semibold">
                          {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t bg-gray-50 space-y-3 shrink-0">
                <div className='flex items-center justify-between'>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={includeDocument}
                      onCheckedChange={setIncludeDocument}
                      id="include-doc"
                    />
                    <label htmlFor="include-doc" className="text-xs text-gray-600 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Include document context
                    </label>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-md font-semibold text-gray-600 bg-gray-200">
                    {chatModel}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                    placeholder="Ask anything about your document..."
                    className="flex-1 resize-none h-20 text-sm"
                    disabled={chatLoading}
                  />
                  <Button
                    onClick={handleChatSubmit}
                    disabled={chatLoading || !chatPrompt.trim()}
                    className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {chatLoading ? (
                      <Sparkles className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift+Enter</kbd> for new line
                </p>
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="flex-1 p-4 overflow-y-auto">
              <div className="text-center py-8 text-gray-400">
                <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Image Generation</p>
                <p className="text-xs mt-1">Coming soon! Generate images with AI</p>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3">AI Model Settings</h4>

                {/* Toolbar Model */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-medium text-gray-600">
                    Toolbar AI Model
                  </label>
                  <select
                    value={toolbarModel}
                    onChange={(e) => setToolbarModel(e.target.value)}
                    className="w-full p-2 text-sm border rounded-lg bg-white"
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chat Model */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">
                    Chat AI Model
                  </label>
                  <select
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value)}
                    className="w-full p-2 text-sm border rounded-lg bg-white"
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Available Models */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Available Models</h4>
                <div className="space-y-2">
                  {availableModels.map(model => (
                    <div key={model.id} className="p-3 bg-gray-50 rounded-lg border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {model.provider}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{model.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Sparkles className="h-3 w-3" />
                        <span>{model.limit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Info */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> All models are free tier with daily limits.
                  Models automatically refresh every 24 hours.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
}