import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const providers = [
  { id: 'anthropic', name: 'Anthropic', color: '#D97757', spend: 1247.32, budget: 2000, tokens: '14.2M', trend: +12 },
  { id: 'openai', name: 'OpenAI', color: '#10A37F', spend: 892.15, budget: 1500, tokens: '8.7M', trend: -5 },
  { id: 'azure', name: 'Azure OpenAI', color: '#0078D4', spend: 456.78, budget: 800, tokens: '5.1M', trend: +23 },
  { id: 'github', name: 'GitHub Copilot', color: '#8B5CF6', spend: 234.00, budget: 500, tokens: '—', trend: 0 },
  { id: 'vercel', name: 'v0.dev', color: '#000000', spend: 89.50, budget: 200, tokens: '890K', trend: +45 },
];

const dailyData = [
  { day: 'Mon', anthropic: 45, openai: 32, azure: 18, github: 8, vercel: 4 },
  { day: 'Tue', anthropic: 52, openai: 28, azure: 22, github: 8, vercel: 6 },
  { day: 'Wed', anthropic: 48, openai: 35, azure: 19, github: 8, vercel: 3 },
  { day: 'Thu', anthropic: 61, openai: 42, azure: 25, github: 8, vercel: 8 },
  { day: 'Fri', anthropic: 55, openai: 38, azure: 21, github: 8, vercel: 5 },
  { day: 'Sat', anthropic: 32, openai: 18, azure: 12, github: 8, vercel: 2 },
  { day: 'Sun', anthropic: 28, openai: 15, azure: 10, github: 8, vercel: 3 },
];

const recentActivity = [
  { time: '2 min ago', provider: 'Anthropic', model: 'claude-sonnet-4', tokens: '12,450', cost: '$0.12' },
  { time: '5 min ago', provider: 'OpenAI', model: 'gpt-4o', tokens: '8,230', cost: '$0.08' },
  { time: '12 min ago', provider: 'Anthropic', model: 'claude-opus-4', tokens: '45,600', cost: '$0.89' },
  { time: '18 min ago', provider: 'Azure', model: 'gpt-4-turbo', tokens: '15,200', cost: '$0.23' },
  { time: '25 min ago', provider: 'v0.dev', model: 'v0-generate', tokens: '2,100', cost: '$0.05' },
];

const modelBreakdown = [
  { model: 'claude-sonnet-4', provider: 'Anthropic', usage: 42, cost: 523.40 },
  { model: 'gpt-4o', provider: 'OpenAI', usage: 28, cost: 412.80 },
  { model: 'claude-opus-4', provider: 'Anthropic', usage: 15, cost: 723.92 },
  { model: 'gpt-4-turbo', provider: 'Azure', usage: 10, cost: 256.78 },
  { model: 'claude-haiku', provider: 'Anthropic', usage: 5, cost: 45.20 },
];

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [hoveredProvider, setHoveredProvider] = useState(null);
  
  const totalSpend = providers.reduce((sum, p) => sum + p.spend, 0);
  const totalBudget = providers.reduce((sum, p) => sum + p.budget, 0);
  const budgetUsed = (totalSpend / totalBudget) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0B',
      color: '#FAFAFA',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      padding: '32px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; }
        
        .card {
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .glow-text {
          background: linear-gradient(135deg, #FAFAFA 0%, #A0A0A0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .period-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #666;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .period-btn:hover {
          color: #FAFAFA;
          background: rgba(255,255,255,0.05);
        }
        
        .period-btn.active {
          background: rgba(255,255,255,0.1);
          color: #FAFAFA;
        }
        
        .provider-row {
          display: grid;
          grid-template-columns: 200px 1fr 100px 80px;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .provider-row:hover {
          background: rgba(255,255,255,0.02);
        }
        
        .provider-row:last-child {
          border-bottom: none;
        }
        
        .progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .activity-row {
          display: grid;
          grid-template-columns: 80px 100px 140px 80px 70px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px;
        }
        
        .activity-row:last-child {
          border-bottom: none;
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .trend-up { color: #22C55E; }
        .trend-down { color: #EF4444; }
        .trend-neutral { color: #666; }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        .alert-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ 
              width: 10, height: 10, borderRadius: '50%', 
              background: '#22C55E',
              boxShadow: '0 0 12px #22C55E'
            }} />
            <span style={{ color: '#666', fontSize: 13, fontWeight: 500 }}>All systems operational</span>
          </div>
          <h1 className="glow-text" style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            Cost Dashboard
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10 }}>
          {['24h', '7d', '30d', '90d'].map(period => (
            <button
              key={period}
              className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ color: '#666', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Total Spend</div>
          <div className="mono" style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
            ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ color: '#666', fontSize: 12 }}>
            of ${totalBudget.toLocaleString()} budget
          </div>
        </div>
        
        <div className="card" style={{ padding: 24 }}>
          <div style={{ color: '#666', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Budget Used</div>
          <div className="mono" style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            {budgetUsed.toFixed(1)}%
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${budgetUsed}%`,
                background: budgetUsed > 80 ? '#EF4444' : budgetUsed > 60 ? '#F59E0B' : '#22C55E'
              }} 
            />
          </div>
        </div>
        
        <div className="card" style={{ padding: 24 }}>
          <div style={{ color: '#666', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Total Tokens</div>
          <div className="mono" style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
            28.9M
          </div>
          <div className="trend-up" style={{ fontSize: 12, fontWeight: 500 }}>
            ↑ 8.2% vs last period
          </div>
        </div>
        
        <div className="card" style={{ padding: 24 }}>
          <div style={{ color: '#666', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Active Models</div>
          <div className="mono" style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
            12
          </div>
          <div style={{ color: '#666', fontSize: 12 }}>
            across 5 providers
          </div>
        </div>
      </div>

      {/* Charts and Providers Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Spend Over Time Chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Daily Spend by Provider</h2>
            <div style={{ display: 'flex', gap: 16 }}>
              {providers.slice(0, 4).map(p => (
                <div 
                  key={p.id} 
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: hoveredProvider && hoveredProvider !== p.id ? 0.3 : 1, transition: 'opacity 0.2s' }}
                  onMouseEnter={() => setHoveredProvider(p.id)}
                  onMouseLeave={() => setHoveredProvider(null)}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                  <span style={{ fontSize: 12, color: '#888' }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <defs>
                {providers.map(p => (
                  <linearGradient key={p.id} id={`gradient-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={p.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1A1A1B',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}
                labelStyle={{ color: '#FAFAFA', marginBottom: 8 }}
                itemStyle={{ padding: 2 }}
              />
              {providers.map(p => (
                <Area
                  key={p.id}
                  type="monotone"
                  dataKey={p.id}
                  stroke={p.color}
                  strokeWidth={2}
                  fill={`url(#gradient-${p.id})`}
                  opacity={hoveredProvider && hoveredProvider !== p.id ? 0.2 : 1}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Provider Breakdown */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Provider Breakdown</h2>
          </div>
          {providers.map(p => (
            <div key={p.id} className="provider-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 36, height: 36, borderRadius: 10, 
                  background: `${p.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${p.color}30`
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ color: '#666', fontSize: 12 }}>{p.tokens} tokens</div>
                </div>
              </div>
              <div style={{ padding: '0 20px' }}>
                <div className="progress-bar" style={{ width: '100%' }}>
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(p.spend / p.budget) * 100}%`,
                      background: p.color
                    }} 
                  />
                </div>
              </div>
              <div className="mono" style={{ fontWeight: 600, textAlign: 'right' }}>
                ${p.spend.toLocaleString()}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={p.trend > 0 ? 'trend-up' : p.trend < 0 ? 'trend-down' : 'trend-neutral'} style={{ fontSize: 13, fontWeight: 500 }}>
                  {p.trend > 0 ? '↑' : p.trend < 0 ? '↓' : '—'} {Math.abs(p.trend)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Activity */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Recent Activity</h2>
            <div style={{ 
              padding: '4px 10px', borderRadius: 20, 
              background: 'rgba(34, 197, 94, 0.1)', 
              color: '#22C55E', 
              fontSize: 11, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <div className="alert-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
              Live
            </div>
          </div>
          <div style={{ padding: '8px 20px 20px' }}>
            <div className="activity-row" style={{ color: '#666', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>
              <div>TIME</div>
              <div>PROVIDER</div>
              <div>MODEL</div>
              <div>TOKENS</div>
              <div>COST</div>
            </div>
            {recentActivity.map((a, i) => (
              <div key={i} className="activity-row">
                <div style={{ color: '#666' }}>{a.time}</div>
                <div style={{ fontWeight: 500 }}>{a.provider}</div>
                <div className="mono" style={{ color: '#888', fontSize: 12 }}>{a.model}</div>
                <div className="mono">{a.tokens}</div>
                <div className="mono" style={{ color: '#22C55E', fontWeight: 500 }}>{a.cost}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Usage */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Top Models by Usage</h2>
          </div>
          <div style={{ padding: '12px 20px 20px' }}>
            {modelBreakdown.map((m, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>{m.model}</span>
                    <span style={{ color: '#666', fontSize: 12, marginLeft: 8 }}>{m.provider}</span>
                  </div>
                  <span className="mono" style={{ color: '#888', fontSize: 13 }}>${m.cost.toFixed(2)}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill shimmer" 
                    style={{ 
                      width: `${m.usage}%`,
                      background: `linear-gradient(90deg, ${providers.find(p => p.name === m.provider)?.color || '#666'}, ${providers.find(p => p.name === m.provider)?.color || '#666'}88)`
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div style={{ 
        marginTop: 24, 
        padding: '16px 24px', 
        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="alert-pulse" style={{ 
            width: 8, height: 8, borderRadius: '50%', 
            background: '#EF4444',
            boxShadow: '0 0 12px #EF4444'
          }} />
          <span style={{ fontWeight: 500 }}>
            <span style={{ color: '#EF4444' }}>Alert:</span> v0.dev spending increased 45% — approaching budget threshold
          </span>
        </div>
        <button style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'transparent',
          color: '#EF4444',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer'
        }}>
          Adjust Budget →
        </button>
      </div>
    </div>
  );
}
