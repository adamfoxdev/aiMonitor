import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Pre-fill email from URL if provided
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(email, username, password, name, company);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password.length >= 8 ? 'strong' : password.length >= 4 ? 'medium' : 'weak';

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
        
        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: #888;
        }
        
        .checkbox {
          width: 20px;
          height: 20px;
          min-width: 20px;
          border-radius: 6px;
          border: 2px solid rgba(255,255,255,0.15);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          margin-top: 2px;
        }
        
        .checkbox.checked {
          background: #6366F1;
          border-color: #6366F1;
        }
        
        .signup-card {
          width: 100%;
          max-width: 480px;
          padding: 48px;
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          position: relative;
          z-index: 10;
        }

        .password-strength {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }

        .password-strength-bar {
          height: 100%;
          width: 0;
          transition: all 0.3s;
        }

        .password-strength-bar.weak {
          width: 33%;
          background: #EF4444;
        }

        .password-strength-bar.medium {
          width: 66%;
          background: #F59E0B;
        }

        .password-strength-bar.strong {
          width: 100%;
          background: #22C55E;
        }
      `}</style>

      <FloatingOrb color="#6366F1" size="500px" top="-200px" left="-200px" delay={0} />
      <FloatingOrb color="#8B5CF6" size="400px" top="50%" left="70%" delay={2} />
      <FloatingOrb color="#D946EF" size="300px" top="70%" left="-10%" delay={4} />

      <div className="signup-card">
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

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: '#666' }}>Start monitoring your LLM costs in 2 minutes</p>
        </div>

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

        <form onSubmit={handleSignup}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Full Name</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Email</label>
              <input 
                type="email" 
                className="input-field"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Username</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="Choose a username (3-30 characters)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                pattern="[a-z0-9_]{3,30}"
                required
              />
              <p style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Letters, numbers, and underscores only</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Company (Optional)</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="Your company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="input-field"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              <div className="password-strength">
                <div className={`password-strength-bar ${passwordStrength}`} />
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                {passwordStrength === 'weak' && 'Password too weak'}
                {passwordStrength === 'medium' && 'Password strength: Medium'}
                {passwordStrength === 'strong' && 'Password strength: Strong'}
              </div>
            </div>

            <div 
              className="checkbox-container"
              onClick={() => setAgreeToTerms(!agreeToTerms)}
            >
              <div className={`checkbox ${agreeToTerms ? 'checked' : ''}`}>
                {agreeToTerms && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              I agree to the{' '}
              <a href="#" style={{ color: '#6366F1', textDecoration: 'none' }}>terms of service</a>
              {' '}and{' '}
              <a href="#" style={{ color: '#6366F1', textDecoration: 'none' }}>privacy policy</a>
            </div>

            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !name || !email || !password || !agreeToTerms || password.length < 8}
              style={{ marginTop: 8 }}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Creating account...
                </>
              ) : (
                'Create account →'
              )}
            </button>
          </div>
        </form>

        <div style={{ 
          marginTop: 32, 
          textAlign: 'center', 
          color: '#666', 
          fontSize: 14,
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
