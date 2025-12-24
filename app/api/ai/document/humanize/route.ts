// app/api/ai/document/humanize/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface HumanizeResult {
  original: string;
  humanized: string;
  beforeScore: number;
  afterScore: number;
  improvement: number;
  changes: Array<{
    type: 'sentence' | 'phrase' | 'word';
    original: string;
    humanized: string;
    reason: string;
  }>;
  metrics: {
    aiReduction: number; // Percentage reduction in AI score
    readabilityScore: number;
    sentenceVariation: number;
    vocabularyDiversity: number;
  };
}

// Humanize text using Groq Llama models
async function humanizeWithGroq(
  text: string,
  model: string = 'llama-3.3-70b-versatile',
  mode: 'natural' | 'formal' | 'casual' | 'creative' = 'natural'
): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  console.log(`🤖 [Groq Humanize] Using model: ${model}, mode: ${mode}`);
  
  const modePrompts = {
    natural: 'Make this text sound more natural and human-like while preserving the meaning. Add subtle imperfections, vary sentence structures, and use conversational language where appropriate.',
    formal: 'Rewrite this text in a formal, professional tone while making it sound genuinely human-written. Use varied sentence structures and professional vocabulary.',
    casual: 'Rewrite this text in a casual, conversational tone that sounds naturally human. Use contractions, varied sentence lengths, and relatable language.',
    creative: 'Rewrite this text with creative flair and personality. Make it engaging, unique, and distinctly human while keeping the core message intact.'
  };

  const prompt = `You are a text humanization expert. Your task is to transform AI-generated text into natural, human-written content.

${modePrompts[mode]}

Key humanization techniques:
1. Vary sentence length and structure (short, medium, long)
2. Add personal touches and conversational elements
3. Use contractions naturally (it's, don't, you're)
4. Include subtle imperfections (like humans make)
5. Add transitional phrases that feel natural
6. Remove overly formal or robotic phrasing
7. Avoid common AI phrases like "delve into", "it's worth noting", "in conclusion", "furthermore"
8. Use more active voice than passive
9. Add occasional rhetorical questions or interjections
10. Make it sound like a real person wrote this

Original text:
"""
${text}
"""

Respond ONLY with a JSON object in this exact format:
{
  "humanized": "The rewritten text here...",
  "changes": [
    {
      "original": "original phrase",
      "humanized": "humanized phrase",
      "reason": "why this change makes it more human"
    }
  ],
  "techniques": ["technique1", "technique2"]
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8, // Higher for more natural variation
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{}');
    
    console.log('✅ [Groq Humanize] Text humanized successfully');
    
    return result;
  } catch (error) {
    console.error('❌ [Groq Humanize] Error:', error);
    throw error;
  }
}

// Calculate readability score (Flesch Reading Ease)
function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, score));
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

// Calculate sentence variation score
function calculateSentenceVariation(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 2) return 50;
  
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  
  // Higher standard deviation = more variation (more human-like)
  // Normalize to 0-100 scale
  const variationScore = Math.min(100, (stdDev / avgLength) * 200);
  
  return variationScore;
}

// Calculate vocabulary diversity
function calculateVocabularyDiversity(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.trim().length > 0);
  const uniqueWords = new Set(words);
  
  if (words.length === 0) return 0;
  
  // Type-Token Ratio (TTR)
  const ttr = uniqueWords.size / words.length;
  
  return Math.round(ttr * 100);
}

// Quick AI detection score (simplified)
async function quickAIScore(text: string): Promise<number> {
  // Statistical quick check
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  
  // Check for AI patterns
  const aiPhrases = [
    'delve into', 'it\'s worth noting', 'in conclusion', 'furthermore',
    'moreover', 'additionally', 'it is important to note', 'as previously mentioned',
    'in summary', 'to summarize', 'firstly', 'secondly', 'lastly'
  ];
  
  let aiPhraseCount = 0;
  const lowerText = text.toLowerCase();
  aiPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) aiPhraseCount++;
  });
  
  // Calculate metrics
  const avgSentenceLength = words.length / sentences.length;
  const lengthVariance = calculateSentenceVariation(text);
  const vocabulary = calculateVocabularyDiversity(text);
  
  // AI text typically has:
  // - Consistent sentence lengths (low variance)
  // - Common AI phrases
  // - Moderate vocabulary diversity
  
  let score = 0.5; // Start neutral
  
  if (lengthVariance < 30) score += 0.2; // Low variation = more AI
  if (aiPhraseCount > 2) score += 0.2; // AI phrases detected
  if (avgSentenceLength > 20) score += 0.1; // Long sentences = more AI
  if (vocabulary < 40) score += 0.1; // Low diversity
  
  return Math.max(0, Math.min(1, score));
}

export async function POST(request: NextRequest) {
  console.log('✨ [Humanize API] Request received');
  
  try {
    const body = await request.json();
    const { text, model = 'llama-3.3-70b-versatile', mode = 'natural' } = body;
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    console.log('📝 [Humanize API] Text length:', text.length);
    console.log('🎯 [Humanize API] Mode:', mode);
    
    // Calculate before metrics
    const beforeScore = await quickAIScore(text);
    const beforeReadability = calculateReadability(text);
    const beforeVariation = calculateSentenceVariation(text);
    const beforeVocabulary = calculateVocabularyDiversity(text);
    
    console.log('📊 [Humanize API] Before metrics:', {
      aiScore: beforeScore,
      readability: beforeReadability,
      variation: beforeVariation,
      vocabulary: beforeVocabulary
    });
    
    // Humanize the text
    const humanizeResult = await humanizeWithGroq(text, model, mode);
    const humanizedText = humanizeResult.humanized || text;
    
    // Calculate after metrics
    const afterScore = await quickAIScore(humanizedText);
    const afterReadability = calculateReadability(humanizedText);
    const afterVariation = calculateSentenceVariation(humanizedText);
    const afterVocabulary = calculateVocabularyDiversity(humanizedText);
    
    console.log('📊 [Humanize API] After metrics:', {
      aiScore: afterScore,
      readability: afterReadability,
      variation: afterVariation,
      vocabulary: afterVocabulary
    });
    
    const improvement = Math.round(((beforeScore - afterScore) / beforeScore) * 100);
    const aiReduction = Math.round((beforeScore - afterScore) * 100);
    
    const result: HumanizeResult = {
      original: text,
      humanized: humanizedText,
      beforeScore: Math.round(beforeScore * 100),
      afterScore: Math.round(afterScore * 100),
      improvement: Math.max(0, improvement),
      changes: humanizeResult.changes || [],
      metrics: {
        aiReduction: Math.max(0, aiReduction),
        readabilityScore: Math.round(afterReadability),
        sentenceVariation: Math.round(afterVariation),
        vocabularyDiversity: afterVocabulary,
      }
    };
    
    console.log('✅ [Humanize API] Humanization complete:', {
      beforeScore: result.beforeScore,
      afterScore: result.afterScore,
      improvement: result.improvement
    });
    
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('💥 [Humanize API] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to humanize text',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}