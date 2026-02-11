import React, { useState, useEffect } from 'react';
import { providerRatingsAPI } from '../services/api.js';

const categories = [
  { id: 'all', label: 'All Providers' },
  { id: 'quality', label: 'Best Quality' },
  { id: 'value', label: 'Best Value' },
  { id: 'speed', label: 'Fastest' },
  { id: 'context', label: 'Largest Context' },
];

function StarRating({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} width={size} height={size} viewBox="0 0 24 24" fill={star <= Math.floor(rating) ? '#F59E0B' : star - 0.5 <= rating ? 'url(#half)' : '#333'}>
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#333" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProviderRatingsPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [sortBy, setSortBy] = useState('rating');
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState([]);

  // Fetch providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await providerRatingsAPI.list();
        setProviders(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Failed to load provider ratings');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const toggleCompare = (id) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(p => p !== id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, id]);
    }
  };

  const sortedProviders = [...providers].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price') return Math.min(...a.models.map(m => m.input)) - Math.min(...b.models.map(m => m.input));
    if (sortBy === 'reviews') return b.reviews - a.reviews;
    return 0;
  });

  const getBestDeal = () => {
    let best = null;
    let bestValue = Infinity;
    providers.forEach(p => {
      p.models.forEach(m => {
        const value = m.input / (m.quality || 1);
        if (value < bestValue) {
          bestValue = value;
          best = { provider: p, model: m };
        }
      });
    });
    return best;
  };

  const bestDeal = getBestDeal();

  // Show loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050506', color: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Loading Provider Ratings</div>
          <div style={{ color: '#888' }}>Fetching the latest provider data...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#050506', color: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>❌</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#EF4444' }}>{error}</div>
          <div style={{ color: '#888' }}>Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050506', color: '#FAFAFA', fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 48px; display: flex; justify-content: space-between; align-items: center; background: rgba(5,5,6,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .btn { padding: 10px 20px; border-radius: 10px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; font-family: inherit; }
        .btn-primary { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(99,102,241,0.4); }
        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        .card { background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; transition: all 0.3s; }
        .card:hover { border-color: rgba(255,255,255,0.12); }
        .provider-card { padding: 28px; cursor: pointer; }
        .provider-card:hover { transform: translateY(-2px); }
        .pill { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .category-btn { padding: 10px 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: transparent; color: #888; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .category-btn:hover { background: rgba(255,255,255,0.03); color: #FAFAFA; }
        .category-btn.active { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #FAFAFA; }
        .model-row { display: grid; grid-template-columns: 1.5fr 0.8fr 0.8fr 0.6fr 0.6fr 0.8fr; gap: 16px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; font-size: 14px; }
        .model-row:last-child { border-bottom: none; }
        .compare-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(5,5,6,0.95); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.1); padding: 20px 48px; display: flex; justify-content: space-between; align-items: center; z-index: 100; transform: translateY(100%); transition: transform 0.3s; }
        .compare-bar.active { transform: translateY(0); }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .best-deal-badge { position: absolute; top: -8px; right: -8px; background: linear-gradient(135deg, #22C55E, #10B981); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>$</div>
          <span style={{ fontSize: 20, fontWeight: 700 }}>TokenMeter</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none', fontSize: 14 }}>Home</a>
          <a href="/pricing" style={{ color: '#888', textDecoration: 'none', fontSize: 14 }}>Pricing</a>
          <a href="#" style={{ color: '#FAFAFA', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Provider Ratings</a>
          <button className="btn btn-primary" style={{ padding: '8px 16px' }}>Dashboard</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '140px 48px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>
          LLM Provider <span style={{ background: 'linear-gradient(135deg, #6366F1, #D946EF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ratings & Pricing</span>
        </h1>
        <p style={{ color: '#888', fontSize: 18, marginBottom: 40, maxWidth: 600 }}>
          Compare pricing, quality, and performance across all major LLM providers. Updated in real-time.
        </p>

        {/* Best Deal Banner */}
        {bestDeal && (
          <div className="card" style={{ padding: 24, marginBottom: 40, background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))', borderColor: 'rgba(34,197,94,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ background: 'rgba(34,197,94,0.15)', padding: 12, borderRadius: 12 }}>
                  <span style={{ fontSize: 28 }}>🏆</span>
                </div>
                <div>
                  <div style={{ color: '#22C55E', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 4 }}>TODAY'S BEST VALUE</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{bestDeal.model.name} <span style={{ color: '#888', fontWeight: 400 }}>by {bestDeal.provider.name}</span></div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#22C55E' }}>${bestDeal.model.input}<span style={{ fontSize: 14, color: '#888' }}>/1M input</span></div>
                <div style={{ color: '#888', fontSize: 13 }}>Best quality-to-price ratio</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: '#666', fontSize: 13 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#FAFAFA', fontSize: 13 }}
            >
              <option value="rating">Rating</option>
              <option value="price">Lowest Price</option>
              <option value="reviews">Most Reviews</option>
            </select>
            <button
              className={`btn ${compareMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setCompareMode(!compareMode); setCompareList([]); }}
              style={{ padding: '8px 16px' }}
            >
              {compareMode ? 'Exit Compare' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Provider Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sortedProviders.map(provider => (
            <div key={provider.id} className="card provider-card" onClick={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)} style={{ position: 'relative' }}>
              {provider.models.some(m => m.bestDeal) && (
                <div className="best-deal-badge">BEST DEAL</div>
              )}
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: expandedProvider === provider.id ? 24 : 0 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  {compareMode && (
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleCompare(provider.id); }}
                      style={{
                        width: 24, height: 24, borderRadius: 6,
                        border: compareList.includes(provider.id) ? '2px solid #6366F1' : '2px solid rgba(255,255,255,0.2)',
                        background: compareList.includes(provider.id) ? '#6366F1' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                      }}
                    >
                      {compareList.includes(provider.id) && <span style={{ color: 'white', fontSize: 14 }}>✓</span>}
                    </div>
                  )}
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `${provider.color}15`, border: `1px solid ${provider.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: provider.color, fontWeight: 700, fontSize: 20
                  }}>
                    {provider.logo}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 600 }}>{provider.name}</h3>
                      <span className="pill" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }}></span>
                        Operational
                      </span>
                    </div>
                    <p style={{ color: '#888', fontSize: 14 }}>{provider.description}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <StarRating rating={provider.rating} />
                    <span style={{ fontWeight: 600 }}>{provider.rating}</span>
                  </div>
                  <div style={{ color: '#666', fontSize: 13 }}>{provider.reviews.toLocaleString()} reviews</div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedProvider === provider.id && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
                  {/* Models Table */}
                  <h4 style={{ fontSize: 14, color: '#888', marginBottom: 16, fontWeight: 600 }}>AVAILABLE MODELS</h4>
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '8px 20px', marginBottom: 24 }}>
                    <div className="model-row" style={{ color: '#666', fontSize: 12, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>MODEL</div>
                      <div>INPUT</div>
                      <div>OUTPUT</div>
                      <div>CONTEXT</div>
                      <div>SPEED</div>
                      <div>BEST FOR</div>
                    </div>
                    {provider.models.map((model, i) => (
                      <div key={i} className="model-row" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 500 }}>{model.name}</span>
                          {model.bestDeal && (
                            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>BEST VALUE</span>
                          )}
                        </div>
                        <div className="mono" style={{ color: '#22C55E' }}>${model.input}/1M</div>
                        <div className="mono" style={{ color: '#F59E0B' }}>${model.output}/1M</div>
                        <div>{model.context}</div>
                        <div>
                          <span className="pill" style={{
                            background: model.speed === 'Fastest' ? 'rgba(34,197,94,0.15)' : model.speed === 'Fast' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                            color: model.speed === 'Fastest' ? '#22C55E' : model.speed === 'Fast' ? '#6366F1' : '#F59E0B',
                            padding: '4px 10px', fontSize: 11
                          }}>
                            {model.speed}
                          </span>
                        </div>
                        <div style={{ color: '#888', fontSize: 13 }}>{model.bestFor}</div>
                      </div>
                    ))}
                  </div>

                  {/* Pros & Cons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <h4 style={{ fontSize: 14, color: '#22C55E', marginBottom: 12, fontWeight: 600 }}>✓ PROS</h4>
                      <ul style={{ listStyle: 'none' }}>
                        {provider.pros.map((pro, i) => (
                          <li key={i} style={{ padding: '8px 0', color: '#A5A5A5', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#22C55E' }}>+</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, color: '#EF4444', marginBottom: 12, fontWeight: 600 }}>✗ CONS</h4>
                      <ul style={{ listStyle: 'none' }}>
                        {provider.cons.map((con, i) => (
                          <li key={i} style={{ padding: '8px 0', color: '#A5A5A5', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#EF4444' }}>−</span> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Expand Indicator */}
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <span style={{ color: '#666', fontSize: 12 }}>{expandedProvider === provider.id ? '▲ Collapse' : '▼ View models & pricing'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section style={{ padding: '60px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Quick Comparison</h2>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={{ padding: 20, textAlign: 'left', color: '#888', fontWeight: 500 }}>Provider</th>
                <th style={{ padding: 20, textAlign: 'center', color: '#888', fontWeight: 500 }}>Cheapest Model</th>
                <th style={{ padding: 20, textAlign: 'center', color: '#888', fontWeight: 500 }}>Best Model</th>
                <th style={{ padding: 20, textAlign: 'center', color: '#888', fontWeight: 500 }}>Max Context</th>
                <th style={{ padding: 20, textAlign: 'center', color: '#888', fontWeight: 500 }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => {
                const cheapest = p.models.reduce((a, b) => a.input < b.input ? a : b);
                const best = p.models.reduce((a, b) => (a.quality || 0) > (b.quality || 0) ? a : b);
                const maxContext = p.models.reduce((a, b) => {
                  const parseCtx = (s) => parseInt(s.replace(/[KM]/g, '')) * (s.includes('M') ? 1000 : 1);
                  return parseCtx(a.context) > parseCtx(b.context) ? a : b;
                });
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color, fontWeight: 700, fontSize: 14 }}>{p.logo}</div>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: 20, textAlign: 'center' }}>
                      <div style={{ fontSize: 13, color: '#888' }}>{cheapest.name}</div>
                      <div className="mono" style={{ color: '#22C55E', fontWeight: 600 }}>${cheapest.input}/1M</div>
                    </td>
                    <td style={{ padding: 20, textAlign: 'center' }}>
                      <div style={{ fontSize: 13, color: '#888' }}>{best.name}</div>
                      <div className="mono" style={{ fontWeight: 600 }}>${best.input}/1M</div>
                    </td>
                    <td style={{ padding: 20, textAlign: 'center', fontWeight: 600 }}>{maxContext.context}</td>
                    <td style={{ padding: 20, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <StarRating rating={p.rating} size={14} />
                        <span style={{ fontWeight: 500 }}>{p.rating}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 48px 100px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 700, margin: '0 auto', padding: 48, background: 'linear-gradient(145deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', borderColor: 'rgba(99,102,241,0.3)' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Track all your providers in one place</h2>
          <p style={{ color: '#888', marginBottom: 32 }}>Get real-time cost monitoring across every LLM you use.</p>
          <button className="btn btn-primary" style={{ padding: '14px 40px', fontSize: 16 }}>Start Free Trial →</button>
        </div>
      </section>

      {/* Compare Bar */}
      <div className={`compare-bar ${compareList.length > 0 ? 'active' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#888' }}>Comparing {compareList.length} providers:</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {compareList.map(id => {
              const p = providers.find(pr => pr.id === id);
              return (
                <span key={id} className="pill" style={{ background: `${p.color}20`, color: p.color }}>
                  {p.name}
                  <span onClick={() => toggleCompare(id)} style={{ cursor: 'pointer', marginLeft: 6 }}>×</span>
                </span>
              );
            })}
          </div>
        </div>
        <button className="btn btn-primary" disabled={compareList.length < 2}>
          Compare Selected →
        </button>
      </div>
    </div>
  );
}
