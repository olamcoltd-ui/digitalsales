import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, fullName, referralCode } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password_hash: hashedPassword
      });

      // Generate referral code
      const userReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      // Create profile
      await storage.createProfile({
        user_id: user.id,
        email,
        full_name: fullName,
        referral_code: userReferralCode,
        referred_by_code: referralCode,
        is_admin: email === 'olamcoltd@gmail.com'
      });

      // Create wallet
      await storage.createWallet({
        user_id: user.id,
        balance: "0",
        total_earned: "0",
        total_withdrawn: "0"
      });

      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email } });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email } });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Profile routes
  app.get('/api/profile', authenticateToken, async (req: any, res) => {
    try {
      const profile = await storage.getProfileByUserId(req.user.userId);
      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/profile', authenticateToken, async (req: any, res) => {
    try {
      await storage.updateProfile(req.user.userId, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Products routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category, search } = req.query;
      const products = await storage.getProducts({ 
        category: category as string,
        search: search as string 
      });
      res.json(products);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Wallet routes
  app.get('/api/wallet', authenticateToken, async (req: any, res) => {
    try {
      const wallet = await storage.getWalletByUserId(req.user.userId);
      res.json(wallet);
    } catch (error) {
      console.error('Get wallet error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Sales routes
  app.get('/api/sales', authenticateToken, async (req: any, res) => {
    try {
      const sales = await storage.getSalesByUserId(req.user.userId);
      res.json(sales);
    } catch (error) {
      console.error('Get sales error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/sales', authenticateToken, async (req: any, res) => {
    try {
      const sale = await storage.createSale({
        ...req.body,
        seller_id: req.user.userId
      });
      res.json(sale);
    } catch (error) {
      console.error('Create sale error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Subscription routes
  app.get('/api/subscription-plans', async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error('Get subscription plans error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/user-subscription', authenticateToken, async (req: any, res) => {
    try {
      const subscription = await storage.getUserSubscription(req.user.userId);
      res.json(subscription);
    } catch (error) {
      console.error('Get user subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Withdrawal routes
  app.get('/api/withdrawals', authenticateToken, async (req: any, res) => {
    try {
      const withdrawals = await storage.getWithdrawalRequestsByUserId(req.user.userId);
      res.json(withdrawals);
    } catch (error) {
      console.error('Get withdrawals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/withdrawals', authenticateToken, async (req: any, res) => {
    try {
      const withdrawal = await storage.createWithdrawalRequest({
        ...req.body,
        user_id: req.user.userId
      });
      res.json(withdrawal);
    } catch (error) {
      console.error('Create withdrawal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Paystack webhook simulation (replace the Supabase functions)
  app.post('/api/paystack-webhook', async (req, res) => {
    try {
      const { event, data } = req.body;
      
      if (event === 'charge.success') {
        const metadata = data.metadata;
        
        if (metadata.type === 'product_purchase') {
          // Handle product purchase
          const commissionRate = 0.20; // Default for free plan
          const saleAmount = data.amount / 100;
          const commissionAmount = saleAmount * commissionRate;
          
          await storage.createSale({
            product_id: metadata.product_id,
            seller_id: metadata.user_id,
            buyer_email: data.customer.email,
            sale_amount: String(saleAmount),
            commission_amount: String(commissionAmount),
            admin_amount: String(saleAmount - commissionAmount),
            transaction_id: data.reference,
            status: 'completed'
          });
          
          await storage.updateWalletBalance(metadata.user_id, commissionAmount);
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
