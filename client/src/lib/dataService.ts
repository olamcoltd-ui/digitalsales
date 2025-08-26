import { apiClient } from './api';

// Type definitions
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
  products?: any;
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
  plan?: SubscriptionPlan;
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

class DataService {
  // Dashboard data
  async getDashboardData() {
    const [wallet, sales, subscription] = await Promise.all([
      this.getWallet(),
      this.getSales(),
      this.getUserSubscription()
    ]);

    return { wallet, sales, subscription };
  }

  async getWallet(): Promise<Wallet | null> {
    try {
      return await apiClient.getWallet();
    } catch (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }
  }

  async getSales(): Promise<Sale[]> {
    try {
      return await apiClient.getSales();
    } catch (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
  }

  async getProducts(filters?: { category?: string; search?: string }): Promise<Product[]> {
    try {
      return await apiClient.getProducts(filters);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      return await apiClient.getProduct(id);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return await apiClient.getSubscriptionPlans();
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }

  async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      return await apiClient.getUserSubscription();
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  async getWithdrawals(): Promise<WithdrawalRequest[]> {
    try {
      return await apiClient.getWithdrawals();
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      return [];
    }
  }

  async createWithdrawal(withdrawal: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | null> {
    try {
      return await apiClient.createWithdrawal(withdrawal);
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      return null;
    }
  }

  // Mock data for stats (to be replaced with real API calls later)
  async getReferralCount(): Promise<number> {
    // TODO: Implement real API call for referral count
    return 0;
  }

  async getActiveProductsCount(): Promise<number> {
    // TODO: Implement real API call for active products count
    const products = await this.getProducts();
    return products.length;
  }
}

export const dataService = new DataService();