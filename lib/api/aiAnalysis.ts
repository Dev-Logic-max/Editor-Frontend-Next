// lib/api/aiAnalysis.ts

export interface DetectionResult {
  overallScore: number;
  classification: 'human' | 'ai' | 'mixed';
  confidence: number;
  sentenceScores: Array<{
    sentence: string;
    score: number;
    startIndex: number;
    endIndex: number;
  }>;
  metrics: {
    aiPercentage: number;
    humanPercentage: number;
    mixedPercentage: number;
    totalSentences: number;
    aiSentences: number;
    humanSentences: number;
    mixedSentences: number;
  };
  detectors: {
    sapling?: {
      score: number;
      available: boolean;
    };
    groq?: {
      score: number;
      patterns: string[];
      available: boolean;
    };
    statistical?: {
      score: number;
      perplexity: number;
      burstiness: number;
      available: boolean;
    };
  };
}

export interface HumanizeResult {
  original: string;
  humanized: string;
  beforeScore: number;
  afterScore: number;
  improvement: number;
  changes: Array<{
    type?: 'sentence' | 'phrase' | 'word';
    original: string;
    humanized: string;
    reason: string;
  }>;
  metrics: {
    aiReduction: number;
    readabilityScore: number;
    sentenceVariation: number;
    vocabularyDiversity: number;
  };
}

/**
 * Detect AI content in text
 */
export async function detectAIContent(
  text: string,
  model: 'hybrid' | 'sapling' | 'groq' | 'statistical' = 'hybrid'
): Promise<DetectionResult> {
  const response = await fetch('/api/ai/document/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, model }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to detect AI content');
  }

  const data = await response.json();
  return data.result;
}

/**
 * Humanize AI-generated text
 */
export async function humanizeText(
  text: string,
  model: 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'gemma2-9b-it' = 'llama-3.3-70b-versatile',
  mode: 'natural' | 'formal' | 'casual' | 'creative' = 'natural'
): Promise<HumanizeResult> {
  const response = await fetch('/api/ai/document/humanize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, model, mode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to humanize text');
  }

  const data = await response.json();
  return data.result;
}

/**
 * Get character limits based on plan
 */
export function getCharacterLimit(plan: 'basic' | 'pro' | 'ultra', feature: 'detection' | 'humanization'): number {
  const limits = {
    basic: {
      detection: 5000,
      humanization: 2000,
    },
    pro: {
      detection: 10000,
      humanization: 5000,
    },
    ultra: {
      detection: 25000,
      humanization: 15000,
    },
  };

  return limits[plan][feature];
}

/**
 * Check if text exceeds plan limit
 */
export function checkTextLimit(
  text: string,
  plan: 'basic' | 'pro' | 'ultra',
  feature: 'detection' | 'humanization'
): {
  withinLimit: boolean;
  charCount: number;
  limit: number;
  excess: number;
} {
  const charCount = text.length;
  const limit = getCharacterLimit(plan, feature);
  const withinLimit = charCount <= limit;
  const excess = Math.max(0, charCount - limit);

  return {
    withinLimit,
    charCount,
    limit,
    excess,
  };
}

/**
 * Get classification color for UI
 */
export function getClassificationColor(classification: 'human' | 'ai' | 'mixed'): {
  bg: string;
  text: string;
  border: string;
} {
  const colors = {
    human: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
    },
    ai: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
    },
    mixed: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
    },
  };

  return colors[classification];
}

/**
 * Get score color for sentence highlighting
 */
export function getScoreColor(score: number): {
  bg: string;
  intensity: string;
} {
  if (score < 0.33) {
    // Human
    return {
      bg: 'bg-green-200',
      intensity: 'low',
    };
  } else if (score < 0.66) {
    // Mixed
    return {
      bg: 'bg-yellow-200',
      intensity: 'medium',
    };
  } else {
    // AI
    return {
      bg: 'bg-red-200',
      intensity: 'high',
    };
  }
}

/**
 * Format detection score as percentage
 */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}

/**
 * Calculate estimated time for processing
 */
export function estimateProcessingTime(textLength: number, operation: 'detection' | 'humanization'): string {
  const baseTime = operation === 'detection' ? 2 : 3; // seconds
  const perCharTime = operation === 'detection' ? 0.0001 : 0.0002;
  
  const estimatedSeconds = baseTime + (textLength * perCharTime);
  
  if (estimatedSeconds < 5) return 'a few seconds';
  if (estimatedSeconds < 15) return '10-15 seconds';
  if (estimatedSeconds < 30) return '20-30 seconds';
  return '30-60 seconds';
}

/**
 * Available AI models for different features
 */
export const AI_MODELS = {
  detection: [
    {
      id: 'hybrid',
      name: 'Hybrid Detection',
      description: 'Combines Sapling, Groq, and statistical analysis',
      accuracy: '97%',
      speed: 'Medium',
      recommended: true,
    },
    {
      id: 'sapling',
      name: 'Sapling AI',
      description: 'Professional AI detector with high accuracy',
      accuracy: '97%',
      speed: 'Fast',
      recommended: false,
    },
    {
      id: 'groq',
      name: 'Groq LLM',
      description: 'Pattern-based detection using Llama 3.3',
      accuracy: '90%',
      speed: 'Medium',
      recommended: false,
    },
    {
      id: 'statistical',
      name: 'Statistical Analysis',
      description: 'Perplexity and burstiness metrics',
      accuracy: '85%',
      speed: 'Very Fast',
      recommended: false,
    },
  ],
  humanization: [
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B',
      description: 'Best quality, most human-like results',
      speed: 'Medium',
      quality: 'Excellent',
      recommended: true,
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B',
      description: 'Ultra fast, good quality',
      speed: 'Very Fast',
      quality: 'Good',
      recommended: false,
    },
    {
      id: 'gemma2-9b-it',
      name: 'Gemma 2 9B',
      description: 'Balanced speed and quality',
      speed: 'Fast',
      quality: 'Very Good',
      recommended: false,
    },
  ],
};