'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrencyWithCommas } from '@/lib/currency';
import { wishlistApi } from '@/lib/api';

interface Product {
  id?: string | number;
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  rating: number;
  numReviews: number;
  stock_quantity: number;
  brand?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => Promise<void> | void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveFromCart?: (productId: string) => void;
  initialQuantity?: number;
  isInWishlist?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  initialQuantity = 0,
  isInWishlist: propIsInWishlist = false // Rename to avoid conflict with state variable if needed, or better: use state initialized from prop
}: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(propIsInWishlist);
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    setIsInWishlist(propIsInWishlist);
  }, [propIsInWishlist]);

  const productId = product.id || product._id || '';

  useEffect(() => {
    // Update quantity when cart changes
    const handleCartUpdate = () => {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          const cart = JSON.parse(cartData);
          const item = cart.items.find((item: any) => item.product_id === productId || item._id === productId || item.id === productId);
          setQuantity(item ? item.quantity : 0);
        }
      } catch (err) {
        // Silent error handling
      }
    };

    handleCartUpdate(); // Check on mount
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [productId]);

  // Wishlist logic
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWishlist) {
        await wishlistApi.removeFromWishlist(String(productId));
        setIsInWishlist(false);
      } else {
        await wishlistApi.addToWishlist(String(productId));
        setIsInWishlist(true);
      }
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    await onAddToCart(product);
    setQuantity(1);
    setTimeout(() => setIsAdding(false), 500); // Short delay for feedback
  };

  const handleIncreaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (onUpdateQuantity) {
      onUpdateQuantity(String(productId), newQuantity);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (onUpdateQuantity) {
        onUpdateQuantity(String(productId), newQuantity);
      }
    } else if (quantity === 1 && onRemoveFromCart) {
      onRemoveFromCart(String(productId));
      setQuantity(0);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center text-yellow-500 text-sm">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
        <span className="text-blue-500 ml-1 text-xs">({product.numReviews || 0})</span>
      </div>
    );
  };

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-md flex flex-col h-full hover:shadow-xl transition-all duration-200 relative group">
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={`w-4 h-4 transition-all ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`}
        />
      </button>

      <Link
        href={`/product/${productId}`}
        className="flex-1 flex flex-col items-center justify-center p-4 bg-white mb-3 min-h-[200px] group/image"
      >
        <img
          src={product.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4='}
          alt={product.name}
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
        <Link
          href={`/product/${productId}`}
          className="hover:text-orange-600 transition-colors"
        >
          <h2 className="font-medium line-clamp-2 text-sm md:text-base leading-tight text-gray-900 group-hover:text-orange-600">
            {product.name}
          </h2>
        </Link>

        {renderStars(product.rating || 0)}

        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg md:text-xl font-bold text-red-700">{formatCurrencyWithCommas(product.price)}</span>
        </div>

        {product.stock_quantity > 0 ? (
          <div className="text-xs text-gray-600 mb-2">
            {product.stock_quantity > 10 ? (
              <>FREE delivery <span className="font-semibold text-green-700">Tomorrow</span></>
            ) : (
              <>Only <span className="font-semibold text-orange-600">{product.stock_quantity}</span> left in stock</>
            )}
          </div>
        ) : (
          <div className="text-xs text-red-600 mb-2 font-semibold">Currently unavailable</div>
        )}

        {quantity > 0 ? (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={handleDecreaseQuantity}
                className="px-2 py-1 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-2 py-1 min-w-[2rem] text-center border-x border-gray-300 font-medium text-sm">
                {quantity}
              </span>
              <button
                onClick={handleIncreaseQuantity}
                className="px-2 py-1 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              onClick={handleDecreaseQuantity}
              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock_quantity === 0}
            className={`mt-auto rounded-md py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 border shadow-sm transition-all duration-200 active:scale-95 ${isAdding
                ? 'bg-yellow-200 text-gray-800 border-yellow-400 cursor-not-allowed'
                : product.stock_quantity === 0
                  ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500 border-yellow-600 text-gray-900'
              }`}
          >
            {isAdding
              ? 'Adding...'
              : product.stock_quantity === 0
                ? 'Out of Stock'
                : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
