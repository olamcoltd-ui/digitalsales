import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import WalletPage from './pages/WalletPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SupportPage from './pages/SupportPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Placeholder components for missing pages
const PlaceholderPage: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-xl text-gray-600 mb-8">{description}</p>
      <div className="bg-white rounded-xl shadow-sm p-8">
        <p className="text-gray-500">This page is under construction. Please check back soon!</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/products" element={<ProductsPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/subscription" element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } />
            
            <Route path="/wallet" element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* Placeholder routes for footer links */}
            <Route path="/about" element={
              <AboutPage />
            } />
            
            <Route path="/contact" element={
              <ContactPage />
            } />
            
            <Route path="/careers" element={
              <PlaceholderPage 
                title="Careers" 
                description="Join our growing team of digital innovators" 
              />
            } />
            
            <Route path="/blog" element={
              <PlaceholderPage 
                title="Blog" 
                description="Tips, insights, and success stories from digital entrepreneurs" 
              />
            } />
            
            <Route path="/privacy" element={
              <PlaceholderPage 
                title="Privacy Policy" 
                description="How we protect and handle your personal information" 
              />
            } />
            
            <Route path="/terms" element={
              <PlaceholderPage 
                title="Terms of Service" 
                description="Terms and conditions for using Olamco Digital Hub" 
              />
            } />
            
            <Route path="/support" element={
              <SupportPage />
            } />

            {/* Additional placeholder routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/referrals" element={
              <ProtectedRoute>
                <PlaceholderPage 
                  title="My Referrals" 
                  description="Track your referral earnings and performance" 
                />
              </ProtectedRoute>
            } />
            
            <Route path="/withdrawals" element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            } />
            
            <Route path="/sales" element={
              <ProtectedRoute>
                <PlaceholderPage 
                  title="Sales History" 
                  description="View detailed history of all your sales" 
                />
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
<Route path="/support" element={<SupportPage />} />