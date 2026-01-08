'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import FixedCartSidebar from '@/components/FixedCartSidebar';
import { useNotification } from '@/hooks/useNotification';
import { useAmazonToast } from '@/hooks/useAmazonToast';
import { useCartSidebar } from '@/hooks/useCartSidebar';
import { getAllProducts } from '@/lib/dummyProducts';
import { productApi } from '@/lib/api';

interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock_quantity?: number;
  rating?: number;
  numReviews?: number;
  brand?: string;
  specifications?: Record<string, string | undefined>;
  [key: string]: any; // Allow additional properties for flexibility
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('q') || '');
  const [category, setCategory] = useState(searchParams?.get('category') || 'All');
  const { showNotification, NotificationComponent } = useNotification();
  const { showToast, ToastComponent } = useAmazonToast();
  const { showCartSidebar, CartSidebarComponent } = useCartSidebar();

  // Fallback function using dummy products
  const getFallbackProducts = useCallback((search = '', cat = 'All') => {
    const allProducts = getAllProducts();
    let filtered = allProducts;

    // Filter by category
    if (cat && cat !== 'All') {
      filtered = filtered.filter(p => p.category === cat);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, []);

  // Fetch products from backend API with fallback to dummy data
  const fetchProducts = useCallback(async (search = '', cat = 'All') => {
    setLoading(true);
    try {
      // Try to fetch from backend API
      const apiProducts = await productApi.getProducts(search, cat);
      if (apiProducts && apiProducts.length > 0) {
        setProducts(apiProducts);
      } else {
        // Fallback to dummy data
        const filteredProducts = getFallbackProducts(search, cat);
        setProducts(filteredProducts);
      }
    } catch (error) {
      // If API fails, use dummy data
      const filteredProducts = getFallbackProducts(search, cat);
      setProducts(filteredProducts);
    } finally {
      setLoading(false);
    }
  }, [getFallbackProducts]);


  // Use local storage for cart
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

  // Add to cart using local storage
  const handleAddToCart = (product: any) => {
    try {
      const cartData = localStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : { items: [] };
      
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex((item: any) => item.product._id === product._id);
      
      if (existingItemIndex >= 0) {
        // Increase quantity
        cart.items[existingItemIndex].quantity += 1;
      } else {
        // Add new item
        cart.items.push({
          _id: `item-${Date.now()}-${Math.random()}`,
          product: product,
          quantity: 1
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      fetchCart();
      // Dispatch event for cart update
      window.dispatchEvent(new Event('cartUpdated'));
      showToast('Added to Cart');
    } catch (err: any) {
      showNotification('Failed to add to cart', 'error');
    }
  };

  const handleSearch = (search: string, cat: string) => {
    setSearchTerm(search);
    setCategory(cat);
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (cat && cat !== 'All') params.set('category', cat);
    
    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    router.push(newUrl, { scroll: false });
    
    fetchProducts(search, cat);
  };

  useEffect(() => {
    // Sync state with URL params whenever they change
    const urlSearch = searchParams?.get('q') || '';
    const urlCategory = searchParams?.get('category') || 'All';
    
    setSearchTerm(urlSearch);
    setCategory(urlCategory);
    fetchProducts(urlSearch, urlCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.get('q'), searchParams?.get('category')]);

  useEffect(() => {
    fetchCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {NotificationComponent}
      {ToastComponent}
      <Header cartCount={cartCount} onSearch={handleSearch} />
      
      <div className="flex relative">
        {/* Let the whole page scroll instead of only the main area */}
        <main className="flex-1">
          <div className="max-w-screen-2xl mx-auto pt-4">
        {/* Hero Banner */}
        <div className="relative w-full h-48 md:h-64 mb-2 overflow-hidden">
           <img 
             src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80" 
             alt="Banner" 
             className="w-full h-full object-cover"
           />
           <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none"></div>
        </div>

        {/* Category Buttons */}
        <div className="relative px-4 md:px-6 pb-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
            {category !== 'All' && (
              <button
                onClick={() => {
                  setCategory('All');
                  setSearchTerm('');
                  fetchProducts('', 'All');
                }}
                className="text-blue-600 hover:text-orange-600 hover:underline text-sm font-medium"
              >
                View All Products
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 w-full">
            <button
              onClick={() => {
                setCategory('Electronics');
                setSearchTerm('');
                fetchProducts('', 'Electronics');
              }}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 h-full ${
                category === 'Electronics' ? 'border-yellow-500 shadow-lg' : 'border-transparent'
              }`}
            >
              <div className="relative h-32 md:h-40 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80" 
                  alt="Electronics" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="text-white font-bold text-lg md:text-xl mb-1">Electronics</h3>
                  <p className="text-white/90 text-sm md:text-base">Shop Now →</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setCategory('Clothing');
                setSearchTerm('');
                fetchProducts('', 'Clothing');
              }}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 h-full ${
                category === 'Clothing' ? 'border-yellow-500 shadow-lg' : 'border-transparent'
              }`}
            >
              <div className="relative h-32 md:h-40 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80" 
                  alt="Clothing" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="text-white font-bold text-lg md:text-xl mb-1">Clothing</h3>
                  <p className="text-white/90 text-sm md:text-base">Shop Now →</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setCategory('Home & Kitchen');
                setSearchTerm('');
                fetchProducts('', 'Home & Kitchen');
              }}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 h-full ${
                category === 'Home & Kitchen' ? 'border-yellow-500 shadow-lg' : 'border-transparent'
              }`}
            >
              <div className="relative h-32 md:h-40 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80" 
                  alt="Home & Kitchen" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="text-white font-bold text-lg md:text-xl mb-1">Home & Kitchen</h3>
                  <p className="text-white/90 text-sm md:text-base">Shop Now →</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Product Grid - Scrollable */}
        <div className="relative px-4 pb-10 pt-4">
          {(category !== 'All' || searchTerm) && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              {searchTerm && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Search results for:</span>
                  <span className="font-bold text-gray-900">&quot;{searchTerm}&quot;</span>
                </div>
              )}
              {category !== 'All' && (
                <div className="flex items-center gap-2">
                  {searchTerm && <span className="text-gray-400">•</span>}
                  <span className="text-gray-600">Category:</span>
                  <span className="font-bold text-gray-900">{category}</span>
                </div>
              )}
              <span className="text-gray-600 ml-auto">
                {products.length} {products.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                {searchTerm 
                  ? `No products found for "${searchTerm}"${category !== 'All' ? ` in ${category}` : ''}`
                  : `No products found in ${category}`
                }
              </p>
              <button
                onClick={() => {
                  setCategory('All');
                  setSearchTerm('');
                  router.push('/', { scroll: false });
                  fetchProducts('', 'All');
                }}
                className="mt-4 text-blue-600 hover:underline"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </div>
          )}
        </div>
          </div>
      </main>
      
      {/* Fixed Cart Sidebar */}
      <FixedCartSidebar />
      </div>
      
      {/* Amazon-style basic footer */}
      <footer className="bg-[#232F3E] text-white mt-8">
        {/* Back to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full bg-[#37475A] py-3 text-sm hover:bg-[#485769] transition-colors"
        >
          Back to top
        </button>

        {/* Link sections */}
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-bold mb-2">Get to Know Us</h3>
            <ul className="space-y-1 text-gray-200">
              <li className="hover:underline cursor-pointer">About Us</li>
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Press Releases</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Connect with Us</h3>
            <ul className="space-y-1 text-gray-200">
              <li className="hover:underline cursor-pointer">Facebook</li>
              <li className="hover:underline cursor-pointer">Twitter</li>
              <li className="hover:underline cursor-pointer">Instagram</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Make Money with Us</h3>
            <ul className="space-y-1 text-gray-200">
              <li className="hover:underline cursor-pointer">Sell on Amazon</li>
              <li className="hover:underline cursor-pointer">Advertise Your Products</li>
              <li className="hover:underline cursor-pointer">Affiliate Program</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Let Us Help You</h3>
            <ul className="space-y-1 text-gray-200">
              <li className="hover:underline cursor-pointer">Your Account</li>
              <li className="hover:underline cursor-pointer">Returns Centre</li>
              <li className="hover:underline cursor-pointer">Help</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright strip */}
        <div className="bg-[#131A22] py-4 text-xs text-gray-300 text-center">
          © 1996-2024, Amazon.com, Inc. or its affiliates
        </div>
      </footer>
    </div>
  );
}
