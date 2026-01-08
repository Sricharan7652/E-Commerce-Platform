'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HeaderWithSuspense from '@/components/HeaderWithSuspense';
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

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch from API first
        const [productsData, categoriesData] = await Promise.all([
          productApi.getProducts(),
          productApi.getCategories()
        ]);
        
        if (productsData && productsData.length > 0) {
          setProducts(productsData);
        } else {
          // Fallback to dummy data
          const dummyProducts = getAllProducts();
          setProducts(dummyProducts);
        }
        
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        } else {
          // Fallback to dummy categories
          const dummyCategories = ['Electronics', 'Clothing', 'Home & Kitchen'];
          setCategories(dummyCategories);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to dummy data
        const dummyProducts = getAllProducts();
        setProducts(dummyProducts);
        const dummyCategories = ['Electronics', 'Clothing', 'Home & Kitchen'];
        setCategories(dummyCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Fetch cart count
  useEffect(() => {
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

    fetchCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchTerm, category);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div className="md:w-48">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleSearch(searchTerm, category)}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 text-sm font-medium rounded-md shadow-sm transition-all duration-200 active:scale-95"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {searchTerm || category !== 'All' ? 'Search Results' : 'All Products'}
          </h1>
          <p className="text-sm text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  ...product,
                  rating: product.rating || 0,
                  numReviews: product.numReviews || 0,
                  stock_quantity: product.stock_quantity || 0
                }}
                onAddToCart={() => {
                  showToast('Added to Cart');
                  showCartSidebar();
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
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
      </main>
    </div>
  );
}
