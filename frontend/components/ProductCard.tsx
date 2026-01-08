'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrencyWithCommas } from '@/lib/currency';

interface Product {
  _id: string;
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
  onAddToCart: (product: Product) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveFromCart?: (productId: string) => void;
  initialQuantity?: number;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  initialQuantity = 0 
}: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    checkWishlist();
  }, []);

  useEffect(() => {
    // Update quantity when cart changes
    const handleCartUpdate = () => {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          const cart = JSON.parse(cartData);
          const item = cart.items.find((item: any) => item._id === product._id);
          setQuantity(item ? item.quantity : 0);
        }
      } catch (err) {
        // Silent error handling
      }
    };

    handleCartUpdate(); // Check on mount
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [product._id]);

  // Use localStorage for wishlist
  const checkWishlist = () => {
    try {
      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData) {
        const wishlist = JSON.parse(wishlistData);
        const productIds = wishlist.products.map((p: any) => 
          typeof p === 'string' ? p : p._id
        );
        setIsInWishlist(productIds.includes(product._id));
      } else {
        setIsInWishlist(false);
      }
    } catch (err) {
      setIsInWishlist(false);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const wishlistData = localStorage.getItem('wishlist');
      let wishlist = wishlistData ? JSON.parse(wishlistData) : { products: [] };
      
      if (isInWishlist) {
        // Remove from wishlist
        wishlist.products = wishlist.products.filter((p: any) => {
          const id = typeof p === 'string' ? p : p._id;
          return id !== product._id;
        });
        setIsInWishlist(false);
      } else {
        // Add to wishlist
        wishlist.products.push(product);
        setIsInWishlist(true);
      }
      
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      // Silent error handling
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setQuantity(1);
  };

  const handleIncreaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (onUpdateQuantity) {
      onUpdateQuantity(product._id, newQuantity);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (onUpdateQuantity) {
        onUpdateQuantity(product._id, newQuantity);
      }
    } else if (quantity === 1 && onRemoveFromCart) {
      onRemoveFromCart(product._id);
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
        href={`/product/${product._id}`} 
        className="flex-1 flex flex-col items-center justify-center p-4 bg-white mb-3 min-h-[200px] group/image"
      >
         <img 
           src={imageUrl} 
           alt={product.name} 
           className="max-h-48 w-full object-contain transition-transform duration-300 group-hover/image:scale-105"
           loading="lazy"
         />
      </Link>
      
      <div className="flex flex-col gap-1.5">
        <Link 
          href={`/product/${product._id}`} 
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
            disabled={product.stock_quantity === 0}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 mt-auto border border-yellow-600 shadow-sm transition-all duration-200 active:scale-95"
          >
            {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        )}
      </div>
    </div>
  );
}
