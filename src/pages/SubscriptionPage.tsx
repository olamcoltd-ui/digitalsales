import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SubscriptionPlan, UserSubscription } from '../lib/supabase';
import { loadPaystackScript, initializePaystackPayment, formatAmountToKobo, generatePaymentReference } from '../lib/paystack';
import { CheckCircle, Star, Zap, Crown, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const SubscriptionPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription & { plan: SubscriptionPlan } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchCurrentSubscription();
    }
    loadPaystackScript();
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
      } else {
        setPlans(data || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      } else if (data) {
        setCurrentSubscription(data as any);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user || !profile) {
      toast.error('Please log in to subscribe');
      return;
    }

    if (plan.price === 0) {
      // Free plan - no payment needed
      await createSubscription(plan.id, 'free_plan_ref');
      return;
    }

    setProcessingPayment(plan.id);

    try {
      const paymentConfig = {
        email: profile.email,
        amount: formatAmountToKobo(plan.price),
        reference: generatePaymentReference('sub'),
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
          plan_name: plan.name,
          type: 'subscription'
        }
      };

      const response = await initializePaystackPayment(paymentConfig);
      
      if (response) {
        // Payment successful, create subscription
        await createSubscription(plan.id, (response as any).reference);
        toast.success('Subscription activated successfully!');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const createSubscription = async (planId: string, reference: string) => {
    if (!user) return;

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration_months);

      // Deactivate current subscription if exists
      if (currentSubscription) {
        await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', currentSubscription.id);
      }

      // Create new subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString()
        }]);

      if (error) {
        console.error('Error creating subscription:', error);
        toast.error('Failed to activate subscription');
      } else {
        // Record the sale if it's a paid plan
        if (plan.price > 0) {
          await supabase
            .from('sales')
            .insert([{
              product_id: planId, // Using plan ID as product ID for subscriptions
              seller_id: user.id,
              buyer_email: profile?.email || '',
              sale_amount: plan.price,
              commission_amount: 0, // No commission on own subscription
              admin_amount: plan.price,
              status: 'completed',
              transaction_id: reference
            }]);
        }

        await fetchCurrentSubscription();
        toast.success('Subscription activated successfully!');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to activate subscription');
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('free')) return CheckCircle;
    if (planName.toLowerCase().includes('monthly')) return Star;
    if (planName.toLowerCase().includes('6-month')) return Zap;
    if (planName.toLowerCase().includes('annual')) return Crown;
    return Shield;
  };

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('free')) return 'gray';
    if (planName.toLowerCase().includes('monthly')) return 'blue';
    if (planName.toLowerCase().includes('6-month')) return 'purple';
    if (planName.toLowerCase().includes('annual')) return 'yellow';
    return 'green';
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Commission Rate
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Higher subscriptions unlock higher commission rates. Start earning more on every sale!
          </p>
          
          {currentSubscription && (
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <CheckCircle className="w-5 h-5 mr-2" />
              Currently on {currentSubscription.plan.name} - {Math.round(currentSubscription.plan.commission_rate * 100)}% commission
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const color = getPlanColor(plan.name);
            const isPopular = plan.name.toLowerCase().includes('6-month');
            const isCurrent = isCurrentPlan(plan.id);
            const isProcessing = processingPayment === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  isPopular ? 'ring-2 ring-purple-500 scale-105' : ''
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    color === 'gray' ? 'bg-gray-100' :
                    color === 'blue' ? 'bg-blue-100' :
                    color === 'purple' ? 'bg-purple-100' :
                    color === 'yellow' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      color === 'gray' ? 'text-gray-600' :
                      color === 'blue' ? 'text-blue-600' :
                      color === 'purple' ? 'text-purple-600' :
                      color === 'yellow' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ₦{plan.price.toLocaleString()}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {plan.duration_months === 1 ? 'per month' :
                     plan.duration_months === 6 ? 'for 6 months' :
                     plan.duration_months === 12 ? 'per year' :
                     'one-time'}
                  </div>
                  
                  <div className="mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      color === 'gray' ? 'bg-gray-100 text-gray-800' :
                      color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      color === 'purple' ? 'bg-purple-100 text-purple-800' :
                      color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {Math.round(plan.commission_rate * 100)}% Commission
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">All digital products access</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">Referral link generation</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">Real-time analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">
                      {plan.commission_rate >= 0.4 ? 'Priority' : 'Standard'} support
                    </span>
                  </li>
                  {plan.commission_rate >= 0.4 && (
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">Bulk sharing tools</span>
                    </li>
                  )}
                  {plan.commission_rate >= 0.5 && (
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">Early access to new products</span>
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrent || isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    isCurrent
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : isProcessing
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : isPopular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrent
                    ? 'Current Plan'
                    : isProcessing
                    ? 'Processing...'
                    : plan.price === 0
                    ? 'Start Free'
                    : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Upgrade Your Subscription?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Higher Commissions</h3>
              <p className="text-gray-600">
                Earn up to 50% commission on every sale with our premium plans
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Referral Bonuses</h3>
              <p className="text-gray-600">
                Earn 15% commission on sales from users you refer to the platform
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Tools</h3>
              <p className="text-gray-600">
                Access bulk sharing tools and advanced analytics to maximize earnings
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my subscription plan?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do commission rates work?
              </h3>
              <p className="text-gray-600">
                Your commission rate applies to all sales you make. Higher subscription plans unlock higher commission rates, allowing you to earn more on every sale.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                You'll revert to the free plan with a 20% commission rate. You can reactivate your subscription at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;