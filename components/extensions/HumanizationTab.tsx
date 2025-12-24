// components/analysis/HumanizationTab.tsx
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import { humanizeText, checkTextLimit, estimateProcessingTime, AI_MODELS, type HumanizeResult } from '@/lib/api/aiAnalysis';

import { Wand2, Sparkles, TrendingDown, AlertCircle, CheckCircle2, Copy, RefreshCw, Download, FileText, Lock, Zap, ArrowRight } from 'lucide-react';

interface HumanizationTabProps {
  editor: Editor | null;
  documentContent: string;
  plan: 'basic' | 'pro' | 'ultra';
  selectedModel: string;
  selectedMode: 'natural' | 'formal' | 'casual' | 'creative';
  onModelChange: (model: string) => void;
  onModeChange: (mode: 'natural' | 'formal' | 'casual' | 'creative') => void;
}

export function HumanizationTab({
  editor,
  documentContent,
  plan,
  selectedModel,
  selectedMode,
  onModelChange,
  onModeChange
}: HumanizationTabProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [useDocumentContent, setUseDocumentContent] = useState(plan !== 'basic');
  const [manualText, setManualText] = useState('');

  const textToProcess = useDocumentContent ? documentContent : manualText;
  const textLimit = checkTextLimit(textToProcess, plan, 'humanization');
  const canHumanize = textLimit.withinLimit && textToProcess.length > 20;

  const handleHumanize = async () => {
    if (!canHumanize) {
      toast.error('Text must be between 20 characters and your plan limit');
      return;
    }

    setLoading(true);
    
    try {
      toast.loading('Humanizing text...', { id: 'humanize' });
      
      const humanizeResult = await humanizeText(textToProcess, selectedModel as any, selectedMode);
      
      setResult(humanizeResult);
      toast.success('Text humanized successfully!', { id: 'humanize' });
      
    } catch (error: any) {
      console.error('Humanization error:', error);
      toast.error(error.message || 'Failed to humanize text', { id: 'humanize' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!result || !editor) return;
    
    // Replace editor content with humanized text
    editor.commands.setContent(result.humanized);
    toast.success('✅ Humanized text applied to document!');
  };

  const handleCopy = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.humanized);
      toast.success('📋 Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const modes = [
    { id: 'natural', name: 'Natural', icon: '✨', desc: 'Balanced and natural' },
    { id: 'formal', name: 'Formal', icon: '🎓', desc: 'Professional tone' },
    { id: 'casual', name: 'Casual', icon: '😊', desc: 'Conversational style' },
    { id: 'creative', name: 'Creative', icon: '🎨', desc: 'Engaging and unique' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        
        {/* Character Limit Warning */}
        {!textLimit.withinLimit && (
          <Alert className="border-2 border-amber-300 bg-linear-to-r from-amber-50 to-orange-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm">
              <strong className="text-amber-900">Character limit exceeded!</strong>
              <div className="mt-1 text-amber-800">
                Your text has <strong>{textLimit.charCount.toLocaleString()}</strong> characters, 
                but your <strong>{plan.toUpperCase()}</strong> plan allows <strong>{textLimit.limit.toLocaleString()}</strong>.
                {plan === 'basic' && (
                  <>
                    <br />
                    <span className="text-xs">💡 Upgrade to Pro for 5,000 characters or Ultra for 15,000 characters!</span>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Content Source Selection */}
        <Card className="p-4 bg-linear-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                Content Source
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">Choose what text to humanize</p>
            </div>
            {plan === 'basic' && useDocumentContent && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-300 border">
                <Lock className="h-3 w-3 mr-1" />
                Pro Feature
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Switch
              checked={useDocumentContent}
              onCheckedChange={setUseDocumentContent}
              disabled={plan === 'basic'}
              id="use-doc"
            />
            <label htmlFor="use-doc" className="flex-1 cursor-pointer">
              <span className="text-sm font-medium text-gray-900">
                Use entire document content
              </span>
              <p className="text-xs text-gray-600">
                {plan === 'basic' 
                  ? '🔒 Available in Pro and Ultra plans'
                  : `✅ Will process ${documentContent.length.toLocaleString()} characters`
                }
              </p>
            </label>
            <Badge variant="outline">
              {useDocumentContent ? documentContent.length : manualText.length} chars
            </Badge>
          </div>
        </Card>

        {/* Manual Text Input (Basic Plan) */}
        {!useDocumentContent && (
          <Card className="p-4 bg-white border-2">
            <label className="block mb-2">
              <span className="text-sm font-semibold text-gray-900">Paste your text here</span>
              <p className="text-xs text-gray-600">Enter the text you want to humanize</p>
            </label>
            <Textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste your AI-generated text here..."
              className="min-h-[200px] resize-none text-sm"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
              <span>Characters: {manualText.length.toLocaleString()} / {textLimit.limit.toLocaleString()}</span>
              {manualText.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setManualText('')}
                  className="h-6 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Humanization Mode */}
        <Card className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Humanization Mode
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id as any)}
                disabled={loading}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  selectedMode === mode.id
                    ? 'bg-linear-to-br from-blue-500 to-indigo-500 border-blue-500 text-white shadow-lg'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-1">{mode.icon}</div>
                <div className={`text-sm font-bold ${selectedMode === mode.id ? 'text-white' : 'text-gray-900'}`}>
                  {mode.name}
                </div>
                <div className={`text-[10px] ${selectedMode === mode.id ? 'text-blue-100' : 'text-gray-600'}`}>
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Model Selection */}
        <Card className="p-4 bg-white border-2">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            AI Model
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {AI_MODELS.humanization.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                disabled={loading}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedModel === model.id
                    ? 'bg-linear-to-br from-purple-500 to-pink-500 border-purple-500 text-white shadow-lg'
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-xs font-bold ${selectedModel === model.id ? 'text-white' : 'text-gray-900'}`}>
                    {model.name}
                  </span>
                  {model.recommended && (
                    <Sparkles className={`h-3 w-3 ${selectedModel === model.id ? 'text-yellow-300' : 'text-yellow-500'}`} />
                  )}
                </div>
                <p className={`text-[10px] mb-2 ${selectedModel === model.id ? 'text-purple-100' : 'text-gray-600'}`}>
                  {model.description}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                    {model.speed}
                  </Badge>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                    {model.quality}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Humanize Button */}
        <div className="flex items-center justify-center">
          <Button
            onClick={handleHumanize}
            disabled={loading || !canHumanize}
            size="lg"
            className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-base font-semibold shadow-xl"
          >
            {loading ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                Humanizing...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Humanize Text
              </>
            )}
          </Button>
        </div>

        {loading && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Estimated time: <strong>{estimateProcessingTime(textToProcess.length, 'humanization')}</strong>
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Improvement Score */}
            <Card className="p-6 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Humanization Results</h3>
                <Badge className="bg-green-100 text-green-700 border-green-300 border-2 text-sm px-3 py-1">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {result.improvement}% More Human
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-red-100 rounded-lg border-2 border-red-200">
                  <div className="text-3xl font-bold text-red-600">{result.beforeScore}%</div>
                  <div className="text-xs text-gray-700 mt-1">Before (AI Score)</div>
                </div>
                <div className="text-center p-4 bg-green-100 rounded-lg border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600">{result.afterScore}%</div>
                  <div className="text-xs text-gray-700 mt-1">After (AI Score)</div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-xs text-gray-600 mb-1">AI Reduction</div>
                  <div className="text-lg font-bold text-green-600">{result.metrics.aiReduction}%</div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-xs text-gray-600 mb-1">Readability</div>
                  <div className="text-lg font-bold text-blue-600">{result.metrics.readabilityScore}</div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-xs text-gray-600 mb-1">Variation</div>
                  <div className="text-lg font-bold text-purple-600">{result.metrics.sentenceVariation}%</div>
                </div>
              </div>
            </Card>

            {/* Before/After Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 bg-red-50 border-2 border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Original (AI-like)</h4>
                  <Badge className="bg-red-100 text-red-700 border-red-300">
                    {result.beforeScore}% AI
                  </Badge>
                </div>
                <div className="p-3 bg-white rounded-lg border max-h-96 overflow-y-auto">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {result.original}
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-green-50 border-2 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Humanized</h4>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    {result.afterScore}% AI
                  </Badge>
                </div>
                <div className="p-3 bg-white rounded-lg border max-h-96 overflow-y-auto">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {result.humanized}
                  </p>
                </div>
              </Card>
            </div>

            {/* Changes Made */}
            {result.changes.length > 0 && (
              <Card className="p-4 bg-white border-2">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  Key Changes ({result.changes.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.changes.map((change, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-1">
                          <div className="text-xs text-red-600 line-through mb-1">{change.original}</div>
                          <div className="text-xs text-green-600 font-medium">{change.humanized}</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 italic">{change.reason}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={handleAccept}
                size="lg"
                className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={!editor}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Apply to Document
              </Button>
              
              <Button
                onClick={handleCopy}
                size="lg"
                variant="outline"
                className="border-2"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy Result
              </Button>
              
              <Button
                onClick={handleHumanize}
                size="lg"
                variant="outline"
                className="border-2"
                disabled={loading}
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Regenerate
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}