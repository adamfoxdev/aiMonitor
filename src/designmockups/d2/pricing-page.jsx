import React, { useState } from 'react';

const plans = [
  { id: 'starter', name: 'Starter', desc: 'For individuals', monthly: 29, yearly: 24, features: ['3 providers', '7-day history', 'Email alerts', '1 team member'] },
  { id: 'pro', name: 'Pro', desc: 'For growing teams', monthly: 99, yearly: 79, popular: true, features: ['Unlimited providers', '90-day history', 'Slack + Email alerts', '10 team members', 'API access'] },
  { id: 'enterprise', name: 'Enterprise', desc: 'For organizations', monthly: 299, yearly: 249, features: ['Everything in Pro', 'Unlimited history', 'SSO / SAML', 'Unlimited team', 'Priority support'] },
];

const faqs = [
  { q: 'What counts as a provider?', a: 'Each API (OpenAI, Anthropic, Azure) counts as one provider.' },
  { q: 'Can I change plans?', a: 'Yes! Upgrade or downgrade anytime with prorated billing.' },
  { q: 'What happens after trial?', a: 'You\'ll be charged for your selected plan. We send reminders before it ends.' },
  { q: 'How secure is my data?', a: 'All API keys encrypted with AES-256. We only request read permissions.' },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#050506', color: '#FAFAFA', fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 48px; display: flex; justify-content: space-between; align-items: center; background: rgba(5,5,6,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .btn { padding: 12px 24px; border-radius: 10px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; font-family: inherit; }
        .btn-primary { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(99,102,241,0.4); }
        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; }
        .card { background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 40px; transition: all 0.3s; position: relative; }
        .card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-4px); }
        .card.popular { border-color: rgba(99,102,241,0.4); background: linear-gradient(145deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05)); }
        .toggle { display: flex; background: rgba(255,255,255,0.03); padding: 6px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
        .toggle-opt { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; color: #888; transition: all 0.2s; }
        .toggle-opt.active { background: rgba(99,102,241,0.15); color: #FAFAFA; }
        .faq { border-bottom: 1px solid rgba(255,255,255,0.06); }
        .faq-q { padding: 24px 0; display: flex; justify-content: space-between; cursor: pointer; font-weight: 500; }
        .faq-q:hover { color: #6366F1; }
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>$</div>
          <span style={{ fontSize: 20, fontWeight: 700 }}>TokenMeter</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none', fontSize: 14 }}>Home</a>
          <a href="#" style={{ color: '#FAFAFA', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Pricing</a>
          <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>Log In</button>
          <button className="btn btn-primary" style={{ padding: '8px 16px' }}>Start Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '160px 48px 80px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 56, fontWeight: 700, marginBottom: 16 }}>
          Simple, transparent <span style={{ background: 'linear-gradient(135deg, #6366F1, #D946EF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pricing</span>
        </h1>
        <p style={{ color: '#888', fontSize: 20, marginBottom: 40 }}>Start free for 14 days. No credit card required.</p>

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 60 }}>
          <div className="toggle">
            <div className={`toggle-opt ${!isYearly ? 'active' : ''}`} onClick={() => setIsYearly(false)}>Monthly</div>
            <div className={`toggle-opt ${isYearly ? 'active' : ''}`} onClick={() => setIsYearly(true)}>
              Yearly <span style={{ marginLeft: 8, padding: '2px 8px', background: 'rgba(34,197,94,0.15)', color: '#22C55E', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Save 20%</span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {plans.map(plan => (
            <div key={plan.id} className={`card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>MOST POPULAR</div>
              )}
              <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{plan.name}</h3>
              <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>{plan.desc}</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 48, fontWeight: 700 }}>${isYearly ? plan.yearly : plan.monthly}</span>
                <span style={{ color: '#888' }}>/mo</span>
              </div>
              {isYearly && <p style={{ color: '#22C55E', fontSize: 13, marginBottom: 24 }}>Billed annually (${plan.yearly * 12}/yr)</p>}
              <button className="btn btn-primary" style={{ width: '100%', marginBottom: 24 }}>Start Free Trial</button>
              <ul style={{ listStyle: 'none', textAlign: 'left' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10, color: '#A5A5A5', fontSize: 14 }}>
                    <span style={{ color: '#6366F1' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section style={{ padding: '80px 48px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <div key={i} className="faq">
            <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{faq.q}</span>
              <span style={{ color: '#666', fontSize: 20 }}>{openFaq === i ? '−' : '+'}</span>
            </div>
            {openFaq === i && <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, paddingBottom: 24 }}>{faq.a}</p>}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 800, margin: '0 auto', background: 'linear-gradient(145deg, rgba(99,102,241,0.15), rgba(139,92,246,0.05))', borderColor: 'rgba(99,102,241,0.3)' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Ready to take control?</h2>
          <p style={{ color: '#888', marginBottom: 32 }}>Start your 14-day free trial today.</p>
          <button className="btn btn-primary" style={{ padding: '16px 48px', fontSize: 16 }}>Get Started Free →</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 48px', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: 13 }}>© 2026 TokenMeter. All rights reserved.</p>
      </footer>
    </div>
  );
}
