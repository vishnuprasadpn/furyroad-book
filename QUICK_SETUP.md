# Quick Setup Checklist

## ✅ Step-by-Step Checklist

### 1. Prerequisites
- [ ] Node.js v18+ installed (`node --version`)
- [ ] PostgreSQL installed and running
- [ ] Git installed

### 2. Database Setup
- [ ] PostgreSQL is running
- [ ] Created database: `CREATE DATABASE rc_cafe;`
- [ ] Note your PostgreSQL credentials (host, port, user, password)

### 3. Backend Setup
- [ ] Navigate to `backend` directory
- [ ] Run `npm install`
- [ ] Create `backend/.env` file with:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=rc_cafe
  DB_USER=postgres
  DB_PASSWORD=your_password
  PORT=5001
  JWT_SECRET=your_secret_key
  MAIN_ADMIN_EMAIL=your_email@example.com
  DEFAULT_ADMIN_PASSWORD=admin123
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASSWORD=your_app_password
  ```
- [ ] Run `npm run migrate` (creates tables and default admin)
- [ ] Run `npm run build`
- [ ] Run `npm run dev` (starts backend on port 5001)

### 4. Frontend Setup
- [ ] Open new terminal, navigate to `frontend` directory
- [ ] Run `npm install`
- [ ] (Optional) Create `frontend/.env` with:
  ```
  VITE_API_URL=http://localhost:5001/api
  ```
- [ ] Run `npm run dev` (starts frontend on port 3000)

### 5. Access Application
- [ ] Open browser: `http://localhost:3000`
- [ ] Login with:
  - Email: Your `MAIN_ADMIN_EMAIL` value
  - Password: Your `DEFAULT_ADMIN_PASSWORD` value

---

## 🔧 Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| Database connection error | Check PostgreSQL is running, verify `.env` credentials |
| Port 5001 in use | Change `PORT` in `.env` to another port |
| Migration fails | Ensure database exists and user has permissions |
| Frontend can't connect | Verify backend is running, check `VITE_API_URL` |
| Email not sending | Verify SMTP credentials, use App Password for Gmail |

---

## 📝 Minimum Required `.env` Variables

**Backend (`backend/.env`):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rc_cafe
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=change_this_secret
MAIN_ADMIN_EMAIL=admin@example.com
```

**Frontend (`frontend/.env` - Optional):**
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🚀 Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run migrate
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Then open: `http://localhost:3000`

