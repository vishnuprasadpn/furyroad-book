# Fly.io Dashboard Setup Guide

## Step 1: Create App from Dashboard

1. Go to: https://fly.io/dashboard
2. Click **"New App"** or **"Create App"**
3. Fill in:
   - **App Name:** `furyroad-backend` (or your preferred name)
   - **Organization:** Select your personal organization
   - **Region:** Choose closest to you (e.g., `iad` for US East)
   - **Launch:** Click **"Launch App"**

---

## Step 2: Connect GitHub Repository

1. In your app dashboard, go to **"Source"** tab
2. Click **"Connect GitHub"** or **"Deploy from GitHub"**
3. Authorize Fly.io to access your GitHub
4. Select repository: `furyroad-book`
5. Select branch: `main`
6. **Root Directory:** Set to `backend`
7. Click **"Connect"** or **"Save"**

---

## Step 3: Configure Build Settings

1. Go to **"Settings"** tab
2. Scroll to **"Build & Deploy"** section

**Build Command:**
```bash
npm install && npm run build && mkdir -p dist/db && cp src/db/schema.sql dist/db/schema.sql
```

**Start Command:**
```bash
node dist/start.js
```

**OR** if using Dockerfile (recommended):
- Make sure **"Dockerfile"** is selected
- Dockerfile path: `backend/Dockerfile`

---

## Step 4: Set Environment Variables

Go to **"Secrets"** tab and add:

### Required Variables:
```
DATABASE_URL=postgresql://postgres:FuryRoad2025@db.hmcazrptitxmksvklojk.supabase.co:5432/postgres
NODE_ENV=production
PORT=5001
JWT_SECRET=furyroad-super-secret-jwt-key-2025
JWT_EXPIRES_IN=7d
LOGIN_CODE_TTL_MINUTES=10
MAIN_ADMIN_EMAIL=vishnuprasad1990@gmail.com
DEFAULT_ADMIN_PASSWORD=admin123
```

### Optional (for email notifications):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=FuryRoad RC Club <noreply@furyroadrc.com>
```

**To add secrets:**
1. Click **"Secrets"** tab
2. Click **"Add Secret"**
3. Enter key and value
4. Click **"Save"**
5. Repeat for each variable

---

## Step 5: Configure Network

1. Go to **"Settings"** tab
2. Scroll to **"Network"** section
3. Ensure:
   - **Internal Port:** `5001`
   - **HTTP Service:** Enabled
   - **HTTPS:** Enabled (automatic)

---

## Step 6: Deploy

1. Go to **"Deployments"** tab
2. Click **"Deploy"** or **"Redeploy"**
3. Watch the build logs
4. Wait for deployment to complete (2-5 minutes)

**Expected build output:**
```
Building Docker image...
Installing dependencies...
Building TypeScript...
Copying schema.sql...
Deploying...
```

---

## Step 7: Verify Deployment

1. Go to **"Monitoring"** or **"Logs"** tab
2. Check logs - you should see:
   ```
   Starting application...
   Running database migrations...
   Database migrations completed successfully!
   Starting server...
   Server running on port 5001
   ```

3. Get your app URL:
   - Go to **"Overview"** tab
   - Your URL: `https://furyroad-backend.fly.dev`

4. Test the API:
   ```bash
   curl https://furyroad-backend.fly.dev/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

---

## Step 8: Update Frontend (Vercel)

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **frontend project**
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://furyroad-backend.fly.dev
   ```
5. Go to **Deployments** tab
6. Click **"..."** on latest deployment → **Redeploy**

---

## Troubleshooting

### Build Fails
- Check **"Logs"** tab for errors
- Verify **Root Directory** is set to `backend`
- Verify **Build Command** is correct

### App Won't Start
- Check **"Logs"** tab
- Verify **Start Command**: `node dist/start.js`
- Verify **PORT** environment variable is set

### Database Connection Fails
- Verify `DATABASE_URL` secret is set correctly
- Check Supabase dashboard - database should be running
- Test connection string locally

### App Not Accessible
- Check **"Network"** settings
- Verify **Internal Port** is `5001`
- Check if machines are running (Overview tab)

---

## Quick Checklist

- [ ] App created in Fly.io dashboard
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`
- [ ] Build/Start commands configured
- [ ] All environment variables set (Secrets tab)
- [ ] Deployment successful
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Frontend API URL updated in Vercel
- [ ] Frontend redeployed

---

## Your App URLs

- **Backend:** https://furyroad-backend.fly.dev
- **Frontend:** Your Vercel URL
- **Health Check:** https://furyroad-backend.fly.dev/api/health

---

## Next Steps

1. ✅ Complete setup in Fly.io dashboard
2. ✅ Test backend API
3. ✅ Update frontend
4. ✅ Test full application
5. ✅ Monitor logs for any issues

**Keep-alive ping is already configured** - your app won't sleep during active use! 🚀

