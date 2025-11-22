# Production Deployment - Quick Start

## 🚀 Fast Track to Production

### Step 1: Backend on Render (5 minutes)

1. **Go to Render.com** → Sign up/Login
2. **New +** → **Blueprint**
3. **Connect GitHub** → Select your repository
4. **Apply** → Render creates everything automatically
5. **Add Environment Variables** in `furyroad-backend` service:

```
JWT_SECRET = [Generate: openssl rand -base64 32]
MAIN_ADMIN_EMAIL = your@email.com
ADMIN_EMAIL = your@email.com
DEFAULT_ADMIN_PASSWORD = SecurePass123!
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your@gmail.com
SMTP_PASSWORD = [Gmail App Password]
SMTP_FROM = FuryRoad RC Club <noreply@furyroadrc.com>
```

6. **Wait for deployment** (3-5 minutes)
7. **Copy backend URL**: `https://furyroad-book.onrender.com`

---

### Step 2: Frontend on Vercel (3 minutes)

1. **Go to Vercel.com** → Sign up/Login
2. **Add New** → **Project**
3. **Import** your GitHub repository
4. **Configure**:
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Add Environment Variable**:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
6. **Deploy**
7. **Copy frontend URL**: `https://your-project.vercel.app`

---

### Step 3: Update CORS (2 minutes)

1. Edit `backend/src/index.ts`
2. Add your Vercel URL to CORS origins (if not using regex)
3. Commit and push:
   ```bash
   git add backend/src/index.ts
   git commit -m "Update CORS for production"
   git push origin main
   ```
4. Render auto-deploys

---

### Step 4: Test & Login (2 minutes)

1. Visit your Vercel frontend URL
2. Login with:
   - Email: Your `MAIN_ADMIN_EMAIL`
   - Password: Your `DEFAULT_ADMIN_PASSWORD`
3. Change admin password immediately

---

## ✅ Done!

Your app is live at:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

---

## 🔑 Key URLs

Save these:
- Frontend: _______________________
- Backend: _______________________
- Health Check: _______________________/api/health

---

## 📝 Environment Variables Summary

### Render (Backend)
```
JWT_SECRET
MAIN_ADMIN_EMAIL
ADMIN_EMAIL
DEFAULT_ADMIN_PASSWORD
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
```

### Vercel (Frontend)
```
VITE_API_URL = https://your-backend.onrender.com/api
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Add Vercel URL to backend CORS |
| Can't login | Check `VITE_API_URL` in Vercel |
| Email not working | Verify SMTP credentials in Render |
| Build fails | Check logs in Render/Vercel dashboard |

---

## 📚 Full Documentation

For detailed instructions, see:
- `PRODUCTION_DEPLOYMENT.md` - Complete guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

