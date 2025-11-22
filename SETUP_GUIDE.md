# FuryRoad Books - Manual Setup Guide

This guide walks you through setting up and running the FuryRoad Books application locally.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/vishnuprasadpn/furyroad-book.git
cd furyroad-book
```

---

## Step 2: Set Up PostgreSQL Database

### 2.1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE rc_cafe;

# Exit psql
\q
```

### 2.2. Note Your Database Credentials

You'll need:
- **Host**: `localhost` (or your PostgreSQL host)
- **Port**: `5432` (default)
- **Database**: `rc_cafe`
- **User**: `postgres` (or your PostgreSQL username)
- **Password**: Your PostgreSQL password

---

## Step 3: Backend Setup

### 3.1. Navigate to Backend Directory

```bash
cd backend
```

### 3.2. Install Dependencies

```bash
npm install
```

### 3.3. Create `.env` File

Create a file named `.env` in the `backend` directory with the following content:

```env
# Database Configuration
# Option 1: Use DB_URL (for Render/cloud databases)
# DB_URL=postgresql://user:password@host:port/database

# Option 2: Use Individual Variables (for local development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rc_cafe
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Login Code Configuration
LOGIN_CODE_TTL_MINUTES=10

# Admin Configuration
MAIN_ADMIN_EMAIL=your_main_admin_email@example.com
ADMIN_EMAIL=your_admin_email@example.com
DEFAULT_ADMIN_PASSWORD=admin123

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=FuryRoad RC Club <noreply@furyroadrc.com>
```

**Important Notes:**
- Replace `your_postgres_password` with your actual PostgreSQL password
- Replace `your_super_secret_jwt_key_change_this_in_production` with a strong random string
- Replace email addresses with your actual email addresses
- For Gmail SMTP, you need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
- For other email providers, adjust `SMTP_HOST` and `SMTP_PORT` accordingly

### 3.4. Run Database Migrations

This will create all tables and seed initial data:

```bash
npm run migrate
```

**Expected Output:**
```
Running database migrations...
Database migrations completed successfully!
Default admin created:
Username: admin
Password: admin123
Please change the password after first login!
```

### 3.5. Build TypeScript

```bash
npm run build
```

### 3.6. Start Backend Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Expected Output:**
```
Server running on port 5001
Environment: development
```

The backend API will be available at: `http://localhost:5001`

---

## Step 4: Frontend Setup

### 4.1. Open a New Terminal

Keep the backend running, and open a new terminal window.

### 4.2. Navigate to Frontend Directory

```bash
cd frontend
```

### 4.3. Install Dependencies

```bash
npm install
```

### 4.4. Create `.env` File (Optional)

Create a file named `.env` in the `frontend` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5001/api
```

**Note:** If you don't create this file, the frontend will default to `/api` (relative URL), which works if you're using a proxy or the backend is on the same domain.

### 4.5. Start Frontend Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

The frontend will be available at: `http://localhost:3000`

---

## Step 5: Access the Application

1. Open your browser and go to: `http://localhost:3000`
2. You should see the login page
3. **Default Login Credentials:**
   - **Email**: The email you set in `MAIN_ADMIN_EMAIL` (or `vishnuprasad1990@gmail.com` if using default)
   - **Password**: The password you set in `DEFAULT_ADMIN_PASSWORD` (or `admin123` if using default)

### Login Methods

You can log in using either:
- **Email + Password**: Traditional login
- **Email + Login Code**: OTP sent to your email

---

## Step 6: Verify Everything Works

### 6.1. Check Backend Health

Visit: `http://localhost:5001/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 6.2. Test Login

1. Go to `http://localhost:3000/login`
2. Enter your admin email and password
3. You should be redirected to the dashboard

---

## Troubleshooting

### Backend Issues

**Problem: Database connection error**
- Check PostgreSQL is running: `pg_isready` or `psql -U postgres`
- Verify database credentials in `.env`
- Ensure database `rc_cafe` exists

**Problem: Port already in use**
- Change `PORT` in `.env` to a different port (e.g., `5002`)
- Or stop the process using port 5001

**Problem: Migration fails**
- Ensure PostgreSQL is running
- Check database permissions
- Verify `.env` file exists and has correct values

### Frontend Issues

**Problem: Cannot connect to backend**
- Verify backend is running on port 5001
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

**Problem: Build errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version: `node --version` (should be v18+)

### Email Issues

**Problem: Login codes not being sent**
- Verify SMTP credentials in backend `.env`
- For Gmail, ensure you're using an App Password, not your regular password
- Check backend console for email errors
- Test SMTP connection separately

---

## Environment Variables Summary

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `rc_cafe` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_password` |
| `JWT_SECRET` | Secret for JWT tokens | `random_string` |
| `MAIN_ADMIN_EMAIL` | Main admin email | `admin@example.com` |

### Backend Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `development` |
| `JWT_EXPIRES_IN` | JWT expiry | `7d` |
| `LOGIN_CODE_TTL_MINUTES` | Code expiry | `10` |
| `DEFAULT_ADMIN_PASSWORD` | Initial admin password | `admin123` |
| `SMTP_HOST` | SMTP server | - |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASSWORD` | SMTP password | - |
| `SMTP_FROM` | Email sender | `FuryRoad RC Club <noreply@furyroadrc.com>` |

### Frontend Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api` |

---

## Quick Start Commands

### Backend
```bash
cd backend
npm install
# Create .env file (see Step 3.3)
npm run migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env file (optional, see Step 4.4)
npm run dev
```

---

## Production Deployment

For production deployment on Render/Vercel, see the deployment documentation or check the `render.yaml` file for Render configuration.

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check backend and frontend console logs for errors
4. Ensure PostgreSQL is running and accessible

