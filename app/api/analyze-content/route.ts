import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is missing' },
        { status: 500 }
      );
    }

    const prompt = `
You are an AI content detector.

Analyze the following text and return ONLY valid JSON in this exact format:
{
  "aiPercentage": number,
  "humanPercentage": number,
  "suggestions": string[]
}

Rules:
- aiPercentage + humanPercentage must equal 100
- suggestions should be helpful and concise
- Do not include explanations outside JSON

Text:
"""${content}"""
`;

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You detect AI-written text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
      }),
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.text();
      console.error('Groq API error:', err);
      throw new Error('AI detection service failed');
    }

    const data = await groqResponse.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error('Invalid AI response');
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('Invalid JSON from Groq:', raw);
      throw new Error('Failed to parse AI response');
    }

    const wordCount = content
      .split(/\s+/)
      .filter(Boolean).length;

    return NextResponse.json({
      aiPercentage: parsed.aiPercentage,
      humanPercentage: parsed.humanPercentage,
      suggestions: parsed.suggestions ?? [],
      wordCount,
      analysisDate: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
