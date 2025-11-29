# 🚀 Quick Start Guide

Start the entire application (frontend + backend) with **one command**!

## ⚡ One-Command Start

### From Root Directory:

```bash
npm run dev
```

That's it! Both servers will start automatically.

### Or Use Start Scripts:

**Mac/Linux:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

## 📋 What You Need First

1. **Configure Backend** (one-time setup):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your DATABASE_URL
   ```

2. **Run Migrations** (one-time setup):
   ```bash
   cd backend
   npm run migrate
   ```

## ✅ What Happens

When you run `npm run dev`:

- ✅ Backend starts on `http://localhost:5001`
- ✅ Frontend starts on `http://localhost:3000` (or Vite's default port)
- ✅ Both servers show colored logs in the same terminal
- ✅ Hot reload enabled for both (auto-restart on file changes)

## 🛑 Stop Servers

Press `Ctrl+C` in the terminal to stop both servers.

## 📝 First Time Setup

If this is your first time:

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database connection
   ```

3. **Run migrations:**
   ```bash
   cd backend
   npm run migrate
   ```

4. **Start everything:**
   ```bash
   npm run dev
   ```

## 🎯 Access the Application

- **Frontend**: http://localhost:3000 (or check terminal for actual port)
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## 🔧 Troubleshooting

**Port already in use?**
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will automatically use the next available port

**Dependencies not installed?**
```bash
npm run install:all
```

**Database connection error?**
- Check `backend/.env` has correct `DATABASE_URL`
- Verify database is accessible from your IP

---

**That's it! Happy coding! 🎉**

