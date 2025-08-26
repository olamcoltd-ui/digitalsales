import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Product } from '../lib/supabase';
import { loadPaystackScript, initializePaystackPayment, formatAmountToKobo, generatePaymentReference } from '../lib/paystack';
import { 
  Share2, 
  Download, 
  Star, 
  Tag,
  ShoppingCart,
  Eye,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    loadPaystackScript();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        navigate('/products');
      } else {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!product || !user || !profile) {
      toast.error('Please log in to purchase');
      navigate('/auth');
      return;
    }

    setPurchasing(true);

    try {
      const paymentConfig = {
        email: profile.email,
        amount: formatAmountToKobo(product.price),
        reference: generatePaymentReference('product'),
        metadata: {
          user_id: user.id,
          product_id: product.id,
          product_title: product.title,
          type: 'product_purchase'
        }
      };

      const response = await initializePaystackPayment(paymentConfig);
      
      if (response) {
        // Payment successful - this would be handled by webhook in production
        await recordSale((response as any).reference);
        toast.success('Purchase successful! Check your email for download link.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const recordSale = async (reference: string) => {
    if (!product || !user || !profile) return;

    try {
      // Get user's current subscription to calculate commission
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (commission_rate)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const commissionRate = subscription?.subscription_plans?.commission_rate || 0.20; // Default 20% for free plan
      const commissionAmount = product.price * commissionRate;
      const adminAmount = product.price - commissionAmount;

      // Record the sale
      const { error } = await supabase
        .from('sales')
        .insert([{
          product_id: product.id,
          seller_id: user.id,
          buyer_email: profile.email,
          sale_amount: product.price,
          commission_amount: commissionAmount,
          admin_amount: adminAmount,
          status: 'completed',
          transaction_id: reference
        }]);

      if (error) {
        console.error('Error recording sale:', error);
      }

      // Update product download count
      await supabase
        .from('products')
        .update({ 
          download_count: (product.download_count || 0) + 1 
        })
        .eq('id', product.id);

    } catch (error) {
      console.error('Error recording sale:', error);
    }
  };

  const generateReferralLink = () => {
    if (!profile?.referral_code || !product) return '';
    return `${window.location.origin}/product/${product.id}?ref=${profile.referral_code}`;
  };

  const shareProduct = async (platform?: string) => {
    if (!product) return;

    const referralLink = generateReferralLink();
    const shareText = `Check out this amazing ${product.category}: ${product.title} - Only ₦${product.price.toLocaleString()}!`;
    const fullText = `${shareText}\n${referralLink}`;

    if (platform) {
      let shareUrl = '';
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
          break;
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(product.title)}&body=${encodeURIComponent(fullText)}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank');
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: shareText,
          url: referralLink
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(fullText);
      toast.success('Product link copied to clipboard!');
    }
  };

  const copyReferralLink = () => {
    const referralLink = generateReferralLink();
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or is no longer available.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-12 h-12 text-purple-600" />
                    </div>
                    <p className="text-lg text-gray-500 capitalize">{product.category}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Preview */}
            {product.preview_url && (
              <div className="bg-white rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
                <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-700">
                  <Eye className="w-5 h-5" />
                  <span>View Preview</span>
                </button>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {product.category}
                </span>
                {product.download_count && product.download_count > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Download className="w-4 h-4 mr-1" />
                    {product.download_count} downloads
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="text-4xl font-bold text-purple-600 mb-6">
                ₦{product.price.toLocaleString()}
              </div>

              {product.description && (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Product Information</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.file_format && (
                  <div>
                    <span className="text-gray-500">Format:</span>
                    <span className="ml-2 font-medium">{product.file_format}</span>
                  </div>
                )}
                
                {product.file_size_mb && (
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <span className="ml-2 font-medium">{product.file_size_mb} MB</span>
                  </div>
                )}
                
                {product.image_resolution && (
                  <div>
                    <span className="text-gray-500">Resolution:</span>
                    <span className="ml-2 font-medium">{product.image_resolution}</span>
                  </div>
                )}
                
                {product.product_version && (
                  <div>
                    <span className="text-gray-500">Version:</span>
                    <span className="ml-2 font-medium">{product.product_version}</span>
                  </div>
                )}
              </div>

              {product.tags && product.tags.length > 0 && (
                <div>
                  <span className="text-gray-500 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.licensing_info && (
                <div>
                  <span className="text-gray-500 text-sm">License:</span>
                  <p className="text-sm text-gray-600 mt-1">{product.licensing_info}</p>
                </div>
              )}
            </div>

            {/* Purchase Actions */}
            <div className="space-y-4">
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>{purchasing ? 'Processing...' : 'Buy Now'}</span>
              </button>

              {user && (
                <button
                  onClick={copyReferralLink}
                  className="w-full bg-green-100 text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copy Referral Link</span>
                </button>
              )}

              {/* Social Sharing */}
              <div className="bg-white rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Share this product</h3>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => shareProduct('facebook')}
                    className="flex flex-col items-center space-y-1 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Facebook className="w-6 h-6" />
                    <span className="text-xs">Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => shareProduct('twitter')}
                    className="flex flex-col items-center space-y-1 p-3 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    <Twitter className="w-6 h-6" />
                    <span className="text-xs">Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => shareProduct('whatsapp')}
                    className="flex flex-col items-center space-y-1 p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-xs">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => shareProduct('email')}
                    className="flex flex-col items-center space-y-1 p-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-6 h-6" />
                    <span className="text-xs">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;