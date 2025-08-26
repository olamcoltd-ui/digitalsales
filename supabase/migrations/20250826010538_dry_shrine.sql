/*
  # Initial Schema Setup for Olamco Digital Hub

  1. New Tables
    - `profiles` - User profile information with referral system
    - `products` - Digital products catalog
    - `wallets` - User wallet balances and earnings
    - `sales` - Product sales tracking
    - `subscription_plans` - Available subscription tiers
    - `user_subscriptions` - User subscription status
    - `withdrawal_requests` - Withdrawal processing
    - `referral_commissions` - Referral earnings tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for sensitive operations

  3. Functions
    - Auto-assign admin role to olamcoltd@gmail.com
    - Generate unique referral codes
    - Update wallet balances
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  bank_name text,
  account_number text,
  account_name text,
  referral_code text UNIQUE,
  referred_by text,
  referred_by_code text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-assign admin role to olamcoltd@gmail.com
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS trigger AS $$
BEGIN
  IF NEW.email = 'olamcoltd@gmail.com' THEN
    NEW.is_admin = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_admin_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_admin_role();

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'ebooks',
  price decimal(10,2) NOT NULL DEFAULT 0,
  file_url text,
  thumbnail_url text,
  preview_url text,
  download_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  tags text[],
  file_format text,
  file_size_mb decimal(10,2),
  image_format text,
  image_size text,
  image_resolution text,
  product_version text,
  licensing_info text,
  author_creator text,
  brand text
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance decimal(10,2) DEFAULT 0,
  total_earned decimal(10,2) DEFAULT 0,
  total_withdrawn decimal(10,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_email text NOT NULL,
  sale_amount decimal(10,2) NOT NULL,
  commission_amount decimal(10,2) NOT NULL,
  admin_amount decimal(10,2) NOT NULL,
  referral_link text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  transaction_id text UNIQUE
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  duration_months integer NOT NULL,
  commission_rate decimal(3,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, duration_months, commission_rate) VALUES
('Free Plan', 0, 0, 0.20),
('Monthly Plan', 2500, 1, 0.30),
('6-Month Plan', 5500, 6, 0.40),
('Annual Plan', 7000, 12, 0.50)
ON CONFLICT DO NOTHING;

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  processing_fee decimal(10,2) DEFAULT 50,
  net_amount decimal(10,2) NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  bank_code text,
  status text DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  reference text UNIQUE
);

-- Referral commissions table
CREATE TABLE IF NOT EXISTS referral_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_amount decimal(10,2) NOT NULL,
  commission_rate decimal(3,2) DEFAULT 0.15,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Referral tracking table
CREATE TABLE IF NOT EXISTS referral_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Products policies
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Wallets policies
CREATE POLICY "Users can read own wallet"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
  ON wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Sales policies
CREATE POLICY "Users can read own sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "System can insert sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Subscription plans policies
CREATE POLICY "Anyone can read subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (true);

-- User subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Withdrawal requests policies
CREATE POLICY "Users can read own withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal requests"
  ON withdrawal_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage withdrawal requests"
  ON withdrawal_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Referral commissions policies
CREATE POLICY "Users can read own referral commissions"
  ON referral_commissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referral commissions"
  ON referral_commissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Referral tracking policies
CREATE POLICY "Users can read own referral tracking"
  ON referral_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referral tracking"
  ON referral_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_user_wallet(user_id uuid, amount decimal)
RETURNS void AS $$
BEGIN
  INSERT INTO wallets (user_id, balance, total_earned)
  VALUES (user_id, amount, amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = wallets.balance + amount,
    total_earned = wallets.total_earned + amount,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code = generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_referral_code_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- Trigger to create wallet on profile creation
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS trigger AS $$
BEGIN
  INSERT INTO wallets (user_id, balance, total_earned, total_withdrawn)
  VALUES (NEW.user_id, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_wallet_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();