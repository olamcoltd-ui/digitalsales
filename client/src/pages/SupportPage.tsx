import React from 'react';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Book, 
  HelpCircle, 
  Clock,
  Users,
  FileText
} from 'lucide-react';

const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Need help? We're here to support you. Find answers to common questions or get in touch with our support team.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Live Chat */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">
              Get instant help from our support team. Available 24/7 for urgent issues.
            </p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Start Chat
            </button>
          </div>

          {/* Email Support */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">
              Send us a detailed message and we'll get back to you within 24 hours.
            </p>
            <a 
              href="mailto:support@olamcodigitalhub.com"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Send Email
            </a>
          </div>

          {/* Phone Support */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">
              Call us directly for immediate assistance with urgent matters.
            </p>
            <a 
              href="tel:+2348123456789"
              className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              +234 812 345 6789
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <div className="flex items-center mb-6">
            <HelpCircle className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How do I start selling products?</h4>
              <p className="text-gray-600">
                Simply sign up for an account, complete your profile, and you can start sharing product links to earn commissions immediately.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">When do I get paid?</h4>
              <p className="text-gray-600">
                Commissions are credited to your wallet immediately after a successful sale. You can withdraw your earnings anytime with a minimum balance of ₦1,000.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What are the commission rates?</h4>
              <p className="text-gray-600">
                Commission rates vary by subscription plan: Free (20%), Monthly (30%), 6-Month (40%), and Annual (50%). Plus 15% referral bonuses!
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How does the referral system work?</h4>
              <p className="text-gray-600">
                Share your unique referral code and earn 15% commission on sales made by people you refer, plus 25% on their subscription revenue.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Book className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
            <p className="text-gray-600 text-sm mb-4">
              Comprehensive guides and tutorials to help you get started.
            </p>
            <a href="#" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              View Docs →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <Users className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
            <p className="text-gray-600 text-sm mb-4">
              Join our community of sellers and get tips from experienced users.
            </p>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Join Community →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <FileText className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-gray-600 text-sm mb-4">
              Watch step-by-step video guides to master the platform.
            </p>
            <a href="#" className="text-green-600 hover:text-green-700 font-medium text-sm">
              Watch Videos →
            </a>
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-purple-50 rounded-xl p-6 mt-12 text-center">
          <Clock className="w-8 h-8 text-purple-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Support Hours</h3>
          <p className="text-gray-600">
            Monday - Friday: 9:00 AM - 6:00 PM (WAT)<br />
            Saturday - Sunday: 10:00 AM - 4:00 PM (WAT)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;