# Local Development Guide

This guide explains how to run the entire application locally (frontend + backend) while connecting to a remote database (like Supabase).

## 🎯 Setup Overview

- **Frontend**: Runs on `http://localhost:3000` (or Vite's default port)
- **Backend**: Runs on `http://localhost:5001`
- **Database**: Remote (Supabase or any PostgreSQL database)

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Remote PostgreSQL database** (Supabase, Railway, etc.)
4. **Database connection string** from your remote database provider

## 🚀 Quick Start

### Step 1: Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Backend

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` and add your remote database connection:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   PORT=5001
   NODE_ENV=development
   JWT_SECRET=your-secret-key-here
   ```

   **For Supabase:**
   - Go to your Supabase project → Settings → Database
   - Copy the "Connection string" (URI format)
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### Step 3: Configure Frontend

1. Copy the example environment file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `frontend/.env` to point to your local backend:
   ```env
   VITE_API_URL=http://localhost:5001
   ```

### Step 4: Run Database Migrations

```bash
cd backend
npm run migrate
```

This will:
- Create all necessary database tables
- Create indexes
- Seed default admin user (username: `admin`, password: `admin123`)

### Step 5: Start Backend Server

```bash
cd backend
npm run dev:local
```

The backend will start on `http://localhost:5001`

### Step 6: Start Frontend Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000` (or Vite's default port)

## ✅ Verify Setup

1. **Check Backend Health:**
   ```bash
   curl http://localhost:5001/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Open Frontend:**
   - Go to: `http://localhost:3000`
   - Login with:
     - Email: `vishnuprasad1990@gmail.com` (or your admin email)
     - Password: `admin123` (or your `DEFAULT_ADMIN_PASSWORD`)

## 🔧 Configuration Details

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | Backend server port | No (default: 5001) |
| `NODE_ENV` | Environment (development/production) | No |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `SMTP_HOST` | SMTP server for emails | No |
| `SMTP_PORT` | SMTP port | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASSWORD` | SMTP password | No |
| `SMTP_FROM` | Email sender address | No |
| `DEFAULT_ADMIN_PASSWORD` | Default admin password | No (default: admin123) |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | No (defaults to live backend) |

## 🎨 Development Workflow

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Vite automatically reloads on file changes
- **Backend**: `tsx watch` automatically restarts on file changes

### Making Changes

1. **Backend Changes:**
   - Edit files in `backend/src/`
   - Server automatically restarts
   - Check terminal for errors

2. **Frontend Changes:**
   - Edit files in `frontend/src/`
   - Browser automatically refreshes
   - Check browser console for errors

### Database Changes

If you modify the database schema:
1. Update `backend/src/db/schema.sql`
2. Run migrations: `cd backend && npm run migrate`

## 🐛 Troubleshooting

### Backend won't start

1. **Check database connection:**
   - Verify `DATABASE_URL` is correct
   - Test connection: `psql "your-connection-string"`
   - Check if database is accessible from your IP (Supabase allows all IPs by default)

2. **Check port availability:**
   - Make sure port 5001 is not in use
   - Change `PORT` in `.env` if needed

3. **Check logs:**
   - Look at terminal output for error messages
   - Common issues: wrong database URL, missing JWT_SECRET

### Frontend can't connect to backend

1. **Check backend is running:**
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Check CORS:**
   - Backend allows `http://localhost:3000` by default
   - If using different port, update `backend/src/index.ts`

3. **Check environment variable:**
   - Verify `frontend/.env` has `VITE_API_URL=http://localhost:5001`
   - Restart frontend dev server after changing `.env`

### Database connection errors

1. **SSL Connection:**
   - Remote databases require SSL
   - Backend automatically enables SSL for remote connections
   - If issues, check database provider's SSL requirements

2. **Connection timeout:**
   - Check firewall settings
   - Verify database allows connections from your IP
   - For Supabase: Check connection pooling settings

## 📝 Common Commands

```bash
# Backend
cd backend
npm run dev:local          # Start development server
npm run build              # Build for production
npm run migrate            # Run database migrations
npm run start              # Start production server

# Frontend
cd frontend
npm run dev                # Start development server
npm run build              # Build for production
npm run preview            # Preview production build
```

## 🔐 Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT_SECRET** in production
3. **Change default admin password** after first login
4. **Keep database credentials secure**

## 🎯 Next Steps

- [ ] Set up your remote database (Supabase recommended)
- [ ] Configure backend `.env` with database URL
- [ ] Configure frontend `.env` to point to local backend
- [ ] Run migrations
- [ ] Start both servers
- [ ] Test login and features

---

**Happy Coding! 🚀**

