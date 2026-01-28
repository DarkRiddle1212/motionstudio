# Railway Deployment Guide

## Prerequisites

1. Railway account
2. GitHub repository connected to Railway
3. PostgreSQL database service added to your Railway project

## Step-by-Step Deployment

### 1. Create Railway Project

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` folder as the root directory

### 2. Add PostgreSQL Database

1. In your Railway project dashboard
2. Click "New Service"
3. Select "Database" → "PostgreSQL"
4. Railway will automatically create a `DATABASE_URL` environment variable

### 3. Configure Environment Variables

Copy the variables from `backend/.env.railway` and set them in Railway:

**Required Variables:**
- `DATABASE_URL` (automatically set by Railway PostgreSQL service)
- `JWT_SECRET` (generate a secure random string)
- `NODE_ENV=production`
- `FRONTEND_URL` (your Vercel frontend URL)

**Optional but Recommended:**
- Email service variables for notifications
- Stripe variables for payments
- AWS S3 variables for file storage

### 4. Deploy

1. Railway will automatically deploy when you push to your main branch
2. Check the deployment logs for any issues
3. Test the health endpoint: `https://your-railway-app.railway.app/api/health`

## Common Issues and Solutions

### Build Failures

If you see npm/package manager issues:
1. Clear Railway's build cache
2. Redeploy the service
3. Check that all dependencies are in `package.json`

### Database Connection Issues

1. Ensure PostgreSQL service is running
2. Check that `DATABASE_URL` is properly set
3. Verify Prisma schema is compatible with PostgreSQL

### Environment Variable Issues

1. Double-check all required variables are set
2. Ensure no typos in variable names
3. Use Railway's variable references like `${{Postgres.DATABASE_URL}}`

## Testing the Deployment

1. Health check: `GET /api/health`
2. Test authentication endpoints
3. Verify database connectivity
4. Check CORS configuration with your frontend

## Monitoring

- Use Railway's built-in logs and metrics
- Set up health check monitoring
- Monitor database performance and connections