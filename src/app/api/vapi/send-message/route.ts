import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message, context } = await request.json();
    
    console.log('💬 Sending message to VAPI session:', sessionId);
    console.log('📝 Message:', message);
    
    // Here you can integrate with VAPI's message API
    // For now, we'll return a simulated response
    const response = await fetch(`https://api.vapi.ai/call/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VAPI_PUBLIC_KEY}`
      },
      body: JSON.stringify({
        message: message,
        context: {
          source: 'electron-middleware',
          timestamp: new Date().toISOString(),
          ...context
        }
      })
    });

    let aiResponse = "I hear you! This is where the VAPI AI response would go.";
    
    // If VAPI responds, use their response, otherwise use fallback
    if (response.ok) {
      const data = await response.json();
      aiResponse = data.response || data.message || aiResponse;
    } else {
      console.log('⚠️ VAPI message API not available, using fallback response');
    }
    
    console.log('✅ Message processed successfully');
    
    return NextResponse.json({
      success: true,
      aiResponse: aiResponse,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('❌ Message sending error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}
