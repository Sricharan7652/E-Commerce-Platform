'use client';
import { X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onCategoryClick: (category: string) => void;
}

export default function SideNav({ isOpen, onClose, categories, onCategoryClick }: SideNavProps) {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    onCategoryClick(category);
    onClose();
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - fully transparent so home stays visible while menu is open */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Side Navigation */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-10 bg-opacity-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <div>
              <p className="text-sm font-bold">Hello, Sign in</p>
              <p className="text-xs text-gray-300">Account & Lists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 pt-6">
          {/* Trending Section - Now visible at top */}
          <div className="mb-6 mt-0">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Trending</h2>
            <div className="space-y-2">
              <Link href="/" onClick={onClose} className="block text-gray-700 hover:text-orange-600 py-1">
                Bestsellers
              </Link>
              <Link href="/" onClick={onClose} className="block text-gray-700 hover:text-orange-600 py-1">
                New Releases
              </Link>
              <Link href="/" onClick={onClose} className="block text-gray-700 hover:text-orange-600 py-1">
                Movers and Shakers
              </Link>
            </div>
          </div>

          {/* Digital Content and Devices */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Digital Content and Devices</h2>
            <div className="space-y-2">
              <button className="block w-full text-left text-gray-700 hover:text-orange-600 py-1 flex items-center justify-between">
                <span>Echo & Alexa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="block w-full text-left text-gray-700 hover:text-orange-600 py-1 flex items-center justify-between">
                <span>Fire TV</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="block w-full text-left text-gray-700 hover:text-orange-600 py-1 flex items-center justify-between">
                <span>Kindle E-Readers & eBooks</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="block w-full text-left text-gray-700 hover:text-orange-600 py-1 flex items-center justify-between">
                <span>Audible Audiobooks</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="block w-full text-left text-gray-700 hover:text-orange-600 py-1 flex items-center justify-between">
                <span>Amazon Prime Video</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="block w-full text-left text-gray-700 hover:text-orange-600 py-1 flex items-center justify-between">
                <span>Amazon Prime Music</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shop by Category */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Shop by Category</h2>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="block w-full text-left text-gray-700 hover:text-orange-600 py-1 flex items-center justify-between"
                >
                  <span>{cat}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
              <button
                onClick={() => handleCategoryClick('All')}
                className="block w-full text-left text-gray-700 hover:text-orange-600 py-1 flex items-center justify-between"
              >
                <span>All Categories</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Additional Links */}
          <div className="border-t pt-4 mt-4">
            <Link href="/orders" onClick={onClose} className="block text-gray-700 hover:text-orange-600 py-2">
              Your Orders
            </Link>
            <Link href="/wishlist" onClick={onClose} className="block text-gray-700 hover:text-orange-600 py-2">
              Your Wishlist
            </Link>
            <Link href="/cart" onClick={onClose} className="block text-gray-700 hover:text-orange-600 py-2">
              Your Cart
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
