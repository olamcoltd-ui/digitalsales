import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { Copy, Users, DollarSign, Eye, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReferralData {
  totalReferrals: number;
  totalEarnings: number;
  pendingCommissions: number;
  completedCommissions: number;
  referralCode: string;
  referralLink: string;
  recentReferrals: Array<{
    id: string;
    referred_user_email: string;
    commission_amount: number;
    status: string;
    created_at: string;
  }>;
}

const ReferralsPage: React.FC = () => {
  const { profile } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const data = await apiClient.getReferralData();
      setReferralData(data as ReferralData);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Set default data if API fails
      setReferralData({
        totalReferrals: 0,
        totalEarnings: 0,
        pendingCommissions: 0,
        completedCommissions: 0,
        referralCode: profile?.referral_code || '30309CB3',
        referralLink: `${window.location.origin}/?ref=${profile?.referral_code || '30309CB3'}`,
        recentReferrals: []
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      toast.success('Referral code copied to clipboard!');
    }
  };

  const copyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      toast.success('Referral link copied to clipboard!');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Referrals</h1>
          <p className="text-gray-600 mt-2">Track your referral earnings and performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Referrals</h3>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{referralData?.totalReferrals || 0}</div>
            <p className="text-xs text-gray-500">Active referrals</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">₦{referralData?.totalEarnings?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">All-time earnings</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">₦{referralData?.pendingCommissions?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">Pending commissions</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <Eye className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">₦{referralData?.completedCommissions?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">Completed commissions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referral Code Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Referral Code</h2>
              <p className="text-sm text-gray-600">Share this code to earn 15% commission on referral sales</p>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-700">
                    {referralData?.referralCode || '30309CB3'}
                  </span>
                  <button 
                    className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center"
                    onClick={copyReferralCode}
                    data-testid="button-copy-code"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Link</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralData?.referralLink || ''}
                    readOnly
                    className="flex-1 p-2 border rounded-md bg-gray-50 text-sm"
                    data-testid="input-referral-link"
                  />
                  <button 
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    onClick={copyReferralLink}
                    data-testid="button-copy-link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Share your referral code or link</li>
                  <li>• Earn 15% commission on sales</li>
                  <li>• Earn 25% commission on subscriptions</li>
                  <li>• Get paid when they make purchases</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Referrals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Referrals</h2>
              <p className="text-sm text-gray-600">Your latest referral activity</p>
            </div>
            {referralData?.recentReferrals && referralData.recentReferrals.length > 0 ? (
              <div className="space-y-4">
                {referralData.recentReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{referral.referred_user_email}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{referral.commission_amount.toLocaleString()}</p>
                      <span 
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          referral.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {referral.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No referrals yet</p>
                <p className="text-sm text-gray-400">Start sharing your referral code to earn commissions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;