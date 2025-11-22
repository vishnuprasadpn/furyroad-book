# Complete Fly.io Dashboard Setup Guide

## Step 1: Create New App in Dashboard

1. Go to: **https://fly.io/dashboard**
2. Click **"New App"** or **"Create App"** button
3. Fill in:
   - **App Name:** `furyroad-backend` (or your preferred name)
   - **Organization:** Select your personal organization
   - **Region:** Choose closest to you (e.g., `iad` for US East, `bom` for Mumbai)
   - **Launch:** Click **"Launch App"**

---

## Step 2: Connect GitHub Repository

1. In your app dashboard, go to **"Source"** tab
2. Click **"Connect GitHub"** or **"Deploy from GitHub"**
3. Authorize Fly.io to access your GitHub account
4. Select repository: **`furyroad-book`**
5. Select branch: **`main`**
6. **Root Directory:** Set to **`backend`** ⚠️ **IMPORTANT!**
7. Click **"Connect"** or **"Save"**

---

## Step 3: Configure Build Settings

1. Go to **"Settings"** tab
2. Scroll to **"Build & Deploy"** section

### Option A: Using Dockerfile (Recommended)
- Make sure **"Dockerfile"** is selected
- Dockerfile path: **`Dockerfile`** (since root is `backend`, it will find `backend/Dockerfile`)

### Option B: Using Build Commands
If Dockerfile doesn't work:
- **Build Command:**
  ```bash
  npm install && npm run build && mkdir -p dist/db && cp src/db/schema.sql dist/db/schema.sql
  ```
- **Start Command:**
  ```bash
  node dist/start.js
  ```

---

## Step 4: Configure Network

1. Go to **"Settings"** tab
2. Scroll to **"Network"** section
3. Ensure:
   - **Internal Port:** `5001`
   - **HTTP Service:** Enabled
   - **HTTPS:** Enabled (automatic)

---

## Step 5: Set Environment Variables (Secrets)

1. Go to **"Secrets"** tab
2. Click **"Add Secret"** for each variable below

### Required Secrets:

**Database:**
- **Key:** `DATABASE_URL`
- **Value:** `postgresql://postgres:FuryRoad2025@db.hmcazrptitxmksvklojk.supabase.co:5432/postgres`

**Server:**
- **Key:** `NODE_ENV`
- **Value:** `production`

- **Key:** `PORT`
- **Value:** `5001`

**Authentication:**
- **Key:** `JWT_SECRET`
- **Value:** `furyroad-super-secret-jwt-key-2025` (change this to something secure!)

- **Key:** `JWT_EXPIRES_IN`
- **Value:** `7d`

- **Key:** `LOGIN_CODE_TTL_MINUTES`
- **Value:** `10`

**Admin:**
- **Key:** `MAIN_ADMIN_EMAIL`
- **Value:** `vishnuprasad1990@gmail.com`

- **Key:** `DEFAULT_ADMIN_PASSWORD`
- **Value:** `admin123` (change this after first login!)

### Optional Secrets (for email notifications):

- **Key:** `SMTP_HOST`
- **Value:** `smtp.gmail.com`

- **Key:** `SMTP_PORT`
- **Value:** `587`

- **Key:** `SMTP_USER`
- **Value:** (your email)

- **Key:** `SMTP_PASSWORD`
- **Value:** (your Gmail app password)

- **Key:** `SMTP_FROM`
- **Value:** `FuryRoad RC Club <noreply@furyroadrc.com>`

**To add each secret:**
1. Click **"Add Secret"**
2. Enter **Key** and **Value**
3. Click **"Save"**
4. Repeat for each variable

---

## Step 6: Deploy

1. Go to **"Deployments"** tab
2. Click **"Deploy"** or **"Redeploy"** button
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
   Using database connection string (DATABASE_URL or DB_URL)
   Database config: { hasDbUrl: true, ... }
   Starting application...
   Running database migrations...
   Database migrations completed successfully!
   Starting server...
   Server running on port 5001
   ```

3. Get your app URL:
   - Go to **"Overview"** tab
   - Your URL: `https://furyroad-backend.fly.dev` (or your app name)

4. Test the API:
   - Open in browser: `https://furyroad-backend.fly.dev/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

---

## Step 8: Start Machines (if stopped)

1. Go to **"Machines"** or **"Overview"** tab
2. If machines are stopped, click **"Start"** on each machine
3. Wait for machines to start (30 seconds)

---

## Step 9: Update Frontend (Vercel)

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **frontend project**
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://furyroad-backend.fly.dev
   ```
   (Replace with your actual Fly.io app URL)
5. Go to **Deployments** tab
6. Click **"..."** on latest deployment → **Redeploy**

---

## Troubleshooting

### Build Fails
- Check **"Logs"** tab for errors
- Verify **Root Directory** is set to `backend`
- Verify **Dockerfile** path is correct

### App Won't Start
- Check **"Logs"** tab
- Verify **PORT** secret is set to `5001`
- Verify all required secrets are set

### Database Connection Fails
- Verify `DATABASE_URL` secret is set correctly
- Check Supabase dashboard - database should be running
- Test connection string format

### App Not Accessible
- Check **"Network"** settings
- Verify **Internal Port** is `5001`
- Check if machines are running

---

## Quick Checklist

- [ ] App created in Fly.io dashboard
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`
- [ ] Build settings configured (Dockerfile or build commands)
- [ ] Network configured (port 5001)
- [ ] All environment variables set (Secrets tab)
- [ ] Deployment successful
- [ ] Machines started
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Frontend API URL updated in Vercel
- [ ] Frontend redeployed

---

## Your App URLs

- **Backend:** `https://furyroad-backend.fly.dev` (or your app name)
- **Frontend:** Your Vercel URL
- **Health Check:** `https://furyroad-backend.fly.dev/api/health`

---

## Important Notes

1. **Root Directory:** Must be set to `backend` in Source settings
2. **Dockerfile:** Should be at `backend/Dockerfile` (automatically found)
3. **Secrets:** All secrets must be set before first deployment
4. **Database:** Supabase connection string must be correct
5. **Port:** Must be `5001` (matches internal_port in fly.toml)

---

## Next Steps After Deployment

1. ✅ Test backend API endpoints
2. ✅ Test login functionality
3. ✅ Verify database migrations ran
4. ✅ Update frontend API URL
5. ✅ Test full application flow

**Keep-alive ping is already configured** - your app won't sleep during active use! 🚀

