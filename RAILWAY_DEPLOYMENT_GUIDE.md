# Railway Deployment Guide

## Current Issue
Your Railway deployment is failing because you're using SQLite locally, but Railway requires a proper database for production.

## Steps to Fix Railway Deployment

### 1. Set Up PostgreSQL Database on Railway

1. Go to your Railway dashboard
2. Click "New Project" or use your existing project
3. Add a **PostgreSQL** service to your project
4. Railway will automatically provide a `DATABASE_URL` environment variable

### 2. Configure Environment Variables in Railway

Go to your Railway project settings and add these environment variables:

```bash
# Database (Railway will provide this automatically when you add PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT (IMPORTANT: Use a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-for-production-at-least-32-characters-long
JWT_EXPIRY=7d

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@motionstudio.com

# Server
PORT=5001
NODE_ENV=production

# Frontend URL (Update with your actual Vercel URL)
FRONTEND_URL=https://motionstudio-darkriddle1212.vercel.app

# Payment (Use your live Stripe keys for production)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Admin Credentials
HARDCODED_ADMIN_EMAIL=bolaowoade8@gmail.com
HARDCODED_ADMIN_PASSWORD=Bolaowo@26
```

### 3. Update Prisma Schema for PostgreSQL

Replace your current `backend/prisma/schema.prisma` with the PostgreSQL version:

```bash
# In your backend directory
cp prisma/schema.railway.prisma prisma/schema.prisma
```

### 4. Add Migration Script

Add this to your `backend/package.json` scripts:

```json
{
  "scripts": {
    "deploy": "npx prisma migrate deploy && npm start",
    "postinstall": "npx prisma generate"
  }
}
```

### 5. Update Railway Configuration

Your `railway.json` should be:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run deploy",
    "healthcheckPath": "/api/health"
  }
}
```

### 6. Create Initial Migration

Before deploying, create a migration for PostgreSQL:

```bash
cd backend
npx prisma migrate dev --name init
```

## Quick Fix for Current Deployment

1. **Add PostgreSQL service** to your Railway project
2. **Set the environment variables** listed above in Railway dashboard
3. **Redeploy** your service

## Testing the Deployment

Once deployed, test your API:

```bash
curl https://your-railway-app.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Motion Studio Backend is running"
}
```

## Common Issues

1. **Database Connection**: Make sure PostgreSQL service is running and `DATABASE_URL` is set
2. **Environment Variables**: Double-check all required env vars are set in Railway
3. **CORS**: Make sure your frontend URL is correctly configured in the CORS settings
4. **Build Failures**: Check Railway logs for specific error messages

## Next Steps

After successful deployment:
1. Update your frontend to use the Railway API URL
2. Test all API endpoints
3. Set up proper monitoring and logging
4. Configure production-ready email service
5. Set up live Stripe webhooks