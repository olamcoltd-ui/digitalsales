-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    bank_name TEXT,
    account_number TEXT,
    account_name TEXT,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES profiles(id),
    referred_by_code TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscription_plans table
CREATE TABLE subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    duration_months INTEGER NOT NULL DEFAULT 1,
    commission_rate DECIMAL(3, 2) NOT NULL DEFAULT 0.20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    file_url TEXT,
    thumbnail_url TEXT,
    preview_url TEXT,
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    file_format TEXT,
    file_size_mb DECIMAL(10, 2),
    image_format TEXT,
    image_size TEXT,
    image_resolution TEXT,
    product_version TEXT,
    licensing_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create wallets table
CREATE TABLE wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0,
    total_earned DECIMAL(10, 2) DEFAULT 0,
    total_withdrawn DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create sales table
CREATE TABLE sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    seller_id UUID REFERENCES auth.users(id),
    buyer_email TEXT NOT NULL,
    sale_amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    admin_amount DECIMAL(10, 2) NOT NULL,
    referral_link TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create withdrawal_requests table
CREATE TABLE withdrawal_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    processing_fee DECIMAL(10, 2) NOT NULL DEFAULT 50,
    net_amount DECIMAL(10, 2) NOT NULL,
    bank_name TEXT NOT NULL,
    bank_code TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create referrals table
CREATE TABLE referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id),
    referred_id UUID REFERENCES auth.users(id),
    referral_code TEXT NOT NULL,
    commission_earned DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(referrer_id, referred_id)
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, duration_months, commission_rate) VALUES
('Free Plan', 0, 999, 0.20),
('Monthly Pro', 2000, 1, 0.30),
('6-Month Pro', 10000, 6, 0.40),
('Annual Pro', 18000, 12, 0.50);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public profiles viewable by all" ON profiles FOR SELECT USING (true);

-- Products policies (public read, admin write)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Subscription plans policies (public read)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription plans are viewable by everyone" ON subscription_plans FOR SELECT USING (true);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Wallets policies
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON wallets FOR UPDATE USING (auth.uid() = user_id);

-- Sales policies
CREATE POLICY "Users can view own sales" ON sales FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can create sales" ON sales FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Withdrawal requests policies
CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create withdrawal requests" ON withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all withdrawals" ON withdrawal_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can update withdrawals" ON withdrawal_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Create functions for automatic wallet creation
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id) VALUES (NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic wallet creation
CREATE TRIGGER create_wallet_trigger
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_for_user();

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
BEGIN
    -- Generate a unique referral code based on full_name and random string
    new_code := UPPER(LEFT(REGEXP_REPLACE(NEW.full_name, '[^a-zA-Z]', '', 'g'), 3)) || 
                LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_code) LOOP
        new_code := UPPER(LEFT(REGEXP_REPLACE(NEW.full_name, '[^a-zA-Z]', '', 'g'), 3)) || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END LOOP;
    
    NEW.referral_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral code generation
CREATE TRIGGER generate_referral_code_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    WHEN (NEW.referral_code IS NULL)
    EXECUTE FUNCTION generate_referral_code();

-- Create function to update wallet balance after sales
CREATE OR REPLACE FUNCTION update_wallet_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Update seller's wallet
    UPDATE wallets 
    SET 
        balance = balance + NEW.commission_amount,
        total_earned = total_earned + NEW.commission_amount,
        updated_at = NOW()
    WHERE user_id = NEW.seller_id;
    
    -- If there's a referrer, give them commission
    IF EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.seller_id AND referred_by IS NOT NULL) THEN
        UPDATE wallets 
        SET 
            balance = balance + (NEW.commission_amount * 0.15), -- 15% referral commission
            total_earned = total_earned + (NEW.commission_amount * 0.15),
            updated_at = NOW()
        WHERE user_id = (SELECT referred_by FROM profiles WHERE user_id = NEW.seller_id);
        
        -- Record referral commission
        INSERT INTO referrals (referrer_id, referred_id, referral_code, commission_earned)
        VALUES (
            (SELECT referred_by FROM profiles WHERE user_id = NEW.seller_id),
            NEW.seller_id,
            (SELECT referred_by_code FROM profiles WHERE user_id = NEW.seller_id),
            NEW.commission_amount * 0.15
        )
        ON CONFLICT (referrer_id, referred_id) 
        DO UPDATE SET commission_earned = referrals.commission_earned + NEW.commission_amount * 0.15;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wallet updates after sales
CREATE TRIGGER update_wallet_after_sale_trigger
    AFTER INSERT ON sales
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_wallet_after_sale();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_sales_seller_id ON sales(seller_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);