import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
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
import ReferralsPage from './pages/ReferralsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    setLocation('/auth');
    return null;
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
      <Layout>
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/product/:id" component={ProductDetailPage} />
          
          {/* Protected Routes */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </Route>
          
          <Route path="/analytics">
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          </Route>
          
          <Route path="/subscription">
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          </Route>
          
          <Route path="/wallet">
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin">
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          </Route>

          <Route path="/profile">
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Route>
          
          <Route path="/settings">
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          </Route>
          
          <Route path="/referrals">
            <ProtectedRoute>
              <ReferralsPage />
            </ProtectedRoute>
          </Route>
          
          <Route path="/withdrawals">
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          </Route>

          {/* Footer links */}
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/support" component={SupportPage} />
          
          <Route path="/careers">
            <PlaceholderPage 
              title="Careers" 
              description="Join our growing team of digital innovators" 
            />
          </Route>
          
          <Route path="/blog">
            <PlaceholderPage 
              title="Blog" 
              description="Tips, insights, and success stories from digital entrepreneurs" 
            />
          </Route>
          
          <Route path="/privacy">
            <PlaceholderPage 
              title="Privacy Policy" 
              description="How we protect and handle your personal information" 
            />
          </Route>
          
          <Route path="/terms">
            <PlaceholderPage 
              title="Terms of Service" 
              description="Terms and conditions for using Olamco Digital Hub" 
            />
          </Route>
          
          <Route path="/sales">
            <ProtectedRoute>
              <PlaceholderPage 
                title="Sales History" 
                description="View detailed history of all your sales" 
              />
            </ProtectedRoute>
          </Route>

          {/* Default route */}
          <Route>
            <HomePage />
          </Route>
        </Switch>
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
    </AuthProvider>
  );
}

export default App;