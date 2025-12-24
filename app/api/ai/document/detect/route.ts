// app/api/ai/document/detect/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface DetectionResult {
  overallScore: number; // 0-1 (0 = human, 1 = AI)
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

// Sapling AI Detection
async function detectWithSapling(text: string): Promise<any> {
  const apiKey = process.env.SAPLING_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Sapling API key not configured');
    return null;
  }

  try {
    console.log('🔍 [Sapling] Detecting AI content...');
    
    const response = await fetch('https://api.sapling.ai/api/v1/aidetect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: apiKey,
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sapling API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [Sapling] Detection complete:', data.score);
    
    return {
      score: data.score,
      sentenceScores: data.sentence_scores || [],
      tokens: data.tokens || [],
      tokenProbs: data.token_probs || [],
    };
  } catch (error) {
    console.error('❌ [Sapling] Error:', error);
    return null;
  }
}

// Groq-based AI Detection using Llama 3.3 70B
async function detectWithGroq(text: string): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Groq API key not configured');
    return null;
  }

  try {
    console.log('🤖 [Groq] Analyzing text patterns...');
    
    const prompt = `You are an AI content detector. Analyze the following text and determine if it was written by AI or a human.

Consider these factors:
1. Repetitive patterns and phrases
2. Overly formal or generic language
3. Lack of personal voice or unique style
4. Perfect grammar with no natural errors
5. Predictable sentence structures
6. Use of common AI phrases like "delve into", "it's worth noting", "in conclusion"

Text to analyze:
"""
${text}
"""

Respond ONLY with a JSON object in this exact format:
{
  "aiProbability": 0.75,
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this text appears AI-generated or human-written",
  "aiIndicators": ["indicator1", "indicator2"],
  "humanIndicators": ["indicator1", "indicator2"]
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{}');
    
    console.log('✅ [Groq] Analysis complete:', result.aiProbability);
    
    return result;
  } catch (error) {
    console.error('❌ [Groq] Error:', error);
    return null;
  }
}

// Statistical Analysis (Perplexity & Burstiness)
function statisticalAnalysis(text: string): any {
  console.log('📊 [Statistical] Analyzing text metrics...');
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate sentence length variance (burstiness)
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const burstiness = Math.sqrt(variance) / avgLength;
  
  // Calculate word repetition (lower perplexity = more AI-like)
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  // AI content typically has:
  // - Lower burstiness (consistent sentence lengths)
  // - Higher lexical diversity but repetitive patterns
  // - More formal vocabulary
  
  const aiScore = 1 - (burstiness * 0.4 + lexicalDiversity * 0.6);
  
  console.log('✅ [Statistical] Analysis complete:', {
    burstiness,
    lexicalDiversity,
    aiScore
  });
  
  return {
    score: Math.max(0, Math.min(1, aiScore)),
    perplexity: lexicalDiversity,
    burstiness: burstiness,
    avgSentenceLength: avgLength,
    vocabularyDiversity: lexicalDiversity,
  };
}

// Sentence-level detection
async function analyzeSentences(text: string, saplingData: any): Promise<any[]> {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const results = [];
  
  let currentIndex = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    const startIndex = text.indexOf(sentence, currentIndex);
    const endIndex = startIndex + sentence.length;
    
    // Get Sapling score if available
    let score = 0.5; // default neutral
    
    if (saplingData?.sentenceScores?.[i]) {
      score = saplingData.sentenceScores[i].score;
    }
    
    results.push({
      sentence,
      score,
      startIndex,
      endIndex,
    });
    
    currentIndex = endIndex;
  }
  
  return results;
}

export async function POST(request: NextRequest) {
  console.log('🎯 [Detection API] Request received');
  
  try {
    const body = await request.json();
    const { text, model = 'hybrid' } = body;
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    console.log('📝 [Detection API] Text length:', text.length);
    
    // Run all detection methods in parallel
    const [saplingResult, groqResult, statsResult] = await Promise.all([
      detectWithSapling(text),
      detectWithGroq(text),
      Promise.resolve(statisticalAnalysis(text)),
    ]);
    
    // Analyze sentences
    const sentenceScores = await analyzeSentences(text, saplingResult);
    
    // Calculate combined score
    let overallScore = 0;
    let weights = 0;
    
    if (saplingResult) {
      overallScore += saplingResult.score * 0.5;
      weights += 0.5;
    }
    
    if (groqResult) {
      overallScore += groqResult.aiProbability * 0.3;
      weights += 0.3;
    }
    
    if (statsResult) {
      overallScore += statsResult.score * 0.2;
      weights += 0.2;
    }
    
    overallScore = weights > 0 ? overallScore / weights : 0.5;
    
    // Classification
    let classification: 'human' | 'ai' | 'mixed';
    if (overallScore < 0.33) {
      classification = 'human';
    } else if (overallScore > 0.66) {
      classification = 'ai';
    } else {
      classification = 'mixed';
    }
    
    // Calculate metrics
    const aiSentences = sentenceScores.filter(s => s.score > 0.66).length;
    const humanSentences = sentenceScores.filter(s => s.score < 0.33).length;
    const mixedSentences = sentenceScores.length - aiSentences - humanSentences;
    
    const result: DetectionResult = {
      overallScore,
      classification,
      confidence: weights,
      sentenceScores,
      metrics: {
        aiPercentage: Math.round((aiSentences / sentenceScores.length) * 100),
        humanPercentage: Math.round((humanSentences / sentenceScores.length) * 100),
        mixedPercentage: Math.round((mixedSentences / sentenceScores.length) * 100),
        totalSentences: sentenceScores.length,
        aiSentences,
        humanSentences,
        mixedSentences,
      },
      detectors: {
        sapling: saplingResult ? {
          score: saplingResult.score,
          available: true,
        } : { score: 0, available: false },
        groq: groqResult ? {
          score: groqResult.aiProbability,
          patterns: [...(groqResult.aiIndicators || []), ...(groqResult.humanIndicators || [])],
          available: true,
        } : { score: 0, patterns: [], available: false },
        statistical: {
          score: statsResult.score,
          perplexity: statsResult.perplexity,
          burstiness: statsResult.burstiness,
          available: true,
        },
      },
    };
    
    console.log('✅ [Detection API] Analysis complete:', {
      overallScore,
      classification,
      metrics: result.metrics
    });
    
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('💥 [Detection API] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to detect AI content',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}