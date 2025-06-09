export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎤 VAPI Middleware Service</h1>
      <p>This service provides VAPI integration for Electron applications.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Available Endpoints:</h2>
        <ul>
          <li><code>POST /api/vapi/start-session</code> - Start VAPI session</li>
          <li><code>POST /api/vapi/end-session</code> - End VAPI session</li>
          <li><code>GET /api/vapi/test</code> - Test VAPI connectivity</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Status: 🟢 Online</h3>
        <p>Middleware service is running and ready to handle VAPI requests.</p>
      </div>
    </div>
  );
}
