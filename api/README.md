# aiMonitor Backend - Setup Guide

The backend is a Node.js/Express API that handles authentication, team management, provider integrations, and spending data tracking.

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier available at supabase.com)
- Environment variables configured

## Quick Start

### 1. Set up Supabase

1. Create a new Supabase project at https://app.supabase.com
2. Note your project URL and API keys (anon key and service key)
3. Go to SQL Editor and run the schema migration:
   - Copy contents of `supabase/migrations/001_init_schema.sql`
   - Create a new query and paste the SQL
   - Run the query

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
JWT_SECRET=your-jwt-secret-key-min-32-chars
FRONTEND_URL=http://localhost:5173
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The API will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh-token` - Refresh JWT token

### Teams
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:teamId` - Get team details
- `GET /api/teams/:teamId/members` - List team members
- `POST /api/teams/:teamId/members/invite` - Invite team member
- `PATCH /api/teams/:teamId/members/:memberId` - Update member role
- `DELETE /api/teams/:teamId/members/:memberId` - Remove team member

### Providers
- `GET /api/providers/:teamId` - List connected providers
- `POST /api/providers/:teamId/connect` - Connect new provider
- `DELETE /api/providers/:teamId/disconnect/:providerId` - Disconnect provider
- `POST /api/providers/:teamId/sync/:providerId` - Manually sync provider data

### Spending
- `GET /api/spending/:teamId` - Get spending entries (paginated)
- `GET /api/spending/:teamId/summary` - Get dashboard summary
- `POST /api/spending/:teamId/import` - Import CSV spending data

### User
- `GET /api/user` - Get current user profile
- `PATCH /api/user` - Update user profile
- `GET /api/user/alerts` - Get alert settings
- `PATCH /api/user/alerts` - Update alert settings
- `POST /api/user/change-password` - Change password

## Database Schema

The backend uses PostgreSQL with the following main tables:

- **users** - User profiles
- **teams** - Workspace teams
- **team_members** - Team membership and roles
- **provider_connections** - Connected LLM providers
- **spending_entries** - Cost tracking data
- **budgets** - Budget limits and alerts
- **alert_settings** - User notification preferences
- **team_invitations** - Pending team invitations
- **api_keys** - API keys for platform access

All tables have Row Level Security (RLS) policies to ensure data isolation by team.

## Authentication Flow

1. User signs up or logs in via `/api/auth/signup` or `/api/auth/login`
2. Backend verifies credentials via Supabase Auth
3. JWT token is returned and stored in localStorage
4. Token is sent in `Authorization: Bearer <token>` header for protected routes
5. Backend verifies token on each request

## Provider Integration

### Adding a New Provider

1. Create provider-specific client in `src/workers/providers/`
2. Implement methods to fetch usage data from provider API
3. Update provider sync logic in `src/routes/providers.js`
4. Add provider to `connectProviderSchema` validation

Example structure:
```javascript
// src/workers/providers/openai.js
export async function fetchUsage(apiKey) {
  // Implement provider-specific API calls
  // Return { tokens, cost, models: [...] }
}
```

### Current Provider Status
- ✓ OpenAI (API ready, not implemented)
- ✓ Anthropic (API ready, not implemented)
- ◯ Azure OpenAI (needs implementation)
- ◯ GitHub Copilot (needs implementation)
- ◯ AWS Bedrock (needs implementation)
- ◯ Google Vertex (needs implementation)

## Encryption

API keys are encrypted before storage using `crypto` module with AES-256-CBC. The encryption key should be a strong 32-character string stored in `.env`.

## Rate Limiting

Not yet implemented. Recommended to add Redis-based rate limiting for production.

## Error Handling

All endpoints follow consistent error response format:
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email"
    }
  ]
}
```

## Testing

```bash
# Run tests (currently no tests - add Jest)
npm test
```

## Deployment

### Vercel/Railway/Render

1. Set environment variables in platform dashboard
2. Deploy Node.js app
3. Update `FRONTEND_URL` and `VITE_API_URL` in frontend config

### Self-hosted (Ubuntu)

```bash
# Install Node
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo and install
git clone ...
cd api && npm install

# Create .env file with production values

# Run with PM2
npm install -g pm2
pm2 start src/index.js --name aimonitor-api
pm2 save
pm2 startup
```

## Troubleshooting

### JWT Verification Fails
- Check `JWT_SECRET` matches between backend and frontend
- Ensure token is valid (not expired)
- Verify `Authorization` header format: `Bearer <token>`

### Supabase Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Check network connectivity
- Ensure RLS policies allow operations

### Provider Sync Not Working
- Verify provider API key is correct and has required permissions
- Check `last_error` in `provider_connections` table
- Monitor server logs for detailed error messages

## Contributing

1. Create feature branch
2. Add tests for new endpoints
3. Submit pull request

## License

MIT
