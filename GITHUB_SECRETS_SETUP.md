# GitHub Secrets Setup - Quick Reference

## Where to Add Secrets

1. Go to your GitHub repo
2. Click **Settings**
3. Click **Secrets and variables** (left sidebar)
4. Click **Actions**
5. Click **New repository secret**

---

## Add These 3 Secrets

### Secret 1: VITE_SUPABASE_URL

**Name**: `VITE_SUPABASE_URL`

**Value**: 
```
https://bsztimnphronckenibzu.supabase.co
```

---

### Secret 2: VITE_SUPABASE_ANON_KEY

**Name**: `VITE_SUPABASE_ANON_KEY`

**Value**: Go to [Supabase Dashboard](https://supabase.com/) → Settings → API → Anon public key
```
[paste your anon key here]
```

---

### Secret 3: VITE_API_URL

**Name**: `VITE_API_URL`

**Value**: Add this AFTER you deploy backend
```
http://localhost:3001/api          # For local testing

https://your-backend.vercel.app/api          # Production
```

---

## How It Works

```
GitHub Actions runs → Reads GitHub Secrets → Builds frontend
  "VITE_SUPABASE_URL" env var → embedded in app.js
  "VITE_API_URL" env var → used by axios for API calls
```

The built frontend is pure HTML/JS/CSS with these values embedded.
Then deployed to GitHub Pages.

---

## ✅ Checklist

- [ ] Added `VITE_SUPABASE_URL`
- [ ] Added `VITE_SUPABASE_ANON_KEY`
- [ ] Added `VITE_API_URL` (set to `http://localhost:3001/api` first)
- [ ] Pushed to main branch
- [ ] GitHub Actions workflow completed
- [ ] Frontend deployed to GitHub Pages
- [ ] (Later) Deploy backend to Vercel/Railway/Render
- [ ] Update `VITE_API_URL` to backend deployment URL

---

## Testing Locally First

Before pushing to GitHub:

```bash
# Create local .env file
cat > .env << EOF
VITE_SUPABASE_URL=https://bsztimnphronckenibzu.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_API_URL=http://localhost:3001/api
VITE_ENV=development
EOF

# Run locally
npm run dev
```

If it works locally, same values in GitHub Secrets will work in production.

---

## Backend Deployment (Next)

After backend is deployed to Vercel/Railway/Render:

1. Get your backend URL
2. Update GitHub Secret `VITE_API_URL` with new URL
3. Push to trigger deployment
4. Frontend will use new backend URL
