import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  console.log('🟢 API endpoint hit: /api/remove-content');
  
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('📦 Request body parsed:', {
        hasContent: !!body.content,
        contentLength: body.content?.length,
        model: body.model,
        documentId: body.documentId
      });
    } catch (parseError: any) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: parseError.message
        },
        { status: 400 }
      );
    }

    const { content, model, documentId } = body;

    // Validation
    if (!content || typeof content !== 'string' || !content.trim()) {
      console.error('❌ Validation failed: Invalid content');
      return NextResponse.json(
        { 
          error: 'Content is required and must be a non-empty string',
          received: { 
            content: content ? 'present' : 'missing',
            type: typeof content,
            length: content?.length || 0
          }
        },
        { status: 400 }
      );
    }

    if (!model || typeof model !== 'string') {
      console.error('❌ Validation failed: Invalid model');
      return NextResponse.json(
        { 
          error: 'Model selection is required',
          received: model
        },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY environment variable is missing');
      return NextResponse.json(
        { 
          error: 'GROQ_API_KEY is not configured on the server',
          hint: 'Add GROQ_API_KEY to your .env file'
        },
        { status: 500 }
      );
    }

    console.log('✅ API key found:', process.env.GROQ_API_KEY.substring(0, 10) + '...');

    // Validate model
    const allowedModels = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma2-9b-it'
    ];

    if (!allowedModels.includes(model)) {
      console.error('❌ Invalid model:', model);
      return NextResponse.json(
        { 
          error: 'Invalid model selection',
          received: model,
          allowed: allowedModels
        },
        { status: 400 }
      );
    }

    console.log('✅ Model validated:', model);

    const prompt = `
You are a professional content humanizer. Your task is to rewrite AI-generated text to make it sound more natural, human-like, and authentic while preserving the original meaning and key information.

Guidelines:
1. Maintain the core message and facts
2. Add natural language variations and imperfections
3. Use more conversational tone where appropriate
4. Include personal touches and relatable elements
5. Vary sentence structure and length
6. Remove overly formal or robotic phrasing
7. Keep the same general length and structure
8. Preserve any technical accuracy

Original text:
"""
${content}
"""

Rewrite this text to be more human-like and natural. Return ONLY the rewritten text without any explanations, prefixes, or meta-commentary.
`;

    console.log('🚀 Sending request to Groq API...');
    console.log('📍 URL:', GROQ_API_URL);
    console.log('📍 Model:', model);

    let groqResponse;
    try {
      groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional content humanizer that rewrites AI-generated text to sound more natural and human-like while preserving meaning and accuracy.'
            },
            {
              role: 'user',
              content: prompt
            },
          ],
          temperature: 0.8,
          max_tokens: 4000,
        }),
      });

      console.log('📥 Groq response status:', groqResponse.status);
      console.log('📥 Groq response ok:', groqResponse.ok);
      
    } catch (fetchError: any) {
      console.error('❌ Fetch error:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to connect to Groq API',
          details: fetchError.message,
          hint: 'Check your internet connection and Groq API status'
        },
        { status: 500 }
      );
    }

    if (!groqResponse.ok) {
      let errorText;
      try {
        errorText = await groqResponse.text();
        console.error('❌ Groq API error response:', errorText);
      } catch (e) {
        errorText = 'Could not read error response';
      }

      return NextResponse.json(
        { 
          error: 'Groq API request failed',
          status: groqResponse.status,
          statusText: groqResponse.statusText,
          details: errorText,
          hint: groqResponse.status === 401 
            ? 'Invalid API key' 
            : groqResponse.status === 429
            ? 'Rate limit exceeded'
            : 'Check Groq API status'
        },
        { status: groqResponse.status }
      );
    }

    let data;
    try {
      data = await groqResponse.json();
      console.log('✅ Groq response parsed successfully');
      console.log('📦 Response structure:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        hasMessage: !!data.choices?.[0]?.message,
        hasContent: !!data.choices?.[0]?.message?.content
      });
    } catch (parseError: any) {
      console.error('❌ Failed to parse Groq response:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid response from Groq API',
          details: parseError.message
        },
        { status: 500 }
      );
    }

    const humanizedContent = data.choices?.[0]?.message?.content;

    if (!humanizedContent) {
      console.error('❌ No content in Groq response');
      console.log('📦 Full response:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { 
          error: 'Invalid AI response - no content returned',
          responseStructure: data
        },
        { status: 500 }
      );
    }

    console.log('✅ Content humanized successfully');
    console.log('📊 Stats:', {
      originalLength: content.length,
      humanizedLength: humanizedContent.length
    });

    // Calculate improvement metrics
    const originalWordCount = content.split(/\s+/).filter(Boolean).length;
    const humanizedWordCount = humanizedContent.split(/\s+/).filter(Boolean).length;

    const response = {
      success: true,
      humanizedContent: humanizedContent.trim(),
      originalWordCount,
      humanizedWordCount,
      model,
      processedAt: new Date().toISOString(),
      documentId,
    };

    console.log('✅ Sending success response');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Unknown error occurred',
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}