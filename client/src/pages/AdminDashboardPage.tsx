import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { dataService, Product, WithdrawalRequest, Sale } from '../lib/dataService';
import DragDropUpload from '../components/DragDropUpload';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  Upload,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (user && profile?.is_admin) {
      fetchAdminData();
    }
  }, [user, profile]);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const [usersCount, productsCount, salesData, withdrawalsData] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('sales').select('*'),
        supabase.from('withdrawal_requests').select('*').eq('status', 'pending')
      ]);

      const totalRevenue = salesData.data?.reduce((sum, sale) => sum + Number(sale.admin_amount), 0) || 0;

      setStats({
        totalUsers: usersCount.count || 0,
        totalProducts: productsCount.count || 0,
        totalSales: salesData.data?.length || 0,
        totalRevenue,
        pendingWithdrawals: withdrawalsData.data?.length || 0
      });

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);

      // Fetch withdrawal requests
      const { data: withdrawalsFullData } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false });

      setWithdrawals(withdrawalsFullData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const status = action === 'approve' ? 'completed' : 'rejected';
      
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status,
          admin_notes: notes,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      toast.success(`Withdrawal ${action}d successfully`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} withdrawal`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Product deleted successfully');
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product status');
    }
  };

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your platform and monitor performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingWithdrawals}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'products', name: 'Products', icon: Package },
                { id: 'withdrawals', name: 'Withdrawals', icon: DollarSign }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Recent Activity</h3>
                    <p className="text-sm text-gray-600">Platform activity summary will be displayed here</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Performance Metrics</h3>
                    <p className="text-sm text-gray-600">Key performance indicators will be shown here</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
                  <button
                    onClick={() => setShowProductModal(true)}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{product.title}</h3>
                          <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                          <p className="text-sm font-semibold text-green-600">₦{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => toggleProductStatus(product.id, product.is_active)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Withdrawal Requests</h2>
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {(withdrawal as any).profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(withdrawal as any).profiles?.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {withdrawal.bank_name} - {withdrawal.account_number}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₦{Number(withdrawal.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Net: ₦{Number(withdrawal.net_amount).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                                className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                                className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {withdrawal.status !== 'pending' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {withdrawal.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <ProductModal
            product={editingProduct}
            onClose={() => {
              setShowProductModal(false);
              setEditingProduct(null);
            }}
            onSuccess={() => {
              setShowProductModal(false);
              setEditingProduct(null);
              fetchAdminData();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Product Modal Component
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    category: product?.category || 'ebooks',
    price: product?.price?.toString() || '',
    tags: product?.tags?.join(', ') || '',
    file_format: product?.file_format || '',
    file_size_mb: product?.file_size_mb?.toString() || '',
    author_creator: (product as any)?.author_creator || '',
    brand: (product as any)?.brand || '',
    thumbnail_url: product?.thumbnail_url || '',
    file_url: product?.file_url || ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    'ebooks', 'audio', 'courses', 'graphics', 'movies', 'dramas', 'comedies', 'music', 'software', 'templates', 'video'
  ];

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle file uploads here - in production, you'd upload to cloud storage
      let thumbnailUrl = formData.thumbnail_url;
      let fileUrl = formData.file_url;

      // For demo purposes, we'll use placeholder URLs
      if (imageFile) {
        thumbnailUrl = `https://example.com/uploads/images/${imageFile.name}`;
      }
      if (productFile) {
        fileUrl = `https://example.com/uploads/files/${productFile.name}`;
      }

      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        thumbnail_url: thumbnailUrl,
        file_url: fileUrl,
        file_format: formData.file_format,
        file_size_mb: formData.file_size_mb ? parseFloat(formData.file_size_mb) : null,
        author_creator: formData.author_creator || null,
        brand: formData.brand || null,
        is_active: true
      };

      let error;
      if (product) {
        // Update existing product
        const result = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        error = result.error;
      } else {
        // Create new product
        const result = await supabase
          .from('products')
          .insert([productData]);
        error = result.error;
      }

      if (error) throw error;

      toast.success(`Product ${product ? 'updated' : 'created'} successfully!`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${product ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter product title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="capitalize">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Product Image
            </label>
            <DragDropUpload
              type="image"
              accept="image/*"
              onFileSelect={setImageFile}
              currentFile={imageFile}
              currentUrl={formData.thumbnail_url}
              label="Upload Product Image"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Product File
            </label>
            <DragDropUpload
              type="file"
              accept=".pdf,.mp3,.mp4,.wav,.avi,.jpeg,.jpg,.png,.zip,.rar,.mov,.wmv,.flv,.aac,.flac,.doc,.docx,.txt"
              onFileSelect={setProductFile}
              currentFile={productFile}
              currentUrl={formData.file_url}
              label="Upload Product File (Unlimited Size)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author/Creator
              </label>
              <input
                type="text"
                value={formData.author_creator}
                onChange={(e) => setFormData(prev => ({ ...prev, author_creator: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter author or creator name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand (Optional)
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter brand name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Format
              </label>
              <input
                type="text"
                value={formData.file_format}
                onChange={(e) => setFormData(prev => ({ ...prev, file_format: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="PDF, MP3, MP4, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Size (MB)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.file_size_mb}
                onChange={(e) => setFormData(prev => ({ ...prev, file_size_mb: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Auto-calculated from uploaded file"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                File size will be automatically calculated when you upload a file
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboardPage;