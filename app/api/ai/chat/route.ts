// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, documentContext, model } = await request.json();
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Build the full prompt
    let fullPrompt = prompt;
    if (documentContext) {
      fullPrompt = `Given this document context:\n\n${documentContext}\n\nUser question: ${prompt}`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const result = data.choices[0]?.message?.content || 'No response';

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}