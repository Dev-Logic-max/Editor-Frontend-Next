'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { BsStars, BsCheckCircle, BsExclamationTriangle, BsLightbulb } from 'react-icons/bs';
import { Loader2, Wand2, Info, TrendingDown, TrendingUp, Settings } from 'lucide-react';

interface AIAnalysisResult {
  aiPercentage: number;
  humanPercentage?: number;
  humanizedContent?: string;
  suggestions: string[];
  wordCount: number;
  analysisDate: string;
}

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: AIAnalysisResult | null;
  documentId: string;
  editor: any;
  defaultTab?: 'analysis' | 'humanize' | 'settings';
  showAnalysisTab?: boolean;
}

export function AIAnalysisModal({
  isOpen,
  onClose,
  analysisResult,
  documentId,
  editor,
  defaultTab = 'humanize',
  showAnalysisTab = true,
}: AIAnalysisModalProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [humanizedContent, setHumanizedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [showHumanized, setShowHumanized] = useState(false);

  const HUMANIZE_CHAR_LIMIT = 5000;

  /* ---------- Loading flag ---------- */
  const isLoading = isOpen && showAnalysisTab && !analysisResult;

  /* ---------- Human % ---------- */
  const humanPct = analysisResult?.humanPercentage ?? Math.max(
    0,
    100 - (analysisResult?.aiPercentage ?? 0)
  );

  /* ---------- Available Models ---------- */
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

  /* ---------- Handle Model Selection ---------- */
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    const selectedModelData = availableModels.find(m => m.id === modelId);
    console.log('🤖 Model Selected:', {
      id: modelId,
      name: selectedModelData?.name,
      provider: selectedModelData?.provider
    });
  };

  /* ---------- Load content when modal opens ---------- */
  useEffect(() => {
    if (isOpen && editor) {
      const selection = editor.state.selection;
      const { from, to } = selection;

      // If text is selected, use only that selection
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        setOriginalContent(selectedText);
      } else {
        // Otherwise use full document text
        setOriginalContent(editor.getText());
      }

      // Reset humanized content when modal opens
      setHumanizedContent('');
      setShowHumanized(false);
    }
  }, [isOpen, editor]);

  /* ---------- Helpers ---------- */
  const getScoreColor = (percentage: number) => {
    if (percentage < 30) return 'from-emerald-50 to-teal-50';
    if (percentage < 60) return 'from-amber-50 to-yellow-50';
    return 'from-rose-50 to-red-50';
  };

  const getScoreTextColor = (percentage: number) => {
    if (percentage < 30) return 'text-emerald-700';
    if (percentage < 60) return 'text-amber-700';
    return 'text-rose-700';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage < 30) return <BsCheckCircle className="w-8 h-8 text-emerald-600" />;
    return <BsExclamationTriangle className="w-8 h-8 text-amber-600" />;
  };

  const getStatusText = (percentage: number) => {
    if (percentage < 30) return 'Mostly Human-Written';
    if (percentage < 60) return 'Moderate AI Content';
    return 'High AI Content';
  };

  const getStatusDescription = (percentage: number) => {
    if (percentage < 30) return 'Your content appears to be authentically written with minimal AI assistance.';
    if (percentage < 60) return 'Your content shows a balanced mix of human and AI-generated text.';
    return 'Your content shows significant AI-generated patterns and may benefit from humanization.';
  };

  /* ---------- Humanize Content ---------- */
  const handleHumanizeContent = async () => {
    if (!editor) return;

    // Check character limit
    if (originalContent.length > HUMANIZE_CHAR_LIMIT) {
      toast.error(`Cannot humanize content longer than ${HUMANIZE_CHAR_LIMIT} characters.`);
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch('/api/remove-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: originalContent,
          model: selectedModel,
          documentId,
        }),
      });

      if (!response.ok) throw new Error('Failed to humanize content');

      const data = await response.json();
      if (data.humanizedContent) {
        setHumanizedContent(data.humanizedContent);
        setShowHumanized(true);
      }

    } catch (error) {
      console.error('Error humanizing content:', error);
      setHumanizedContent('Failed to humanize content. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  /* ---------- Accept humanized content ---------- */
  const handleAccept = () => {
    if (!editor || !humanizedContent) return;

    const selection = editor.state.selection;
    const { from, to } = selection;

    // Convert plain text to HTML with proper formatting
    const formatContent = (text: string) => {
      // Split by double newlines for paragraphs
      const paragraphs = text.split(/\n\n+/);

      return paragraphs
        .map(para => {
          // Handle single newlines within paragraphs as line breaks
          const withBreaks = para.split('\n').join('<br>');
          return `<p>${withBreaks}</p>`;
        })
        .join('');
    };

    const formattedContent = formatContent(humanizedContent);

    // If text was selected, replace only that selection
    if (from !== to && originalContent !== editor.getText()) {
      editor.chain().focus().deleteRange({ from, to }).insertContent(formattedContent).run();
    } else {
      // Replace entire document
      editor.commands.setContent(formattedContent);
    }

    onClose();
  };

  /* ---------- Reject and try better ---------- */
  const handleReject = () => {
    setShowHumanized(false);
    setHumanizedContent('');
  };

  const handleTryBetter = async () => {
    // Re-humanize with a different prompt or approach
    await handleHumanizeContent();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full lg:min-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-linear-to-br from-purple-500 to-indigo-600 rounded-lg">
              <BsStars className="w-6 h-6 text-white" />
            </div>
            <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {showAnalysisTab ? 'AI Content Analysis' : 'AI Content Tools'}
            </span>
            <Badge className="ml-2 bg-linear-to-r from-purple-500 to-indigo-500 text-white text-xs font-semibold px-3 py-1">
              Pro
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
              <div className="absolute inset-0 w-16 h-16 animate-ping rounded-full bg-purple-400 opacity-20" />
            </div>
            <p className="text-xl font-semibold text-gray-800">
              Analyzing your content…
            </p>
            <p className="text-sm text-gray-500 text-center max-w-md">
              Our AI is examining patterns, structure, and authenticity markers in your text.
            </p>
          </div>
        )}

        {/* Tabs */}
        {!isLoading && (
          <Tabs defaultValue={defaultTab} className="mt-6">
            <TabsList className={`grid w-full ${showAnalysisTab ? 'grid-cols-3' : 'grid-cols-2'} bg-gray-100 rounded-xl p-1 gap-1`}>
              {showAnalysisTab && (
                <TabsTrigger
                  value="analysis"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Analysis
                </TabsTrigger>
              )}
              <TabsTrigger
                value="humanize"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Humanize
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold"
              >
                <Settings className="w-4 h-4 mr-2" />
                Model
              </TabsTrigger>
            </TabsList>

            {/* ANALYSIS TAB */}
            {showAnalysisTab && analysisResult && (
              <TabsContent value="analysis" className="space-y-6 py-6">
                {/* Score Card */}
                <div className={`p-8 rounded-2xl bg-linear-to-br ${getScoreColor(analysisResult.aiPercentage)} border-2 border-white shadow-lg space-y-6`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      {getScoreIcon(analysisResult.aiPercentage)}
                      <div>
                        <h3 className={`text-2xl font-bold ${getScoreTextColor(analysisResult.aiPercentage)}`}>
                          {getStatusText(analysisResult.aiPercentage)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 max-w-md">
                          {getStatusDescription(analysisResult.aiPercentage)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="text-center">
                        <Badge className="bg-linear-to-br from-rose-500 to-red-600 text-white px-4 py-2 rounded-xl text-lg font-bold shadow-md">
                          {analysisResult.aiPercentage}%
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1 font-medium">AI Content</p>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-linear-to-br from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-lg font-bold shadow-md">
                          {humanPct}%
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1 font-medium">Human</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-rose-600" />
                          AI Generated Content
                        </p>
                        <span className="text-xs font-bold text-rose-600">{analysisResult.aiPercentage}%</span>
                      </div>
                      <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-4 rounded-full bg-linear-to-r from-rose-500 to-red-600 transition-all duration-1000 shadow-sm"
                          style={{ width: `${analysisResult.aiPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-emerald-600" />
                          Human Written Content
                        </p>
                        <span className="text-xs font-bold text-emerald-600">{humanPct}%</span>
                      </div>
                      <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-4 rounded-full bg-linear-to-r from-emerald-500 to-teal-600 transition-all duration-1000 shadow-sm"
                          style={{ width: `${humanPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-white shadow-md">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Word Count</p>
                    <p className="text-3xl font-bold text-indigo-700">{analysisResult.wordCount.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-white shadow-md">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Analysis Date</p>
                    <p className="text-sm font-bold text-purple-700">{new Date(analysisResult.analysisDate).toLocaleDateString()}</p>
                  </div>
                  <div className="p-6 bg-linear-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-white shadow-md">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Confidence</p>
                    <p className="text-3xl font-bold text-amber-700">High</p>
                  </div>
                </div>

                {/* Suggestions */}
                {analysisResult.suggestions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                      <div className="p-2 bg-linear-to-br from-amber-400 to-orange-500 rounded-lg">
                        <BsLightbulb className="w-5 h-5 text-white" />
                      </div>
                      Improvement Suggestions
                    </h4>
                    <div className="space-y-3">
                      {analysisResult.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 bg-linear-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="shrink-0 w-8 h-8 bg-linear-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                            {i + 1}
                          </span>
                          <p className="text-gray-700 font-medium pt-1">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            )}

            {/* HUMANIZE TAB */}
            <TabsContent value="humanize" className="py-6">
              <div className="space-y-6">
                {/* Original Content */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    {originalContent !== editor?.getText() ? 'Selected Text' : 'Document Content'}
                  </label>
                  <textarea
                    value={originalContent}
                    readOnly
                    className={`w-full h-48 p-4 border-2 rounded-xl bg-gray-50 text-gray-700 resize-none focus:outline-none
                    ${originalContent.length > HUMANIZE_CHAR_LIMIT ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {originalContent.split(' ').length} words
                  </p>
                  <p className={`text-xs mt-1 font-medium ${originalContent.length > HUMANIZE_CHAR_LIMIT ? 'text-red-600' : 'text-gray-500'}`}>
                    {originalContent.length}/{HUMANIZE_CHAR_LIMIT} characters
                    {originalContent.length > HUMANIZE_CHAR_LIMIT && ' - Limit exceeded!'}
                  </p>
                  {originalContent.length > HUMANIZE_CHAR_LIMIT && (
                    <p className="text-sm text-gray-600 mt-1">
                      Character limit exceeded! You can also select a snippet to humanize a particular part of your text.
                    </p>
                  )}
                </div>

                {/* Humanize Button */}
                {!showHumanized && (
                  <button
                    disabled={isRemoving || originalContent.length > HUMANIZE_CHAR_LIMIT}
                    onClick={handleHumanizeContent}
                    className="w-full py-4 rounded-xl font-bold text-lg
                   bg-linear-to-r from-purple-600 to-indigo-600 
                   text-white flex items-center justify-center gap-3 
                   shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700
                   transition-all duration-300 transform hover:scale-[1.02]
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isRemoving ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Humanizing Content...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-6 h-6" />
                        Humanize Content
                      </>
                    )}
                  </button>
                )}

                {/* Humanized Content */}
                {showHumanized && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        <BsStars className="w-4 h-4" />
                        Humanized Content
                      </label>
                      <textarea
                        value={humanizedContent}
                        readOnly
                        className="w-full h-48 p-4 border-2 border-purple-200 rounded-xl bg-purple-50/30 text-gray-800 resize-none focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {humanizedContent.split(' ').length} words
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={handleReject}
                        className="py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                      >
                        Reject
                      </button>
                      <button
                        onClick={handleTryBetter}
                        disabled={isRemoving}
                        className="py-3 rounded-xl font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all duration-200 disabled:opacity-50"
                      >
                        {isRemoving ? 'Processing...' : 'Try Better'}
                      </button>
                      <button
                        onClick={handleAccept}
                        className="py-3 rounded-xl font-semibold
                     bg-linear-to-r from-green-600 to-emerald-600
                     text-white
                     hover:from-green-700 hover:to-emerald-700
                     transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        Accept
                      </button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>


            {/* MODEL SETTINGS TAB */}
            <TabsContent value="settings" className="py-6">
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-linear-to-br from-purple-50 to-indigo-50 border-2 border-white shadow-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Select AI Model
                  </h3>

                  <div className="grid gap-3">
                    {availableModels.map((model) => (
                      <label
                        key={model.id}
                        className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedModel === model.id
                          ? 'bg-white border-purple-500 shadow-md'
                          : 'bg-white/50 border-gray-200 hover:border-purple-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="model"
                          value={model.id}
                          checked={selectedModel === model.id}
                          onChange={(e) => handleModelChange(e.target.value)}
                          className="mt-1 w-4 h-4 text-purple-600"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{model.name}</span>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              {model.provider}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Limit: {model.limit}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-100">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">About AI Models</p>
                      <p className="text-sm text-blue-700">
                        Different models offer varying levels of quality and speed. Choose based on your needs - larger models provide better results but may be slower, while smaller models are faster but less sophisticated.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}