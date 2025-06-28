# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: feed-me-app (or any name you prefer)
   - Database Password: Create a strong password
   - Region: Choose closest to your users
6. Click "Create new project"

## 2. Set up the Database

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql` into the SQL editor
3. Click "Run" to create the feedings table

## 3. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Find your **Project URL** and **anon public** key
3. Copy these values

## 4. Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_actual_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   ```

## 5. Test the Application

1. Start your development server:
   ```bash
   npm start
   ```
2. The app should now save feeding data to Supabase
3. Data will persist across page refreshes and browser sessions

## 6. Optional: Set Up Row Level Security (RLS)

The current setup allows public access. For production, consider:

1. Enable authentication
2. Restrict RLS policies to authenticated users
3. Add user-specific data isolation

## Troubleshooting

- **Connection errors**: Check your environment variables are correct
- **Database errors**: Verify the schema was created successfully
- **CORS issues**: Ensure your domain is added to Supabase allowed origins (for production)

## Files Created/Modified

- `src/supabaseClient.js` - Supabase client configuration
- `src/feedingService.js` - Database operations
- `src/FeedMeApp.js` - Updated to use Supabase
- `.env.local` - Environment variables
- `supabase-schema.sql` - Database schema