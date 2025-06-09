import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get optional metadata from request, but use hardcoded Assistant ID
    const { metadata } = await request.json().catch(() => ({}));
    
    const assistantId = process.env.VAPI_ASSISTANT_ID; // <-- Hardcoded from env
    
    if (!assistantId) {
      throw new Error('VAPI_ASSISTANT_ID not configured');
    }
    
    console.log('🎤 Creating VAPI session for:', assistantId);
    
    const response = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VAPI_PUBLIC_KEY}`
      },
      body: JSON.stringify({
        assistantId: assistantId, // <-- Using hardcoded Assistant ID
        metadata: {
          source: 'electron-middleware',
          timestamp: new Date().toISOString(),
          ...metadata
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VAPI API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ VAPI session created:', data.id);
    
    return NextResponse.json({
      success: true,
      sessionId: data.id,
      webCallUrl: data.webCallUrl || `https://vapi.ai/call/${data.id}`,
      status: 'ready'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('❌ VAPI session error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}
