# Fly.io Deployment Guide

## Quick Setup (10 minutes)

### Prerequisites
- Fly.io account (free, no credit card required)
- Fly CLI installed
- GitHub repository connected

---

## Step 1: Install Fly CLI

**macOS:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Or via Homebrew:**
```bash
brew install flyctl
```

**Verify installation:**
```bash
fly version
```

---

## Step 2: Sign Up / Login

```bash
fly auth signup
# Or if you already have an account:
fly auth login
```

This will open your browser to sign up/login.

---

## Step 3: Create Fly.io App

From the project root directory:

```bash
cd /Users/vishnuprasad/Work/FuryRoad/FuryRoad-Books
fly launch --name furyroad-backend --region iad
```

**When prompted:**
- **App name:** `furyroad-backend` (or your preferred name)
- **Region:** Choose closest to you (e.g., `iad` for US East)
- **Postgres:** **Yes** (we'll create it)
- **Redis:** No
- **Deploy now:** No (we'll configure first)

---

## Step 4: Create PostgreSQL Database

```bash
fly postgres create --name furyroad-db --region iad
```

**Note the connection details** - Fly will show you the connection string.

---

## Step 5: Link Database to App

```bash
fly postgres attach furyroad-db --app furyroad-backend
```

This automatically sets `DATABASE_URL` environment variable.

---

## Step 6: Set Environment Variables

```bash
fly secrets set NODE_ENV=production
fly secrets set PORT=5001
fly secrets set JWT_SECRET=your-super-secret-jwt-key-change-this
fly secrets set JWT_EXPIRES_IN=7d
fly secrets set LOGIN_CODE_TTL_MINUTES=10
fly secrets set MAIN_ADMIN_EMAIL=your-email@example.com
fly secrets set DEFAULT_ADMIN_PASSWORD=your-secure-password
```

**Optional (for email notifications):**
```bash
fly secrets set SMTP_HOST=smtp.gmail.com
fly secrets set SMTP_PORT=587
fly secrets set SMTP_USER=your-email@gmail.com
fly secrets set SMTP_PASSWORD=your-app-password
fly secrets set SMTP_FROM="FuryRoad RC Club <noreply@furyroadrc.com>"
```

**View all secrets:**
```bash
fly secrets list
```

---

## Step 7: Configure Build

The `fly.toml` is already configured. Verify it:

```bash
cat fly.toml
```

**Key settings:**
- `app = "furyroad-backend"` (your app name)
- `internal_port = 5001`
- `auto_stop_machines = true` (saves resources)
- `auto_start_machines = true` (wakes on request)
- `min_machines_running = 0` (free tier)

---

## Step 8: Deploy

```bash
fly deploy
```

This will:
1. Build your Docker image
2. Run migrations (via `start.js`)
3. Start the server

**Watch the logs:**
```bash
fly logs
```

---

## Step 9: Get Your Backend URL

```bash
fly status
```

Your backend URL will be: `https://furyroad-backend.fly.dev`

**Or check:**
```bash
fly open
```

---

## Step 10: Update Frontend

1. Go to Vercel Dashboard
2. Your frontend project → **Settings** → **Environment Variables**
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://furyroad-backend.fly.dev
   ```
4. Redeploy frontend

---

## Step 11: Verify Deployment

**Test health endpoint:**
```bash
curl https://furyroad-backend.fly.dev/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

**Check logs:**
```bash
fly logs
```

You should see:
```
Starting application...
Running database migrations...
Database migrations completed successfully!
Starting server...
Server running on port 5001
```

---

## Keep-Alive Ping

The frontend automatically pings the backend every 4 minutes to prevent sleep during active use. This is already configured in `frontend/src/context/AuthContext.tsx`.

**How it works:**
- When user is logged in, frontend pings `/api/health` every 4 minutes
- Keeps app awake during business hours
- Only sleeps overnight (acceptable)

---

## Useful Commands

**View logs:**
```bash
fly logs
```

**SSH into app:**
```bash
fly ssh console
```

**Restart app:**
```bash
fly apps restart furyroad-backend
```

**Scale app:**
```bash
fly scale count 1
```

**View app info:**
```bash
fly status
```

**Open app in browser:**
```bash
fly open
```

---

## Troubleshooting

### Build Fails

**Check Dockerfile:**
```bash
cd backend
docker build -t test .
```

**Check logs:**
```bash
fly logs
```

### Migrations Fail

**Check database connection:**
```bash
fly secrets list | grep DATABASE_URL
```

**Run migrations manually:**
```bash
fly ssh console
node dist/db/migrate.js
```

### App Won't Start

**Check start command:**
```bash
cat fly.toml | grep CMD
```

Should be: `CMD ["node", "dist/start.js"]`

**Check logs:**
```bash
fly logs
```

### Database Connection Issues

**Verify DATABASE_URL is set:**
```bash
fly secrets list
```

**Test connection:**
```bash
fly ssh console
node -e "console.log(process.env.DATABASE_URL)"
```

---

## Free Tier Limits

- **3 shared-cpu VMs** (256MB RAM each)
- **3GB persistent volume storage**
- **160GB outbound data transfer/month**
- **Apps sleep after 5 minutes** (wake on first request)

**Keep-alive ping prevents sleep during active use!**

---

## Upgrade to Paid (Optional)

If you need always-on (no sleep):

```bash
fly scale vm shared-cpu-1x --memory 256
```

Cost: **~$1.94/month** for always-on

---

## Support

- Fly.io Docs: https://fly.io/docs
- Fly.io Discord: https://fly.io/discord
- Community: https://community.fly.io

---

## Next Steps

1. ✅ Deploy backend to Fly.io
2. ✅ Update frontend API URL
3. ✅ Test login and functionality
4. ✅ Monitor for a week
5. ✅ Upgrade to paid if needed ($1.94/month)

Your app is now deployed on Fly.io with keep-alive ping! 🚀

