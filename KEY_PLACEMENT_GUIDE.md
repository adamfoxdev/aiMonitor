# Key Placement Reference

## The Rule

**Public/Frontend Keys** → GitHub Secrets + Frontend
**Secret/Backend Keys** → Only on backend server (Vercel/Railway/etc environment variables)

---

## Key-by-Key Breakdown

| Key | Purpose | GitHub Secrets? | Frontend .env? | Backend .env? | GitHub Public? |
|-----|---------|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase endpoint | ✅ YES | ✅ YES | ✅ YES | ✅ OK (URL is public) |
| `VITE_SUPABASE_ANON_KEY` | Frontend DB access | ✅ YES | ✅ YES | ✅ YES | ✅ OK (limited scope) |
| `VITE_API_URL` | Backend URL | ✅ YES | ✅ YES | ✅ YES | ✅ OK (just a URL) |
| `SUPABASE_SERVICE_KEY` | Full DB access | ❌ NO | ❌ NO | ✅ ONLY | ❌ NEVER |
| `SENDGRID_API_KEY` | Email sending | ❌ NO | ❌ NO | ✅ ONLY | ❌ NEVER |
| `JWT_SECRET` | Token signing | ❌ NO | ❌ NO | ✅ ONLY | ❌ NEVER |
| `ENCRYPTION_KEY` | Data encryption | ❌ NO | ❌ NO | ✅ ONLY | ❌ NEVER |

---

## Visual Flow

```
GitHub Secrets
├── ✅ VITE_SUPABASE_URL
├── ✅ VITE_SUPABASE_ANON_KEY
└── ✅ VITE_API_URL
    ↓
    GitHub Actions
    ↓
    npm run build (uses secrets above)
    ↓
    dist/ folder (public keys embedded)
    ↓
    GitHub Pages
    ↓
    User's Browser


Backend Server (Vercel/Railway)
├── ✅ SUPABASE_URL
├── ✅ SUPABASE_SERVICE_KEY (SECRET!)
├── ✅ SENDGRID_API_KEY (SECRET!)
├── ✅ JWT_SECRET (SECRET!)
└── ✅ ENCRYPTION_KEY (SECRET!)
    ↓
    Only accessible to backend code, never sent to browser
```

---

## Common Mistakes

### ❌ DON'T DO THIS

```javascript
// Frontend code - VISIBLE IN BROWSER!
const apiKey = "SG.abc123...";  // ❌ ANYONE CAN SEE THIS
fetch('/sendEmail', { 
  headers: { 'Auth': apiKey }
});
```

### ✅ DO THIS INSTEAD

```javascript
// Frontend code - SAFE
const apiKey = "pk_live_abc123...";  // Public key, can be exposed
fetch('/api/sendEmail', { 
  body: { email, message }  // Sensitive data not sent in client
});

// Backend code - SECRET
app.post('/api/sendEmail', (req, res) => {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;  // ✅ HIDDEN
  sendgrid.send({...});
});
```

---

## Deployment Checklist

### GitHub (Frontend)
```
GitHub Secrets added:
  ✅ VITE_SUPABASE_URL
  ✅ VITE_SUPABASE_ANON_KEY
  ✅ VITE_API_URL
```

### Vercel/Railway/Render (Backend)
```
Environment Variables added:
  ✅ SUPABASE_URL
  ✅ SUPABASE_SERVICE_KEY
  ✅ SENDGRID_API_KEY
  ✅ JWT_SECRET
  ✅ ENCRYPTION_KEY
  ✅ FRONTEND_URL
```

---

## Default Values Reference

| Key | Dev Value | Production |
|-----|-----------|-----------|
| `VITE_SUPABASE_URL` | https://bsztimnp...supabase.co | Same or staging |
| `VITE_API_URL` | http://localhost:3001/api | https://your-api.vercel.app/api |
| `VITE_ENV` | development | production |
| `NODE_ENV` | development | production |
| `PORT` | 3001 | auto (5000, 8080 depending on host) |
| `JWT_SECRET` | any string | Strong random string |
| `ENCRYPTION_KEY` | any 32 chars | Strong random string |

---

## One-Minute Summary

1. **GitHub Secrets** = Frontend build environment variables (public keys)
2. **Backend Server Secrets** = Production secrets (hidden from users)
3. **Never** put backend secrets in GitHub
4. **Always** test locally before pushing to GitHub
5. **Rotation** = Change keys regularly, not in git
