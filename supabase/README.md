# Supabase Setup for Olamco Digital Hub

## Prerequisites
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Get your project URL and anon key

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Run Migrations
Copy the content of `supabase/migrations/20250826000001_initial_schema.sql` and execute it in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Paste the migration content
4. Click "Run"

### 3. Enable Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Email authentication
3. Configure your site URL for redirects

### 4. Configure Storage (Optional)
If you plan to store product files:
1. Go to Storage in your Supabase dashboard
2. Create buckets for products, thumbnails, etc.
3. Set up appropriate RLS policies

## Database Schema

The migration creates the following tables:
- `profiles` - User profiles and settings
- `products` - Digital products catalog
- `sales` - Sales transactions
- `wallets` - User wallet balances
- `withdrawal_requests` - Withdrawal requests
- `subscription_plans` - Available subscription plans
- `user_subscriptions` - User subscription records
- `referrals` - Referral tracking

## Row Level Security (RLS)
All tables have RLS enabled with appropriate policies to ensure data security.