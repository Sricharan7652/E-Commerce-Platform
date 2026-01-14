'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useNotification } from '@/hooks/useNotification';
import { formatCurrencyWithCommas } from '@/lib/currency';
import SignInPrompt from '@/components/SignInPrompt';
import { getBaseURL, cartApi, orderApi } from '@/lib/api';

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
  });
  const [cartCount, setCartCount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const { showNotification, NotificationComponent } = useNotification();

  // Fetch cart
  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart();
      const items = data.cart || [];
      const formattedItems = items.map((item: any) => ({
        ...item,
        _id: item.product_id, // Match frontend expected ID for product
        id: item.id, // Cart item ID
        // Backend returns joined fields directly on the item
        product: {
          _id: item.product_id,
          name: item.name,
          price: Number(item.price), // Ensure number
          images: item.images,
          stock_quantity: item.stock_quantity
        }
      }));
      setCart({ items: formattedItems });

      const count = formattedItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      setCartCount(count);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCart({ items: [] });
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // Default auth check - relying on backend default user
    setIsAuthenticated(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!address.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!address.address.trim()) newErrors.address = 'Address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state.trim()) newErrors.state = 'State is required';
    if (!address.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!address.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10,}$/.test(address.phone.replace(/\D/g, ''))) newErrors.phone = 'Please enter a valid phone number';
    if (!address.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification('Please fill in all required fields correctly', 'error');
      return;
    }

    await proceedWithOrder();
  };

  const proceedWithOrder = async () => {
    try {
      // Create order via API
      const response = await orderApi.placeOrder(address);
      const order = response.order;

      // Show success message
      showNotification('Order placed successfully!', 'success');

      // Dispatch cart update
      window.dispatchEvent(new Event('cartUpdated'));

      // Redirect to confirmation
      setTimeout(() => {
        router.push(`/order-confirmation?orderId=${order.id || order._id}`);
      }, 1000);

    } catch (err: any) {
      console.error('Failed to place order:', err);
      showNotification(err.response?.data?.message || 'Failed to place order', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const cartItems = cart?.items || [];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header cartCount={0} onSearch={() => { }} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
          <Link href="/" className="text-blue-600 hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc: number, item: any) => {
    const product = item.product;
    const price = product && typeof product === 'object' && product !== null ? product.price : 0;
    return acc + (price * (item.quantity || 0));
  }, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;
  const totalItems = cartItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {NotificationComponent}
      <SignInPrompt
        isOpen={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        redirectUrl="/checkout"
      />
      <Header cartCount={cartCount} onSearch={() => { }} />

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <form onSubmit={handlePlaceOrder}>
            {/* Address Section */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-900">Full name (First and Last name)</label>
                  <input
                    required
                    type="text"
                    className={`w-full border border-gray-400 p-2.5 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${errors.fullName ? 'border-red-500' : ''
                      }`}
                    value={address.fullName}
                    onChange={(e) => {
                      setAddress({ ...address, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Address</label>
                  <input
                    required
                    type="text"
                    placeholder="Street address or P.O. Box"
                    className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${errors.address ? 'border-red-500' : ''
                      }`}
                    value={address.address}
                    onChange={(e) => {
                      setAddress({ ...address, address: e.target.value });
                      if (errors.address) setErrors({ ...errors, address: '' });
                    }}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">City</label>
                    <input
                      required
                      type="text"
                      className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${errors.city ? 'border-red-500' : ''
                        }`}
                      value={address.city}
                      onChange={(e) => {
                        setAddress({ ...address, city: e.target.value });
                        if (errors.city) setErrors({ ...errors, city: '' });
                      }}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">State</label>
                    <input
                      required
                      type="text"
                      className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${errors.state ? 'border-red-500' : ''
                        }`}
                      value={address.state}
                      onChange={(e) => {
                        setAddress({ ...address, state: e.target.value });
                        if (errors.state) setErrors({ ...errors, state: '' });
                      }}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Zip Code</label>
                    <input
                      required
                      type="text"
                      className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${errors.zipCode ? 'border-red-500' : ''
                        }`}
                      value={address.zipCode}
                      onChange={(e) => {
                        setAddress({ ...address, zipCode: e.target.value });
                        if (errors.zipCode) setErrors({ ...errors, zipCode: '' });
                      }}
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${errors.phone ? 'border-red-500' : ''
                      }`}
                    value={address.phone}
                    onChange={(e) => {
                      setAddress({ ...address, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Country</label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500"
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Payment Section (Mock) */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Payment method</h2>
              <div className="ml-4">
                <p className="text-gray-900">Paying with <span className="font-bold">Visa ending in 1234</span></p>
                <p className="text-sm text-blue-600 hover:text-orange-600 hover:underline cursor-pointer mt-2 transition-colors">
                  Billing address: Same as shipping address
                </p>
                {!isAuthenticated && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <p className="text-sm text-gray-800 mb-2">
                      <span className="font-bold">Sign in for the best experience:</span>
                    </p>
                    <ul className="text-xs text-gray-700 list-disc list-inside mb-3 space-y-1">
                      <li>Track your orders easily</li>
                      <li>Faster checkout next time</li>
                      <li>Save multiple addresses</li>
                      <li>View order history</li>
                    </ul>
                    <Link
                      href={`/login?redirect=${encodeURIComponent('/checkout')}`}
                      className="text-sm text-blue-600 hover:text-orange-600 hover:underline font-medium transition-colors"
                    >
                      Sign in to your account →
                    </Link>
                    <p className="text-xs text-gray-600 mt-2">
                      You must sign in to place an order.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Items */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Review items and shipping</h2>
              <div className="space-y-4">
                {cartItems.map((item: any) => {
                  const product = item.product;
                  const isProductObject = product && typeof product === 'object' && product !== null;
                  const productName = isProductObject ? product.name : 'Product';
                  const productPrice = isProductObject ? product.price : 0;
                  const productImage = isProductObject && product.images && product.images.length > 0
                    ? product.images[0]
                    : 'https://via.placeholder.com/150?text=No+Image';
                  const productId = isProductObject ? product._id : null;
                  const maxQuantity = isProductObject ? Math.min(product.stock_quantity || 10, 10) : 10;

                  const handleQuantityChange = async (newQuantity: number) => {
                    if (newQuantity <= 0) {
                      handleRemoveFromCart(item.id); // Use cart item ID
                    } else {
                      try {
                        await cartApi.updateQuantity(item.id, newQuantity);
                        showNotification('Cart updated', 'success');
                        window.dispatchEvent(new Event('cartUpdated'));
                        fetchCart();
                      } catch (err: any) {
                        showNotification('Failed to update quantity', 'error');
                      }
                    }
                  };

                  const handleRemoveFromCart = async (itemId: string) => {
                    try {
                      await cartApi.removeFromCart(itemId);
                      showNotification('Item removed from cart', 'success');
                      window.dispatchEvent(new Event('cartUpdated'));
                      fetchCart();
                    } catch (err: any) {
                      showNotification('Failed to remove item', 'error');
                    }
                  };

                  return (
                    <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                      <Link href={productId ? `/product/${productId}` : '#'} className="flex-shrink-0">
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-20 h-20 object-contain bg-white rounded border border-gray-200"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={productId ? `/product/${productId}` : '#'}>
                          <p className="font-medium text-gray-900 hover:text-orange-600 transition-colors">{productName}</p>
                        </Link>
                        <p className="text-sm text-red-700 font-bold mt-1">{formatCurrencyWithCommas(productPrice)}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 font-medium">Qty:</label>
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                onClick={() => handleQuantityChange(item.quantity - 1)}
                                className="px-2 py-1 hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="px-3 py-1 min-w-[3rem] text-center border-x border-gray-300 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.quantity + 1)}
                                className="px-2 py-1 hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity >= maxQuantity}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-blue-600 hover:text-red-600 hover:underline text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Subtotal: <span className="font-bold text-gray-900">{formatCurrencyWithCommas(productPrice * item.quantity)}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:hidden mt-6">
              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 rounded-md py-3 shadow font-medium"
              >
                Place your order
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:w-1/4">
          <div className="bg-white border rounded-md p-6 sticky top-4 shadow-sm">
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-yellow-400 hover:bg-yellow-500 rounded-md py-2 shadow-sm text-sm font-medium mb-4"
            >
              Place your order
            </button>
            <p className="text-xs text-center text-gray-500 mb-4 border-b pb-2">
              By placing your order, you agree to Amazon's{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">privacy notice</span> and{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">conditions of use</span>.
            </p>

            <h3 className="font-bold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between">
                <span>Items ({totalItems}):</span>
                <span>{formatCurrencyWithCommas(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & handling:</span>
                <span>{shipping === 0 ? 'FREE' : formatCurrencyWithCommas(shipping)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Estimated tax:</span>
                <span>{formatCurrencyWithCommas(tax)}</span>
              </div>
            </div>
            <div className="flex justify-between text-xl font-bold text-red-700 mt-3">
              <span>Order total:</span>
              <span>{formatCurrencyWithCommas(total)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
