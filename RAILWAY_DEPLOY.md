# Railway Deployment Guide

## Quick Setup (5 minutes)

### 1. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. You'll get $5 free credit monthly

### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `furyroad-book` repository
4. Railway will auto-detect it's a Node.js project

### 3. Add PostgreSQL Database
1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL database automatically
4. Note the database connection details (you'll need them)

### 4. Configure Backend Service

#### Set Root Directory
1. Click on your backend service
2. Go to "Settings"
3. Set **Root Directory** to: `backend`
4. Save

#### Set Build Command
1. In Settings, find "Build Command"
2. Set to:
   ```bash
   npm install && npm run build && mkdir -p dist/db && cp src/db/schema.sql dist/db/schema.sql
   ```

#### Set Start Command
1. In Settings, find "Start Command"
2. Set to:
   ```bash
   node dist/start.js
   ```

### 5. Configure Environment Variables

Go to your backend service → "Variables" tab and add:

#### Database (from Railway PostgreSQL)
Railway automatically provides these, but verify:
- `DATABASE_URL` - Auto-provided by Railway (use this!)
- Or use individual vars:
  - `DB_HOST` - From your PostgreSQL service
  - `DB_PORT` - Usually `5432`
  - `DB_NAME` - Database name
  - `DB_USER` - Database user
  - `DB_PASSWORD` - Database password

**Note:** Railway provides `DATABASE_URL` automatically. The backend will use it if available.

#### Required Variables
```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
LOGIN_CODE_TTL_MINUTES=10
MAIN_ADMIN_EMAIL=your-email@example.com
DEFAULT_ADMIN_PASSWORD=your-secure-password
```

#### Email (Optional - for notifications)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=FuryRoad RC Club <noreply@furyroadrc.com>
```

### 6. Link Database to Backend

1. In your backend service, go to "Variables"
2. Click "Add Variable" → "Reference from Service"
3. Select your PostgreSQL service
4. Select `DATABASE_URL`
5. Save

This automatically links the database to your backend.

### 7. Deploy

Railway will automatically:
1. Build your backend
2. Run migrations (via `start.js`)
3. Start the server

Watch the "Deployments" tab for logs.

## Verify Deployment

1. Check deployment logs - you should see:
   ```
   Starting application...
   Running database migrations...
   Database migrations completed successfully!
   Starting server...
   Server running on port 5001
   ```

2. Get your backend URL:
   - Go to backend service → "Settings"
   - Copy the "Public Domain" (e.g., `furyroad-backend-production.up.railway.app`)

3. Test the API:
   ```
   https://your-backend-url.railway.app/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

## Update Frontend (Vercel)

1. Go to Vercel Dashboard → Your frontend project
2. Go to "Settings" → "Environment Variables"
3. Update `VITE_API_URL` to your Railway backend URL:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
4. Redeploy frontend

## Troubleshooting

### Build Fails
- Check build logs in Railway
- Ensure `backend/package.json` has all dependencies
- Verify TypeScript compiles: `cd backend && npm run build`

### Migrations Fail
- Check database connection in logs
- Verify `DATABASE_URL` is set correctly
- Check if `schema.sql` exists in `backend/src/db/`

### Server Won't Start
- Check start command: `node dist/start.js`
- Verify `dist/start.js` exists after build
- Check port: Railway uses `PORT` env var (defaults to provided port)

### Database Connection Issues
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is linked correctly
- Railway PostgreSQL uses SSL - backend handles this automatically

## Railway vs Render

**Advantages:**
- ✅ More reliable free tier
- ✅ Better build system
- ✅ Automatic database linking
- ✅ Simpler configuration
- ✅ Better error messages
- ✅ $5 free credit monthly

## Cost

- **Free Tier:** $5 credit/month
- **PostgreSQL:** ~$5/month (covered by free credit initially)
- **Backend Service:** ~$5/month (covered by free credit initially)
- After free credit: ~$10/month total

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

