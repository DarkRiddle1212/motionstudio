# Vercel Environment Variables

Copy and paste these environment variables into your Vercel project settings:

## Required Environment Variables for Vercel Deployment

### Backend Environment Variables:
```
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=production
HARDCODED_ADMIN_EMAIL=bolaowoade8@gmail.com
HARDCODED_ADMIN_PASSWORD=Bolaowo@26
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables:
```
VITE_API_URL=https://your-project-name.vercel.app/api
```

## How to Set These in Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable one by one:
   - **Name:** `DATABASE_URL`
   - **Value:** `your_database_connection_string`
   - **Environment:** Select "Production", "Preview", and "Development"
   - Click "Save"

## Database Options:

### Option 1: Vercel Postgres (Recommended)
- In Vercel dashboard → Storage → Create Database → Postgres
- This automatically sets `DATABASE_URL`

### Option 2: Railway (Free)
- Go to railway.app → New Project → PostgreSQL
- Copy connection string for `DATABASE_URL`

### Option 3: PlanetScale (Free MySQL)
- Go to planetscale.com → Create database
- Get connection string for `DATABASE_URL`

## Email Setup (Gmail):
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for your application
3. Use your Gmail email as `EMAIL_USER`
4. Use the app password as `EMAIL_PASS`

## JWT Secret:
Generate a secure random string (at least 32 characters):
```bash
# You can use this command to generate one:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## After Deployment:
Update `VITE_API_URL` with your actual Vercel domain:
```
VITE_API_URL=https://motionstudio-darkriddle1212.vercel.app/api
```