'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, Menu, Heart, User } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import SideNav from './SideNav';
import { productApi } from '@/lib/api';

interface HeaderProps {
  cartCount: number;
  onSearch: (searchTerm: string, category: string) => void;
}

export default function Header({ cartCount, onSearch }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [localCartCount, setLocalCartCount] = useState(cartCount);

  useEffect(() => {
    // Sync search term and category from URL params
    const urlSearch = searchParams?.get('q') || '';
    const urlCategory = searchParams?.get('category') || 'All';
    setSearchTerm(urlSearch);
    setCategory(urlCategory);
    
    // Fetch categories from backend
    const fetchCategories = async () => {
      try {
        const cats = await productApi.getCategories();
        if (cats && cats.length > 0) {
          setCategories(cats);
        } else {
          // Fallback to dummy categories
          setCategories(['Electronics', 'Clothing', 'Home & Kitchen']);
        }
      } catch (err) {
        // Fallback to dummy categories if API fails
        setCategories(['Electronics', 'Clothing', 'Home & Kitchen']);
      }
    };
    
    fetchCategories();
    checkAuth();
    
    // Update local cart count from prop
    setLocalCartCount(cartCount);
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          const cart = JSON.parse(cartData);
          const count = cart.items?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0;
          setLocalCartCount(count);
        } else {
          setLocalCartCount(0);
        }
      } catch (err) {
        setLocalCartCount(0);
      }
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [cartCount]);

  // Check auth using localStorage only (no API)
  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setIsLoggedIn(true);
      }
    } catch (err) {
      // Silent error handling
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = searchTerm.trim();
    
    // Build URL with search params
    const params = new URLSearchParams();
    if (trimmedSearch) params.set('q', trimmedSearch);
    if (category && category !== 'All') params.set('category', category);
    
    const queryString = params.toString();
    const searchUrl = queryString ? `/?${queryString}` : '/';
    
    // Navigate to home page with search params
    router.push(searchUrl);
    
    // Also call the onSearch callback if provided (for current page updates)
    if (onSearch) {
      onSearch(trimmedSearch, category);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    
    // Build URL with search params
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    
    const queryString = params.toString();
    const searchUrl = queryString ? `/?${queryString}` : '/';
    
    // Navigate to home page with search params
    router.push(searchUrl);
    
    // Also call the onSearch callback if provided
    if (onSearch) {
      onSearch(searchTerm, selectedCategory);
    }
  };

  return (
    <>
      <SideNav 
        isOpen={isSideNavOpen} 
        onClose={() => setIsSideNavOpen(false)}
        categories={categories}
        onCategoryClick={handleCategorySelect}
      />
      <header className="bg-[#131921] text-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 hover:opacity-90 transition-opacity">
          <span className="text-2xl font-bold tracking-tighter">amazon</span>
          <span className="text-xs self-start mt-1 text-gray-400">.com</span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="flex w-full">
            <select 
              className="bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-l-md border-r border-gray-300 focus:outline-none h-10 cursor-pointer hover:bg-gray-200 transition-colors"
              value={category}
              onChange={(e) => {
                const newCategory = e.target.value;
                setCategory(newCategory);
                
                // Build URL with search params
                const params = new URLSearchParams();
                if (searchTerm.trim()) params.set('q', searchTerm.trim());
                if (newCategory && newCategory !== 'All') params.set('category', newCategory);
                
                const queryString = params.toString();
                const searchUrl = queryString ? `/?${queryString}` : '/';
                
                // Navigate to home page with search params
                router.push(searchUrl);
                
                // Also call the onSearch callback if provided
                if (onSearch) onSearch(searchTerm, newCategory);
              }}
            >
              <option value="All">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex-1 relative">
              <input 
                type="text" 
                className="w-full px-4 pr-10 text-gray-900 bg-white focus:outline-none h-10 border-0 focus:ring-2 focus:ring-yellow-500"
                placeholder="Search Amazon"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(e as any);
                  }
                }}
                style={{ color: '#000' }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    
                    // Build URL without search term
                    const params = new URLSearchParams();
                    if (category && category !== 'All') params.set('category', category);
                    
                    const queryString = params.toString();
                    const searchUrl = queryString ? `/?${queryString}` : '/';
                    
                    // Navigate to home page
                    router.push(searchUrl);
                    
                    // Also call the onSearch callback if provided
                    if (onSearch) onSearch('', category);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors p-1"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="bg-[#febd69] hover:bg-[#f3a847] px-4 rounded-r-md h-10 text-gray-900 transition-colors active:scale-95"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4 text-sm">
          {isLoggedIn ? (
            <>
              <div className="hidden md:block cursor-pointer relative group">
                <p className="text-xs text-gray-300">Hello, {user?.name || 'User'}</p>
                <p className="font-bold text-sm">Account & Lists</p>
                <div className="absolute top-full right-0 mt-2 w-56 bg-white text-gray-900 rounded shadow-xl hidden group-hover:block p-4 border border-gray-200 z-50">
                  <Link href="/orders" className="block py-2 hover:text-orange-600 transition-colors">Your Orders</Link>
                  <Link href="/wishlist" className="block py-2 hover:text-orange-600 transition-colors">Your Wishlist</Link>
                  <hr className="my-2 border-gray-200" />
                  <button onClick={handleLogout} className="block py-2 hover:text-orange-600 w-full text-left transition-colors">Sign Out</button>
                </div>
              </div>
            </>
          ) : (
            <Link href="/login" className="hidden md:block cursor-pointer hover:opacity-90 transition-opacity">
              <p className="text-xs text-gray-300">Hello, Sign in</p>
              <p className="font-bold text-sm">Account & Lists</p>
            </Link>
          )}
          
          <Link href="/orders" className="hidden md:block cursor-pointer hover:opacity-90 transition-opacity">
            <p className="text-xs text-gray-300">Returns</p>
            <p className="font-bold text-sm">& Orders</p>
          </Link>

          <Link href="/wishlist" className="hidden md:flex items-center gap-1 hover:opacity-90 transition-opacity">
            <Heart className="w-6 h-6" />
            <span className="font-bold mt-3 text-sm">Wishlist</span>
          </Link>

          <Link href="/cart" className="flex items-center gap-1 relative hover:opacity-90 transition-opacity">
            <div className="relative">
               <ShoppingCart className="w-8 h-8" />
               {localCartCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#febd69] text-[#131921] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                   {localCartCount}
                 </span>
               )}
            </div>
            <span className="font-bold mt-3 hidden md:inline text-sm">Cart</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-2">
        <form onSubmit={handleSearch} className="flex w-full">
          <div className="flex-1 relative">
            <input 
              type="text" 
              className="w-full px-3 pr-10 py-2 rounded-md text-gray-900 bg-white focus:outline-none"
              placeholder="Search Amazon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ color: '#000' }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  
                  // Build URL without search term
                  const params = new URLSearchParams();
                  if (category && category !== 'All') params.set('category', category);
                  
                  const queryString = params.toString();
                  const searchUrl = queryString ? `/?${queryString}` : '/';
                  
                  // Navigate to home page
                  router.push(searchUrl);
                  
                  // Also call the onSearch callback if provided
                  if (onSearch) onSearch('', category);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors p-1"
                title="Clear search"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sub-header */}
      <div className="bg-[#232f3e] text-white text-sm px-4 py-1.5 flex items-center gap-6 overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setIsSideNavOpen(prev => !prev)}
          className="flex items-center gap-1 font-bold hover:text-orange-400 transition-colors px-2 py-1 rounded hover:bg-[#37475a] active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" /> All
        </button>
        <Link href="/deals" className="cursor-pointer hover:underline whitespace-nowrap transition-colors">Today&apos;s Deals</Link>
        <Link href="/customer-service" className="cursor-pointer hover:underline whitespace-nowrap transition-colors">Customer Service</Link>
        <Link href="/registry" className="cursor-pointer hover:underline whitespace-nowrap transition-colors">Registry</Link>
        <Link href="/gift-cards" className="cursor-pointer hover:underline whitespace-nowrap transition-colors">Gift Cards</Link>
        <Link href="/sell" className="cursor-pointer hover:underline whitespace-nowrap transition-colors">Sell</Link>
      </div>
    </header>
    </>
  );
}
