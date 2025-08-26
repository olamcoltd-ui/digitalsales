import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  totalSales: number;
  totalCommissions: number;
  totalReferrals: number;
  conversionRate: number;
  monthlySales: Array<{ month: string; sales: number; commissions: number }>;
  topProducts: Array<{ title: string; sales: number; commissions: number }>;
  referralStats: Array<{ month: string; referrals: number; commissions: number }>;
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch sales data
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          *,
          products (title, category)
        `)
        .eq('seller_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch referral data
      const { data: referralData } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('referrer_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Process data
      const totalSales = salesData?.length || 0;
      const totalCommissions = salesData?.reduce((sum, sale) => sum + Number(sale.commission_amount), 0) || 0;
      const totalReferrals = referralData?.length || 0;
      const referralCommissions = referralData?.reduce((sum, ref) => sum + Number(ref.commission_amount), 0) || 0;

      // Monthly breakdown
      const monthlySales = processMonthlyData(salesData || []);
      
      // Top products
      const productStats = processProductStats(salesData || []);
      
      // Referral stats
      const referralStats = processReferralStats(referralData || []);

      setAnalytics({
        totalSales,
        totalCommissions: totalCommissions + referralCommissions,
        totalReferrals,
        conversionRate: totalSales > 0 ? (totalSales / 100) * 100 : 0, // Placeholder calculation
        monthlySales,
        topProducts: productStats,
        referralStats
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (sales: any[]) => {
    const monthlyData: { [key: string]: { sales: number; commissions: number } } = {};
    
    sales.forEach(sale => {
      const month = new Date(sale.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, commissions: 0 };
      }
      
      monthlyData[month].sales += 1;
      monthlyData[month].commissions += Number(sale.commission_amount);
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sales: data.sales,
      commissions: data.commissions
    }));
  };

  const processProductStats = (sales: any[]) => {
    const productStats: { [key: string]: { sales: number; commissions: number } } = {};
    
    sales.forEach(sale => {
      const title = sale.products?.title || 'Unknown Product';
      
      if (!productStats[title]) {
        productStats[title] = { sales: 0, commissions: 0 };
      }
      
      productStats[title].sales += 1;
      productStats[title].commissions += Number(sale.commission_amount);
    });

    return Object.entries(productStats)
      .map(([title, data]) => ({
        title,
        sales: data.sales,
        commissions: data.commissions
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  const processReferralStats = (referrals: any[]) => {
    const monthlyReferrals: { [key: string]: { referrals: number; commissions: number } } = {};
    
    referrals.forEach(referral => {
      const month = new Date(referral.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyReferrals[month]) {
        monthlyReferrals[month] = { referrals: 0, commissions: 0 };
      }
      
      monthlyReferrals[month].referrals += 1;
      monthlyReferrals[month].commissions += Number(referral.commission_amount);
    });

    return Object.entries(monthlyReferrals).map(([month, data]) => ({
      month,
      referrals: data.referrals,
      commissions: data.commissions
    }));
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your sales performance and earnings</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalSales}</p>
                    <p className="text-sm text-green-600 mt-1">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      +12% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{analytics.totalCommissions.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      +8% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Referral Commissions</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalReferrals}</p>
                    <p className="text-sm text-green-600 mt-1">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      +15% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      +2% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly Sales Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Monthly Sales</h2>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                
                {analytics.monthlySales.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.monthlySales.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900">{month.month}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{month.sales} sales</p>
                          <p className="text-xs text-gray-500">₦{month.commissions.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sales data available</p>
                  </div>
                )}
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                
                {analytics.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                              {product.title}
                            </p>
                            <p className="text-xs text-gray-500">{product.sales} sales</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            ₦{product.commissions.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No product sales yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Referral Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Referral Performance</h2>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              
              {analytics.referralStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {analytics.referralStats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">{stat.month}</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">{stat.referrals}</p>
                      <p className="text-sm text-gray-500">referrals</p>
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        ₦{stat.commissions.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No referral data available</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start referring users to earn 15% commission on their sales
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600">Start making sales to see your analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;