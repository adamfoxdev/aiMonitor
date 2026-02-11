import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, supabase } from '../services/api';

function FloatingOrb({ color, size, top, left, delay }) {
  return (
    <div style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10, transparent)`,
      filter: 'blur(60px)',
      top,
      left,
      animation: `float ${8 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none',
    }} />
  );
}

function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@');
      const response = await login(emailOrUsername, password, isEmail);
      if (response?.token) {
        // Only navigate if we have a valid token
        navigate('/dashboard');
      } else {
        setError('Login failed: No token received');
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      console.error('Login error:', errorMsg);
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setError('');
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase(),
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(`${provider} login failed: ${error.message}`);
        setIsLoading(false);
      }
    } catch (err) {
      setError(`${provider} login error: ${err.message}`);
      setIsLoading(false);
    }
  };

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
      padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .input-field {
          width: 100%;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: white;
          font-size: 16px;
          font-family: inherit;
          outline: none;
          transition: all 0.3s;
        }
        
        .input-field:focus {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          background: rgba(255,255,255,0.05);
        }
        
        .input-field::placeholder {
          color: #555;
        }
        
        .input-field.error {
          border-color: rgba(239, 68, 68, 0.5);
          animation: shake 0.3s ease;
        }
        
        .btn {
          padding: 16px 32px;
          border-radius: 12px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-social {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 14px 20px;
        }
        
        .btn-social:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }
        
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: #888;
        }
        
        .checkbox {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid rgba(255,255,255,0.15);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .checkbox.checked {
          background: #6366F1;
          border-color: #6366F1;
        }
        
        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
          color: #444;
          font-size: 13px;
        }
        
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        
        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 48px;
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          position: relative;
          z-index: 10;
        }
      `}</style>

      {/* Background Effects */}
      <FloatingOrb color="#6366F1" size="500px" top="-200px" left="-200px" delay={0} />
      <FloatingOrb color="#8B5CF6" size="400px" top="50%" left="70%" delay={2} />
      <FloatingOrb color="#D946EF" size="300px" top="70%" left="-10%" delay={4} />

      <div className="login-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
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

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: '#666' }}>Sign in to your account to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: 14,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            marginBottom: 20,
            color: '#EF4444',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Social Login Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-social" onClick={() => handleSocialLogin('Google')} disabled={isLoading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button className="btn btn-social" onClick={() => handleSocialLogin('GitHub')} disabled={isLoading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </button>
          <button className="btn btn-social" onClick={() => handleSocialLogin('Azure')} disabled={isLoading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M11.4 2h-8.6l8.6 9.2H24V2h-12.6z" fill="#0078D4"/>
              <path d="M5.6 11.4L0 20.6h7.8l10.2-9.2H5.6z" fill="#50E6FF"/>
              <path d="M11 11.4l8.4-9.2H24v9.2h-13z" fill="#0078D4"/>
            </svg>
            Microsoft
          </button>
        </div>

        <div className="divider">or continue with email / username</div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Email or Username</label>
              <input 
                type="text" 
                className={`input-field ${error ? 'error' : ''}`}
                placeholder="you@company.com or your_username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 14, color: '#888' }}>Password</label>
                <a href="/forgot-password" style={{ fontSize: 13, color: '#6366F1', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className={`input-field ${error ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 60 }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div 
              className="checkbox-container"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div className={`checkbox ${rememberMe ? 'checked' : ''}`}>
                {rememberMe && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              Remember me for 30 days
            </div>

            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !emailOrUsername || !password}
              style={{ marginTop: 8 }}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Signing in...
                </>
              ) : (
                'Sign in →'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={{ 
          marginTop: 32, 
          textAlign: 'center', 
          color: '#666', 
          fontSize: 14,
        }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 500 }}>
            Create one now
          </a>
        </div>

        {/* Security Badge */}
        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: '#444',
          fontSize: 12,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Secured with 256-bit SSL encryption
        </div>
      </div>
    </div>
  );
}
