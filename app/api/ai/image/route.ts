// app/api/ai/image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🎨 [Image API] Request received');
  
  try {
    const body = await request.json();
    const { prompt, model = 'flux', width = 1024, height = 1024, enhance = true } = body;
    
    console.log('📦 [Image API] Request body:', {
      prompt: prompt?.substring(0, 100),
      model,
      width,
      height,
      enhance
    });

    if (!prompt || prompt.trim().length === 0) {
      console.error('❌ [Image API] No prompt provided');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Encode prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Build Pollinations.ai URL with HD parameters
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&nologo=true&enhance=${enhance}&private=false`;
    
    console.log('🔗 [Image API] Generated URL:', imageUrl);
    console.log('📡 [Image API] Fetching image from Pollinations.ai...');

    // Fetch the image to verify it exists
    const imageResponse = await fetch(imageUrl);
    
    console.log('📊 [Image API] Response status:', imageResponse.status);
    console.log('📊 [Image API] Response headers:', Object.fromEntries(imageResponse.headers.entries()));

    if (!imageResponse.ok) {
      console.error('❌ [Image API] Pollinations.ai returned error:', imageResponse.status);
      throw new Error(`Image generation failed with status ${imageResponse.status}`);
    }

    // Get image as buffer to verify it's valid
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageSizeKB = (imageBuffer.byteLength / 1024).toFixed(2);
    
    console.log('✅ [Image API] Image received successfully');
    console.log('📏 [Image API] Image size:', imageSizeKB, 'KB');

    // Return the URL to client
    return NextResponse.json({
      success: true,
      imageUrl,
      metadata: {
        prompt,
        model,
        width,
        height,
        sizeKB: imageSizeKB,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('💥 [Image API] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate image',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}