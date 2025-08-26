import { pgTable, text, serial, integer, boolean, decimal, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Users table for authentication
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  full_name: text("full_name"),
  phone: text("phone"),
  bank_name: text("bank_name"),
  account_number: text("account_number"),
  account_name: text("account_name"),
  referral_code: text("referral_code").unique(),
  referred_by: text("referred_by"),
  referred_by_code: text("referred_by_code"),
  is_admin: boolean("is_admin").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("ebooks"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  file_url: text("file_url"),
  thumbnail_url: text("thumbnail_url"),
  preview_url: text("preview_url"),
  download_count: integer("download_count").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  tags: text("tags").array(),
  file_format: text("file_format"),
  file_size_mb: decimal("file_size_mb", { precision: 10, scale: 2 }),
  image_format: text("image_format"),
  image_size: text("image_size"),
  image_resolution: text("image_resolution"),
  product_version: text("product_version"),
  licensing_info: text("licensing_info"),
  author_creator: text("author_creator"),
  brand: text("brand"),
});

// Wallets table
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  total_earned: decimal("total_earned", { precision: 10, scale: 2 }).default("0"),
  total_withdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).default("0"),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Sales table
export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  seller_id: uuid("seller_id").references(() => users.id, { onDelete: "cascade" }),
  buyer_email: text("buyer_email").notNull(),
  sale_amount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  commission_amount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  admin_amount: decimal("admin_amount", { precision: 10, scale: 2 }).notNull(),
  referral_link: text("referral_link"),
  status: text("status").default("completed"),
  created_at: timestamp("created_at").defaultNow(),
  transaction_id: text("transaction_id").unique(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration_months: integer("duration_months").notNull(),
  commission_rate: decimal("commission_rate", { precision: 3, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  plan_id: uuid("plan_id").references(() => subscriptionPlans.id, { onDelete: "cascade" }),
  status: text("status").default("active"),
  start_date: timestamp("start_date").defaultNow(),
  end_date: timestamp("end_date"),
  created_at: timestamp("created_at").defaultNow(),
});

// Withdrawal requests table
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  processing_fee: decimal("processing_fee", { precision: 10, scale: 2 }).default("50"),
  net_amount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  bank_name: text("bank_name").notNull(),
  account_number: text("account_number").notNull(),
  account_name: text("account_name").notNull(),
  bank_code: text("bank_code"),
  status: text("status").default("pending"),
  admin_notes: text("admin_notes"),
  created_at: timestamp("created_at").defaultNow(),
  processed_at: timestamp("processed_at"),
  reference: text("reference").unique(),
});

// Referral commissions table
export const referralCommissions = pgTable("referral_commissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  referrer_id: uuid("referrer_id").references(() => users.id, { onDelete: "cascade" }),
  referred_user_id: uuid("referred_user_id").references(() => users.id, { onDelete: "cascade" }),
  commission_amount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commission_rate: decimal("commission_rate", { precision: 3, scale: 2 }).default("0.15"),
  status: text("status").default("completed"),
  created_at: timestamp("created_at").defaultNow(),
});

// Referral tracking table
export const referralTracking = pgTable("referral_tracking", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  referrer_id: uuid("referrer_id").references(() => users.id, { onDelete: "cascade" }),
  referred_user_id: uuid("referred_user_id").references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password_hash: true,
});

export const insertProfileSchema = createInsertSchema(profiles);
export const insertProductSchema = createInsertSchema(products);
export const insertWalletSchema = createInsertSchema(wallets);
export const insertSaleSchema = createInsertSchema(sales);
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions);
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests);
export const insertReferralCommissionSchema = createInsertSchema(referralCommissions);
export const insertReferralTrackingSchema = createInsertSchema(referralTracking);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type ReferralCommission = typeof referralCommissions.$inferSelect;
export type ReferralTracking = typeof referralTracking.$inferSelect;
