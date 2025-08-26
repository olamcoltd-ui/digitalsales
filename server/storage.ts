import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";
import type { 
  User, 
  Profile,
  Product,
  Wallet,
  Sale,
  SubscriptionPlan,
  UserSubscription,
  WithdrawalRequest,
  ReferralCommission,
  ReferralTracking,
  InsertUser
} from "@shared/schema";

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  // User operations
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile operations
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: Partial<Profile>): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<void>;
  
  // Product operations
  getProducts(filters?: { category?: string; search?: string }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  
  // Wallet operations
  getWalletByUserId(userId: string): Promise<Wallet | undefined>;
  createWallet(wallet: Partial<Wallet>): Promise<Wallet>;
  updateWalletBalance(userId: string, amount: number): Promise<void>;
  
  // Sales operations
  createSale(sale: Partial<Sale>): Promise<Sale>;
  getSalesByUserId(userId: string): Promise<Sale[]>;
  
  // Subscription operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: Partial<UserSubscription>): Promise<UserSubscription>;
  
  // Withdrawal operations
  createWithdrawalRequest(request: Partial<WithdrawalRequest>): Promise<WithdrawalRequest>;
  getWithdrawalRequestsByUserId(userId: string): Promise<WithdrawalRequest[]>;
}

export class PostgresStorage implements IStorage {
  
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(schema.profiles).where(eq(schema.profiles.user_id, userId)).limit(1);
    return result[0];
  }

  async createProfile(profile: Partial<Profile>): Promise<Profile> {
    const result = await db.insert(schema.profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    await db.update(schema.profiles).set(updates).where(eq(schema.profiles.user_id, userId));
  }

  async getProducts(filters?: { category?: string; search?: string }): Promise<Product[]> {
    let query = db.select().from(schema.products).where(eq(schema.products.is_active, true));
    
    if (filters?.category) {
      query = query.where(eq(schema.products.category, filters.category));
    }
    
    return await query;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(schema.products)
      .where(and(eq(schema.products.id, id), eq(schema.products.is_active, true)))
      .limit(1);
    return result[0];
  }

  async getWalletByUserId(userId: string): Promise<Wallet | undefined> {
    const result = await db.select().from(schema.wallets).where(eq(schema.wallets.user_id, userId)).limit(1);
    return result[0];
  }

  async createWallet(wallet: Partial<Wallet>): Promise<Wallet> {
    const result = await db.insert(schema.wallets).values(wallet).returning();
    return result[0];
  }

  async updateWalletBalance(userId: string, amount: number): Promise<void> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) {
      // Create wallet if it doesn't exist
      await db.insert(schema.wallets).values({
        user_id: userId,
        balance: String(amount),
        total_earned: String(amount),
        total_withdrawn: "0"
      });
    } else {
      const currentBalance = Number(wallet.balance) || 0;
      const currentEarned = Number(wallet.total_earned) || 0;
      
      await db.update(schema.wallets)
        .set({ 
          balance: String(currentBalance + amount),
          total_earned: String(currentEarned + amount)
        })
        .where(eq(schema.wallets.user_id, userId));
    }
  }

  async createSale(sale: Partial<Sale>): Promise<Sale> {
    const result = await db.insert(schema.sales).values(sale).returning();
    return result[0];
  }

  async getSalesByUserId(userId: string): Promise<Sale[]> {
    return await db.select().from(schema.sales).where(eq(schema.sales.seller_id, userId));
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(schema.subscriptionPlans);
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const result = await db.select().from(schema.userSubscriptions)
      .where(and(eq(schema.userSubscriptions.user_id, userId), eq(schema.userSubscriptions.status, 'active')))
      .limit(1);
    return result[0];
  }

  async createUserSubscription(subscription: Partial<UserSubscription>): Promise<UserSubscription> {
    const result = await db.insert(schema.userSubscriptions).values(subscription).returning();
    return result[0];
  }

  async createWithdrawalRequest(request: Partial<WithdrawalRequest>): Promise<WithdrawalRequest> {
    const result = await db.insert(schema.withdrawalRequests).values(request).returning();
    return result[0];
  }

  async getWithdrawalRequestsByUserId(userId: string): Promise<WithdrawalRequest[]> {
    return await db.select().from(schema.withdrawalRequests).where(eq(schema.withdrawalRequests.user_id, userId));
  }
}

export const storage = new PostgresStorage();
