// API client to replace Supabase client
const API_BASE_URL = '/api';

class ApiClient {
  private token: string | null = localStorage.getItem('auth_token');

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Network error');
    }

    return response.json();
  }

  // Auth methods
  async signUp(email: string, password: string, fullName: string, referralCode?: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, referralCode }),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async signIn(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  signOut() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Profile methods
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(updates: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Products methods
  async getProducts(filters?: { category?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  // Wallet methods
  async getWallet() {
    return this.request('/wallet');
  }

  // Sales methods
  async getSales() {
    return this.request('/sales');
  }

  async createSale(sale: any) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  // Subscription methods
  async getSubscriptionPlans() {
    return this.request('/subscription-plans');
  }

  async getUserSubscription() {
    return this.request('/user-subscription');
  }

  // Withdrawal methods
  async getWithdrawals() {
    return this.request('/withdrawals');
  }

  async createWithdrawal(withdrawal: any) {
    return this.request('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(withdrawal),
    });
  }

  // Get token for checking auth status
  getToken() {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Referral methods
  async getReferralData() {
    return this.request('/referrals');
  }
}

export const apiClient = new ApiClient();