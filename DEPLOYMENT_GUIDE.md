# GitHub Pages + Backend Deployment Guide

## 🎯 Current Setup

- **Frontend**: GitHub Pages (static files only)
- **Backend API**: Needs separate deployment (Vercel, Railway, Render, etc.)
- **Database**: Supabase (shared by both)

---

## Step 1: Add GitHub Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add these 3 secrets (only PUBLIC keys):

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL = https://your-api-domain.com/api
```

⚠️ **NEVER add sensitive keys** (SERVICE_KEY, SendGrid) to GitHub - they go on backend server only.

---

## Step 2: Deploy Backend (Choose One)

### Option A: Vercel (Recommended - Free tier)

1. Go to [Vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Set **Root Directory**: `api`
5. Add Environment Variables:
   ```
   SUPABASE_URL = [your supabase url]
   SUPABASE_SERVICE_KEY = [your service key]
   SENDGRID_API_KEY = [your sendgrid key]
   JWT_SECRET = [generate random string]
   ENCRYPTION_KEY = [32-char random string]
   FRONTEND_URL = https://your-github-pages-url
   ```
6. Deploy

Then update `VITE_API_URL` in GitHub secrets to your Vercel URL:
```
VITE_API_URL = https://your-api.vercel.app/api
```

### Option B: Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Railway generates URL automatically

### Option C: Render

1. Go to [Render.com](https://render.com)
2. New → Web Service → Connect GitHub repo
3. Set build directory to `api`
4. Add environment variables
5. Deploy

---

## Step 3: Update API URL

In GitHub Settings → Secrets:

Update `VITE_API_URL` to match your backend deployment:
```
VITE_API_URL = https://your-backend-url.com/api
```

---

## Step 4: Test Deployment

Push to main branch:
```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

Check:
1. **GitHub Actions** tab → workflow runs
2. **Pages** deployment completes
3. Visit `https://username.github.io/aiMonitor`
4. Frontend should load and call your backend API

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                         │
│              (Your Frontend - Static)                   │
│  - React App                                            │
│  - VITE_SUPABASE_ANON_KEY (public, safe)              │
│  - VITE_API_URL (points to backend)                    │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS Calls
                   ↓
┌──────────────────────────────────────────────────────────┐
│            Vercel/Railway/Render                         │
│              (Your Backend API)                          │
│  - Node.js Express                                       │
│  - SUPABASE_SERVICE_KEY (secret, protected)            │
│  - SENDGRID_API_KEY (secret, protected)                │
│  - JWT_SECRET (secret, protected)                       │
└──────────────────┬───────────────────────────────────────┘
                   │ Queries
                   ↓
┌──────────────────────────────────────────────────────────┐
│              Supabase Database                           │
│  - Shared by frontend & backend                         │
│  - Accessed via SERVICE_KEY from backend only          │
└──────────────────────────────────────────────────────────┘
```

---

## File Structure for Deployment

```
aiMonitor/
├── src/                          # Frontend (GitHub Pages)
│   ├── main.jsx
│   ├── App.jsx
│   └── ...
├── dist/                         # Built frontend → GitHub Pages
├── api/                          # Backend (Vercel/Railway/etc)
│   ├── src/
│   │   └── index.js
│   ├── package.json
│   └── .env                      # Backend secrets (never in git)
├── .github/workflows/
│   └── deploy.yml                # GitHub Actions for frontend
├── .env                          # Frontend local (not in git)
├── .env.example                  # Safe template
└── vite.config.js
```

---

## GitHub Secrets Checklist

✅ Required for Frontend Build:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY  
VITE_API_URL
```

❌ Never in GitHub (backend server only):
```
SUPABASE_SERVICE_KEY
SENDGRID_API_KEY
JWT_SECRET
ENCRYPTION_KEY
```

---

## Testing Flow

```
1. Push to main → GitHub Actions triggers
2. Workflow uses GitHub Secrets to build frontend
3. Frontend built with VITE_API_URL pointing to your backend
4. App deployed to GitHub Pages
5. User opens https://username.github.io/aiMonitor
6. Frontend loads and calls https://your-backend/api/*
7. Backend queries Supabase with SERVICE_KEY (hidden)
8. Data returned to frontend
```

---

## Troubleshooting

### "Cannot find module" during build
Check that GitHub secrets are set correctly

### "API calls failing" 
Check that `VITE_API_URL` in GitHub secrets matches deployment

### "Supabase connection refused"
Check backend's `SUPABASE_SERVICE_KEY` is correct

### "SendGrid emails not sending"
Check backend's `SENDGRID_API_KEY` has proper permissions

---

## Cost Estimate

| Service | Cost |
|---------|------|
| GitHub Pages | Free |
| Vercel (API) | Free tier, $20+ for features |
| Railway | Free tier or pay-as-you-go |
| Render | Free tier, $7+/month recommended |
| Supabase | Free tier, $25+/month for more |

**Total**: ~$0-50/month for small projects

---

## Next Steps

1. ✅ Create Vercel account (or Railway/Render)
2. ✅ Deploy backend to your chosen platform
3. ✅ Add GitHub Secrets for frontend
4. ✅ Push to main and deploy frontend
5. ✅ Test the full app at GitHub Pages URL
6. ✅ Update DNS if using custom domain
