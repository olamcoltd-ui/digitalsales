import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dataService, Wallet, WithdrawalRequest } from '../lib/dataService';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  History
} from 'lucide-react';
import toast from 'react-hot-toast';

const WalletPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      // Fetch wallet using dataService
      const walletData = await dataService.getWallet();
      if (walletData) {
        setWallet(walletData);
      }

      // Fetch withdrawal requests using dataService
      const withdrawalsData = await dataService.getWithdrawalRequests();
      if (withdrawalsData) {
        setWithdrawalRequests(withdrawalsData);
      }

    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">Manage your earnings and withdrawals</p>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{wallet?.balance?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-green-600 mt-1">Ready for withdrawal</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{wallet?.total_earned?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-purple-600 mt-1">All-time earnings</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Withdrawn</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{wallet?.total_withdrawn?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-blue-600 mt-1">Successfully withdrawn</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={!wallet?.balance || wallet.balance < 1000}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpRight className="w-5 h-5" />
                  <span>Withdraw Funds</span>
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Minimum withdrawal: ₦1,000
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Processing fee: ₦50 per withdrawal
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Bank Account</h3>
                  {profile?.bank_name ? (
                    <div className="text-sm text-gray-600">
                      <p>{profile.bank_name}</p>
                      <p>{profile.account_number}</p>
                      <p>{profile.account_name}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <p>No bank account added</p>
                      <button className="text-purple-600 hover:text-purple-700 mt-1">
                        Add bank account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Withdrawal History</h2>
                <History className="w-5 h-5 text-gray-400" />
              </div>

              {withdrawalRequests.length > 0 ? (
                <div className="space-y-4">
                  {withdrawalRequests.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(withdrawal.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            ₦{Number(withdrawal.amount).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {withdrawal.bank_name} - {withdrawal.account_number}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(withdrawal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Net: ₦{Number(withdrawal.net_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ArrowDownLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No withdrawal history</p>
                  <p className="text-sm text-gray-500">Your withdrawals will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <WithdrawalModal
            wallet={wallet}
            profile={profile}
            onClose={() => setShowWithdrawModal(false)}
            onSuccess={() => {
              setShowWithdrawModal(false);
              fetchWalletData();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Withdrawal Modal Component
interface WithdrawalModalProps {
  wallet: Wallet | null;
  profile: any;
  onClose: () => void;
  onSuccess: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ wallet, profile, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState(profile?.account_number || '');
  const [accountName, setAccountName] = useState(profile?.account_name || '');
  const [verifiedAccount, setVerifiedAccount] = useState<any>(null);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      // This would normally call your backend API that uses Paystack
      // For now, we'll use a mock list of Nigerian banks
      const mockBanks = [
        { name: 'Access Bank', code: '044' },
        { name: 'Guaranty Trust Bank', code: '058' },
        { name: 'United Bank For Africa', code: '033' },
        { name: 'Zenith Bank', code: '057' },
        { name: 'First Bank of Nigeria', code: '011' },
        { name: 'Fidelity Bank', code: '070' },
        { name: 'FCMB', code: '214' },
        { name: 'Sterling Bank', code: '232' },
        { name: 'Union Bank', code: '032' },
        { name: 'Wema Bank', code: '035' }
      ];
      setBanks(mockBanks);
      
      if (profile?.bank_name) {
        const bank = mockBanks.find(b => b.name === profile.bank_name);
        if (bank) setSelectedBank(bank.code);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const verifyAccount = async () => {
    if (!accountNumber || !selectedBank) return;

    try {
      setLoading(true);
      // This would call your backend API to verify with Paystack
      // For demo purposes, we'll simulate verification
      setTimeout(() => {
        setVerifiedAccount({
          account_name: accountName || 'John Doe',
          account_number: accountNumber
        });
        setLoading(false);
        toast.success('Account verified successfully!');
      }, 2000);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to verify account');
    }
  };

  const handleWithdraw = async () => {
    if (!user || !amount || !accountNumber || !selectedBank) {
      toast.error('Please fill all required fields');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < 1000) {
      toast.error('Minimum withdrawal amount is ₦1,000');
      return;
    }

    if (withdrawAmount > (wallet?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const processingFee = 50;
      const netAmount = withdrawAmount - processingFee;
      const selectedBankData = banks.find(b => b.code === selectedBank);

      const withdrawalData = {
        user_id: user.id,
        amount: withdrawAmount,
        processing_fee: processingFee,
        net_amount: netAmount,
        bank_name: selectedBankData?.name || '',
        bank_code: selectedBank,
        account_number: accountNumber,
        account_name: verifiedAccount?.account_name || accountName,
        status: 'pending'
      };

      const result = await dataService.createWithdrawal(withdrawalData);

      if (!result) {
        throw new Error('Failed to create withdrawal request');
      }

      toast.success('Withdrawal request submitted successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting withdrawal:', error);
      toast.error(error.message || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const processingFee = 50;
  const withdrawAmount = parseFloat(amount) || 0;
  const netAmount = withdrawAmount - processingFee;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1000"
                max={wallet?.balance || 0}
                className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available: ₦{wallet?.balance?.toLocaleString() || '0'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Bank
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select your bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter account name"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {accountNumber && selectedBank && !verifiedAccount && (
            <button
              onClick={verifyAccount}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          )}

          {verifiedAccount && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-800">Account Verified</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {verifiedAccount.account_name}
              </p>
            </div>
          )}

          {withdrawAmount > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Withdrawal Amount:</span>
                <span>₦{withdrawAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Processing Fee:</span>
                <span>-₦{processingFee}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Net Amount:</span>
                <span>₦{netAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={loading || !verifiedAccount || withdrawAmount < 1000}
              className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;