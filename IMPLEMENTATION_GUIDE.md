# Implementation Guide - Phase 1 Complete ✓

## What's Been Done

Phase 1 (Backend Infrastructure) is complete. Below is what's been implemented:

### ✓ Backend Infrastructure
- [x] Supabase PostgreSQL database schema with all tables
- [x] Express.js API server with middleware
- [x] Authentication routes (signup, login, password reset)
- [x] Teams management (CRUD, member invitations, roles)
- [x] Provider connections (API key storage, management)
- [x] Spending data tracking (query, import, summary)
- [x] User profile & alert settings
- [x] Row Level Security (RLS) policies for data isolation

### ✓ Frontend Setup
- [x] API client service layer (`src/services/api.js`)
- [x] Auth context for state management (`src/contexts/AuthContext.jsx`)
- [x] All API endpoints defined and ready to use
- [x] Environment variables configured

### ✓ Documentation
- [x] Backend README with setup instructions
- [x] Updated main README
- [x] API documentation
- [x] Database schema documented

## Next Steps - Phases 2-4

### Phase 2: Connect Frontend to API (Coming Next)

1. **Update Login Page**
   - Replace mock validation with `authAPI.login()`
   - Add OAuth buttons (Google/GitHub)
   - Store JWT token in localStorage
   - Redirect on success

2. **Update Signup Page**
   - Wire form to `authAPI.signup()`
   - Create default team on signup
   - Auto-login after signup

3. **Add Auth Protection**
   - Wrap app routes with `<AuthProvider>`
   - Redirect unauthenticated users to login
   - Load user's teams on app startup

4. **Update Navigation**
   - Show user email/profile in header
   - Add logout button

### Phase 3: Wire Dashboard to Real Data

1. **Dashboard Spending Data**
   - Replace mock providers with `spendingAPI.getSummary()`
   - Replace mock charts with real data
   - Add real-time subscriptions

2. **Team Management**
   - Display actual team members from API
   - Wire invite form to `teamsAPI.inviteMember()`
   - Show pending invitations

3. **Provider Management**
   - Show connected providers from `providersAPI.list()`
   - Add "Connect Provider" button
   - Add manual sync trigger

### Phase 4: Settings & Advanced Features

1. **Settings Page**
   - Profile: `userAPI.updateProfile()`
   - Alerts: `userAPI.updateAlerts()`
   - Billing stub (for future Stripe integration)

2. **Onboarding Flow**
   - Track steps in backend
   - Save progress
   - Auto-complete on team setup

3. **Provider Integrations**
   - OpenAI API sync (fetch real usage)
   - Anthropic API sync
   - Manual CSV import via `spendingAPI.import()`

## Current Architecture

```
aiMonitor Frontend              aiMonitor Backend
─────────────────────────────  ──────────────────────────
React App (5173)               Express API (3001)
  ├─ Auth Pages       ────────→  Auth Routes
  ├─ Dashboard        ────────→  Spending Routes  ─→ Supabase
  ├─ Settings         ────────→  Teams Routes    ─→ Supabase
  ├─ Team Mgmt        ────────→  User Routes     ─→ Supabase
  └─ Services         ────→ Supabase Auth        
     └─ api.js
```

## Development Workflow

### Run Everything Locally

**Terminal 1 - Frontend:**
```bash
npm run dev
# Opens http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd api
npm run dev
# Runs on http://localhost:3001
```

**Terminal 3 - Database:**
Use Supabase dashboard at https://app.supabase.com

### Test Authentication Flow

1. Visit http://localhost:5173/login (not yet connected)
2. Test backend directly:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

3. Response should include JWT token:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "test@example.com" }
}
```

## Common Tasks

### Add a New API Endpoint

1. Add route to `api/src/routes/[resource].js`
2. Add validation schema (Joi)
3. Add RLS policy to `supabase/migrations/001_init_schema.sql`
4. Export function in `src/services/api.js`
5. Update component to use new endpoint

### Connect Component to API

```javascript
import { useState, useEffect } from 'react';
import { spendingAPI } from '../services/api';

function Dashboard() {
  const [spending, setSpending] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const { summary } = await spendingAPI.getSummary(teamId);
        setSpending(summary);
      } catch (error) {
        console.error('Failed to load spending:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [teamId]);
  
  if (loading) return <div>Loading...</div>;
  return <div>${spending.totalSpend}</div>;
}
```

### Debug API Issues

```javascript
// In browser console
const token = localStorage.getItem('authToken');
console.log('Token:', token);

// Test API call
fetch('http://localhost:3001/api/user', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log(d))
```

## Important Notes

1. **JWT Secret**: Backend uses `JWT_SECRET` from .env. Keep it the same between backend and frontend if using separate tokens.

2. **CORS**: Backend CORS is set to `FRONTEND_URL`. Update if frontend URL changes.

3. **API Keys**: Provider API keys are encrypted before storage using AES-256-CBC. Use a strong `ENCRYPTION_KEY`.

4. **Row Level Security**: All database queries respect RLS policies. Users can only see their own data.

5. **Environment Variables**: Never commit `.env` files. Use `.env.example` as template.

## Troubleshooting

### "Invalid token" error
- Check `JWT_SECRET` matches between backend and frontend
- Ensure token isn't expired (7 days)
- Clear localStorage and re-login

### "Access denied to this team" error
- Verify user is member of team via `team_members` table
- Check RLS policies in Supabase dashboard

### CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches where frontend is running
- Check browser console for exact CORS error message

### Supabase connection fails
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Check Supabase project is active and not paused
- Try accessing Supabase dashboard directly

## File Structure Reference

```
api/
├── src/
│   ├── index.js                    # Express app setup
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification
│   │   └── errorHandler.js         # Error responses
│   ├── routes/
│   │   ├── auth.js                 # Auth endpoints
│   │   ├── teams.js                # Teams endpoints
│   │   ├── providers.js            # Providers endpoints
│   │   ├── spending.js             # Spending endpoints
│   │   └── user.js                 # User endpoints
│   ├── workers/                    # Background jobs (future)
│   └── utils/                      # Helpers (future)
├── package.json
├── .env.example
└── README.md

frontend (src/)
├── App.jsx
├── main.jsx
├── services/
│   └── api.js                      # API client
├── contexts/
│   └── AuthContext.jsx             # Auth state
└── designmockups/                  # Page components
    ├── landing-page.jsx
    ├── login-page.jsx
    ├── dashboard.jsx
    ├── settings-billing.jsx
    ├── onboarding-tutorial.jsx
    └── forgot-password.jsx
```

## Next Session - Phase 2 Kickoff

When ready to start Phase 2, focus on:
1. Connecting login page to `authAPI.login()`
2. Adding `AuthProvider` wrapper to app
3. Protecting routes that need authentication
4. Testing full auth flow end-to-end

This will give you a working authentication system before integrating spending data.

---

**Status**: Backend complete and ready for frontend integration ✓
