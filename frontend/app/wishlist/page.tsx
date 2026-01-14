'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useNotification } from '@/hooks/useNotification';
import { formatCurrencyWithCommas } from '@/lib/currency';
import { cartApi, wishlistApi } from '@/lib/api';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const { showNotification, NotificationComponent } = useNotification();

  // Fetch wishlist from API
  const fetchWishlist = async () => {
    try {
      const data = await wishlistApi.getWishlist();
      // The backend returns { wishlist: [...] } where items contain product details
      setWishlist({ products: data.wishlist || [] });
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setWishlist({ products: [] });
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart from API
  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart();
      const items = data.cart || [];
      const count = items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      setCartCount(count);
    } catch (err) {
      setCartCount(0);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      // The ID passed here is the PRODUCT ID (from productData._id or similar)
      const idStr = String(productId);
      await wishlistApi.removeFromWishlist(idStr);
      window.dispatchEvent(new Event('wishlistUpdated'));
      showNotification('Removed from wishlist', 'success');
      fetchWishlist();
    } catch (err: any) {
      showNotification('Failed to remove from wishlist', 'error');
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      // Use product_id or id from the object
      const productId = String(product.product_id || product.id || product._id);
      await cartApi.addToCart(productId, 1);

      window.dispatchEvent(new Event('cartUpdated'));
      fetchCart();
      showNotification(`${product.name} added to cart!`, 'success');
    } catch (err: any) {
      showNotification('Failed to add to cart', 'error');
    }
  };

  useEffect(() => {
    fetchWishlist();
    fetchCart();

    // Listen for wishlist and cart updates
    const handleWishlistUpdate = () => {
      fetchWishlist();
    };
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const products = wishlist?.products || [];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {NotificationComponent}
      <Header cartCount={cartCount} onSearch={() => { }} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-medium mb-6">Your Wishlist</h1>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-medium mb-4 text-gray-900">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Save items you love for later. Add items to your wishlist by clicking the heart icon on any product.
            </p>
            <Link href="/" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2 rounded-md font-medium transition-colors">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any, idx: number) => {
              const productData = product && typeof product === 'object' && product !== null ? product : null;
              if (!productData) return null;

              return (
                <div key={productData.id || productData._id || idx} className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col h-full hover:shadow-xl transition-all duration-200 relative group">
                  <button
                    onClick={() => handleRemoveFromWishlist(String(productData.id || productData._id || productData.product_id))}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-gray-100 transition-all"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>

                  <Link href={`/product/${productData.id || productData._id || productData.product_id}`} className="flex-1 flex flex-col items-center justify-center p-4 bg-white mb-3 min-h-[200px] group/image">
                    <img
                      src={productData.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4='}
                      alt={productData.name}
                      className="max-h-48 w-full object-contain transition-transform duration-300 group-hover/image:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </Link>

                  <div className="flex flex-col gap-1.5">
                    <Link href={`/product/${productData._id}`} className="hover:text-orange-600 transition-colors">
                      <h2 className="font-medium line-clamp-2 text-sm md:text-base leading-tight text-gray-900 group-hover:text-orange-600">
                        {productData.name}
                      </h2>
                    </Link>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg md:text-xl font-bold text-red-700">{formatCurrencyWithCommas(productData.price)}</span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(productData)}
                      disabled={productData.stock_quantity === 0}
                      className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 mt-auto border border-yellow-600 shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
