'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, CheckCircle, Plus } from 'lucide-react';
import { formatCurrencyWithCommas } from '@/lib/currency';
import { getAllProducts } from '@/lib/dummyProducts';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

export default function CartSidebar({ isOpen, onClose, onItemAdded }: CartSidebarProps) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [addingProduct, setAddingProduct] = useState<string | null>(null);

  // Use shared dummy products
  const dummyProducts = getAllProducts();

  const fetchCart = () => {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        setCart(JSON.parse(cartData));
      } else {
        setCart({ items: [] });
      }
      if (onItemAdded) onItemAdded();
    } catch (err) {
      setCart({ items: [] });
    }
  };

  const fetchRecommendedProducts = () => {
    // Use dummy products
    setRecommendedProducts(dummyProducts);
  };

  const handleAddProduct = (productId: string) => {
    setAddingProduct(productId);
    try {
      const product = dummyProducts.find(p => p._id === productId);
      if (!product) return;

      const cartData = localStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : { items: [] };
      
      const existingItemIndex = cart.items.findIndex((item: any) => item.product._id === productId);
      
      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += 1;
      } else {
        cart.items.push({
          _id: `item-${Date.now()}-${Math.random()}`,
          product: product,
          quantity: 1
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      fetchCart();
      if (onItemAdded) onItemAdded();
    } catch (err: any) {
      // Silent error handling
    } finally {
      setAddingProduct(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
      fetchRecommendedProducts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cartItems = cart?.items || [];
  const totalItems = cartItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
  const subtotal = cartItems.reduce((acc: number, item: any) => {
    const product = item.product;
    const price = product && typeof product === 'object' && product !== null ? product.price : 0;
    return acc + (price * (item.quantity || 0));
  }, 0);

  // Filter recommended products (not in cart)
  const filteredRecommended = recommendedProducts.filter(recProduct => {
    return !cartItems.some((item: any) => {
      const product = item.product;
      const isProductObject = product && typeof product === 'object' && product !== null;
      return isProductObject && product._id === recProduct._id;
    });
  });

  return (
    <>
      {/* Backdrop - Transparent so home page shows through */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />
      
      {/* Recommended Products on Left Side */}
      {filteredRecommended.length > 0 && (
        <div className="fixed left-0 top-0 h-full w-[calc(100%-384px)] bg-gray-50 z-45 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredRecommended.slice(0, 12).map((product: any, idx: number) => {
                const productImage = product.images && product.images.length > 0
                  ? product.images[0]
                  : 'https://via.placeholder.com/150?text=No+Image';
                const isAdding = addingProduct === product._id;
                
                return (
                  <div
                    key={`rec-${product._id || idx}`}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-xl transition-all duration-200 group relative"
                  >
                    <Link
                      href={`/product/${product._id}`}
                      onClick={onClose}
                      className="block"
                    >
                      <div className="aspect-square bg-white rounded mb-2 overflow-hidden flex items-center justify-center">
                        <img 
                          src={productImage} 
                          alt={product.name} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                          loading="lazy"
                        />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <p className="text-base font-bold text-red-700 mb-2">
                        {formatCurrencyWithCommas(product.price)}
                      </p>
                    </Link>
                    <button
                      onClick={() => handleAddProduct(product._id)}
                      disabled={isAdding}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-md py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-yellow-600 shadow-sm transition-all duration-200 active:scale-95"
                    >
                      {isAdding ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-bold text-gray-900">Added to Cart</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items Grid - Only show cart items */}
        <div className="p-4 bg-white border-b">
          <h3 className="text-base font-bold text-gray-900 mb-4">Cart</h3>
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {/* Show all cart items */}
              {cartItems.map((item: any, idx: number) => {
                const product = item.product;
                const isProductObject = product && typeof product === 'object' && product !== null;
                const productImage = isProductObject && product.images && product.images.length > 0
                  ? product.images[0]
                  : 'https://via.placeholder.com/150?text=No+Image';
                
                return (
                  <Link
                    key={item._id || idx}
                    href={`/product/${isProductObject ? product._id : ''}`}
                    onClick={onClose}
                    className="aspect-square bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden p-1 hover:border-yellow-500 hover:shadow-lg transition-all group relative"
                  >
                    <img 
                      src={productImage} 
                      alt={isProductObject ? product.name : 'Product'} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200" 
                      loading="lazy"
                    />
                    {item.quantity > 1 && (
                      <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                        {item.quantity}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs mt-2 text-gray-400">Add items to see them here</p>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="border-t p-4 bg-white sticky bottom-0 shadow-lg">
          <div className="mb-4">
            <p className="text-lg font-bold text-gray-900">
              Cart subtotal: <span className="text-red-700">{formatCurrencyWithCommas(subtotal)}</span>
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <Link 
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-yellow-400 hover:bg-yellow-500 rounded-md py-2.5 text-center text-sm font-medium shadow-sm border border-yellow-600 transition-all duration-200 active:scale-95"
            >
              Proceed to Buy ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </Link>
            <Link 
              href="/cart"
              onClick={onClose}
              className="block w-full bg-white border border-gray-300 hover:bg-gray-50 rounded-md py-2.5 text-center text-sm font-medium transition-colors"
            >
              Go to Cart
            </Link>
          </div>

          <p className="text-xs text-gray-600 text-center">
            For best experience{' '}
            <Link href="/login" className="text-blue-600 hover:text-orange-600 hover:underline transition-colors">
              sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
