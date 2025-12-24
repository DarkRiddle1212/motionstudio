# Deployment Troubleshooting Guide

## Common 404 Issues and Solutions

### 1. **Environment Variables Missing**
Make sure all required environment variables are set in Vercel:
- `DATABASE_URL`
- `JWT_SECRET`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `VITE_API_URL` (should be `https://your-domain.vercel.app/api`)

### 2. **Build Issues**
Check Vercel build logs for:
- TypeScript compilation errors
- Missing dependencies
- Build script failures

### 3. **Routing Issues**
The updated `vercel.json` should handle:
- API routes (`/api/*` → backend)
- Static assets (`/assets/*`, images, fonts)
- SPA routing (all other routes → `index.html`)

### 4. **Database Connection**
Ensure your database is accessible from Vercel's servers:
- Use connection pooling for production
- Check database URL format
- Verify database is running

## Quick Fixes to Try:

1. **Redeploy with updated vercel.json**
2. **Check environment variables in Vercel dashboard**
3. **Verify build logs in Vercel deployment**
4. **Test API endpoints directly**: `https://your-domain.vercel.app/api/health`

## Debug Steps:

1. Visit your Vercel deployment URL
2. Open browser dev tools → Network tab
3. Check which requests are failing (404, 500, etc.)
4. Look at Vercel function logs for backend errors

## If Still Having Issues:

1. Check Vercel deployment logs
2. Test locally with `npm run build && npm run preview`
3. Verify all environment variables are set correctly
4. Make sure database is accessible from external connections