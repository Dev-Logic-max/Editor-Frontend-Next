// components/analysis/SettingsTab.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { AI_MODELS, getCharacterLimit } from '@/lib/api/aiAnalysis';

import { Brain, Zap, Target, Sparkles, TrendingUp, Clock, CheckCircle2, ArrowRight, Info } from 'lucide-react';

interface SettingsTabProps {
  detectionModel: string;
  humanizationModel: string;
  humanizationMode: 'natural' | 'formal' | 'casual' | 'creative';
  onDetectionModelChange: (model: string) => void;
  onHumanizationModelChange: (model: string) => void;
  onHumanizationModeChange: (mode: 'natural' | 'formal' | 'casual' | 'creative') => void;
  plan: 'basic' | 'pro' | 'ultra';
}

export function SettingsTab({
  detectionModel,
  humanizationModel,
  humanizationMode,
  onDetectionModelChange,
  onHumanizationModelChange,
  onHumanizationModeChange,
  plan
}: SettingsTabProps) {

  const modes = [
    { 
      id: 'natural', 
      name: 'Natural', 
      icon: '✨', 
      description: 'Balanced and natural-sounding text',
      features: ['Varied sentence length', 'Conversational flow', 'Subtle imperfections']
    },
    { 
      id: 'formal', 
      name: 'Formal', 
      icon: '🎓', 
      description: 'Professional and polished tone',
      features: ['Professional vocabulary', 'Structured sentences', 'Academic style']
    },
    { 
      id: 'casual', 
      name: 'Casual', 
      icon: '😊', 
      description: 'Friendly and conversational',
      features: ['Contractions', 'Relatable language', 'Personal touches']
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      icon: '🎨', 
      description: 'Engaging and unique writing',
      features: ['Creative flair', 'Personality', 'Distinctive voice']
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* Current Configuration */}
        <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Current Configuration
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border-2">
              <div className="text-xs text-gray-600 mb-1">Detection Model</div>
              <div className="font-semibold text-gray-900">
                {AI_MODELS.detection.find(m => m.id === detectionModel)?.name || 'N/A'}
              </div>
              <Badge variant="outline" className="mt-2 text-xs">
                {AI_MODELS.detection.find(m => m.id === detectionModel)?.accuracy}
              </Badge>
            </div>

            <div className="p-4 bg-white rounded-lg border-2">
              <div className="text-xs text-gray-600 mb-1">Humanization Model</div>
              <div className="font-semibold text-gray-900">
                {AI_MODELS.humanization.find(m => m.id === humanizationModel)?.name || 'N/A'}
              </div>
              <Badge variant="outline" className="mt-2 text-xs">
                {AI_MODELS.humanization.find(m => m.id === humanizationModel)?.quality}
              </Badge>
            </div>

            <div className="p-4 bg-white rounded-lg border-2">
              <div className="text-xs text-gray-600 mb-1">Humanization Mode</div>
              <div className="font-semibold text-gray-900">
                {modes.find(m => m.id === humanizationMode)?.name || 'N/A'}
              </div>
              <Badge variant="outline" className="mt-2 text-xs">
                {modes.find(m => m.id === humanizationMode)?.icon} Active
              </Badge>
            </div>
          </div>
        </Card>

        {/* Detection Models */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Detection Models
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {AI_MODELS.detection.map((model) => (
              <Card 
                key={model.id}
                className={`p-5 transition-all cursor-pointer ${
                  detectionModel === model.id
                    ? 'bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => onDetectionModelChange(model.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{model.name}</h4>
                      {model.recommended && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                      {detectionModel === model.id && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    {model.accuracy}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {model.speed}
                  </Badge>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Key Features:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {model.id === 'hybrid' && (
                      <>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Combines multiple detection methods
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          97% accuracy with Sapling AI
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Pattern analysis with Groq LLM
                        </li>
                      </>
                    )}
                    {model.id === 'sapling' && (
                      <>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Professional-grade detector
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Sentence-level scoring
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Fast processing
                        </li>
                      </>
                    )}
                    {model.id === 'groq' && (
                      <>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          LLM-based pattern detection
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Identifies AI phrases
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Context-aware analysis
                        </li>
                      </>
                    )}
                    {model.id === 'statistical' && (
                      <>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Perplexity analysis
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Burstiness metrics
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          Ultra-fast processing
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Humanization Models */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Humanization Models
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {AI_MODELS.humanization.map((model) => (
              <Card 
                key={model.id}
                className={`p-5 transition-all cursor-pointer ${
                  humanizationModel === model.id
                    ? 'bg-linear-to-br from-purple-50 to-pink-50 border-2 border-purple-500 shadow-lg'
                    : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
                onClick={() => onHumanizationModelChange(model.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-gray-900">{model.name}</h4>
                      {model.recommended && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Best
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                  {humanizationModel === model.id && (
                    <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {model.speed}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {model.quality}
                  </Badge>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Best For:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {model.id === 'llama-3.3-70b-versatile' && (
                      <>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">✓</span>
                          Highest quality results
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">✓</span>
                          Most human-like output
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">✓</span>
                          Complex documents
                        </li>
                      </>
                    )}
                    {model.id === 'llama-3.1-8b-instant' && (
                      <>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">✓</span>
                          Quick processing
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">✓</span>
                          Short documents
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">✓</span>
                          Rapid iterations
                        </li>
                      </>
                    )}
                    {model.id === 'gemma2-9b-it' && (
                      <>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">✓</span>
                          Balanced performance
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">✓</span>
                          Good quality output
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-purple-600">✓</span>
                          General use cases
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Humanization Modes */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-600" />
            Humanization Modes
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {modes.map((mode) => (
              <Card 
                key={mode.id}
                className={`p-5 transition-all cursor-pointer ${
                  humanizationMode === mode.id
                    ? 'bg-linear-to-br from-pink-50 to-rose-50 border-2 border-pink-500 shadow-lg'
                    : 'bg-white border-2 border-gray-200 hover:border-pink-300 hover:shadow-md'
                }`}
                onClick={() => onHumanizationModeChange(mode.id as any)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{mode.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{mode.name}</h4>
                        {humanizationMode === mode.id && (
                          <CheckCircle2 className="h-5 w-5 text-pink-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{mode.description}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Features:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {mode.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-pink-600">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Plan Information */}
        <Card className="p-6 bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-600" />
            Your Plan: {plan.toUpperCase()}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border-2">
              <div className="text-sm font-semibold text-gray-900 mb-2">Detection Limits</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Max Characters:</span>
                  <span className="font-bold text-blue-600">{getCharacterLimit(plan, 'detection').toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Available Models:</span>
                  <span className="font-bold text-gray-900">{AI_MODELS.detection.length}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-2">
              <div className="text-sm font-semibold text-gray-900 mb-2">Humanization Limits</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Max Characters:</span>
                  <span className="font-bold text-purple-600">{getCharacterLimit(plan, 'humanization').toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Auto-include Document:</span>
                  <span className="font-bold text-gray-900">{plan !== 'basic' ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>

          {plan === 'basic' && (
            <div className="mt-4 p-3 bg-linear-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-blue-300">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">Upgrade for More Features!</div>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      Pro: 10,000 detection / 5,000 humanization characters
                    </li>
                    <li className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      Ultra: 25,000 detection / 15,000 humanization characters
                    </li>
                    <li className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      Auto-include entire document content
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}