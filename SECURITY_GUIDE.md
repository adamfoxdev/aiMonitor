# API Security Best Practices

## ⚠️ CRITICAL - Key Rotation Required

Since API keys have been exposed (shared in chat/logs), you MUST rotate these keys immediately:

### Keys that need to be rotated:
1. **SUPABASE_SERVICE_KEY** - Generate new service key in Supabase dashboard
2. **SENDGRID_API_KEY** - Revoke and create new API key
3. **JWT_SECRET** - Change to a new random value (dev only)
4. **ENCRYPTION_KEY** - Generate new 32-character key

---

## 🔐 How to Rotate Keys

### Supabase Keys
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Settings → API → Service Key → Regenerate

### SendGrid Keys
1. Go to [SendGrid Dashboard](https://sendgrid.com/)
2. Settings → API Keys
3. Delete the old key, create a new one
4. Copy the new key immediately (it won't show again)

---

## 📋 Environment File Structure

### Root Level (`.env`)
```dotenv
# Supabase - Frontend/Public Access Key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Non-sensitive, public

# API Server
VITE_API_URL=http://localhost:3001/api

# Environment
VITE_ENV=development
```

### API Level (`api/.env`)
```dotenv
# Supabase - Backend/Service Key (SENSITIVE - never expose)
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # HIGHLY SENSITIVE

# JWT (SENSITIVE)
JWT_SECRET=your-super-secret-key-change-in-production

# Email (SENSITIVE)
SENDGRID_API_KEY=SG.xxx... # HIGHLY SENSITIVE
FROM_EMAIL=noreply@yourdomain.com  # Non-sensitive

# Encryption (SENSITIVE)
ENCRYPTION_KEY=32-character-random-string # HIGHLY SENSITIVE

# Frontend URL (Non-sensitive)
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
PORT=3001
```

---

## 🛡️ Security Checklist

### Development
- ✅ `.env` files in `.gitignore`
- ✅ `.env.example` in git with safe placeholders
- ✅ Never log sensitive keys
- ✅ Use environment variables, not hardcoded secrets
- ✅ Rotate keys if exposed

### Staging/Production
- ⚠️ Use environment variable service:
  - **Vercel**: Environment Variables in project settings
  - **Railway**: Variables tab in service settings
  - **Render**: Environment section
  - **Heroku**: Config Vars
  - **AWS**: Secrets Manager
  - **Azure**: Key Vault

---

## 📦 Deployment Key Management

### For Vercel
1. Deploy → Settings → Environment Variables
2. Add secrets with proper environment separation:
   ```
   SUPABASE_SERVICE_KEY = [production-value]
   SENDGRID_API_KEY = [production-value]
   JWT_SECRET = [production-value]
   ```

### For Self-Hosted (Docker)
Use Docker secrets or environment variables:
```bash
docker run \
  -e SUPABASE_SERVICE_KEY='your-key' \
  -e SENDGRID_API_KEY='your-key' \
  -e JWT_SECRET='your-key' \
  your-image
```

---

## 🔍 Key Sensitivity Matrix

| Variable | Sensitivity | Storage | Rotation |
|----------|------------|---------|----------|
| SUPABASE_SERVICE_KEY | 🔴 CRITICAL | Secrets Manager | Monthly |
| SENDGRID_API_KEY | 🔴 CRITICAL | Secrets Manager | Quarterly |
| JWT_SECRET | 🔴 CRITICAL | Secrets Manager | Annually |
| ENCRYPTION_KEY | 🔴 CRITICAL | Secrets Manager | Annually |
| SUPABASE_URL | 🟡 LOW | Source Control | Never |
| FROM_EMAIL | 🟡 LOW | Source Control | Never |
| API_URL | 🟡 LOW | Source Control | Never |

---

## ✅ Implementation Steps

### 1. Immediate (Next 5 minutes)
```bash
# Rotate all exposed keys
# See "How to Rotate Keys" section above
```

### 2. Short-term (This hour)
```bash
# Update .env files with new keys
cp api/.env.example api/.env
# Edit with new keys
```

### 3. Medium-term (This week)
```bash
# Set up secrets management for production
# - Vercel Environment Variables
# - AWS Secrets Manager
# - Docker secrets
```

### 4. Ongoing (Every deployment)
```bash
# Never commit .env files
# Use CI/CD to inject secrets
# Rotate keys periodically
```

---

## 🚨 What NOT to Do

❌ Commit `.env` files to git
❌ Share API keys in chat, logs, or documentation
❌ Use same keys across dev/staging/production
❌ Hardcode secrets in source code
❌ Store keys in plain text in comments
❌ Use static/easy-to-guess JWT secrets

---

## 📞 If Key Compromise is Suspected

1. **Immediately rotate the key** in the service dashboard
2. **Update environment variables** in all deployment platforms
3. **Restart all services** to load new credentials
4. **Monitor the service** for unusual activity
5. **Document what happened** in your security log

---

## 🔗 Helpful Resources

- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [SendGrid API Key Management](https://sendgrid.com/docs/ui/account-and-settings/api-keys/)
- [12-Factor App - Config](https://12factor.net/config)
- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
