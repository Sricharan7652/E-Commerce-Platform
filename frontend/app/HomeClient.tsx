'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HeaderWithSuspense from '@/components/HeaderWithSuspense';
import HeroCarousel from '@/components/HeroCarousel';
import ProductCard from '@/components/ProductCard';
import FixedCartSidebar from '@/components/FixedCartSidebar';
import { useNotification } from '@/hooks/useNotification';
import { useAmazonToast } from '@/hooks/useAmazonToast';
import { useCartSidebar } from '@/hooks/useCartSidebar';
import { productApi, cartApi, wishlistApi } from '@/lib/api';

interface Product {
  _id?: string;
  id?: string | number;
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

export default function HomeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const { showNotification, NotificationComponent } = useNotification();
  const { showToast, ToastComponent } = useAmazonToast();
  const { showCartSidebar, CartSidebarComponent } = useCartSidebar();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    try {
      const data = await wishlistApi.getWishlist();
      const ids = data.wishlist?.map((item: any) => String(item.product_id)) || [];
      setWishlistIds(ids);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  }, []);

  // Fetch products, categories, and wishlist
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productApi.getProducts(),
          productApi.getCategories()
        ]);

        if (productsData) setProducts(productsData);
        if (categoriesData) setCategories(categoriesData);
        fetchWishlist();
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to empty state
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for wishlist updates
    const handleWishlistUpdate = () => fetchWishlist();
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [fetchWishlist]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      const data = await cartApi.getCart();
      const rawItems = data.cart || [];
      // Format items for UI consistency (price as number, product_id mapped)
      const items = rawItems.map((item: any) => ({
        ...item,
        _id: item.product_id, // For product links
        price: Number(item.price) || 0,
        id: item.id // Cart item ID
      }));

      setCartItems(items);
      const count = items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      setCartCount(count);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCartCount(0);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    fetchCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => fetchCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [fetchCart]);

  // Sync search term and category from URL params
  useEffect(() => {
    const urlSearch = searchParams?.get('q') || '';
    const urlCategory = searchParams?.get('category') || 'All';
    setSearchTerm(urlSearch);
    setCategory(urlCategory);
  }, [searchParams]);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(product =>
        product.category === category
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, category]);

  const handleAddToCart = async (product: Product) => {
    try {
      const productId = String(product._id || product.id || '');
      await cartApi.addToCart(productId, 1);

      // Update local state immediately for responsiveness
      await fetchCart();

      // Show success message
      showToast('Added to Cart');
      showCartSidebar();

      // Dispatch event to update other components
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add item to cart. Make sure backend is running.', 'error');
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      // Find cart item ID
      const item = cartItems.find((item: any) => item.product_id === productId || item._id === productId);
      if (!item) return;

      if (quantity <= 0) {
        await cartApi.removeFromCart(item.id || item._id); // DB cart item id
      } else {
        await cartApi.updateQuantity(item.id || item._id, quantity);
      }

      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    handleUpdateQuantity(productId, 0);
  };

  const getProductQuantity = (productId: string) => {
    const item = cartItems.find((item: any) => item.product_id === productId || item._id === productId);
    return item ? item.quantity : 0;
  };

  const handleSearch = useCallback((searchTerm: string, category: string) => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (category && category !== 'All') params.set('category', category);

    const query = params.toString();
    router.push(query ? `/?${query}` : '/');
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {NotificationComponent}
      {ToastComponent}
      {CartSidebarComponent}
      <HeaderWithSuspense cartCount={cartCount} onSearch={handleSearch} />

      <div className="min-h-screen bg-gray-100 font-sans">
        {/* Full Width Carousel */}
        <div className="pt-[10px]">
          <HeroCarousel />
        </div>

        <main className="max-w-[1500px] mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left Side: Product Grid */}
            <div className="flex-1 w-full lg:min-w-0">
              {/* Results Summary */}
              <div className="mb-4 pb-4 border-b border-gray-200 bg-white p-4 rounded-t-md shadow-sm">
                <h1 className="text-xl font-bold text-gray-900">
                  {searchTerm || category !== 'All' ? 'Search Results' : 'Related to items you\'ve viewed'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id || product._id || Math.random().toString()}
                      product={{
                        ...product,
                        rating: product.rating || 0,
                        numReviews: product.numReviews || 0,
                        stock_quantity: product.stock_quantity || 0
                      }}
                      isInWishlist={wishlistIds.includes(String(product._id || product.id || ''))}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveFromCart={handleRemoveFromCart}
                      initialQuantity={getProductQuantity(product._id || '')}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-lg mb-4">No products found</div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategory('All');
                      router.push('/');
                    }}
                    className="text-blue-600 hover:text-orange-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Right Side: Fixed Cart Sidebar */}
            {cartCount > 0 && (
              <div className="hidden lg:block w-80 flex-shrink-0">
                <FixedCartSidebar items={cartItems} />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
