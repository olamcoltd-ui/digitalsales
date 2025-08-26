import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper functions for Paystack operations
async function handleProductPurchase(paymentData: any, metadata: any) {
  try {
    console.log('Handling product purchase for user:', metadata.user_id);

    // Get user's current subscription to calculate commission
    const subscription = await storage.getUserSubscription(metadata.user_id);
    const product = await storage.getProductById(metadata.product_id);

    if (!product) {
      console.error('Product not found:', metadata.product_id);
      return;
    }

    const commissionRate = 0.20; // Default for free plan, could be enhanced to check subscription
    const saleAmount = paymentData.amount / 100; // Convert from kobo
    const commissionAmount = saleAmount * commissionRate;
    const adminAmount = saleAmount - commissionAmount;

    console.log('Commission calculation:', {
      saleAmount,
      commissionRate,
      commissionAmount,
      adminAmount
    });

    // Record the sale
    await storage.createSale({
      product_id: metadata.product_id,
      seller_id: metadata.user_id,
      buyer_email: paymentData.customer.email,
      sale_amount: String(saleAmount),
      commission_amount: String(commissionAmount),
      admin_amount: String(adminAmount),
      status: 'completed',
      transaction_id: paymentData.reference
    });

    // Update user wallet
    await storage.updateWalletBalance(metadata.user_id, commissionAmount);

    console.log('Product purchase processed successfully');
  } catch (error) {
    console.error('Error handling product purchase:', error);
    throw error;
  }
}

async function handleSubscriptionPayment(paymentData: any, metadata: any) {
  try {
    console.log('Handling subscription payment for user:', metadata.user_id);

    // Create new subscription
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Assuming monthly for now

    await storage.createUserSubscription({
      user_id: metadata.user_id,
      plan_id: metadata.plan_id,
      status: 'active',
      start_date: new Date(),
      end_date: endDate
    });

    console.log('Subscription payment processed successfully');
  } catch (error) {
    console.error('Error handling subscription payment:', error);
    throw error;
  }
}

async function handleWithdrawalSuccess(transferData: any) {
  try {
    console.log('Handling withdrawal success:', transferData.reference);

    await storage.updateWithdrawalRequest(transferData.reference, {
      status: 'completed',
      processed_at: new Date()
    });

    console.log('Withdrawal success processed');
  } catch (error) {
    console.error('Error handling withdrawal success:', error);
    throw error;
  }
}

async function handleWithdrawalFailed(transferData: any) {
  try {
    console.log('Handling withdrawal failure:', transferData.reference);

    await storage.updateWithdrawalRequest(transferData.reference, {
      status: 'failed',
      processed_at: new Date(),
      admin_notes: 'Transfer failed - balance refunded'
    });

    console.log('Withdrawal failure processed');
  } catch (error) {
    console.error('Error handling withdrawal failure:', error);
    throw error;
  }
}

async function approveWithdrawal(withdrawal: any, notes?: string) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack secret key not configured');
  }

  // Create transfer recipient
  const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: withdrawal.account_name,
      account_number: withdrawal.account_number,
      bank_code: withdrawal.bank_code,
      currency: 'NGN'
    }),
  });

  const recipientData = await recipientResponse.json();

  if (!recipientData.status) {
    throw new Error(recipientData.message || 'Failed to create recipient');
  }

  // Generate unique reference
  const reference = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Initiate transfer
  const transferResponse = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: Math.round(Number(withdrawal.net_amount) * 100), // Convert to kobo
      recipient: recipientData.data.recipient_code,
      reason: `Withdrawal from Olamco Digital Hub`,
      reference: reference
    }),
  });

  const transferData = await transferResponse.json();

  if (!transferData.status) {
    throw new Error(transferData.message || 'Failed to initiate transfer');
  }

  // Update withdrawal request
  await storage.updateWithdrawalRequest(withdrawal.id, {
    status: 'processing',
    reference: reference,
    admin_notes: notes || 'Transfer initiated',
    processed_at: new Date()
  });
}

async function rejectWithdrawal(withdrawalId: string, notes?: string) {
  await storage.updateWithdrawalRequest(withdrawalId, {
    status: 'rejected',
    admin_notes: notes || 'Withdrawal rejected by admin',
    processed_at: new Date()
  });
}

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

  // Paystack webhook (migrated from Supabase Edge Functions)
  app.post('/api/paystack-webhook', async (req, res) => {
    try {
      const { event, data } = req.body;
      console.log('Webhook event received:', event);
      
      if (event === 'charge.success') {
        const metadata = data.metadata;
        console.log('Processing charge success:', metadata);
        
        if (metadata.type === 'product_purchase') {
          await handleProductPurchase(data, metadata);
        } else if (metadata.type === 'subscription') {
          await handleSubscriptionPayment(data, metadata);
        }
      } else if (event === 'transfer.success') {
        await handleWithdrawalSuccess(data);
      } else if (event === 'transfer.failed') {
        await handleWithdrawalFailed(data);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Bank verification (migrated from Supabase Edge Functions)
  app.post('/api/verify-bank-account', async (req, res) => {
    try {
      const { account_number, bank_code } = req.body;
      
      if (!account_number || !bank_code) {
        return res.status(400).json({ success: false, error: 'Account number and bank code are required' });
      }

      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
      if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ success: false, error: 'Paystack secret key not configured' });
      }

      const response = await fetch(
        `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseData = await response.json();

      if (!responseData.status) {
        return res.status(400).json({ success: false, error: responseData.message || 'Failed to verify account' });
      }

      res.json({
        success: true,
        data: {
          account_name: responseData.data.account_name,
          account_number: responseData.data.account_number
        }
      });
    } catch (error) {
      console.error('Bank verification error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Get banks list (migrated from Supabase Edge Functions)
  app.get('/api/banks', async (req, res) => {
    try {
      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
      if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ success: false, error: 'Paystack secret key not configured' });
      }

      const response = await fetch('https://api.paystack.co/bank', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.status) {
        return res.status(400).json({ success: false, error: data.message || 'Failed to fetch banks' });
      }

      // Filter Nigerian banks
      const nigerianBanks = data.data.filter((bank: any) => 
        bank.country === 'Nigeria' && bank.active === true
      ).map((bank: any) => ({
        name: bank.name,
        code: bank.code,
        slug: bank.slug
      }));

      res.json({
        success: true,
        data: nigerianBanks
      });
    } catch (error) {
      console.error('Get banks error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Paystack transfer (migrated from Supabase Edge Functions)
  app.post('/api/paystack-transfer', authenticateToken, async (req: any, res) => {
    try {
      const { withdrawalId, action, notes } = req.body;

      if (!withdrawalId || !action) {
        return res.status(400).json({ success: false, error: 'Missing required parameters' });
      }

      const withdrawal = await storage.getWithdrawalRequestById(withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({ success: false, error: 'Withdrawal request not found' });
      }

      // Check if user is admin
      const profile = await storage.getProfileByUserId(req.user.userId);
      if (!profile?.is_admin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      if (action === 'approve') {
        await approveWithdrawal(withdrawal, notes);
        res.json({ success: true, message: 'Transfer initiated successfully' });
      } else if (action === 'reject') {
        await rejectWithdrawal(withdrawalId, notes);
        res.json({ success: true, message: 'Withdrawal request rejected' });
      } else {
        res.status(400).json({ success: false, error: 'Invalid action' });
      }
    } catch (error) {
      console.error('Transfer function error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
