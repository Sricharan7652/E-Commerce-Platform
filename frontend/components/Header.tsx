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
      <header className="bg-[#131921] text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center pt-2 hover:outline hover:outline-1 hover:outline-white rounded-sm px-1 pb-1 transition-all">
            <span className="text-2xl font-bold tracking-tighter leading-none">amazon</span>
            <span className="text-xs self-start mt-1 text-gray-300 leading-none">.in</span>
          </Link>

          {/* Location (Dummy) - Hidden on mobile */}
          <div className="hidden lg:flex flex-col items-start hover:outline hover:outline-1 hover:outline-white rounded-sm px-2 py-1 cursor-pointer transition-all">
            <span className="text-xs text-gray-300 ml-3">Delivering to</span>
            <div className="flex items-center font-bold text-sm leading-none">
              <span className="transform -translate-x-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>
              Bengaluru 560001
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-3xl mx-2 h-10 bg-white focus-within:ring-2 focus-within:ring-[#febd69] rounded-md transition-shadow">
            <form onSubmit={handleSearch} className="flex w-full h-full rounded-md overflow-hidden text-black">
              <select
                className="bg-gray-100 text-gray-600 text-xs px-2 border-r border-gray-300 hover:bg-gray-200 focus:outline-none cursor-pointer w-auto max-w-[60px]"
                value={category}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  handleCategorySelect(newCategory);
                }}
              >
                <option value="All">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                className="flex-1 px-3 text-[15px] focus:outline-none h-full"
                placeholder="Search Amazon.in"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#febd69] hover:bg-[#f3a847] px-4 h-full flex items-center justify-center transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-800" />
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 text-sm">
            {/* Language (Dummy) */}
            <div className="hidden lg:flex items-center gap-1 font-bold px-2 py-2 hover:outline hover:outline-1 hover:outline-white rounded-sm cursor-pointer">
              <span className="text-white text-xs">EN</span>
            </div>

            {/* Account & Lists */}
            <Link href={isLoggedIn ? "/orders" : "/login"} className="hidden md:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm cursor-pointer">
              <p className="text-xs text-gray-200 leading-none">Hello, {user?.name || 'sign in'}</p>
              <p className="font-bold text-sm leading-none mt-0.5">Account & Lists</p>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden lg:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm cursor-pointer">
              <p className="text-xs text-gray-200 leading-none">Your</p>
              <p className="font-bold text-sm leading-none mt-0.5">Wishlist</p>
            </Link>

            {/* Returns & Orders */}
            <Link href="/orders" className="hidden md:block px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm cursor-pointer">
              <p className="text-xs text-gray-200 leading-none">Returns</p>
              <p className="font-bold text-sm leading-none mt-0.5">& Orders</p>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="flex items-end px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm cursor-pointer relative group">
              <div className="relative">
                <ShoppingCart className="w-8 h-8 -scale-x-100" />
                <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-[#f08804] text-base font-bold">
                  {localCartCount}
                </span>
              </div>
              <span className="font-bold text-sm mb-0.5 hidden md:inline">Cart</span>
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
