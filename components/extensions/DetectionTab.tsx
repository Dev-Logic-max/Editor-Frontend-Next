// components/analysis/DetectionTab.tsx
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

import { detectAIContent, checkTextLimit, getClassificationColor, formatScore, getConfidenceLevel, estimateProcessingTime, AI_MODELS, type DetectionResult } from '@/lib/api/aiAnalysis';

import { ScanSearch, Sparkles, TrendingUp, AlertCircle, CheckCircle2, Brain, Zap, Target, ChevronRight } from 'lucide-react';

interface DetectionTabProps {
  editor: Editor | null;
  documentContent: string;
  plan: 'basic' | 'pro' | 'ultra';
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function DetectionTab({ editor, documentContent, plan, selectedModel, onModelChange }: DetectionTabProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [highlightedSentences, setHighlightedSentences] = useState<Set<number>>(new Set());

  const textLimit = checkTextLimit(documentContent, plan, 'detection');
  const canAnalyze = textLimit.withinLimit && documentContent.length > 50;

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      toast.error('Document must be between 50 characters and your plan limit');
      return;
    }

    setLoading(true);
    
    try {
      toast.loading('Analyzing content...', { id: 'detection' });
      
      const detectionResult = await detectAIContent(documentContent, selectedModel as any);
      
      setResult(detectionResult);
      toast.success('Analysis complete!', { id: 'detection' });
      
    } catch (error: any) {
      console.error('Detection error:', error);
      toast.error(error.message || 'Failed to analyze content', { id: 'detection' });
    } finally {
      setLoading(false);
    }
  };

  const getSentenceColor = (score: number) => {
    if (score < 0.33) return 'bg-green-100 hover:bg-green-200 border-green-300';
    if (score < 0.66) return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300';
    return 'bg-red-100 hover:bg-red-200 border-red-300';
  };

  const getSentenceLabel = (score: number) => {
    if (score < 0.33) return { text: 'Human', icon: '✍️', color: 'text-green-700' };
    if (score < 0.66) return { text: 'Mixed', icon: '🤔', color: 'text-yellow-700' };
    return { text: 'AI', icon: '🤖', color: 'text-red-700' };
  };

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
                Your document has <strong>{textLimit.charCount.toLocaleString()}</strong> characters, 
                but your <strong>{plan.toUpperCase()}</strong> plan allows <strong>{textLimit.limit.toLocaleString()}</strong>.
                <br />
                <span className="text-xs">Please upgrade to Pro or Ultra for larger documents.</span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Model Selection */}
        <Card className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                Detection Model
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">Choose your AI detection model</p>
            </div>
            <Badge variant="outline" className="bg-white border-blue-300">
              {AI_MODELS.detection.find(m => m.id === selectedModel)?.accuracy || 'N/A'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {AI_MODELS.detection.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                disabled={loading}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedModel === model.id
                    ? 'bg-linear-to-br from-blue-500 to-indigo-500 border-blue-500 text-white shadow-lg'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
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
                <p className={`text-[10px] ${selectedModel === model.id ? 'text-blue-100' : 'text-gray-600'}`}>
                  {model.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                    {model.speed}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Analyze Button */}
        <div className="flex items-center justify-center">
          <Button
            onClick={handleAnalyze}
            disabled={loading || !canAnalyze}
            size="lg"
            className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-6 text-base font-semibold shadow-xl"
          >
            {loading ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ScanSearch className="h-5 w-5 mr-2" />
                Analyze Document
              </>
            )}
          </Button>
        </div>

        {loading && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Estimated time: <strong>{estimateProcessingTime(documentContent.length, 'detection')}</strong>
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Overall Score */}
            <Card className="p-6 bg-linear-to-br from-white to-blue-50 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Overall Analysis</h3>
                <Badge 
                  className={`text-sm px-3 py-1 ${
                    result.classification === 'human' 
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : result.classification === 'ai'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                  } border-2`}
                >
                  {result.classification === 'human' && '✍️ Human Written'}
                  {result.classification === 'ai' && '🤖 AI Generated'}
                  {result.classification === 'mixed' && '🤔 Mixed Content'}
                </Badge>
              </div>

              {/* Score Circle */}
              <div className="flex items-center gap-8 mb-6">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - result.overallScore)}`}
                      className={
                        result.overallScore < 0.33 ? 'text-green-500' :
                        result.overallScore < 0.66 ? 'text-yellow-500' :
                        'text-red-500'
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {Math.round(result.overallScore * 100)}%
                    </span>
                    <span className="text-xs text-gray-600">AI Score</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-700">✍️ Human Written</span>
                      <span className="text-sm font-bold text-green-900">{result.metrics.humanPercentage}%</span>
                    </div>
                    <Progress value={result.metrics.humanPercentage} className="h-2 bg-green-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-yellow-700">🤔 Mixed Content</span>
                      <span className="text-sm font-bold text-yellow-900">{result.metrics.mixedPercentage}%</span>
                    </div>
                    <Progress value={result.metrics.mixedPercentage} className="h-2 bg-yellow-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-red-700">🤖 AI Generated</span>
                      <span className="text-sm font-bold text-red-900">{result.metrics.aiPercentage}%</span>
                    </div>
                    <Progress value={result.metrics.aiPercentage} className="h-2 bg-red-100" />
                  </div>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="text-sm text-gray-700">Confidence Level</span>
                <Badge variant="outline" className="font-semibold">
                  {getConfidenceLevel(result.confidence)} ({Math.round(result.confidence * 100)}%)
                </Badge>
              </div>
            </Card>

            {/* Detector Breakdown */}
            <Card className="p-6 bg-white border-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Detector Breakdown
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.detectors.sapling?.available && (
                  <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">Sapling AI</span>
                      <Badge variant="secondary" className="text-xs">97% Accuracy</Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {Math.round(result.detectors.sapling.score * 100)}%
                    </div>
                    <p className="text-xs text-gray-600">Professional detector</p>
                  </div>
                )}

                {result.detectors.groq?.available && (
                  <div className="p-4 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">Groq LLM</span>
                      <Badge variant="secondary" className="text-xs">Pattern Analysis</Badge>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {Math.round(result.detectors.groq.score * 100)}%
                    </div>
                    <p className="text-xs text-gray-600">AI pattern detection</p>
                  </div>
                )}

                {result.detectors.statistical?.available && (
                  <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">Statistical</span>
                      <Badge variant="secondary" className="text-xs">Fast Analysis</Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {Math.round(result.detectors.statistical.score * 100)}%
                    </div>
                    <p className="text-xs text-gray-600">Perplexity & burstiness</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Sentence Analysis */}
            <Card className="p-6 bg-white border-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Sentence-Level Detection
                <Badge variant="secondary">{result.sentenceScores.length} sentences</Badge>
              </h3>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {result.sentenceScores.map((item, idx) => {
                  const label = getSentenceLabel(item.score);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${getSentenceColor(item.score)}`}
                      onClick={() => {
                        const newSet = new Set(highlightedSentences);
                        if (newSet.has(idx)) {
                          newSet.delete(idx);
                        } else {
                          newSet.add(idx);
                        }
                        setHighlightedSentences(newSet);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-xs font-bold ${label.color}`}>
                          {label.icon} {label.text}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(item.score * 100)}% AI
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {item.sentence}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{result.metrics.totalSentences}</div>
                <div className="text-xs text-gray-700">Total Sentences</div>
              </Card>
              <Card className="p-4 bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200">
                <div className="text-2xl font-bold text-green-600">{result.metrics.humanSentences}</div>
                <div className="text-xs text-gray-700">Human Sentences</div>
              </Card>
              <Card className="p-4 bg-linear-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{result.metrics.mixedSentences}</div>
                <div className="text-xs text-gray-700">Mixed Sentences</div>
              </Card>
              <Card className="p-4 bg-linear-to-br from-red-50 to-red-100 border-2 border-red-200">
                <div className="text-2xl font-bold text-red-600">{result.metrics.aiSentences}</div>
                <div className="text-xs text-gray-700">AI Sentences</div>
              </Card>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}