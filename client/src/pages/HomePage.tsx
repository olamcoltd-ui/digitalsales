import React from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Star,
  CheckCircle,
  DollarSign,
  Share2,
  BarChart3
} from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: DollarSign,
      title: 'High Commissions',
      description: 'Earn up to 50% commission on every sale with our premium subscription plans.'
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share products across social media platforms with your unique referral links.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track your sales, commissions, and performance with detailed analytics.'
    },
    {
      icon: Users,
      title: 'Referral Rewards',
      description: 'Earn 15% commission on sales from users you refer to the platform.'
    }
  ];

  const subscriptionPlans = [
    {
      name: 'Free Plan',
      price: '₦0',
      commission: '20%',
      duration: 'Forever',
      features: ['Basic product access', 'Standard support', '20% commission rate'],
      popular: false
    },
    {
      name: 'Monthly',
      price: '₦2,500',
      commission: '30%',
      duration: 'per month',
      features: ['All products access', 'Priority support', '30% commission rate', 'Advanced analytics'],
      popular: false
    },
    {
      name: '6-Month Plan',
      price: '₦5,500',
      commission: '40%',
      duration: 'for 6 months',
      features: ['All products access', 'Priority support', '40% commission rate', 'Advanced analytics', 'Bulk sharing tools'],
      popular: true
    },
    {
      name: 'Annual Plan',
      price: '₦7,000',
      commission: '50%',
      duration: 'per year',
      features: ['All products access', 'VIP support', '50% commission rate', 'Advanced analytics', 'Bulk sharing tools', 'Early access to new products'],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Digital Entrepreneur',
      content: 'I\'ve earned over ₦500,000 in just 3 months! The platform is incredibly user-friendly.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Content Creator',
      content: 'The referral system is amazing. I earn from both my sales and my referrals\' sales.',
      rating: 5
    },
    {
      name: 'Aisha Okafor',
      role: 'Social Media Influencer',
      content: 'Perfect for influencers! Easy to share products and track earnings in real-time.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Earn Up To{' '}
              <span className="text-green-400">50% Commission</span>
              <br />
              Selling Digital Products
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Join thousands of successful entrepreneurs earning passive income by sharing digital products on social media
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth?mode=register"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Earning Today</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/products"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-800 px-8 py-4 rounded-lg text-lg font-semibold transition-all"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-500 mb-2">₦50M+</div>
              <div className="text-gray-600">Total Earnings</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">5,000+</div>
              <div className="text-gray-600">Digital Products</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-500 mb-2">50%</div>
              <div className="text-gray-600">Max Commission</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Olamco Digital Hub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to build a successful digital business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Commission Rate
            </h2>
            <p className="text-xl text-gray-600">
              Higher subscriptions = Higher commissions on every sale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {subscriptionPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{plan.price}</div>
                  <div className="text-gray-500 text-sm">{plan.duration}</div>
                  <div className="mt-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {plan.commission} Commission
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/auth?mode=register"
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all text-center block ${
                    plan.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of successful digital entrepreneurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Digital Business?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of entrepreneurs earning passive income with digital products
          </p>
          <Link
            to="/auth?mode=register"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>Start Earning Today</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;