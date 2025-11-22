# Deploy Now - Quick Steps

## 🚀 Fly.io Deployment (10 minutes)

### Step 1: Install Fly CLI

**macOS:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Or via Homebrew:**
```bash
brew install flyctl
```

**Verify:**
```bash
fly version
```

---

### Step 2: Sign Up / Login

```bash
fly auth signup
```

This opens your browser to create a free account (no credit card required).

---

### Step 3: Create App & Database

From your project root:

```bash
cd /Users/vishnuprasad/Work/FuryRoad/FuryRoad-Books

# Create app (when prompted: Yes to Postgres, No to deploy now)
fly launch --name furyroad-backend --region iad

# Create PostgreSQL database
fly postgres create --name furyroad-db --region iad

# Link database to app (sets DATABASE_URL automatically)
fly postgres attach furyroad-db --app furyroad-backend
```

---

### Step 4: Set Environment Variables

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

### Step 5: Deploy

```bash
fly deploy
```

This will:
1. Build your Docker image
2. Run database migrations automatically
3. Start the server

**Watch the logs:**
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

### Step 6: Get Your Backend URL

```bash
fly status
```

Your backend URL will be: `https://furyroad-backend.fly.dev`

**Or open in browser:**
```bash
fly open
```

**Test it:**
```bash
curl https://furyroad-backend.fly.dev/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

### Step 7: Update Frontend (Vercel)

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

## ✅ Done!

Your app is now deployed:
- **Backend:** https://furyroad-backend.fly.dev
- **Frontend:** Your Vercel URL

---

## 🔧 Useful Commands

**View logs:**
```bash
fly logs
```

**Restart app:**
```bash
fly apps restart furyroad-backend
```

**SSH into app:**
```bash
fly ssh console
```

**View app info:**
```bash
fly status
```

**Update secrets:**
```bash
fly secrets set KEY=value
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check logs
fly logs

# Test Docker build locally
cd backend
docker build -t test .
```

### Migrations Fail
```bash
# Check DATABASE_URL is set
fly secrets list | grep DATABASE_URL

# Run migrations manually
fly ssh console
node dist/db/migrate.js
```

### App Won't Start
```bash
# Check logs
fly logs

# Verify start command in fly.toml
cat fly.toml | grep CMD
```

---

## 📚 More Help

- **Full Guide:** See `FLY_IO_DEPLOY.md`
- **Fly.io Docs:** https://fly.io/docs
- **Fly.io Discord:** https://fly.io/discord

---

## 🎉 Next Steps

1. ✅ Deploy backend to Fly.io
2. ✅ Update frontend API URL
3. ✅ Test login and functionality
4. ✅ Monitor for a week
5. ✅ Upgrade to paid ($1.94/month) if you need always-on

**Keep-alive ping is already configured** - your app won't sleep during active use! 🚀

