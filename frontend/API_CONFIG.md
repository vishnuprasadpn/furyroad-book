# Frontend API Configuration

## Default Configuration

The frontend is now configured to connect to the **live Fly.io backend** by default:
- **Backend URL**: `https://furyroad-backend.fly.dev`

## Environment Variables

To override the backend URL, create a `.env` file in the `frontend` directory:

### For Local Development (using local backend):
```env
VITE_API_URL=http://localhost:5001
```

### For Production (using live backend):
```env
VITE_API_URL=https://furyroad-backend.fly.dev
```

### For Vercel Deployment:
Set the environment variable in Vercel Dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add: `VITE_API_URL` = `https://furyroad-backend.fly.dev`

## How It Works

The frontend automatically:
1. Checks for `VITE_API_URL` environment variable
2. If not set, defaults to `https://furyroad-backend.fly.dev`
3. Automatically appends `/api` to the URL if missing

## Testing Locally

### Option 1: Use Live Backend (Default)
Just run:
```bash
npm run dev
```
The frontend will connect to the live Fly.io backend.

### Option 2: Use Local Backend
1. Create `frontend/.env` file:
   ```env
   VITE_API_URL=http://localhost:5001
   ```
2. Make sure your local backend is running on port 5001
3. Run:
   ```bash
   npm run dev
   ```

## Current Setup

- **Default**: Live backend (`https://furyroad-backend.fly.dev`)
- **API Base URL**: `https://furyroad-backend.fly.dev/api`

