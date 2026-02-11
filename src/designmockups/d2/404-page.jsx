import React from 'react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050506',
      color: '#FAFAFA',
      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .btn {
          padding: 14px 32px;
          border-radius: 12px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        }
        
        .btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }
        
        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }
        
        .error-code {
          font-size: 180px;
          font-weight: 700;
          line-height: 1;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          animation: flicker 3s ease-in-out infinite;
        }
        
        .error-code::before {
          content: '404';
          position: absolute;
          left: 2px;
          top: 2px;
          background: linear-gradient(135deg, #EF4444 0%, #F59E0B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0.3;
          animation: glitch 0.3s ease-in-out infinite;
        }
        
        .search-links a {
          color: #6366F1;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .search-links a:hover {
          color: #8B5CF6;
        }
      `}</style>

      {/* Background Orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)', top: '-200px', left: '-200px' }} />
      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent)', bottom: '-150px', right: '-150px', animationDelay: '2s' }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(217,70,239,0.2), transparent)', top: '50%', left: '70%', animationDelay: '4s' }} />

      {/* Content */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, padding: 24 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 22,
          }}>
            $
          </div>
          <span style={{ fontSize: 24, fontWeight: 700 }}>TokenMeter</span>
        </div>

        {/* 404 */}
        <div className="error-code">404</div>
        
        {/* Message */}
        <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 24, marginBottom: 12 }}>
          Page not found
        </h1>
        <p style={{ color: '#888', fontSize: 18, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
          Looks like this page got lost in the cloud. Let's get you back on track.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary">
              ← Go Home
            </button>
          </a>
          <a href="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary">
              Dashboard
            </button>
          </a>
        </div>

        {/* Search Links */}
        <div className="search-links" style={{ color: '#666', fontSize: 14 }}>
          <p style={{ marginBottom: 12 }}>Looking for something specific?</p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <a href="/pricing">Pricing</a>
            <a href="/docs">Documentation</a>
            <a href="/support">Support</a>
            <a href="/status">System Status</a>
          </div>
        </div>

        {/* Fun Element */}
        <div style={{
          marginTop: 64,
          padding: 24,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          maxWidth: 400,
          margin: '64px auto 0',
        }}>
          <p style={{ color: '#666', fontSize: 13, fontStyle: 'italic' }}>
            💡 Fun fact: This 404 page cost us approximately <span style={{ color: '#6366F1', fontWeight: 600 }}>$0.0012</span> in AI tokens to generate.
          </p>
        </div>
      </div>
    </div>
  );
}
