import React from 'react';
import { Link } from 'wouter';
import { Mail, Phone, MessageCircle, FileText, Clock, CheckCircle, BarChart3, Wallet, Users, Package, ArrowRight } from 'lucide-react';

const SupportPage: React.FC = () => {
  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      available: '24/7'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message and we\'ll respond within 24 hours',
      action: 'Send Email',
      contact: 'support@olamcodigitalhub.com'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      action: 'Call Now',
      contact: '+234 XXX XXX XXXX'
    }
  ];

  const faqs = [
    {
      question: 'How do I start selling digital products?',
      answer: 'Sign up for an account, choose a subscription plan, and start browsing our product catalog. Each product has sharing tools and your unique referral link.'
    },
    {
      question: 'When do I receive my commissions?',
      answer: 'Commissions are processed weekly and paid out to your wallet. You can withdraw funds once you reach the minimum threshold of ₦5,000.'
    },
    {
      question: 'What commission rates can I earn?',
      answer: 'Commission rates vary by subscription plan: Free (20%), Monthly (30%), 6-Month (40%), and Annual (50%). Plus 15% on referrals and 25% on subscription referrals.'
    },
    {
      question: 'Can I promote products on social media?',
      answer: 'Yes! We provide sharing tools for Facebook, Instagram, Twitter, WhatsApp, and other platforms. Always use your unique referral links to track commissions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help you succeed with your digital products business. 
            Get support, find answers, and connect with our team.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                  <Icon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{option.title}</h3>
                <p className="text-gray-600 mb-6">{option.description}</p>
                {option.available && (
                  <p className="text-sm text-green-600 mb-4">Available {option.available}</p>
                )}
                {option.contact && (
                  <p className="text-sm text-gray-500 mb-4">{option.contact}</p>
                )}
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  {option.action}
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="font-medium">View Dashboard</span>
            </Link>
            <Link 
              href="/wallet"
              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Wallet className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Check Wallet</span>
            </Link>
            <Link 
              href="/referrals"
              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-medium">My Referrals</span>
            </Link>
            <Link 
              href="/products"
              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Browse Products</span>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-8">
            Can't find what you're looking for? Our support team is standing by to help.
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Contact Support
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;