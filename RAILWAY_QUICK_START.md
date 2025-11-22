# Railway Quick Start (5 Minutes)

## Step 1: Sign Up
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)

## Step 2: Deploy Backend
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your `furyroad-book` repository
3. Railway will auto-detect it

## Step 3: Configure Backend
1. Click on your service
2. Go to **Settings** tab
3. Set **Root Directory**: `backend`
4. Set **Start Command**: `node dist/start.js`
5. Save

## Step 4: Add PostgreSQL
1. In your project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway creates it automatically

## Step 5: Link Database
1. Go to your backend service → **Variables** tab
2. Click **"Add Variable"** → **"Reference from Service"**
3. Select your PostgreSQL service
4. Select **`DATABASE_URL`**
5. Save

## Step 6: Add Environment Variables
In backend service → **Variables**, add:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
LOGIN_CODE_TTL_MINUTES=10
MAIN_ADMIN_EMAIL=your-email@example.com
DEFAULT_ADMIN_PASSWORD=your-password
```

**Optional (for emails):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=FuryRoad RC Club <noreply@furyroadrc.com>
```

## Step 7: Deploy
Railway auto-deploys! Watch the **Deployments** tab.

## Step 8: Get Your URL
1. Backend service → **Settings**
2. Copy **"Public Domain"** (e.g., `furyroad-backend-production.up.railway.app`)

## Step 9: Update Frontend
1. Go to Vercel Dashboard
2. Your frontend project → **Settings** → **Environment Variables**
3. Update `VITE_API_URL` to your Railway URL:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
4. Redeploy frontend

## Done! ✅

Your backend is now live on Railway!

**Test it:**
```
https://your-backend-url.railway.app/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Troubleshooting

**Build fails?**
- Check build logs
- Ensure `backend/package.json` exists

**Migrations fail?**
- Check `DATABASE_URL` is linked
- Verify PostgreSQL service is running

**Server won't start?**
- Check Start Command: `node dist/start.js`
- Verify port is set (Railway provides PORT automatically)

