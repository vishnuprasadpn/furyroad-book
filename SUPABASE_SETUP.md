# Supabase + Fly.io Setup Guide

## Step 1: Create Supabase Account & Database

1. Go to: https://supabase.com
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub (recommended) or email
4. Create a new project:
   - **Name:** `furyroad-db` (or any name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free (no credit card required)
5. Wait 2-3 minutes for database to be created

## Step 2: Get Database Connection String

1. In your Supabase project dashboard
2. Go to **Settings** → **Database**
3. Scroll to **"Connection string"** section
4. Select **"URI"** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual database password
7. **Save this connection string** - you'll need it!

## Step 3: Test Connection (Optional)

You can test the connection locally first if you want.

## Step 4: Deploy to Fly.io with Supabase

Once you have the Supabase connection string, we'll:
1. Create Fly.io app
2. Set DATABASE_URL to your Supabase connection string
3. Deploy the backend

---

**Ready?** Let me know when you have your Supabase connection string!

