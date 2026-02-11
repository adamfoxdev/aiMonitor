import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

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

function CheckCircle({ size = 64 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'rgba(34, 197, 94, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <path 
          d="M5 12L10 17L20 7" 
          stroke="#22C55E" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{
            strokeDasharray: 30,
            strokeDashoffset: 30,
            animation: 'draw 0.5s ease forwards 0.3s',
          }}
        />
      </svg>
    </div>
  );
}

export default function ForgotPasswordFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Check email, 3: Reset password, 4: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendCode = async () => {
    setError('');
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    // Note: Supabase handles code verification automatically when resetting password
    setStep(3);
  };

  const handleResetPassword = async () => {
    setError('');
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      const fullCode = code.join('');
      await authAPI.resetPassword(fullCode, newPassword);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeInput = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(60);
      // Simulate resend
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const strengthColors = ['#EF4444', '#F59E0B', '#EAB308', '#22C55E', '#10B981'];

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
        
        @keyframes pop {
          0% { transform: scale(0); }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
        
        .btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }
        
        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .code-input {
          width: 52px;
          height: 64px;
          border-radius: 12px;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: white;
          font-size: 24px;
          font-weight: 600;
          font-family: inherit;
          text-align: center;
          outline: none;
          transition: all 0.2s;
        }
        
        .code-input:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
          background: rgba(255,255,255,0.05);
        }
        
        .code-input:not(:placeholder-shown) {
          border-color: rgba(99, 102, 241, 0.4);
        }
        
        .card {
          width: 100%;
          max-width: 440px;
          padding: 48px;
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          position: relative;
          z-index: 10;
          animation: slide-in 0.4s ease-out;
        }
        
        .strength-bar {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 8px;
        }
        
        .strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: all 0.3s;
        }
      `}</style>

      {/* Background Effects */}
      <FloatingOrb color="#6366F1" size="500px" top="-200px" left="-200px" delay={0} />
      <FloatingOrb color="#8B5CF6" size="400px" top="50%" left="70%" delay={2} />
      <FloatingOrb color="#D946EF" size="300px" top="70%" left="-10%" delay={4} />

      <div className="card" key={step}>
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

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 28,
              }}>
                🔑
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Forgot password?</h1>
              <p style={{ color: '#666', lineHeight: 1.5 }}>
                No worries! Enter your email and we'll send you a reset code.
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Email</label>
              <input 
                type="email" 
                className="input-field"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleSendCode}
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Sending...
                </>
              ) : (
                'Send reset code →'
              )}
            </button>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <a href="/login" style={{ color: '#666', textDecoration: 'none', fontSize: 14 }}>
                ← Back to login
              </a>
            </div>
          </>
        )}

        {/* Step 2: Enter Code */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 28,
              }}>
                ✉️
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Check your email</h1>
              <p style={{ color: '#666', lineHeight: 1.5 }}>
                We sent a 6-digit code to<br />
                <span style={{ color: '#FAFAFA', fontWeight: 500 }}>{email}</span>
              </p>
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
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="code-input"
                  value={digit}
                  onChange={(e) => handleCodeInput(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  placeholder="·"
                />
              ))}
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleVerifyCode}
              disabled={isLoading || code.join('').length !== 6}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Verifying...
                </>
              ) : (
                'Verify code →'
              )}
            </button>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                Didn't receive the email?
              </p>
              <button 
                onClick={handleResend}
                disabled={resendTimer > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendTimer > 0 ? '#555' : '#6366F1',
                  cursor: resendTimer > 0 ? 'default' : 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
              </button>
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button 
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontFamily: 'inherit',
                }}
              >
                ← Use different email
              </button>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 28,
              }}>
                🔐
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Set new password</h1>
              <p style={{ color: '#666', lineHeight: 1.5 }}>
                Create a strong password for your account
              </p>
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
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>New password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="input-field"
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                {newPassword && (
                  <>
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{
                          width: `${(passwordStrength / 5) * 100}%`,
                          background: strengthColors[passwordStrength - 1] || '#EF4444',
                        }}
                      />
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginTop: 6,
                      fontSize: 12,
                    }}>
                      <span style={{ color: strengthColors[passwordStrength - 1] || '#666' }}>
                        {strengthLabels[passwordStrength - 1] || 'Too short'}
                      </span>
                      <span style={{ color: '#555' }}>Min 8 characters</span>
                    </div>
                  </>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>Confirm password</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="input-field"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>
                    Passwords don't match
                  </p>
                )}
              </div>
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleResetPassword}
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Resetting...
                </>
              ) : (
                'Reset password →'
              )}
            </button>
          </>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={80} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Password reset!</h1>
            <p style={{ color: '#666', marginBottom: 32, lineHeight: 1.5 }}>
              Your password has been successfully reset.<br />
              You can now sign in with your new password.
            </p>

            <a href="/login" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary">
                Sign in →
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
