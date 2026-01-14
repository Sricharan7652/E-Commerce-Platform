'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { formatCurrencyWithCommas } from '@/lib/currency';
import { useAmazonToast } from '@/hooks/useAmazonToast';
import { useCartSidebar } from '@/hooks/useCartSidebar';
import { productApi, cartApi } from '@/lib/api';

export default function ProductDetailClient() {
  const router = useRouter();
  const params = useParams(); // Use useParams hook
  const [product, setProduct] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { showNotification, NotificationComponent } = useNotification();
  const { showToast, ToastComponent } = useAmazonToast();
  const { showCartSidebar, CartSidebarComponent } = useCartSidebar();

  // Use API to fetch product
  const fetchProduct = async () => {
    try {
      const productId = params?.id as string;
      if (!productId) return; // Wait for params

      console.log('Fetching product with ID:', productId);
      const response = await productApi.getProductById(productId);
      console.log('API response:', response);

      // API returns {product: {...}} structure
      if (response && response.product) {
        console.log('Setting product:', response.product);
        setProduct(response.product);
      } else {
        console.error('No product data found, response:', response);
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const data = await cartApi.getCart();
      const items = data.cart || [];
      const count = items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      setCartCount(count);
    } catch (err) {
      setCartCount(0);
    }
  };

  // Use localStorage for wishlist
  const checkWishlist = () => {
    try {
      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData) {
        const wishlist = JSON.parse(wishlistData);
        const productIds = wishlist.products.map((p: any) =>
          typeof p === 'string' ? p : p._id
        );
        setIsInWishlist(productIds.includes(params.id));
      } else {
        setIsInWishlist(false);
      }
    } catch (err) {
      setIsInWishlist(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await cartApi.addToCart(product._id || product.id, quantity);

      // Update local state
      await fetchCartCount();

      window.dispatchEvent(new Event('cartUpdated'));
      showToast('Added to Cart');
      showCartSidebar();
    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      showNotification('Failed to add to cart. Ensure backend is running.', 'error');
    }
  };

  // Buy now - add to cart and go to checkout
  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await cartApi.addToCart(product._id || product.id, quantity);

      window.dispatchEvent(new Event('cartUpdated'));
      await fetchCartCount();

      showNotification('Redirecting to checkout...', 'info');
      setTimeout(() => {
        router.push('/checkout');
      }, 500);
    } catch (err: any) {
      showNotification('Failed to add to cart', 'error');
    }
  };

  // Toggle wishlist using localStorage
  const toggleWishlist = () => {
    if (!product) return;
    try {
      const wishlistData = localStorage.getItem('wishlist');
      let wishlist = wishlistData ? JSON.parse(wishlistData) : { products: [] };

      if (isInWishlist) {
        wishlist.products = wishlist.products.filter((p: any) => {
          const id = typeof p === 'string' ? p : p._id;
          return id !== product._id;
        });
        setIsInWishlist(false);
      } else {
        wishlist.products.push(product);
        setIsInWishlist(true);
      }

      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      // Silent error handling
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchCartCount();
      checkWishlist();

      // Listen for cart and wishlist updates
      const handleCartUpdate = () => {
        fetchCartCount();
      };
      const handleWishlistUpdate = () => {
        checkWishlist();
      };

      window.addEventListener('cartUpdated', handleCartUpdate);
      window.addEventListener('wishlistUpdated', handleWishlistUpdate);

      return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
        window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      };
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  console.log('Product data:', product); // Debug log

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://via.placeholder.com/500x500?text=No+Image'];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center text-yellow-500">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
        <span className="text-blue-500 ml-2 text-sm">({product.numReviews || 0})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {NotificationComponent}
      {ToastComponent}
      {CartSidebarComponent}
      <Header cartCount={cartCount} onSearch={() => { }} />

      <main className="container mx-auto px-4 py-8 max-w-[1500px]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Image Carousel */}
          <div className="lg:col-span-2">
            <div className="flex gap-4 sticky top-4 h-[500px]">
              {/* Thumbnail List - Left Side */}
              {images.length > 1 && (
                <div className="flex flex-col gap-3 overflow-y-auto w-16 h-full py-1 scrollbar-hide">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onMouseEnter={() => setSelectedImage(idx)}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-14 h-18 border rounded-md overflow-hidden transition-all bg-white ${selectedImage === idx
                        ? 'border-yellow-500 shadow-md ring-1 ring-yellow-500'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <img
                        src={img || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4='}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-contain p-0.5"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image - Right Side */}
              <div className="flex-1 flex justify-center items-center bg-white rounded-lg border border-gray-100 h-full relative group cursor-crosshair">
                <img
                  src={images[selectedImage] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4='}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-opacity duration-200 p-4"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Product Details - Middle Column */}
          <div className="lg:col-span-2 flex flex-col gap-4 px-2">
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-4 text-sm">
              <Link href="#reviews" className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                {renderStars(product.rating || 0)}
                <span className="text-blue-600 ml-1 font-medium">{product.numReviews || 0} ratings</span>
              </Link>
            </div>

            <div className="border-t border-gray-200 my-1"></div>

            <div className="flex flex-col gap-2">
              <div>
                <span className="text-3xl font-medium text-gray-900"><sup className="text-sm top-[-0.5rem]">₹</sup>{formatCurrencyWithCommas(product.price).replace('₹', '')}</span>
              </div>
              <div className="text-sm text-gray-600">
                Inclusive of all taxes
              </div>
            </div>

            {/* Offers / Icons placeholder could go here */}

            <div className="border-t border-gray-200 my-2"></div>

            {product.brand && (
              <div className="text-sm flex gap-4">
                <span className="font-bold w-24">Brand</span>
                <span>{product.brand}</span>
              </div>
            )}

            {product.category && (
              <div className="text-sm flex gap-4">
                <span className="font-bold w-24">Category</span>
                <span>{product.category}</span>
              </div>
            )}

            <div className="border-t border-gray-200 my-2"></div>

            <div className="text-sm text-gray-900">
              <h3 className="font-bold mb-2 text-base">About this item</h3>
              <ul className="list-disc pl-5 space-y-1">
                {/* Split description into list items if possible, else show paragraph */}
                {product.description.split('. ').map((desc: string, i: number) => (
                  desc.trim() && <li key={i}>{desc.trim()}.</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Buy Box - Right Column */}
          <div className="lg:col-span-1">
            <div className="border border-gray-300 rounded-lg p-5 shadow-sm bg-white sticky top-4">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl md:text-3xl font-bold text-red-700">{formatCurrencyWithCommas(product.price)}</span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {product.stock_quantity > 10 ? (
                  <span><span className="text-green-700 font-semibold">FREE delivery</span> <span className="font-bold">Tomorrow</span>.</span>
                ) : product.stock_quantity > 0 ? (
                  <span>Only <span className="font-bold text-orange-600">{product.stock_quantity}</span> left in stock - order soon.</span>
                ) : (
                  <span><span className="text-red-600 font-semibold">Currently unavailable</span></span>
                )}
              </div>

              {product.stock_quantity > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-bold text-gray-900 block mb-2">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full border border-gray-400 rounded px-2 py-1 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                  >
                    {[...Array(Math.min(product.stock_quantity, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 transition-all duration-200 active:scale-95"
                >
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock_quantity === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 active:scale-95"
                >
                  Buy Now
                </button>
              </div>

              <div className="border-t border-gray-300 my-3"></div>

              <button
                onClick={toggleWishlist}
                className="w-full border border-gray-300 rounded-md py-1.5 px-4 text-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Heart className={`w-4 h-4 transition-all ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                {isInWishlist ? 'In Wishlist' : 'Add to Wish List'}
              </button>

              <div className="mt-4 text-xs text-gray-600 space-y-1">
                <p className="flex justify-between"><span>Ships from</span> <span>Amazon</span></p>
                <p className="flex justify-between"><span>Sold by</span> <span>Amazon</span></p>
                <p className="text-blue-600 hover:text-orange-600 hover:underline cursor-pointer transition-colors pt-2">Add a gift receipt</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
