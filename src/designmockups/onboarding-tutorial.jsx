import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to TokenMeter! 🎉',
    subtitle: 'Let\'s get you set up in under 2 minutes',
    icon: '👋',
  },
  {
    id: 'dashboard',
    title: 'Your Command Center',
    subtitle: 'See all your AI spending at a glance',
    icon: '📊',
    features: [
      { label: 'Real-time costs', desc: 'Updated every minute' },
      { label: 'Provider breakdown', desc: 'Compare across services' },
      { label: 'Usage trends', desc: 'Spot patterns instantly' },
    ],
  },
  {
    id: 'alerts',
    title: 'Never Get Surprised',
    subtitle: 'Set up smart alerts to stay in control',
    icon: '🚨',
    features: [
      { label: 'Budget thresholds', desc: 'Alert at 50%, 80%, 100%' },
      { label: 'Spike detection', desc: 'Unusual usage warnings' },
      { label: 'Daily digests', desc: 'Morning cost summaries' },
    ],
  },
  {
    id: 'team',
    title: 'Invite Your Team',
    subtitle: 'Collaborate with your engineering team',
    icon: '👥',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    subtitle: 'Start monitoring your AI costs now',
    icon: '🚀',
  },
];

const mockTeamMembers = [
  { email: 'sarah@company.com', role: 'Admin', status: 'pending' },
];

function ProgressRing({ progress, size = 120 }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Confetti() {
  const colors = ['#6366F1', '#8B5CF6', '#D946EF', '#22C55E', '#F59E0B'];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.size > 10 ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ease-in forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingTutorial() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [budgetThreshold, setBudgetThreshold] = useState(80);
  const [alertChannels, setAlertChannels] = useState({ email: true, slack: false });
  const [teamEmails, setTeamEmails] = useState('');
  const [invitedMembers, setInvitedMembers] = useState(mockTeamMembers);
  const [showConfetti, setShowConfetti] = useState(false);

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (currentStep === onboardingSteps.length - 2) {
        setShowConfetti(true);
      }
    }
  };

  const handleSkip = () => {
    setCurrentStep(onboardingSteps.length - 1);
    setShowConfetti(true);
  };

  const handleInvite = () => {
    if (teamEmails.trim()) {
      const emails = teamEmails.split(',').map(e => e.trim()).filter(e => e);
      const newMembers = emails.map(email => ({ email, role: 'Member', status: 'pending' }));
      setInvitedMembers([...invitedMembers, ...newMembers]);
      setTeamEmails('');
    }
  };

  const toggleAlertChannel = (channel) => {
    setAlertChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050506',
      color: '#FAFAFA',
      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .input-field {
          width: 100%;
          padding: 14px 18px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: white;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: all 0.3s;
        }
        
        .input-field:focus {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        
        .input-field::placeholder {
          color: #555;
        }
        
        .btn {
          padding: 14px 28px;
          border-radius: 10px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
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
        
        .btn-ghost {
          background: transparent;
          color: #666;
        }
        
        .btn-ghost:hover {
          color: #FAFAFA;
        }
        
        .feature-card {
          padding: 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          transition: all 0.3s;
        }
        
        .feature-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
        
        .toggle {
          width: 48px;
          height: 26px;
          background: rgba(255,255,255,0.1);
          border-radius: 13px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .toggle.active {
          background: #6366F1;
        }
        
        .toggle::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: all 0.3s;
        }
        
        .toggle.active::after {
          left: 25px;
        }
        
        .slider-track {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          position: relative;
          cursor: pointer;
        }
        
        .slider-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366F1, #8B5CF6);
          border-radius: 3px;
          transition: width 0.1s;
        }
        
        .slider-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: grab;
        }
        
        .step-indicator {
          display: flex;
          gap: 6px;
        }
        
        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.3s;
        }
        
        .step-dot.active {
          background: #6366F1;
          width: 24px;
          border-radius: 4px;
        }
        
        .step-dot.completed {
          background: #22C55E;
        }
        
        .member-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          margin-bottom: 8px;
        }
        
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .badge-pending {
          background: rgba(245, 158, 11, 0.15);
          color: #F59E0B;
        }
        
        .badge-admin {
          background: rgba(99, 102, 241, 0.15);
          color: #6366F1;
        }
      `}</style>

      {showConfetti && <Confetti />}

      {/* Sidebar */}
      <div style={{
        width: 280,
        padding: 32,
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
          }}>
            $
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>TokenMeter</span>
        </div>

        {/* Progress */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <ProgressRing progress={progress} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <span style={{ fontSize: 28, fontWeight: 700 }}>{currentStep + 1}</span>
              <span style={{ fontSize: 12, color: '#666' }}>of {onboardingSteps.length}</span>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div style={{ flex: 1 }}>
          {onboardingSteps.map((s, i) => (
            <div 
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 0',
                opacity: i <= currentStep ? 1 : 0.4,
                transition: 'all 0.3s',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: i < currentStep ? 'rgba(34, 197, 94, 0.15)' : i === currentStep ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}>
                {i < currentStep ? '✓' : s.icon}
              </div>
              <span style={{ 
                fontSize: 14, 
                fontWeight: i === currentStep ? 600 : 400,
                color: i === currentStep ? '#FAFAFA' : '#888',
              }}>
                {s.title.replace(/[🎉🚀]/g, '').trim()}
              </span>
            </div>
          ))}
        </div>

        {/* Skip */}
        {currentStep < onboardingSteps.length - 1 && (
          <button className="btn btn-ghost" onClick={handleSkip}>
            Skip tutorial
          </button>
        )}
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        padding: 64, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 600, width: '100%', animation: 'slide-up 0.4s ease-out' }} key={currentStep}>
          
          {/* Welcome Step */}
          {step.id === 'welcome' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
                fontSize: 48,
                animation: 'float 3s ease-in-out infinite',
              }}>
                {step.icon}
              </div>
              <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>{step.title}</h1>
              <p style={{ color: '#888', fontSize: 18, marginBottom: 48, lineHeight: 1.6 }}>
                {step.subtitle}
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                marginBottom: 48,
              }}>
                {[
                  { icon: '⚡', label: 'Real-time tracking' },
                  { icon: '💰', label: 'Cost optimization' },
                  { icon: '🔔', label: 'Smart alerts' },
                ].map((item, i) => (
                  <div key={i} className="feature-card" style={{ textAlign: 'center', padding: 24 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" onClick={handleNext} style={{ padding: '16px 48px', fontSize: 16 }}>
                Let's get started →
              </button>
            </div>
          )}

          {/* Dashboard Tour Step */}
          {step.id === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {step.icon}
                </div>
                <div>
                  <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{step.title}</h1>
                  <p style={{ color: '#888' }}>{step.subtitle}</p>
                </div>
              </div>

              {/* Mock Dashboard Preview */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: 24,
                marginBottom: 32,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                  {[
                    { label: 'Today', value: '$127.45', color: '#6366F1' },
                    { label: 'This Week', value: '$892.30', color: '#8B5CF6' },
                    { label: 'This Month', value: '$2,847.00', color: '#D946EF' },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      padding: 20,
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 12,
                      borderLeft: `3px solid ${stat.color}`,
                    }}>
                      <div style={{ color: '#666', fontSize: 12, marginBottom: 6 }}>{stat.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 68].map((h, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: `${h}%`,
                      background: 'linear-gradient(180deg, #6366F1 0%, #8B5CF6 100%)',
                      borderRadius: 4,
                      opacity: 0.6 + (i * 0.03),
                    }} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
                {step.features.map((f, i) => (
                  <div key={i} className="feature-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(34, 197, 94, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#22C55E',
                    }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                      <div style={{ color: '#666', fontSize: 13 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Alerts Setup Step */}
          {step.id === 'alerts' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {step.icon}
                </div>
                <div>
                  <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{step.title}</h1>
                  <p style={{ color: '#888' }}>{step.subtitle}</p>
                </div>
              </div>

              {/* Budget Threshold Slider */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: 28,
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontWeight: 600 }}>Budget Alert Threshold</span>
                  <span style={{ 
                    color: '#6366F1', 
                    fontWeight: 700,
                    fontSize: 18,
                  }}>
                    {budgetThreshold}%
                  </span>
                </div>
                <div className="slider-track" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  setBudgetThreshold(Math.max(10, Math.min(100, pct)));
                }}>
                  <div className="slider-fill" style={{ width: `${budgetThreshold}%` }} />
                  <div className="slider-thumb" style={{ left: `${budgetThreshold}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#555' }}>
                  <span>10%</span>
                  <span>Alert me when spending reaches {budgetThreshold}% of budget</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Alert Channels */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: 28,
                marginBottom: 32,
              }}>
                <div style={{ fontWeight: 600, marginBottom: 20 }}>Alert Channels</div>
                
                {[
                  { id: 'email', label: 'Email notifications', desc: 'Get alerts sent to your inbox' },
                  { id: 'slack', label: 'Slack integration', desc: 'Post alerts to a Slack channel' },
                ].map(channel => (
                  <div key={channel.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 2 }}>{channel.label}</div>
                      <div style={{ color: '#666', fontSize: 13 }}>{channel.desc}</div>
                    </div>
                    <div 
                      className={`toggle ${alertChannels[channel.id] ? 'active' : ''}`}
                      onClick={() => toggleAlertChannel(channel.id)}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Team Invite Step */}
          {step.id === 'team' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {step.icon}
                </div>
                <div>
                  <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{step.title}</h1>
                  <p style={{ color: '#888' }}>{step.subtitle}</p>
                </div>
              </div>

              {/* Invite Form */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: 28,
                marginBottom: 24,
              }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Invite by email</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input 
                    type="text"
                    className="input-field"
                    placeholder="email@company.com, another@company.com"
                    value={teamEmails}
                    onChange={(e) => setTeamEmails(e.target.value)}
                  />
                  <button className="btn btn-secondary" onClick={handleInvite}>
                    Invite
                  </button>
                </div>
              </div>

              {/* Team Members */}
              {invitedMembers.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: 28,
                  marginBottom: 32,
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>Pending invites</div>
                  {invitedMembers.map((member, i) => (
                    <div key={i} className="member-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: 14,
                        }}>
                          {member.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{member.email}</div>
                          <span className={`badge ${member.role === 'Admin' ? 'badge-admin' : ''}`} style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                      <span className="badge badge-pending">Pending</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={handleNext}>
                  Skip for now
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step.id === 'complete' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: 30,
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
                fontSize: 56,
                animation: 'bounce 0.6s ease',
              }}>
                {step.icon}
              </div>
              <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>{step.title}</h1>
              <p style={{ color: '#888', fontSize: 18, marginBottom: 48, lineHeight: 1.6 }}>
                Your account is configured and ready to go.<br />
                Start exploring your AI spending insights!
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                marginBottom: 48,
              }}>
                {[
                  { icon: '✓', label: 'Account created' },
                  { icon: '✓', label: 'Providers connected' },
                  { icon: '✓', label: 'Alerts configured' },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: 20,
                    background: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: 12,
                    textAlign: 'center',
                  }}>
                    <div style={{ color: '#22C55E', fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontSize: 14, color: '#888' }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/dashboard')}
                style={{ padding: '18px 56px', fontSize: 17 }}
              >
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>

        {/* Step Dots */}
        <div className="step-indicator" style={{ position: 'absolute', bottom: 48 }}>
          {onboardingSteps.map((_, i) => (
            <div 
              key={i} 
              className={`step-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
