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

  // Add to component state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [includeDocumentForImage, setIncludeDocumentForImage] = useState(false);

  const [imageModel, setImageModel] = useState('flux');
  const [generatedImages, setGeneratedImages] = useState<Array<{
    url: string;
    prompt: string;
    model: string;
    timestamp: Date;
  }>>([]);

  const availableImageModelsV0 = [
    { id: 'flux', name: 'Flux', description: 'High quality, balanced', provider: 'Pollinations' },
    { id: 'flux-realism', name: 'Flux Realism', description: 'Photorealistic images', provider: 'Pollinations' },
    { id: 'flux-anime', name: 'Flux Anime', description: 'Anime style art', provider: 'Pollinations' },
    { id: 'turbo', name: 'Turbo', description: 'Fast generation', provider: 'Pollinations' },
  ];

  // Update available image models with ALL options
  const availableImageModels = [
    // Pollinations.ai - FREE
    {
      id: 'pollinations-flux',
      name: 'Pollinations Flux',
      description: 'FREE - High quality, no API key',
      provider: 'Pollinations',
      api: 'pollinations',
      cost: 'Free'
    },
    {
      id: 'pollinations-flux-realism',
      name: 'Pollinations Flux Realism',
      description: 'FREE - Photorealistic',
      provider: 'Pollinations',
      api: 'pollinations',
      cost: 'Free'
    },
    {
      id: 'pollinations-flux-anime',
      name: 'Pollinations Flux Anime',
      description: 'FREE - Anime style',
      provider: 'Pollinations',
      api: 'pollinations',
      cost: 'Free'
    },
    {
      id: 'pollinations-turbo',
      name: 'Pollinations Turbo',
      description: 'FREE - Fast generation',
      provider: 'Pollinations',
      api: 'pollinations',
      cost: 'Free'
    },

    // Hugging Face - FREE with queue
    {
      id: 'hf-sdxl',
      name: 'Stable Diffusion XL',
      description: 'FREE - Queue-based',
      provider: 'Hugging Face',
      api: 'huggingface',
      cost: 'Free (slower)'
    },
    {
      id: 'hf-flux-schnell',
      name: 'FLUX.1 Schnell',
      description: 'FREE - Fast, good quality',
      provider: 'Hugging Face',
      api: 'huggingface',
      cost: 'Free (slower)'
    },

    // Replicate - Paid but best quality
    {
      id: 'replicate-flux-pro',
      name: 'FLUX.1 Pro',
      description: 'Best quality available',
      provider: 'Replicate',
      api: 'replicate',
      cost: '$0.05/img (50 free)'
    },
    {
      id: 'replicate-flux-dev',
      name: 'FLUX.1 Dev',
      description: 'High quality, faster',
      provider: 'Replicate',
      api: 'replicate',
      cost: '$0.003/img'
    },
  ];

  const handleImageGenerateV0 = async () => {
    if (!imagePrompt.trim()) return;

    setImageLoading(true);
    try {
      // Using Pollinations.ai (FREE, no API key needed)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=512&height=512&nologo=true`;

      // setGeneratedImages(prev => [...prev, { url: imageUrl, prompt: imagePrompt }]);
      setImagePrompt('');
      toast.success('✨ Image generated!');
    } catch (error) {
      toast.error('Failed to generate image');
    } finally {
      setImageLoading(false);
    }
  };

  const insertImageIntoEditorV0 = (imageUrl: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    toast.success('Image inserted into document');
    onClose(); // Close sidebar after inserting
  };

  const downloadImageV0 = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${prompt.slice(0, 30)}.png`;
      link.click();
      toast.success('Image downloaded');
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleImageGenerateV1 = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setImageLoading(true);

    try {
      // Enhanced prompt with document context if enabled
      let finalPrompt = imagePrompt;
      if (includeDocumentForImage && documentContent) {
        finalPrompt = `Based on this context: ${documentContent.slice(0, 500)}...\n\nGenerate: ${imagePrompt}`;
      }

      console.log('🎨 Generating image with:', {
        prompt: finalPrompt,
        model: imageModel,
        includeDocument: includeDocumentForImage
      });

      // Pollinations.ai API - FREE, no API key needed
      const encodedPrompt = encodeURIComponent(finalPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=${imageModel}&nologo=true&enhance=true`;

      console.log('📡 API URL:', imageUrl);

      // Verify image loads
      const img = new Image();
      img.onload = () => {
        console.log('✅ Image loaded successfully');
        setGeneratedImages(prev => [{
          url: imageUrl,
          prompt: imagePrompt,
          model: imageModel,
          timestamp: new Date()
        }, ...prev]);
        setImagePrompt('');
        toast.success('✨ Image generated!');
      };

      img.onerror = () => {
        console.error('❌ Failed to load image');
        toast.error('Failed to generate image. Try a different prompt.');
      };

      img.src = imageUrl;

    } catch (error: any) {
      console.error('💥 Image generation error:', error);
      toast.error('Failed to generate image');
    } finally {
      setImageLoading(false);
    }
  };

  const insertImageIntoEditor = (imageUrl: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    toast.success('📷 Image inserted!');
  };

  const downloadImage = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.png`;
      link.click();
      toast('⬇️ Image Downloaded!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const regenerateImage = (prompt: string, model: string) => {
    setImagePrompt(prompt);
    setImageModel(model);
    handleImageGenerate();
  };

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

  const handleImageGenerate = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setImageLoading(true);

    try {
      // Enhanced prompt with document context if enabled
      let finalPrompt = imagePrompt;
      if (includeDocumentForImage && documentContent) {
        finalPrompt = `Based on this context: ${documentContent.slice(0, 500)}...\n\nGenerate: ${imagePrompt}`;
      }

      console.log('🎨 [Frontend] Starting image generation');
      console.log('📝 [Frontend] Prompt:', finalPrompt);
      console.log('🤖 [Frontend] Model:', imageModel);

      // Call our API route
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          model: imageModel,
          width: 1024,  // HD quality
          height: 1024,
          enhance: true  // Enable AI enhancement for better quality
        }),
      });

      console.log('📡 [Frontend] API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [Frontend] API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      console.log('✅ [Frontend] API Response:', data);

      if (!data.imageUrl) {
        throw new Error('No image URL received');
      }

      // Add to gallery
      setGeneratedImages(prev => [{
        url: data.imageUrl,
        prompt: imagePrompt,
        model: imageModel,
        timestamp: new Date()
      }, ...prev]);

      setImagePrompt('');
      toast.success('✨ Image generated successfully!');

      console.log('🎉 [Frontend] Image added to gallery');

    } catch (error: any) {
      console.error('💥 [Frontend] Error:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setImageLoading(false);
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
              {/* Chat Header with Clear Button */}
              <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <PiRobot className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-semibold text-gray-700">Chat Assistant</span>
                  <Badge variant="outline" className="text-xs">
                    {chatMessages.length} messages
                  </Badge>
                </div>
                {chatMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setChatMessages([]);
                      toast.success('Chat cleared');
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <PiRobot className="h-16 w-16 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">Start a conversation</p>
                    <p className="text-xs mt-1">Ask anything about your document</p>

                    {/* Suggested Prompts */}
                    <div className="mt-6 space-y-2">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Try asking:</p>
                      {['Summarize this document', 'What are the key points?', 'Explain this in simple terms'].map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setChatPrompt(suggestion)}
                          className="block w-full text-left px-3 py-2 text-xs bg-white border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                        >
                          💡 {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`group relative p-3 rounded-lg ${msg.role === 'user'
                        ? 'bg-blue-50 border border-blue-200 ml-8'
                        : 'bg-purple-50 border border-purple-200 mr-8'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {msg.role === 'ai' && <PiSparkle className="h-3 w-3 text-purple-600" />}
                          <span className="text-xs font-semibold">
                            {msg.role === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                        </div>
                        {/* Copy button */}
                        <button
                          onClick={() => copyText(msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/50"
                        >
                          <LuCopy className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t bg-linear-to-br from-gray-50 to-white space-y-3 shrink-0">
                {/* Model & Context Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={includeDocument}
                      onCheckedChange={setIncludeDocument}
                      id="include-doc"
                    />
                    <label htmlFor="include-doc" className="text-xs text-gray-600 flex items-center gap-1 cursor-pointer">
                      <FileText className="h-3 w-3" />
                      Include document {includeDocument && `(${documentContent.length} chars)`}
                    </label>
                  </div>
                  <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md font-semibold text-purple-700 bg-purple-100 border border-purple-200">
                    <Sparkles className="h-3 w-3" />
                    {chatModel.split('-')[0]}
                  </div>
                </div>

                {/* Input Area */}
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
                    placeholder={includeDocument
                      ? "Ask about your document..."
                      : "Type your message..."
                    }
                    className="flex-1 resize-none h-20 text-sm"
                    disabled={chatLoading}
                  />
                  <Button
                    onClick={handleChatSubmit}
                    disabled={chatLoading || !chatPrompt.trim()}
                    className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 self-end"
                  >
                    {chatLoading ? (
                      <Sparkles className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Help Text */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-gray-200 rounded font-mono">⏎</kbd> Send •
                    <kbd className="px-1.5 py-0.5 bg-gray-200 rounded font-mono ml-1">Shift+⏎</kbd> New line
                  </span>
                  {chatLoading && (
                    <span className="text-purple-600 animate-pulse">Thinking...</span>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Images Tab */}
            {/* <TabsContent value="images" className="flex-1 p-4 overflow-y-auto">
              <div className="text-center py-8 text-gray-400">
                <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Image Generation</p>
                <p className="text-xs mt-1">Coming soon! Generate images with AI</p>
              </div>
            </TabsContent> */}

            {/* Images Tab */}
            <TabsContent value="img" className="flex-1 flex flex-col overflow-hidden">
              {/* Gallery Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {generatedImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No images generated yet</p>
                    <p className="text-xs mt-1 mb-4">Create AI images and insert them into your document</p>

                    {/* Example Prompts */}
                    <div className="text-left max-w-sm mx-auto space-y-2">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Try these prompts:</p>
                      {[
                        'A futuristic office workspace',
                        'Abstract geometric pattern',
                        'Minimalist logo design'
                      ].map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => setImagePrompt(example)}
                          className="block w-full text-left px-3 py-2 text-xs bg-white border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                        >
                          💡 {example}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {generatedImages.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Image */}
                        <div className="relative group">
                          <img
                            src={img.url}
                            alt={img.prompt}
                            className="w-full aspect-square object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', img.url);
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage failed to load%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Image Info */}
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              🤖 {img.model}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(img.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <p className="text-xs text-gray-700 line-clamp-2">
                            {img.prompt}
                          </p>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => insertImageIntoEditor(img.url)}
                              className="text-xs h-8 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                              📝 Insert
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadImage(img.url, img.prompt)}
                              className="text-xs h-8"
                            >
                              ⬇️ Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => regenerateImage(img.prompt, img.model)}
                              className="text-xs h-8"
                            >
                              🔄 Regenerate
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Clear All Button */}
                    {generatedImages.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setGeneratedImages([]);
                          toast.success('Gallery cleared');
                        }}
                        className="w-full text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All Images
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Image Generation Input - Bottom */}
              <div className="p-4 border-t bg-linear-to-br from-gray-50 to-white space-y-3 shrink-0">
                {/* Model & Context Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={includeDocumentForImage}
                      onCheckedChange={setIncludeDocumentForImage}
                      id="include-doc-image"
                    />
                    <label htmlFor="include-doc-image" className="text-xs text-gray-600 flex items-center gap-1 cursor-pointer">
                      <FileText className="h-3 w-3" />
                      Context {includeDocumentForImage && `(${documentContent.length} chars)`}
                    </label>
                  </div>

                  {/* Model Selector */}
                  <select
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value)}
                    className="text-xs px-2 py-1 rounded-md font-semibold border bg-white"
                  >
                    {availableImageModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prompt Input */}
                <Textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleImageGenerate();
                    }
                  }}
                  placeholder={includeDocumentForImage
                    ? "Describe image based on your document..."
                    : "Describe the image you want to generate..."
                  }
                  className="resize-none h-20 text-sm"
                  disabled={imageLoading}
                />

                {/* Generate Button */}
                {/* <Button
                  onClick={handleImageGenerate}
                  disabled={imageLoading || !imagePrompt.trim()}
                  className="w-full bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  {imageLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button> */}

                {/* Generate Button */}
                <Button
                  onClick={handleImageGenerate}
                  disabled={imageLoading || !imagePrompt.trim()}
                  className="w-full bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {imageLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin mr-2" />
                      Generating... Please wait
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate HD Image
                    </>
                  )}
                </Button>

                {/* Help Text */}
                <p className="text-xs text-gray-500 text-center">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded font-mono">Ctrl+Enter</kbd> to generate
                </p>
              </div>
            </TabsContent>

            <TabsContent value="images" className="flex-1 flex flex-col overflow-hidden">
              {/* Gallery Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {imageLoading && generatedImages.length === 0 && (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm animate-pulse">
                      <div className="aspect-square bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <div className="text-center">
                          <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-400 animate-spin" />
                          <p className="text-sm font-medium text-purple-600">Generating your image...</p>
                          <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                )}

                {!imageLoading && generatedImages.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No images generated yet</p>
                    <p className="text-xs mt-1 mb-4">Create AI images and insert them into your document</p>

                    {/* Example Prompts */}
                    <div className="text-left max-w-sm mx-auto space-y-2">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Try these prompts:</p>
                      {[
                        'A futuristic office workspace with holographic displays',
                        'Abstract geometric pattern in vibrant colors',
                        'Minimalist logo design for tech company'
                      ].map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => setImagePrompt(example)}
                          className="block w-full text-left px-3 py-2 text-xs bg-white border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                        >
                          💡 {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {generatedImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No images generated yet</p>
                    <p className="text-xs mt-1 mb-4">Create AI images and insert them into your document</p>

                    {/* Example Prompts */}
                    <div className="text-left max-w-sm mx-auto space-y-2">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Try these prompts:</p>
                      {[
                        'A futuristic office workspace',
                        'Abstract geometric pattern',
                        'Minimalist logo design'
                      ].map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => setImagePrompt(example)}
                          className="block w-full text-left px-3 py-2 text-xs bg-white border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                        >
                          💡 {example}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {generatedImages.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Image */}
                        <div className="relative group">
                          <img
                            src={img.url}
                            alt={img.prompt}
                            className="w-full aspect-square object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', img.url);
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage failed to load%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Image Info */}
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              🤖 {img.model}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(img.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <p className="text-xs text-gray-700 line-clamp-2">
                            {img.prompt}
                          </p>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => insertImageIntoEditor(img.url)}
                              className="text-xs h-8 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                              📝 Insert
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadImage(img.url, img.prompt)}
                              className="text-xs h-8"
                            >
                              ⬇️ Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => regenerateImage(img.prompt, img.model)}
                              className="text-xs h-8"
                            >
                              🔄 Regenerate
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Clear All Button */}
                    {generatedImages.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setGeneratedImages([]);
                          toast.success('Gallery cleared');
                        }}
                        className="w-full text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All Images
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Image Generation Input - Bottom */}
              <div className="p-4 border-t bg-linear-to-br from-gray-50 to-white space-y-3 shrink-0">
                {/* Model & Context Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={includeDocumentForImage}
                      onCheckedChange={setIncludeDocumentForImage}
                      id="include-doc-image"
                    />
                    <label htmlFor="include-doc-image" className="text-xs text-gray-600 flex items-center gap-1 cursor-pointer">
                      <FileText className="h-3 w-3" />
                      Context {includeDocumentForImage && `(${documentContent.length} chars)`}
                    </label>
                  </div>

                  {/* Model Selector */}
                  <select
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value)}
                    className="text-xs px-2 py-1 rounded-md font-semibold border bg-white"
                  >
                    {availableImageModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prompt Input */}
                <Textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleImageGenerate();
                    }
                  }}
                  placeholder={includeDocumentForImage
                    ? "Describe image based on your document..."
                    : "Describe the image you want to generate..."
                  }
                  className="resize-none h-20 text-sm"
                  disabled={imageLoading}
                />

                {/* Generate Button */}
                <Button
                  onClick={handleImageGenerate}
                  disabled={imageLoading || !imagePrompt.trim()}
                  className="w-full bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {imageLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin mr-2" />
                      Generating... Please wait
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate HD Image
                    </>
                  )}
                </Button>

                {/* Help Text */}
                <p className="text-xs text-gray-500 text-center">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded font-mono">Ctrl+Enter</kbd> to generate
                </p>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  AI Model Settings
                </h4>

                {/* Text Models Section */}
                <div className="mb-6">
                  <h5 className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Text Generation Models
                  </h5>

                  {/* Toolbar Model */}
                  <div className="space-y-2 mb-3">
                    <label className="text-xs font-medium text-gray-600">Toolbar AI Model</label>
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
                    <label className="text-xs font-medium text-gray-600">Chat AI Model</label>
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

                {/* Image Models Section */}
                <div className="mb-6">
                  <h5 className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Image Generation Models
                  </h5>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">Image Model</label>
                    <select
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      className="w-full p-2 text-sm border rounded-lg bg-white"
                    >
                      {availableImageModels.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Available Text Models */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Available Text Models</h4>
                <div className="space-y-2">
                  {availableModels.map(model => (
                    <div key={model.id} className="p-3 bg-gray-50 rounded-lg border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model.name}</span>
                        <Badge variant="secondary" className="text-xs">{model.provider}</Badge>
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

              {/* Available Image Models */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Available Image Models</h4>
                <div className="space-y-2">
                  {availableImageModels.map(model => (
                    <div key={model.id} className="p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model.name}</span>
                        <Badge variant="secondary" className="text-xs">{model.provider}</Badge>
                      </div>
                      <p className="text-xs text-gray-600">{model.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Info */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>🎉 All Free!</strong> Text models have daily limits. Image generation via Pollinations.ai is completely free with no API key required.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
}