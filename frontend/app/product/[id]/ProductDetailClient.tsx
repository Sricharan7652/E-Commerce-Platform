'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { formatCurrencyWithCommas } from '@/lib/currency';
import { useAmazonToast } from '@/hooks/useAmazonToast';
import { useCartSidebar } from '@/hooks/useCartSidebar';
import { productApi } from '@/lib/api';

export default function ProductDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter();
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
      const productId = params.id as string;
      const response = await productApi.getProductById(productId);
      if (response && response.product) {
        setProduct(response.product);
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Use localStorage for cart
  const fetchCart = () => {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        const count = cart.items?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0;
        setCartCount(count);
      } else {
        setCartCount(0);
      }
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

  // Add to cart using localStorage
  const handleAddToCart = () => {
    if (!product) return;
    try {
      const cartData = localStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : { items: [] };
      
      const existingItemIndex = cart.items.findIndex((item: any) => item.product._id === product._id);
      
      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({
          _id: `item-${Date.now()}-${Math.random()}`,
          product: product,
          quantity: quantity
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      fetchCart();
      showToast('Added to Cart');
      showCartSidebar(); // Show cart sidebar
    } catch (err: any) {
      showNotification('Failed to add to cart', 'error');
    }
  };

  // Buy now - add to cart and go to checkout
  const handleBuyNow = () => {
    if (!product) return;
    try {
      const cartData = localStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : { items: [] };
      
      const existingItemIndex = cart.items.findIndex((item: any) => item.product._id === product._id);
      
      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({
          _id: `item-${Date.now()}-${Math.random()}`,
          product: product,
          quantity: quantity
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      fetchCart();
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
      fetchCart();
      checkWishlist();
      
      // Listen for cart and wishlist updates
      const handleCartUpdate = () => {
        fetchCart();
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
      <Header cartCount={cartCount} onSearch={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Carousel */}
          <div className="lg:w-2/5">
            <div className="flex flex-col gap-4">
              {/* Main Image */}
              <div className="flex justify-center items-center bg-white p-8 rounded-lg border border-gray-200 shadow-sm min-h-[400px]">
                <img 
                  src={images[selectedImage]} 
                  alt={product.name} 
                  className="max-h-96 w-full object-contain transition-opacity duration-200"
                  loading="eager"
                />
              </div>
              
              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 border-2 rounded overflow-hidden transition-all ${
                        selectedImage === idx 
                          ? 'border-yellow-500 shadow-md scale-105' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} ${idx + 1}`} 
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-2/5 flex flex-col gap-4">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4">
              {renderStars(product.rating || 0)}
              <Link href="#reviews" className="text-blue-600 hover:text-orange-600 hover:underline text-sm transition-colors">
                {product.numReviews || 0} ratings
              </Link>
            </div>

            <hr className="my-2 border-gray-300" />

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Price:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-red-700">{formatCurrencyWithCommas(product.price)}</span>
              </div>
            </div>

            {product.brand && (
              <div className="text-sm">
                <span className="font-bold">Brand:</span> {product.brand}
              </div>
            )}

            <div className="text-sm text-gray-600">
              <span className="font-bold">About this item:</span>
              <p className="mt-2 whitespace-pre-line">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Specifications:</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex">
                      <span className="font-medium w-32">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-700' : 'text-red-600'}`}>
              {product.stock_quantity > 0 
                ? `In Stock (${product.stock_quantity} available)` 
                : 'Out of Stock'}
            </div>
          </div>

          {/* Buy Box */}
          <div className="lg:w-1/5 border border-gray-300 rounded-lg p-6 h-fit shadow-md bg-white">
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl md:text-3xl font-bold text-red-700">{formatCurrencyWithCommas(product.price)}</span>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              {product.stock_quantity > 10 ? (
                <><span className="text-green-700 font-semibold">FREE delivery</span> <span className="font-bold">Tomorrow</span>.</>
              ) : product.stock_quantity > 0 ? (
                <>Only <span className="font-bold text-orange-600">{product.stock_quantity}</span> left in stock - order soon.</>
              ) : (
                <><span className="text-red-600 font-semibold">Currently unavailable</span></>
              )}
            </div>

            {product.stock_quantity > 0 && (
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-900 block mb-2">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full border border-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                >
                  {[...Array(Math.min(product.stock_quantity, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            <button 
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md py-2.5 mb-2 text-sm font-medium shadow-sm border border-yellow-600 transition-all duration-200 active:scale-95"
            >
              Add to Cart
            </button>
            
            <button 
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0}
              className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md py-2.5 text-sm font-medium shadow-sm transition-all duration-200 active:scale-95"
            >
              Buy Now
            </button>

            <div className="border-t border-gray-300 my-3"></div>

            <button
              onClick={toggleWishlist}
              className="w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Heart className={`w-4 h-4 transition-all ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              {isInWishlist ? 'In Wishlist' : 'Add to Wish List'}
            </button>

            <div className="mt-4 text-xs text-gray-600 space-y-1">
              <p className="font-medium">Ships from Amazon</p>
              <p className="font-medium">Sold by Amazon</p>
              <p className="text-blue-600 hover:text-orange-600 hover:underline cursor-pointer transition-colors">Add a gift receipt</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
