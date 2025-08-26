import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  ShoppingBag, 
  User, 
  LogOut, 
  Settings,
  Wallet,
  BarChart3,
  Users,
  Package,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: ShoppingBag },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requireAuth: true },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminNavigation = [
    { name: 'Admin Panel', href: '/admin', icon: Settings },
    { name: 'Manage Products', href: '/admin/products', icon: Package },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Olamco Digital Hub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                if (item.requireAuth && !user) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.href
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {profile?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {profile?.full_name || user.email}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      {userNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                      
                      {profile?.is_admin && (
                        <>
                          <div className="border-t border-gray-200 my-1"></div>
                          {adminNavigation.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Icon className="h-4 w-4" />
                                <span>{item.name}</span>
                              </Link>
                            );
                          })}
                        </>
                      )}
                      
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                if (item.requireAuth && !user) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      location === item.href
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {user && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  {userNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <span className="text-xl font-bold">Olamco Digital Hub</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your premier destination for digital products and affiliate marketing success.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Join thousands of successful digital entrepreneurs
                </p>
                <p className="text-sm text-gray-400">
                  Earn up to 50% commission on sales
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="/support" className="text-gray-400 hover:text-white">Support</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Olamco Digital Hub. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0">
                <p className="text-gray-400 text-sm">
                  Made with ❤️ for digital entrepreneurs
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;