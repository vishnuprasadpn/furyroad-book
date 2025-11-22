# Production Deployment Guide

This guide covers deploying FuryRoad Books to production using **Render** (backend) and **Vercel** (frontend).

---

## Prerequisites

- GitHub repository with your code
- Render account (free tier available)
- Vercel account (free tier available)
- SMTP email service (Gmail, SendGrid, etc.)

---

## Part 1: Backend Deployment on Render

### Step 1: Push Code to GitHub

Ensure your code is pushed to the main branch:

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Create Render Account & Connect GitHub

1. Go to [render.com](https://render.com) and sign up/login
2. Connect your GitHub account
3. Authorize Render to access your repository

### Step 3: Deploy Using Blueprint (Recommended)

1. In Render dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will detect `render.yaml` and create services automatically
4. Click **"Apply"** to deploy

### Step 4: Configure Environment Variables

After deployment starts, go to your **furyroad-backend** service and add these environment variables:

**Required Variables:**

| Variable | Value | Notes |
|----------|-------|-------|
| `JWT_SECRET` | `your_strong_random_secret` | Generate with: `openssl rand -base64 32` |
| `MAIN_ADMIN_EMAIL` | `admin@yourdomain.com` | Main admin email address |
| `ADMIN_EMAIL` | `admin@yourdomain.com` | Admin notification email |
| `DEFAULT_ADMIN_PASSWORD` | `secure_password_123` | Initial admin password (change after first login) |
| `SMTP_HOST` | `smtp.gmail.com` | Your SMTP server |
| `SMTP_PORT` | `587` | SMTP port (usually 587) |
| `SMTP_USER` | `your_email@gmail.com` | SMTP username |
| `SMTP_PASSWORD` | `your_app_password` | SMTP password (use App Password for Gmail) |
| `SMTP_FROM` | `FuryRoad RC Club <noreply@yourdomain.com>` | Email sender name |

**Note:** Database variables (`DB_HOST`, `DB_PORT`, etc.) are automatically set from the linked database.

### Step 5: Wait for Deployment

1. Render will:
   - Create PostgreSQL database (`furyroad-db`)
   - Build backend
   - Run migrations
   - Start the service

2. Check deployment logs for any errors

3. Your backend URL will be: `https://furyroad-book.onrender.com` (or your custom domain)

### Step 6: Verify Backend

Visit: `https://your-backend-url.onrender.com/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

Or use `npx vercel` without installation.

### Step 2: Login to Vercel

```bash
npx vercel login
```

Follow the browser authentication.

### Step 3: Deploy Frontend

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

**Option B: Using CLI**

```bash
cd frontend
npx vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? `furyroad-frontend` (or your choice)
- Directory? `./`
- Override settings? **No**

### Step 4: Configure Environment Variables

In Vercel dashboard, go to your project → **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com/api` | Production, Preview, Development |

**Important:** Replace `your-backend-url.onrender.com` with your actual Render backend URL.

### Step 5: Update Backend CORS

Update `backend/src/index.ts` to include your Vercel frontend URL:

```typescript
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',  // Add your Vercel URL
    /\.vercel\.app$/,  // Allows all Vercel preview URLs
    'http://localhost:3000'  // For local development
  ],
  credentials: true
}));
```

Then commit and push:
```bash
git add backend/src/index.ts
git commit -m "Update CORS for production frontend"
git push origin main
```

Render will auto-deploy the backend update.

### Step 6: Redeploy Frontend

After updating environment variables, trigger a new deployment:
- Go to Vercel dashboard → Your project → **Deployments**
- Click **"Redeploy"** on the latest deployment

---

## Part 3: Post-Deployment Setup

### Step 1: Update Admin Password

1. Login to your frontend: `https://your-frontend.vercel.app/login`
2. Use credentials:
   - Email: Your `MAIN_ADMIN_EMAIL`
   - Password: Your `DEFAULT_ADMIN_PASSWORD`
3. Go to **Users** section
4. Change the main admin password

### Step 2: Test Email Notifications

1. Request a login code to verify email is working
2. Create a test sale to verify sale notifications
3. Check email inbox for notifications

### Step 3: Set Up Custom Domain (Optional)

**Vercel:**
1. Go to project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

**Render:**
1. Go to service → **Settings** → **Custom Domain**
2. Add your custom domain
3. Update DNS records

**Update CORS:**
After setting up custom domains, update CORS in `backend/src/index.ts` to include your custom domain.

---

## Part 4: Environment Variables Checklist

### Render (Backend) - Required

- [ ] `NODE_ENV` = `production` (auto-set by Render)
- [ ] `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (auto-set from database)
- [ ] `JWT_SECRET` = Strong random string
- [ ] `MAIN_ADMIN_EMAIL` = Your admin email
- [ ] `ADMIN_EMAIL` = Your admin email
- [ ] `DEFAULT_ADMIN_PASSWORD` = Secure password
- [ ] `SMTP_HOST` = Your SMTP server
- [ ] `SMTP_PORT` = `587` (or your SMTP port)
- [ ] `SMTP_USER` = Your SMTP username
- [ ] `SMTP_PASSWORD` = Your SMTP password
- [ ] `SMTP_FROM` = Email sender name

### Vercel (Frontend) - Required

- [ ] `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

---

## Part 5: Monitoring & Maintenance

### Render

- **Logs**: View in Render dashboard → Your service → **Logs**
- **Metrics**: Monitor CPU, memory, and request metrics
- **Auto-deploy**: Enabled by default on git push to main branch

### Vercel

- **Analytics**: Available in Vercel dashboard
- **Logs**: View deployment and function logs
- **Auto-deploy**: Enabled by default on git push to main branch

### Database Backups

Render automatically backs up PostgreSQL databases. You can:
- View backups in Render dashboard → Database → **Backups**
- Restore from backups if needed

---

## Troubleshooting

### Backend Issues

**Problem: Build fails with "Cannot find type definition file for 'node'"**
- Solution: Ensure `render-build.sh` uses `NODE_ENV=development npm install`

**Problem: Database connection error**
- Solution: Verify database is created and environment variables are linked correctly

**Problem: SSL/TLS required error**
- Solution: Backend automatically enables SSL for Render databases

**Problem: CORS errors**
- Solution: Add your Vercel frontend URL to CORS origins in `backend/src/index.ts`

### Frontend Issues

**Problem: Cannot connect to backend**
- Solution: Verify `VITE_API_URL` is set correctly in Vercel environment variables
- Solution: Check backend CORS configuration includes your Vercel URL

**Problem: Build fails**
- Solution: Check Vercel build logs for specific errors
- Solution: Ensure all dependencies are in `package.json`

### Email Issues

**Problem: Login codes not being sent**
- Solution: Verify SMTP credentials in Render environment variables
- Solution: For Gmail, use App Password instead of regular password
- Solution: Check Render logs for email errors

---

## Production Checklist

Before going live:

- [ ] All environment variables are set correctly
- [ ] Backend health check returns `ok`
- [ ] Frontend can connect to backend
- [ ] Login works (both password and code methods)
- [ ] Email notifications are working
- [ ] Admin password has been changed from default
- [ ] CORS is configured for production URLs
- [ ] Database migrations have run successfully
- [ ] Custom domains are configured (if applicable)
- [ ] SSL certificates are active (automatic on Render/Vercel)

---

## Quick Reference

### Backend URL
```
https://furyroad-book.onrender.com
```

### Frontend URL
```
https://your-project.vercel.app
```

### API Health Check
```
https://your-backend-url.onrender.com/api/health
```

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Gmail App Password Setup
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use this password in `SMTP_PASSWORD`

---

## Support

For issues:
- **Render**: Check [Render Docs](https://render.com/docs)
- **Vercel**: Check [Vercel Docs](https://vercel.com/docs)
- **Application**: Check deployment logs in respective dashboards

