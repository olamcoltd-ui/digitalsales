// Paystack integration utilities
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_df2747b0e6aa58d4720e834d25ac19ca779b7804';
export const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY || 'sk_live_80b21';

export interface PaystackConfig {
  email: string;
  amount: number; // in kobo (multiply by 100)
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

export const initializePaystackPayment = (config: PaystackConfig) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.PaystackPop) {
      reject(new Error('Paystack not loaded'));
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: config.email,
      amount: config.amount,
      currency: config.currency || 'NGN',
      ref: config.reference || `ref_${Date.now()}`,
      metadata: config.metadata || {},
      channels: config.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      callback: function(response: any) {
        resolve(response);
      },
      onClose: function() {
        reject(new Error('Payment cancelled'));
      }
    });

    handler.openIframe();
  });
};

export const generatePaymentReference = (prefix: string = 'olamco') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatAmountToKobo = (amount: number): number => {
  return Math.round(amount * 100);
};

export const formatAmountFromKobo = (amount: number): number => {
  return amount / 100;
};

// Verify Paystack transaction
export const verifyPaystackTransaction = async (reference: string) => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw error;
  }
};

// Initialize bank transfer for withdrawals
export const initiateBankTransfer = async (transferData: {
  amount: number;
  recipient: string;
  reason?: string;
  reference?: string;
}) => {
  try {
    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: formatAmountToKobo(transferData.amount),
        recipient: transferData.recipient,
        reason: transferData.reason || 'Withdrawal from Olamco Digital Hub',
        reference: transferData.reference || generatePaymentReference('withdrawal')
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initiating transfer:', error);
    throw error;
  }
};

// Create transfer recipient
export const createTransferRecipient = async (recipientData: {
  type: string;
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
}) => {
  try {
    const response = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: recipientData.type,
        name: recipientData.name,
        account_number: recipientData.account_number,
        bank_code: recipientData.bank_code,
        currency: recipientData.currency || 'NGN'
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating recipient:', error);
    throw error;
  }
};

// Get list of banks
export const getBankList = async () => {
  try {
    const response = await fetch('https://api.paystack.co/bank', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching banks:', error);
    throw error;
  }
};

// Verify bank account
export const verifyBankAccount = async (accountNumber: string, bankCode: string) => {
  try {
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying account:', error);
    throw error;
  }
};

// Add Paystack script to document head
export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};

// Declare global Paystack types
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    };
  }
}