// Legacy Supabase types - keeping for compatibility
// This file is deprecated and will be removed in future versions
// Use dataService instead

// Database types
export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  referral_code?: string;
  referred_by?: string;
  referred_by_code?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  file_url?: string;
  thumbnail_url?: string;
  preview_url?: string;
  download_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
  file_format?: string;
  file_size_mb?: number;
  image_format?: string;
  image_size?: string;
  image_resolution?: string;
  product_version?: string;
  licensing_info?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_email: string;
  sale_amount: number;
  commission_amount: number;
  admin_amount: number;
  referral_link?: string;
  status: string;
  created_at: string;
  transaction_id?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  commission_rate: number;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  processing_fee: number;
  net_amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}