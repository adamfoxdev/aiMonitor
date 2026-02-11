# Deployment Checklist

Use this checklist to ensure your aiMonitor backend and frontend are ready for production deployment.

## Pre-Deployment Setup

### Supabase Setup
- [ ] Create Supabase project
- [ ] Run database migration SQL
- [ ] Verify all tables created
- [ ] Enable RLS on all tables
- [ ] Set up Supabase Auth (Email, Google, GitHub)
- [ ] Note down `SUPABASE_URL` and API keys
- [ ] Test Supabase connection from backend

### Backend Setup
- [ ] Create `api/.env` file from `api/.env.example`
- [ ] Fill in all required environment variables:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_KEY`
  - [ ] `JWT_SECRET` (strong 32+ char string)
  - [ ] `FRONTEND_URL`
  - [ ] `ENCRYPTION_KEY` (32-char string)
  - [ ] `PORT` (default 3001)
- [ ] Run `npm install` in `/api`
- [ ] Test local API: `npm run dev`
- [ ] Verify health check: `curl http://localhost:3001/health`
- [ ] Test auth endpoints with curl or Postman
- [ ] Check logs for any errors

### Frontend Setup
- [ ] Create `.env.local` file from `.env.example`
- [ ] Fill in all required variables:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_API_URL` (point to backend)
- [ ] Run `npm install`
- [ ] Test local dev: `npm run dev`
- [ ] Verify app loads on http://localhost:5173
- [ ] Test navigation between pages

## Local Testing

- [ ] User signup works
- [ ] User login works
- [ ] Protected pages redirect to login when not authenticated
- [ ] Team creation works
- [ ] Team member invitation works
- [ ] Provider connection flow completes
- [ ] Dashboard loads and displays data
- [ ] Settings page works
- [ ] Password reset flow works
- [ ] Logout works

## Build & Production Configuration

### Frontend Build
- [ ] Run `npm run build`
- [ ] Verify `dist/` folder created
- [ ] Check build output for errors
- [ ] Test production build locally: `npm run preview`

### Backend Production Configuration
- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Update `VITE_API_URL` in frontend to production backend URL
- [ ] Use strong `JWT_SECRET` for production
- [ ] Use strong `ENCRYPTION_KEY` for production
- [ ] Ensure `SUPABASE_SERVICE_KEY` is secure (never expose publicly)

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Frontend to Vercel:**
- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Add environment variables to Vercel
- [ ] Deploy and verify

**Backend to Railway/Render:**
- [ ] Create account on Railway or Render
- [ ] Connect GitHub repo
- [ ] Add environment variables
- [ ] Deploy and verify
- [ ] Note backend URL
- [ ] Update frontend `VITE_API_URL` to point to production backend
- [ ] Redeploy frontend

### Option 2: AWS (EC2 + RDS)

**Backend on EC2:**
- [ ] Launch Ubuntu 22.04 t3.micro instance
- [ ] Install Node.js, npm, git
- [ ] Clone repo and install dependencies
- [ ] Setup systemd service for auto-restart
- [ ] Configure security groups (allow 3001, 443)

**Frontend on S3 + CloudFront:**
- [ ] Build frontend
- [ ] Upload `dist/` to S3
- [ ] Setup CloudFront distribution
- [ ] Configure custom domain

### Option 3: Self-Hosted VPS

- [ ] Setup reverse proxy (nginx)
- [ ] Setup SSL (Let's Encrypt)
- [ ] Setup process manager (PM2)
- [ ] Setup monitoring/logging
- [ ] Backup database regularly

## Post-Deployment Verification

- [ ] Frontend loads at production URL
- [ ] Backend API responds at production URL
- [ ] Health check works: `curl https://api.example.com/health`
- [ ] CORS is configured correctly
- [ ] Can signup new user
- [ ] Can login
- [ ] Can create team
- [ ] API calls work (check network tab)
- [ ] No console errors
- [ ] SSL certificate is valid
- [ ] Database connections are stable

## Monitoring Setup

- [ ] Setup error tracking (Sentry, LogRocket)
- [ ] Setup performance monitoring (New Relic, DataDog)
- [ ] Setup uptime monitoring (Pingdom, UptimeRobot)
- [ ] Setup log aggregation (CloudWatch, ELK)
- [ ] Setup alerts for critical errors
- [ ] Monitor database performance

## Security Checklist

- [ ] API keys not exposed in logs
- [ ] HTTPS enforced everywhere
- [ ] CORS origin correctly set
- [ ] Rate limiting enabled (todo: implement)
- [ ] SQL injection prevention (Supabase handles via parameterized queries)
- [ ] XSS prevention (React handles by default)
- [ ] CSRF protection (should be added)
- [ ] Input validation on all endpoints
- [ ] Environment variables never committed to git
- [ ] `.env` files added to `.gitignore`
- [ ] Sensitive logs disabled in production

## Performance Checklist

- [ ] Frontend build size optimized
- [ ] Database queries are indexed
- [ ] Pagination implemented for large datasets
- [ ] Caching implemented where appropriate
- [ ] Images optimized
- [ ] Unnecessary dependencies removed
- [ ] Tree-shaking enabled in build
- [ ] Code splitting implemented (future)
- [ ] CDN configured for static assets (future)

## Database Backup

- [ ] Supabase automated backups enabled
- [ ] Test restore process
- [ ] Database backup plan documented
- [ ] Recovery procedure tested

## Scaling Preparation

- [ ] Identify potential bottlenecks
- [ ] Plan for horizontal scaling (future)
- [ ] Database connection pooling considered
- [ ] Caching strategy planned (Redis, CDN)
- [ ] Load testing plan documented

## Documentation

- [ ] README updated with production URL
- [ ] API documentation complete
- [ ] Deployment procedure documented
- [ ] Troubleshooting guide created
- [ ] Team trained on deployment

## Final Sign-Off

- [ ] All checks completed
- [ ] Team lead approved
- [ ] Ready for production release

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Notes**: 

