# Troubleshooting Internal Server Error on Login Code

## Issue: Getting Internal Server Error when requesting login code

### Possible Causes:

1. **Database table `login_codes` doesn't exist** (most likely)
   - Migrations didn't complete successfully
   - Check Fly.io logs for migration errors

2. **Email sending failure**
   - SMTP not configured or misconfigured
   - Fixed: Email now non-blocking

3. **Database connection issue**
   - DATABASE_URL not set correctly
   - Supabase database not accessible

## How to Check:

### 1. Check Fly.io Logs

Go to Fly.io Dashboard → Your App → **Logs** tab

Look for:
- Migration errors
- Database connection errors
- "relation login_codes does not exist" errors

### 2. Verify Migrations Completed

In the logs, you should see:
```
Database migrations completed successfully!
```

If you see errors like:
```
relation "login_codes" does not exist
```

Then migrations didn't complete.

### 3. Check Database Tables

If you have access to Supabase dashboard:
1. Go to Supabase Dashboard
2. Go to **Table Editor**
3. Check if `login_codes` table exists

## Solutions:

### Solution 1: Re-run Migrations

If migrations failed, you need to manually run them:

1. Go to Fly.io Dashboard → Your App
2. Go to **Machines** tab
3. Click on a machine → **Console** or **SSH**
4. Run:
   ```bash
   node dist/db/migrate.js
   ```

### Solution 2: Check Database Connection

Verify `DATABASE_URL` secret is set correctly in Fly.io:
1. Go to **Secrets** tab
2. Verify `DATABASE_URL` exists and is correct
3. Should be: `postgresql://postgres:FuryRoad2025@db.hmcazrptitxmksvklojk.supabase.co:5432/postgres`

### Solution 3: Redeploy

If migrations didn't run, redeploy:
1. Go to **Deployments** tab
2. Click **Redeploy**
3. Watch logs to ensure migrations complete

## Quick Fix:

The code has been updated to make email sending non-blocking. Redeploy and check logs for the actual error message.

