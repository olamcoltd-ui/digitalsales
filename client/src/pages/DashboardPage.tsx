import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dataService, Wallet, Sale, UserSubscription, SubscriptionPlan } from '../lib/dataService';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  Users, 
  Package, 
  Copy, 
  Share2,
  BarChart3,
  Settings,
  Plus,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription & { plan: SubscriptionPlan } | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCommissions: 0,
    referralCount: 0,
    activeProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch wallet, sales, and subscription
      const { wallet: walletData, sales: salesData, subscription: subscriptionData } = await dataService.getDashboardData();
      
      if (walletData) {
        setWallet(walletData);
      }
      
      if (salesData) {
        setSales(salesData.slice(0, 10)); // Limit to 10 recent sales
      }
      
      if (subscriptionData) {
        setSubscription(subscriptionData);
      }

      // Calculate stats
      const totalSales = salesData?.length || 0;
      const totalCommissions = salesData?.reduce((sum, sale) => sum + Number(sale.commission_amount), 0) || 0;

      // Fetch additional stats
      const [referralCount, activeProducts] = await Promise.all([
        dataService.getReferralCount(),
        dataService.getActiveProductsCount()
      ]);

      setStats({
        totalSales,
        totalCommissions,
        referralCount,
        activeProducts
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}/auth?mode=register&ref=${profile.referral_code}`;
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    }
  };

  const shareReferralLink = () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}/auth?mode=register&ref=${profile.referral_code}`;
      const text = `Join me on Olamco Digital Hub and start earning up to 50% commission selling digital products! Use my referral code: ${profile.referral_code}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Join Olamco Digital Hub',
          text: text,
          url: referralLink
        });
      } else {
        // Fallback to copying
        navigator.clipboard.writeText(`${text}\n${referralLink}`);
        toast.success('Referral message copied to clipboard!');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentCommissionRate = subscription?.plan?.commission_rate || 0.20;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your dashboard overview and recent activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{wallet?.balance?.toLocaleString() || '0'}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  ₦{wallet?.total_earned?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.referralCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Status</h2>
              {subscription ? (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-800">{subscription.plan.name}</p>
                    <p className="text-sm text-green-600">
                      {Math.round(currentCommissionRate * 100)}% commission rate
                    </p>
                    <p className="text-xs text-green-500">
                      Expires: {new Date(subscription.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-800">
                      ₦{subscription.plan.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">Free Plan</p>
                    <p className="text-sm text-gray-600">20% commission rate</p>
                  </div>
                  <Link
                    to="/subscription"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upgrade
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Sales</h2>
                <Link
                  to="/sales"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              {sales.length > 0 ? (
                <div className="space-y-4">
                  {sales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {(sale as any).products?.title || 'Product'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +₦{Number(sale.commission_amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No sales yet</p>
                  <p className="text-sm text-gray-500">Start sharing products to earn commissions</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Referral Code */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-center font-mono text-lg font-bold text-purple-600">
                    {profile?.referral_code || 'Loading...'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={copyReferralLink}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={shareReferralLink}
                    className="flex items-center justify-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Earn 15% commission on sales from your referrals
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Browse Products</p>
                    <p className="text-sm text-gray-600">Find products to share</p>
                  </div>
                </Link>

                <Link
                  to="/analytics"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Analytics</p>
                    <p className="text-sm text-gray-600">View detailed stats</p>
                  </div>
                </Link>

                <Link
                  to="/referrals"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My Referrals</p>
                    <p className="text-sm text-gray-600">Track referral earnings</p>
                  </div>
                </Link>

                <Link
                  to="/withdrawals"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Withdraw Funds</p>
                    <p className="text-sm text-gray-600">Cash out your earnings</p>
                  </div>
                </Link>

                {profile?.is_admin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border-t pt-4 mt-4"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Admin Panel</p>
                      <p className="text-sm text-gray-600">Manage platform</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;