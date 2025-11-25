
// app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔵 API route called');
  
  try {
    const body = await request.json();
    console.log('📦 Request body:', body);
    
    const { action, text, targetLang } = body;
    
    const apiKey = process.env.GROQ_API_KEY;
    console.log('🔑 API Key exists:', !!apiKey);
    
    if (!apiKey) {
      console.error('❌ No API key found');
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    // Create prompts based on action
    let prompt = '';
    switch (action) {
      case 'improve':
        prompt = `Improve this text, make it more clear and professional. Only return the improved text, nothing else:\n\n"${text}"`;
        break;
      case 'summarize':
        prompt = `Summarize this text concisely. Only return the summary, nothing else:\n\n"${text}"`;
        break;
      case 'expand':
        prompt = `Expand on this text with more details. Only return the expanded text, nothing else:\n\n"${text}"`;
        break;
      case 'grammar':
        prompt = `Fix any grammar and spelling errors in this text. Only return the corrected text, nothing else:\n\n"${text}"`;
        break;
      case 'translate':
        const lang = targetLang === 'es' ? 'Spanish' : targetLang === 'fr' ? 'French' : 'German';
        prompt = `Translate this text to ${lang}. Only return the translation, nothing else:\n\n"${text}"`;
        break;
      case 'tone':
        prompt = `Rewrite this text in a formal, professional tone. Only return the rewritten text, nothing else:\n\n"${text}"`;
        break;
      default:
        prompt = `Improve this text:\n\n"${text}"`;
    }

    console.log('📝 Prompt created for action:', action);

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // model: 'mixtral-8x7b-32768', // Fast and free!
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    console.log('📡 Groq Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq Error:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Groq Response received');
    
    const result = data.choices[0]?.message?.content || text;
    console.log('✨ Final result:', result.substring(0, 100) + '...');

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error('💥 API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process text' },
      { status: 500 }
    );
  }
}