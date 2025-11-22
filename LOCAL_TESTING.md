# Local Testing Guide

## Frontend is Running! 🚀

The frontend development server is now running on **port 3000**.

### Access the Dashboard:
Open your browser and go to:
```
http://localhost:3000
```

### Login Credentials:
- **Email**: `vishnuprasad1990@gmail.com` (or your admin email)
- **Password**: `admin123` (or your `DEFAULT_ADMIN_PASSWORD`)

## Backend Setup

### If Backend is NOT Running:

1. **Start the backend** in a new terminal:
   ```bash
   cd backend
   npm run dev
   ```

2. **Make sure your backend `.env` is configured**:
   ```env
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=your-secret-key
   PORT=5001
   ```

### If Backend is Running:

The frontend will automatically proxy API requests to `http://localhost:5001` via the Vite proxy configuration.

## Testing the New Dashboard

1. **Login** to the application
2. **Navigate to Dashboard** (should be default after login)
3. **Check the new professional design**:
   - Modern metric cards with gradients
   - Improved charts with better styling
   - Professional pending tasks section
   - Date range filter (UI ready)
   - Better loading states

## Troubleshooting

### Frontend not loading?
- Check if port 3000 is available
- Look for errors in the terminal
- Try: `npm run dev` in the frontend directory

### API errors?
- Make sure backend is running on port 5001
- Check backend logs for errors
- Verify database connection in backend `.env`

### Can't see dashboard data?
- Make sure you're logged in
- Check browser console for errors
- Verify backend `/api/dashboard/stats` endpoint is working

## Hot Reload

The frontend uses Vite's hot module replacement, so any changes you make will automatically refresh in the browser!

## Stop the Server

Press `Ctrl+C` in the terminal where the dev server is running.

