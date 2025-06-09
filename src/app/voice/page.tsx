export default function VoiceInterface() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>VAPI Voice Interface</title>
        <style jsx>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .status {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            font-size: 14px;
            text-align: center;
          }
          
          .controls {
            display: flex;
            gap: 10px;
            margin: 20px 0;
          }
          
          button {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            flex: 1;
          }
          
          button:hover {
            background: rgba(255,255,255,0.3);
          }
          
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          button.active {
            background: rgba(52, 211, 153, 0.3);
            border-color: rgba(52, 211, 153, 0.5);
          }
          
          .conversation {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            flex: 1;
            overflow-y: auto;
            max-height: 300px;
          }
          
          .message {
            margin: 10px 0;
            padding: 10px;
            border-radius: 8px;
            font-size: 13px;
            animation: fadeIn 0.3s ease;
          }
          
          .user-message {
            background: rgba(255,255,255,0.2);
            margin-left: 20px;
          }
          
          .assistant-message {
            background: rgba(0,0,0,0.2);
            margin-right: 20px;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .input-area {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 15px;
            margin: 15px 0;
          }
          
          .input-area textarea {
            width: 100%;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            padding: 10px;
            border-radius: 6px;
            font-size: 13px;
            resize: vertical;
            min-height: 60px;
            box-sizing: border-box;
          }
          
          .input-area textarea::placeholder {
            color: rgba(255,255,255,0.6);
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h2>🎤 Voice Assistant</h2>
          <div>Connected to VAPI Middleware</div>
        </div>
        
        <div className="status" id="status">
          Initializing VAPI connection...
        </div>
        
        <div className="controls">
          <button id="startVoice">🎤 Start Voice</button>
          <button id="endVoice" disabled>⏹️ End Voice</button>
          <button id="testConnection">🔍 Test</button>
        </div>
        
        <div className="conversation" id="conversation">
          <div id="messages">
            <div className="message assistant-message">
              🤖 Hi! I&apos;m your creative assistant. Let&apos;s start a conversation!
            </div>
          </div>
        </div>
        
        <div className="input-area">
          <textarea id="messageInput" placeholder="Type a message or use voice chat above..."></textarea>
          <button id="sendMessage" style={{marginTop: '10px', width: '100%'}}>💬 Send Message</button>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            let currentSession = null;
            let isVoiceActive = false;
            
            const statusEl = document.getElementById('status');
            const startBtn = document.getElementById('startVoice');
            const endBtn = document.getElementById('endVoice');
            const testBtn = document.getElementById('testConnection');
            const messagesEl = document.getElementById('messages');
            const messageInput = document.getElementById('messageInput');
            const sendBtn = document.getElementById('sendMessage');
            
            // API functions using the middleware
            async function testVAPIConnection() {
              try {
                statusEl.textContent = '🔍 Testing VAPI connection...';
                
                const response = await fetch('/api/vapi/test');
                const data = await response.json();
                
                if (data.success) {
                  statusEl.textContent = '✅ VAPI connection successful!';
                  addMessage('Connection test successful! Ready for voice chat.', 'assistant');
                } else {
                  throw new Error(data.message || 'Connection test failed');
                }
                
              } catch (error) {
                console.error('Connection test failed:', error);
                statusEl.textContent = '❌ Connection failed: ' + error.message;
                addMessage('Connection test failed. Please check the service.', 'assistant');
              }
            }
            
            async function startVoiceSession() {
              try {
                statusEl.textContent = '🚀 Starting VAPI session...';
                startBtn.disabled = true;
                
                const response = await fetch('/api/vapi/start-session', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    metadata: {
                      source: 'middleware-ui',
                      timestamp: new Date().toISOString()
                    }
                  })
                });
                
                const data = await response.json();
                
                if (data.success) {
                  currentSession = data.sessionId;
                  isVoiceActive = true;
                  statusEl.textContent = '🟢 Voice session active!';
                  startBtn.disabled = true;
                  startBtn.classList.add('active');
                  endBtn.disabled = false;
                  
                  addMessage('Voice session started! You can now speak or type messages.', 'assistant');
                  
                  // If there's a webCallUrl, offer to open it
                  if (data.webCallUrl) {
                    addMessage('Voice interface: ' + data.webCallUrl, 'assistant');
                    
                    // Try to open the VAPI interface in a popup
                    const popup = window.open(data.webCallUrl, 'vapi-voice', 'width=400,height=600');
                    if (popup) {
                      addMessage('Voice interface opened in popup! You can talk there.', 'assistant');
                    }
                  }
                  
                } else {
                  throw new Error(data.error || 'Failed to start session');
                }
                
              } catch (error) {
                console.error('Failed to start voice session:', error);
                statusEl.textContent = '❌ Failed to start: ' + error.message;
                startBtn.disabled = false;
                addMessage('Failed to start voice session. Please try again.', 'assistant');
              }
            }
            
            async function endVoiceSession() {
              try {
                if (currentSession) {
                  statusEl.textContent = '🛑 Ending voice session...';
                  
                  const response = await fetch('/api/vapi/end-session', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      sessionId: currentSession
                    })
                  });
                  
                  const data = await response.json();
                  console.log('End session response:', data);
                }
                
                // Reset UI regardless of API response
                currentSession = null;
                isVoiceActive = false;
                statusEl.textContent = '📞 Voice session ended';
                startBtn.disabled = false;
                startBtn.classList.remove('active');
                endBtn.disabled = true;
                
                addMessage('Voice session ended. Click "Start Voice" to begin again.', 'assistant');
                
              } catch (error) {
                console.error('Error ending session:', error);
                // Still reset UI
                currentSession = null;
                isVoiceActive = false;
                startBtn.disabled = false;
                endBtn.disabled = true;
                statusEl.textContent = '⚠️ Session ended (with errors)';
              }
            }
            
            async function sendMessage() {
              const message = messageInput.value.trim();
              if (!message) return;
              
              // Add user message
              addMessage(message, 'user');
              messageInput.value = '';
              
              // Show thinking
              const thinkingId = addMessage('🤔 thinking...', 'assistant', true);
              
              try {
                const response = await fetch('/api/vapi/send-message', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    sessionId: currentSession || 'text-session',
                    message: message,
                    context: 'Creative Assistant Chat'
                  })
                });
                
                const data = await response.json();
                
                // Remove thinking message
                removeMessage(thinkingId);
                
                if (data.success && data.aiResponse) {
                  addMessage(data.aiResponse, 'assistant');
                } else {
                  addMessage('Sorry, I had trouble processing that. Please try again.', 'assistant');
                }
                
              } catch (error) {
                console.error('Error sending message:', error);
                removeMessage(thinkingId);
                addMessage('Connection error. Please check your internet and try again.', 'assistant');
              }
            }
            
            function addMessage(text, role, isThinking = false) {
              const messageId = Date.now().toString();
              const messageEl = document.createElement('div');
              messageEl.className = 'message ' + role + '-message';
              messageEl.id = messageId;
              
              if (isThinking) {
                messageEl.style.opacity = '0.6';
                messageEl.style.fontStyle = 'italic';
              }
              
              messageEl.innerHTML = '<strong>' + (role === 'user' ? '👤 You' : '🤖 Assistant') + ':</strong> ' + text;
              messagesEl.appendChild(messageEl);
              messagesEl.scrollTop = messagesEl.scrollHeight;
              
              return messageId;
            }
            
            function removeMessage(messageId) {
              const messageEl = document.getElementById(messageId);
              if (messageEl) {
                messageEl.remove();
              }
            }
            
            // Event listeners
            startBtn.addEventListener('click', startVoiceSession);
            endBtn.addEventListener('click', endVoiceSession);
            testBtn.addEventListener('click', testVAPIConnection);
            sendBtn.addEventListener('click', sendMessage);
            
            messageInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            });
            
            // Initialize
            window.addEventListener('load', () => {
              console.log('🎤 VAPI Voice Interface loaded');
              testVAPIConnection();
            });
            
            // Expose to parent window (for Electron integration)
            window.vapiInterface = {
              startVoice: startVoiceSession,
              endVoice: endVoiceSession,
              sendMessage: sendMessage,
              isActive: () => isVoiceActive
            };
          `
        }} />
      </body>
    </html>
  );
}
