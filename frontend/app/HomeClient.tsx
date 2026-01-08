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

  const handleAddToCart = (product: Product) => {
    try {
      // Get current cart from localStorage
      const cartData = localStorage.getItem('cart');
      const cart = cartData ? JSON.parse(cartData) : { items: [] };
      
      // Check if product already exists in cart
      const existingItemIndex = cart.items.findIndex((item: any) => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if already in cart
        cart.items[existingItemIndex].quantity += 1;
      } else {
        // Add new item to cart
        cart.items.push({
          ...product,
          quantity: 1
        });
      }
      
      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart count
      const newCount = cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
      setCartCount(newCount);
      
      // Show success message
      showToast('Added to Cart');
      showCartSidebar();
      
      // Dispatch event to update other components
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add item to cart', 'error');
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    try {
      const cartData = localStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : { items: [] };
      
      const itemIndex = cart.items.findIndex((item: any) => item._id === productId);
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        const newCount = cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setCartCount(newCount);
        
        // Dispatch event to update other components
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    handleUpdateQuantity(productId, 0);
  };

  const getProductQuantity = (productId: string) => {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        const item = cart.items.find((item: any) => item._id === productId);
        return item ? item.quantity : 0;
      }
    } catch (error) {
      console.error('Error getting product quantity:', error);
    }
    return 0;
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

      <main className="max-w-7xl mx-auto px-4 py-8">
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
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                initialQuantity={getProductQuantity(product._id)}
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
