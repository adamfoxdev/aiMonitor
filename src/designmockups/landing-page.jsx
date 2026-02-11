import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const providers = [
  { name: 'Anthropic', logo: 'A', color: '#D97757' },
  { name: 'OpenAI', logo: 'O', color: '#10A37F' },
  { name: 'Azure', logo: 'Az', color: '#0078D4' },
  { name: 'GitHub', logo: 'G', color: '#8B5CF6' },
  { name: 'Vercel', logo: 'V', color: '#fff' },
  { name: 'AWS', logo: 'λ', color: '#FF9900' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'CTO, TechFlow', quote: 'Cut our LLM costs by 34% in the first month. The model-level insights were a game changer.', avatar: 'SC' },
  { name: 'Marcus Johnson', role: 'Engineering Lead, DataPipe', quote: 'Finally, one dashboard for all our AI spend. No more spreadsheet nightmares.', avatar: 'MJ' },
  { name: 'Elena Rodriguez', role: 'VP Engineering, ScaleAI', quote: 'The budget alerts saved us from a $50K overage. Paid for itself instantly.', avatar: 'ER' },
];

const pricingPlans = [
  { name: 'Starter', price: 29, features: ['Up to 3 providers', '7-day history', 'Email alerts', '1 team member'], cta: 'Start Free Trial' },
  { name: 'Pro', price: 99, features: ['Unlimited providers', '90-day history', 'Slack + Email alerts', '10 team members', 'API access', 'Custom reports'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: null, features: ['Everything in Pro', 'Unlimited history', 'SSO / SAML', 'Unlimited team', 'Dedicated support', 'Custom integrations'], cta: 'Contact Sales' },
];

function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function FloatingOrb({ color, size, top, left, delay }) {
  return (
    <div style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10, transparent)`,
      filter: 'blur(40px)',
      top,
      left,
      animation: `float ${8 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none',
    }} />
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    
    if (!email) {
      setEmailError('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setIsSubmittingEmail(true);
    
    try {
      // Send email to backend
      const response = await fetch('http://localhost:3001/api/auth/landing-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to signup with email pre-filled
        navigate(`/signup?email=${encodeURIComponent(email)}`);
      } else {
        setEmailError(data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email submission error:', error);
      setEmailError('Network error. Please try again.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKey = (event) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050506',
      color: '#FAFAFA',
      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 80px rgba(99, 102, 241, 0.6); }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 20px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        .nav-link {
          color: #888;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .nav-toggle {
          display: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: #fafafa;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .nav-toggle span {
          display: block;
          width: 18px;
          height: 2px;
          background: currentColor;
          position: relative;
        }

        .nav-toggle span::before,
        .nav-toggle span::after {
          content: '';
          position: absolute;
          left: 0;
          width: 18px;
          height: 2px;
          background: currentColor;
        }

        .nav-toggle span::before {
          top: -6px;
        }

        .nav-toggle span::after {
          top: 6px;
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 76px;
          left: 16px;
          right: 16px;
          padding: 20px;
          border-radius: 18px;
          background: rgba(8, 8, 10, 0.96);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 60px rgba(0,0,0,0.45);
          backdrop-filter: blur(18px);
          z-index: 120;
        }

        .mobile-menu.open {
          display: grid;
          gap: 16px;
        }

        .mobile-menu a {
          color: #e2e2e2;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .nav {
            padding: 16px 20px;
          }

          .nav-links {
            display: none;
          }

          .nav-toggle {
            display: inline-flex;
          }
        }
        
        .nav.scrolled {
          background: rgba(5, 5, 6, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .hero-btn {
          padding: 16px 32px;
          border-radius: 12px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
        }
        
        .hero-btn.primary {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          color: white;
        }
        
        .hero-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4);
        }
        
        .hero-btn.secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }
        
        .hero-btn.secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        
        .section {
          padding: 120px 48px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .card {
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card:hover {
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-4px);
        }
        
        .feature-card:hover {
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }
        
        .pricing-card {
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        
        .pricing-card.popular {
          border-color: rgba(99, 102, 241, 0.3);
          background: linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%);
        }
        
        .pricing-card.popular::before {
          content: 'MOST POPULAR';
          position: absolute;
          top: 20px;
          right: -35px;
          background: linear-gradient(90deg, #6366F1, #8B5CF6);
          color: white;
          padding: 6px 40px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          transform: rotate(45deg);
        }

        .price-value {
          font-size: 48px;
          font-weight: 700;
        }

        .price-suffix {
          color: #666;
          font-size: 16px;
        }

        .price-custom {
          font-size: 32px;
          font-weight: 600;
        }

        @media (max-width: 1100px) {
          .pricing-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .pricing-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .pricing-card {
            padding: 28px;
          }

          .price-value {
            font-size: 40px;
          }

          .price-custom {
            font-size: 28px;
          }
        }
        
        .email-input {
          flex: 1;
          padding: 18px 24px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: white;
          font-size: 16px;
          font-family: inherit;
          outline: none;
          transition: all 0.3s;
        }
        
        .email-input:focus {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        
        .email-input::placeholder {
          color: #666;
        }
        
        .stat-number {
          font-size: 64px;
          font-weight: 700;
          background: linear-gradient(135deg, #fff 0%, #888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        
        .ticker-wrapper {
          overflow: hidden;
          padding: 40px 0;
          background: linear-gradient(90deg, #050506 0%, transparent 10%, transparent 90%, #050506 100%);
        }
        
        .ticker {
          display: flex;
          animation: ticker 20s linear infinite;
        }
        
        .ticker-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          margin: 0 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 100px;
          white-space: nowrap;
        }
      `}</style>

      {/* Floating Orbs Background */}
      <FloatingOrb color="#6366F1" size="600px" top="-200px" left="-200px" delay={0} />
      <FloatingOrb color="#8B5CF6" size="400px" top="20%" left="70%" delay={2} />
      <FloatingOrb color="#D946EF" size="500px" top="60%" left="-100px" delay={4} />
      <FloatingOrb color="#6366F1" size="300px" top="80%" left="60%" delay={1} />

      {/* Navigation */}
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          <span style={{ fontSize: 20, fontWeight: 700 }}>TokenMeter</span>
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#" className="nav-link">Docs</a>
          <button className="hero-btn secondary" style={{ padding: '10px 20px', fontSize: 14 }} onClick={() => navigate('/login')}>Log In</button>
          <button className="hero-btn primary" style={{ padding: '10px 20px', fontSize: 14 }} onClick={() => navigate('/signup')}>Get Started</button>
        </div>
        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span />
        </button>
      </nav>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
        <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
        <a href="#" onClick={() => setIsMobileMenuOpen(false)}>Docs</a>
        <button className="hero-btn secondary" style={{ width: '100%' }} onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Log In</button>
        <button className="hero-btn primary" style={{ width: '100%' }} onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}>Get Started</button>
      </div>

      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
        padding: '140px 48px 80px',
        position: 'relative',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px 8px 8px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 100,
          marginBottom: 32,
          animation: 'slide-up 0.6s ease-out',
        }}>
          <span style={{
            padding: '4px 10px',
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}>NEW</span>
          <span style={{ fontSize: 13, color: '#A5A5A5' }}>Now supporting AWS Bedrock & Google Vertex AI</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 88px)',
          fontWeight: 700,
          lineHeight: 1.05,
          maxWidth: 900,
          marginBottom: 24,
          animation: 'slide-up 0.6s ease-out 0.1s both',
        }}>
          Stop Overspending on{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            AI APIs
          </span>
        </h1>

        <p style={{
          fontSize: 20,
          color: '#888',
          maxWidth: 600,
          lineHeight: 1.6,
          marginBottom: 48,
          animation: 'slide-up 0.6s ease-out 0.2s both',
        }}>
          One dashboard to monitor, analyze, and optimize your costs across every LLM provider. 
          Get real-time alerts before budgets blow up.
        </p>

        <div style={{
          display: 'flex',
          gap: 16,
          marginBottom: 48,
          animation: 'slide-up 0.6s ease-out 0.3s both',
        }}>
          <div style={{ display: 'flex', gap: 12, maxWidth: 500 }}>
            <input 
              type="email" 
              placeholder="Enter your work email" 
              className="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit(e)}
            />
            <button 
              className="hero-btn primary"
              onClick={handleEmailSubmit}
              disabled={isSubmittingEmail}
              style={{ minWidth: 140 }}
            >
              {isSubmittingEmail ? 'Sending...' : 'Start Free →'}
            </button>
          </div>
          {emailError && (
            <div style={{ color: '#EF4444', fontSize: 14, marginTop: 8 }}>
              {emailError}
            </div>
          )}
        </div>

        <p style={{ fontSize: 13, color: '#555', animation: 'slide-up 0.6s ease-out 0.4s both' }}>
          Free 14-day trial · No credit card required · Setup in 2 minutes
        </p>

        {/* Dashboard Preview */}
        <div style={{
          marginTop: 80,
          width: '100%',
          maxWidth: 1100,
          animation: 'slide-up 0.8s ease-out 0.5s both',
        }}>
          <div className="card" style={{
            padding: 8,
            background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
            borderColor: 'rgba(99, 102, 241, 0.2)',
            animation: 'pulse-glow 4s ease-in-out infinite',
          }}>
            <div style={{
              background: '#0A0A0B',
              borderRadius: 18,
              padding: 24,
              minHeight: 400,
            }}>
              {/* Mock Dashboard Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
                </div>
                <div style={{ color: '#444', fontSize: 12 }}>dashboard.tokenmeter.io</div>
              </div>
              
              {/* Mock Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Total Spend', value: '$2,847.32', trend: '+12%' },
                  { label: 'Tokens Used', value: '28.4M', trend: '+8%' },
                  { label: 'Avg Cost/1K', value: '$0.0042', trend: '-15%' },
                  { label: 'Active Models', value: '12', trend: '' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    padding: 20,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>{stat.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{stat.value}</div>
                    {stat.trend && (
                      <div style={{ color: stat.trend.startsWith('+') ? '#22C55E' : '#EF4444', fontSize: 12, marginTop: 4 }}>
                        {stat.trend}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mock Chart Area */}
              <div style={{
                height: 180,
                background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'flex-end',
                padding: '0 16px 16px',
                gap: 8,
              }}>
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
          </div>
        </div>
      </section>

      {/* Provider Ticker */}
      <div className="ticker-wrapper">
        <div className="ticker">
          {[...providers, ...providers].map((p, i) => (
            <div key={i} className="ticker-item">
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${p.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: p.color,
                fontWeight: 700,
                fontSize: 14,
              }}>
                {p.logo}
              </div>
              <span style={{ fontWeight: 500 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
          {[
            { number: 2847, suffix: '+', label: 'Companies monitoring costs' },
            { number: 34, suffix: '%', label: 'Average cost reduction' },
            { number: 12, suffix: 'M', prefix: '$', label: 'Saved for customers' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="stat-number">
                <AnimatedCounter end={stat.number} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <div style={{ color: '#666', marginTop: 8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>
            Everything you need to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366F1, #D946EF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>control AI costs</span>
          </h2>
          <p style={{ color: '#666', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            Stop guessing. Start knowing exactly where every dollar goes across your AI infrastructure.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { 
              icon: '📊', 
              title: 'Unified Dashboard', 
              desc: 'All your providers in one view. Compare costs, usage, and efficiency across OpenAI, Anthropic, Azure, and more.' 
            },
            { 
              icon: '🚨', 
              title: 'Smart Alerts', 
              desc: 'Get notified before you overspend. Set budget thresholds, anomaly detection, and usage spike warnings.' 
            },
            { 
              icon: '📈', 
              title: 'Model Analytics', 
              desc: 'Deep dive into cost-per-token, response latency, and efficiency metrics for every model you use.' 
            },
            { 
              icon: '👥', 
              title: 'Team Attribution', 
              desc: 'Track spend by team, project, or feature. Know exactly who\'s using what and optimize accordingly.' 
            },
            { 
              icon: '🔌', 
              title: '2-Minute Setup', 
              desc: 'Just paste your API keys. We handle the rest. No code changes, no SDK, no infrastructure.' 
            },
            { 
              icon: '📑', 
              title: 'Export & Reports', 
              desc: 'Generate finance-ready reports. Export to CSV, PDF, or integrate directly with your billing systems.' 
            },
          ].map((feature, i) => (
            <div key={i} className="card feature-card" style={{ padding: 32 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                marginBottom: 20,
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{feature.title}</h3>
              <p style={{ color: '#888', lineHeight: 1.6, fontSize: 15 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, marginBottom: 60 }}>
          Loved by engineering teams
        </h2>
        
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', minHeight: 200 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: activeTestimonial === i ? 1 : 0,
              transform: activeTestimonial === i ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.5s ease-out',
            }}>
              <p style={{ fontSize: 24, lineHeight: 1.6, marginBottom: 32, fontStyle: 'italic', color: '#ccc' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                }}>
                  {t.avatar}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ color: '#666', fontSize: 14 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTestimonial(i)}
              style={{
                width: activeTestimonial === i ? 32 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: activeTestimonial === i ? '#6366F1' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ color: '#666', fontSize: 18 }}>
            Start free. Upgrade when you're ready.
          </p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, i) => (
            <div key={i} className={`card pricing-card ${plan.popular ? 'popular' : ''}`}>
              <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>{plan.name}</h3>
              <div style={{ marginBottom: 24 }}>
                {plan.price ? (
                  <>
                    <span className="price-value">${plan.price}</span>
                    <span className="price-suffix">/month</span>
                  </>
                ) : (
                  <span className="price-custom">Custom</span>
                )}
              </div>
              <ul style={{ listStyle: 'none', marginBottom: 32 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ 
                    padding: '12px 0', 
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    color: '#A5A5A5',
                    fontSize: 14,
                  }}>
                    <span style={{ color: '#6366F1' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                className={`hero-btn ${plan.popular ? 'primary' : 'secondary'}`}
                style={{ width: '100%' }}
                onClick={() => navigate('/signup')}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="card" style={{
          padding: 80,
          background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <FloatingOrb color="#6366F1" size="300px" top="-100px" left="-100px" delay={0} />
          <FloatingOrb color="#8B5CF6" size="200px" top="50%" left="80%" delay={2} />
          
          <h2 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            Ready to take control?
          </h2>
          <p style={{ color: '#888', fontSize: 18, marginBottom: 40, position: 'relative', zIndex: 1 }}>
            Join 2,800+ teams already saving money on AI costs.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <button className="hero-btn primary" style={{ padding: '18px 40px', fontSize: 18 }} onClick={() => navigate('/signup')}>
              Start Free Trial →
            </button>
            <button className="hero-btn secondary" style={{ padding: '18px 40px', fontSize: 18 }}>
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 48px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
            }}>
              $
            </div>
            <span style={{ fontWeight: 600 }}>TokenMeter</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: 14 }}>Privacy</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: 14 }}>Terms</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: 14 }}>Documentation</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: 14 }}>Contact</a>
          </div>
          <div style={{ color: '#444', fontSize: 13 }}>
            © 2026 TokenMeter. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
