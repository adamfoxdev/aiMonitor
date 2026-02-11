# aiMonitor - LLM Cost Monitoring Platform

A real-time cost monitoring and optimization dashboard for AI/LLM API usage across multiple providers. Track spending, set budgets, get alerts, and optimize your AI infrastructure costs.

## Features

- 📊 **Unified Dashboard** - Monitor spend across OpenAI, Anthropic, Azure, GitHub, AWS, and Google
- 🚨 **Smart Alerts** - Budget thresholds, anomaly detection, spike warnings
- 👥 **Team Collaboration** - Invite team members, role-based access control
- 📈 **Analytics** - Per-model costs, trending, provider breakdowns
- 🔌 **Easy Setup** - 2-minute setup, no code changes needed
- 💾 **Data Export** - CSV and PDF reports for finance teams

## Tech Stack

### Frontend
- React 19
- Vite (build tool)
- React Router (navigation)
- Recharts (data visualization)
- Axios (HTTP client)
- Supabase JS (auth & real-time)

### Backend
- Node.js / Express
- PostgreSQL (via Supabase)
- Supabase Auth (authentication)
- JWT (token-based auth)
- Row Level Security (data isolation)

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier available)

### Frontend Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials and API URL

# Start development server
npm run dev

# Open http://localhost:5173 in browser
```

### Backend Setup

See [api/README.md](api/README.md) for detailed backend setup instructions.

```bash
# Install backend dependencies
cd api
npm install

# Configure environment
cp .env.example .env
# Edit .env with Supabase credentials

# Start API server
npm run dev

# API runs on http://localhost:3001
```

## Project Structure

```
aiMonitor/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   ├── services/
│   │   └── api.js              # API client setup
│   ├── contexts/
│   │   └── AuthContext.jsx     # Auth state management
│   └── designmockups/          # Page components
│       ├── landing-page.jsx
│       ├── login-page.jsx
│       ├── dashboard.jsx
│       ├── settings-billing.jsx
│       └── ...
├── api/
│   ├── src/
│   │   ├── index.js            # Express server
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, error handling
│   │   ├── workers/            # Background jobs
│   │   └── utils/              # Helper functions
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 001_init_schema.sql # Database schema
├── .env.example                # Frontend env template
└── README.md                   # This file
```

## Environment Setup

### Frontend (.env)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

### Backend (api/.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
ENCRYPTION_KEY=your-32-character-encryption-key
```

## API Documentation

Core endpoints:

- **Auth**: `/api/auth/login`, `/api/auth/signup`, `/api/auth/forgot-password`
- **Teams**: `/api/teams` (CRUD operations)
- **Providers**: `/api/providers` (connect/disconnect LLM providers)
- **Spending**: `/api/spending` (cost data and dashboard summaries)
- **User**: `/api/user` (profile & alert settings)

See [api/README.md](api/README.md) for complete API documentation.

## Deployment

### Frontend
```bash
npm run build  # Creates dist/ directory
npm run deploy # Deploys to GitHub Pages
```

### Backend
Deploy to Vercel, Railway, Render, or self-hosted server. See [api/README.md](api/README.md) for deployment instructions.

## Development Commands

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run deploy   # Deploy to GitHub Pages
```

### Backend
```bash
cd api
npm run dev      # Start dev server with nodemon
npm run start    # Start production server
npm run test     # Run tests (not implemented yet)
npm run lint     # Lint code
```

## Database Schema

Key tables:
- `users` - User accounts
- `teams` - Workspaces
- `team_members` - Team membership & roles
- `provider_connections` - Connected LLM providers
- `spending_entries` - Cost tracking data
- `budgets` - Budget limits & alerts
- `alert_settings` - Notification preferences

All data is isolated per team using Supabase Row Level Security (RLS).

## Authentication Flow

1. User signs up/logs in
2. Supabase Auth verifies credentials
3. Backend returns JWT token
4. Frontend stores token and sends in `Authorization` header
5. Backend verifies token for protected routes

OAuth support ready for Google & GitHub (requires additional frontend setup).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/adamfoxdev/aiMonitor/issues)
- Email: support@aimonitor.app (coming soon)

## Roadmap

- [ ] Full LLM provider API integrations (OpenAI, Anthropic, Azure)
- [ ] Stripe billing integration
- [ ] Slack notifications
- [ ] Cost optimization recommendations
- [ ] Advanced analytics & forecasting
- [ ] Mobile app
- [ ] API key management for users

---

**Built with ❤️ for engineering teams managing AI costs**
