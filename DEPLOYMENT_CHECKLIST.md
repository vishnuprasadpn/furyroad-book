# Production Deployment Checklist

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub main branch
- [ ] All tests pass locally
- [ ] Environment variables documented
- [ ] SMTP credentials ready (Gmail App Password or other)

---

## Backend (Render)

### Setup
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Blueprint deployed (using `render.yaml`)
- [ ] PostgreSQL database created automatically

### Environment Variables
- [ ] `JWT_SECRET` - Generated strong random string
- [ ] `MAIN_ADMIN_EMAIL` - Set to your email
- [ ] `ADMIN_EMAIL` - Set to your email
- [ ] `DEFAULT_ADMIN_PASSWORD` - Set secure password
- [ ] `SMTP_HOST` - Set (e.g., `smtp.gmail.com`)
- [ ] `SMTP_PORT` - Set (e.g., `587`)
- [ ] `SMTP_USER` - Set your email
- [ ] `SMTP_PASSWORD` - Set App Password
- [ ] `SMTP_FROM` - Set sender name

### Verification
- [ ] Backend builds successfully
- [ ] Database migrations run successfully
- [ ] Health check works: `https://your-backend.onrender.com/api/health`
- [ ] Backend URL noted: `___________________________`

---

## Frontend (Vercel)

### Setup
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project imported/created
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables
- [ ] `VITE_API_URL` - Set to `https://your-backend.onrender.com/api`

### Verification
- [ ] Frontend builds successfully
- [ ] Frontend URL noted: `___________________________`
- [ ] Frontend can access backend API

---

## Post-Deployment

### Backend CORS Update
- [ ] Updated `backend/src/index.ts` CORS with Vercel URL
- [ ] Committed and pushed CORS changes
- [ ] Backend redeployed automatically

### Testing
- [ ] Can access frontend URL
- [ ] Login page loads
- [ ] Can login with email + password
- [ ] Can login with email + code (OTP)
- [ ] Dashboard loads after login
- [ ] Email notifications work (test login code)
- [ ] Admin password changed from default

### Security
- [ ] Default admin password changed
- [ ] JWT_SECRET is strong and unique
- [ ] SMTP credentials are secure
- [ ] No sensitive data in code/commits

---

## Custom Domain (Optional)

### Vercel
- [ ] Custom domain added
- [ ] DNS records configured
- [ ] SSL certificate active

### Render
- [ ] Custom domain added
- [ ] DNS records configured
- [ ] SSL certificate active

### CORS Update
- [ ] Updated CORS with custom domain
- [ ] Redeployed backend

---

## URLs to Save

**Backend:**
```
https://___________________________onrender.com
```

**Frontend:**
```
https://___________________________vercel.app
```

**API Health:**
```
https://___________________________onrender.com/api/health
```

---

## Quick Commands

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Test Backend Health
```bash
curl https://your-backend.onrender.com/api/health
```

### View Render Logs
```bash
# In Render dashboard → Service → Logs
```

### View Vercel Logs
```bash
# In Vercel dashboard → Project → Deployments → View Logs
```

---

## Emergency Rollback

### Render
1. Go to service → **Deployments**
2. Find previous working deployment
3. Click **"Rollback"**

### Vercel
1. Go to project → **Deployments**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

---

## Notes

```
Date: ___________________
Deployed by: ___________________
Backend URL: ___________________
Frontend URL: ___________________
Issues encountered: ___________________
_______________________________________
_______________________________________
```

