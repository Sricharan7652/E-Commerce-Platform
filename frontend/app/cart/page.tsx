'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useNotification } from '@/hooks/useNotification';
import { formatCurrencyWithCommas } from '@/lib/currency';

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const { showNotification, NotificationComponent } = useNotification();

  // Use local storage for cart
  const fetchCart = () => {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const parsed = JSON.parse(cartData);
        setCart(parsed);
        const items = parsed?.items || [];
        setSelectedItemIds(
          items.map((item: any, idx: number) => (item._id ? String(item._id) : String(idx)))
        );
      } else {
        setCart({ items: [] });
        setSelectedItemIds([]);
      }
    } catch (err) {
      setCart({ items: [] });
      setSelectedItemIds([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemIndex: number, quantity: number) => {
    try {
      const cartData = localStorage.getItem('cart');
      if (!cartData) return;

      let updatedCart = JSON.parse(cartData);

      if (!Array.isArray(updatedCart.items)) {
        updatedCart.items = [];
      }

      if (itemIndex < 0 || itemIndex >= updatedCart.items.length) return;

      if (quantity <= 0) {
        updatedCart.items.splice(itemIndex, 1);
        showNotification('Item removed from cart', 'success');
      } else {
        updatedCart.items[itemIndex].quantity = quantity;
        showNotification('Cart updated', 'success');
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
      fetchCart();
    } catch (err: any) {
      showNotification('Failed to update cart', 'error');
    }
  };

  const removeItem = (itemIndex: number) => {
    try {
      const cartData = localStorage.getItem('cart');
      if (!cartData) return;

      let updatedCart = JSON.parse(cartData);

      if (!Array.isArray(updatedCart.items)) {
        updatedCart.items = [];
      }

      if (itemIndex < 0 || itemIndex >= updatedCart.items.length) return;

      updatedCart.items.splice(itemIndex, 1);

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
      showNotification('Item removed from cart', 'success');
      fetchCart();
    } catch (err: any) {
      showNotification('Failed to remove item', 'error');
    }
  };

  const handleToggleItemSelection = (selectionKey: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(selectionKey)
        ? prev.filter((id) => id !== selectionKey)
        : [...prev, selectionKey]
    );
  };

  const handleDeselectAll = () => {
    setSelectedItemIds([]);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const selectedItems = cartItems.filter((item: any, idx: number) => {
    const key = item._id ? String(item._id) : String(idx);
    return selectedItemIds.length === 0 ? false : selectedItemIds.includes(key);
  });
  const itemsForTotals = selectedItemIds.length ? selectedItems : cartItems;

  const totalItems = itemsForTotals.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
  const subtotal = itemsForTotals.reduce((acc: number, item: any) => {
    const product = item.product;
    const price = product && typeof product === 'object' && product !== null ? product.price : 0;
    return acc + (price * (item.quantity || 0));
  }, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {NotificationComponent}
      <Header cartCount={totalItems} onSearch={() => {}} />

      <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Cart Items */}
        <div className="md:w-3/4 bg-white p-6 shadow-sm rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900">Shopping Cart</h1>
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-sm text-blue-600 cursor-pointer hover:text-orange-600 hover:underline transition-colors"
              >
                Deselect all items
              </button>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="text-right text-sm text-gray-500 border-b pb-2 mb-4 font-medium">Price</div>
          )}

          {cartItems.length === 0 ? (
            <div className="py-12 text-center">
              <h2 className="text-2xl font-medium mb-2">Your Amazon Cart is empty</h2>
              <Link href="/" className="text-blue-600 hover:underline">
                Shop today's deals
              </Link>
            </div>
          ) : (
            cartItems.map((item: any, index: number) => {
              const product = item.product;
              const isProductObject = product && typeof product === 'object' && product !== null;
              const productId = isProductObject ? product._id : product;
              const productName = isProductObject ? product.name : 'Product';
              const productPrice = isProductObject ? product.price : 0;
              const productImage = isProductObject && product.images && product.images.length > 0
                ? product.images[0]
                : 'https://via.placeholder.com/150?text=No+Image';
              const selectionKey = item._id ? String(item._id) : String(index);

              return (

                <div key={selectionKey} className="flex gap-4 py-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500 mt-1"
                      checked={selectedItemIds.includes(selectionKey)}
                      onChange={() => handleToggleItemSelection(selectionKey)}
                    />
                    <div className="w-24 h-24 flex-shrink-0 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                      <img 
                        src={productImage} 
                        alt={productName} 
                        className="w-full h-full object-contain" 
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/product/${productId}`} 
                      className="text-base md:text-lg font-medium text-blue-700 hover:text-orange-600 hover:underline transition-colors line-clamp-2"
                    >
                      {productName}
                    </Link>
                    <div className={`text-xs mt-1 font-medium ${isProductObject && product.stock_quantity > 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {isProductObject && product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Qty:</label>
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 min-w-[3rem] text-center border-x border-gray-300 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 text-gray-700 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity >= 10}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-blue-600 hover:text-red-600 hover:underline font-medium transition-colors"
                      >
                        Delete
                      </button>
                      <span className="text-blue-600 hover:text-orange-600 hover:underline cursor-pointer transition-colors">
                        Save for later
                      </span>
                    </div>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap">
                    {formatCurrencyWithCommas(productPrice)}
                  </div>
                </div>
              );
            })
          )}

          {cartItems.length > 0 && (
            <div className="text-right pt-4 border-t mt-4">
              <span className="text-lg">
                Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'}): 
                <span className="font-bold"> {formatCurrencyWithCommas(subtotal)}</span>
              </span>
            </div>
          )}
        </div>

        {/* Checkout Sidebar */}
        {cartItems.length > 0 && (
          <div className="md:w-1/4 bg-white p-6 shadow-sm rounded-lg border border-gray-200 h-fit sticky top-4">
            <div className="text-base mb-4">
              <span className="text-gray-700">Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'}):</span>
              <span className="font-bold text-gray-900 ml-2"> {formatCurrencyWithCommas(subtotal)}</span>
            </div>
            <div className="text-sm text-gray-600 mb-4 space-y-1">
              <p className="flex justify-between">
                <span>Shipping & handling:</span>
                <span className="font-medium">{shipping === 0 ? 'FREE' : formatCurrencyWithCommas(shipping)}</span>
              </p>
              <p className="flex justify-between">
                <span>Tax:</span>
                <span className="font-medium">{formatCurrencyWithCommas(tax)}</span>
              </p>
            </div>
            <div className="border-t border-gray-300 pt-4 mb-4">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Order total:</span>
                <span className="text-red-700">{formatCurrencyWithCommas(total)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4 text-sm">
              <input type="checkbox" className="rounded text-yellow-500 focus:ring-yellow-500" /> 
              <span className="text-gray-700">This order contains a gift</span>
            </div>
            <Link href="/checkout">
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 rounded-md py-2.5 shadow-sm text-sm font-medium border border-yellow-600 transition-all duration-200 active:scale-95">
                Proceed to checkout
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
