'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useNotification } from '@/hooks/useNotification';
import { formatCurrencyWithCommas } from '@/lib/currency';
import { cartApi } from '@/lib/api';

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const { showNotification, NotificationComponent } = useNotification();

  // Fetch cart
  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart();
      const items = data.cart || [];
      const formattedItems = items.map((item: any) => ({
        ...item,
        // Ensure product fields are top-level if needed, or structured as backend returns
        // Backend returns join result: c.*, p.name, p.price...
        // So item has name, price directly.
        _id: item.product_id, // Local logic often uses product id as key
        id: item.id // Cart item id
      }));
      setCart({ items: formattedItems });

      // Select all by default if first load or logic dictates
      const itemIds = formattedItems.map((item: any) => String(item._id));
      if (selectedItemIds.length === 0 && itemIds.length > 0) {
        setSelectedItemIds(itemIds);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemIndex: number, quantity: number) => {
    try {
      const item = cart?.items[itemIndex];
      if (!item) return;

      if (quantity <= 0) {
        await cartApi.removeFromCart(item.id); // Use cart item ID
        showNotification('Item removed from cart', 'success');
      } else {
        await cartApi.updateQuantity(item.id, quantity);
        showNotification('Cart updated', 'success');
      }
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err: any) {
      showNotification('Failed to update cart', 'error');
    }
  };

  const removeItem = async (itemIndex: number) => {
    try {
      const item = cart?.items[itemIndex];
      if (!item) return;

      await cartApi.removeFromCart(item.id);

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

    // Listen for cart updates
    const handleCartUpdate = () => fetchCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
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
    return acc + (item.price * (item.quantity || 0));
  }, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {NotificationComponent}
      <Header cartCount={totalItems} onSearch={() => { }} />

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
              const productId = item._id;
              const productName = item.name;
              const productPrice = item.price;
              const productImage = item.images && item.images.length > 0
                ? item.images[0]
                : 'https://via.placeholder.com/150?text=No+Image';
              const selectionKey = String(productId);

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
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${productId}`}
                      className="text-base md:text-xl font-medium text-black hover:text-[#c45500] hover:underline line-clamp-2"
                    >
                      {productName}
                    </Link>
                    <div className={`text-xs mt-1 font-medium ${item.stock_quantity > 0 ? 'text-[#007600]' : 'text-[#B12704]'}`}>
                      {item.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-[#565959]">
                      <img src="https://m.media-amazon.com/images/G/31/marketing/prime/Prime_icon_pixel._CB485936814_.gif" alt="Prime" className="h-4" />
                      <span>Eligible for FREE Shipping</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[#D5D9D9] rounded-md shadow-sm bg-[#F0F2F2] hover:bg-[#E3E6E6]">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="px-3 py-1 text-black font-medium transition-colors border-r border-[#D5D9D9]"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 min-w-[3rem] text-center font-medium bg-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="px-3 py-1 text-black font-medium transition-colors border-l border-[#D5D9D9] disabled:opacity-50"
                            disabled={item.quantity >= 10}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 border-l border-[#D5D9D9] pl-4 ml-1">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-[#007185] hover:text-[#c45500] hover:underline text-xs bg-transparent"
                        >
                          Delete
                        </button>
                        <span className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer text-xs">
                          Save for later
                        </span>
                        <span className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer text-xs">
                          See more like this
                        </span>
                      </div>
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
