'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useNotification } from '@/hooks/useNotification';
import { formatCurrencyWithCommas } from '@/lib/currency';
import SignInPrompt from '@/components/SignInPrompt';
import { getBaseURL } from '@/lib/api';

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

  // Use localStorage for cart
  const fetchCart = () => {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        setCart(cart);
        const count = cart.items?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0;
        setCartCount(count);
      } else {
        setCart({ items: [] });
        setCartCount(0);
      }
    } catch (err) {
      setCart({ items: [] });
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    checkAuth();
  }, []);

  // Check auth using localStorage only (no API)
  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        const user = JSON.parse(userData);
        if (user && user._id && user._id !== 'default-user-id') {
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      // Silent error handling
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!address.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!address.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!address.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!address.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!address.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    }
    if (!address.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(address.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!address.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fill in all required fields correctly', 'error');
      return;
    }
    
    // Require sign-in to place order
    if (!isAuthenticated) {
      setShowSignInPrompt(true);
      return;
    }

    await proceedWithOrder();
  };

  const proceedWithOrder = async () => {
    try {
      const cartData = localStorage.getItem('cart');
      if (!cartData) {
        showNotification('Cart is empty', 'error');
        return;
      }

      const cart = JSON.parse(cartData);
      const cartItems = cart.items || [];
      
      if (cartItems.length === 0) {
        showNotification('Cart is empty', 'error');
        return;
      }

      // Calculate totals
      const subtotal = cartItems.reduce((acc: number, item: any) => {
        const product = item.product;
        const price = product && typeof product === 'object' && product !== null ? product.price : 0;
        return acc + (price * (item.quantity || 0));
      }, 0);
      const tax = subtotal * 0.1;
      const shipping = subtotal > 100 ? 0 : 10;
      const totalPrice = subtotal + tax + shipping;

      // Create order
      const order = {
        _id: `order-${Date.now()}-${Math.random()}`,
        orderItems: cartItems.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.product && typeof item.product === 'object' ? item.product.price : 0,
          image: item.product && typeof item.product === 'object' && item.product.images && item.product.images.length > 0
            ? item.product.images[0]
            : 'https://via.placeholder.com/150?text=No+Image',
          name: item.product && typeof item.product === 'object' ? item.product.name : 'Product'
        })),
        shippingAddress: address,
        totalPrice: totalPrice,
        status: 'Processing',
        createdAt: new Date().toISOString(),
      };

      // Save order to localStorage
      const ordersData = localStorage.getItem('orders');
      const orders = ordersData ? JSON.parse(ordersData) : [];
      orders.unshift(order); // Add to beginning
      localStorage.setItem('orders', JSON.stringify(orders));

      // Clear cart
      localStorage.setItem('cart', JSON.stringify({ items: [] }));
      window.dispatchEvent(new Event('cartUpdated'));

      // Show success message immediately (order was placed successfully)
      showNotification('Order placed successfully!', 'success');

      // Send order confirmation email in background (non-blocking)
      // This won't block the order if email fails
      setTimeout(() => {
        const sendOrderEmail = async () => {
          try {
            const userData = localStorage.getItem('user');
            if (!userData) return;
            
            const user = JSON.parse(userData);
            const userEmail = user?.email;
            
            if (!userEmail) return;

            // Try to send email via backend API (non-blocking)
            // Use fetch with timeout controller for better compatibility
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            try {
              const apiUrl = `${getBaseURL()}/email/send-order-confirmation`;
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: userEmail,
                  order: order
                }),
                signal: controller.signal
              });

              clearTimeout(timeoutId);

              if (response.ok) {
                console.log('Order confirmation email sent successfully');
              } else {
                throw new Error('Email service returned error');
              }
            } catch (fetchError: any) {
              clearTimeout(timeoutId);
              throw fetchError;
            }
          } catch (emailError: any) {
            // Email failed silently - order was still placed successfully
            // Backend might not be running, which is okay - order still works with localStorage
            // Only log if it's not a network/abort error
            if (emailError.name !== 'AbortError' && 
                !emailError.message?.includes('fetch') && 
                !emailError.message?.includes('Failed to fetch') &&
                !emailError.message?.includes('NetworkError')) {
              console.log('Email service error:', emailError.message);
            }
            // Don't show error to user - order was successful
          }
        };

        // Send email in background without blocking UI
        sendOrderEmail().catch(() => {
          // Silently handle any email errors - order was already successful
        });
      }, 100); // Small delay to let order complete first

      setTimeout(() => {
        router.push(`/order-confirmation?orderId=${order._id}`);
      }, 1000);
    } catch (err: any) {
      showNotification('Failed to place order', 'error');
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
        <Header cartCount={0} onSearch={() => {}} />
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
      <Header cartCount={cartCount} onSearch={() => {}} />

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
                    className={`w-full border border-gray-400 p-2.5 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${
                      errors.fullName ? 'border-red-500' : ''
                    }`}
                    value={address.fullName}
                    onChange={(e) => {
                      setAddress({...address, fullName: e.target.value});
                      if (errors.fullName) setErrors({...errors, fullName: ''});
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
                    className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.address ? 'border-red-500' : ''
                    }`}
                    value={address.address}
                    onChange={(e) => {
                      setAddress({...address, address: e.target.value});
                      if (errors.address) setErrors({...errors, address: ''});
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
                      className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${
                        errors.city ? 'border-red-500' : ''
                      }`}
                      value={address.city}
                      onChange={(e) => {
                        setAddress({...address, city: e.target.value});
                        if (errors.city) setErrors({...errors, city: ''});
                      }}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">State</label>
                    <input 
                      required
                      type="text" 
                      className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${
                        errors.state ? 'border-red-500' : ''
                      }`}
                      value={address.state}
                      onChange={(e) => {
                        setAddress({...address, state: e.target.value});
                        if (errors.state) setErrors({...errors, state: ''});
                      }}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Zip Code</label>
                    <input 
                      required
                      type="text" 
                      className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${
                        errors.zipCode ? 'border-red-500' : ''
                      }`}
                      value={address.zipCode}
                      onChange={(e) => {
                        setAddress({...address, zipCode: e.target.value});
                        if (errors.zipCode) setErrors({...errors, zipCode: ''});
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
                    className={`w-full border p-2 rounded focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                    value={address.phone}
                    onChange={(e) => {
                      setAddress({...address, phone: e.target.value});
                      if (errors.phone) setErrors({...errors, phone: ''});
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
                    onChange={(e) => setAddress({...address, country: e.target.value})}
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

                  const handleQuantityChange = (newQuantity: number) => {
                    if (newQuantity <= 0) {
                      handleRemoveFromCart(item._id);
                    } else {
                      try {
                        const cartData = localStorage.getItem('cart');
                        if (!cartData) return;

                        let cart = JSON.parse(cartData);
                        const itemIndex = cart.items.findIndex((i: any) => i._id === item._id);
                        if (itemIndex >= 0) {
                          cart.items[itemIndex].quantity = newQuantity;
                          localStorage.setItem('cart', JSON.stringify(cart));
                          window.dispatchEvent(new Event('cartUpdated'));
                          fetchCart();
                          showNotification('Cart updated', 'success');
                        }
                      } catch (err: any) {
                        showNotification('Failed to update quantity', 'error');
                      }
                    }
                  };

                  const handleRemoveFromCart = (itemId: string) => {
                    try {
                      const cartData = localStorage.getItem('cart');
                      if (!cartData) return;

                      let cart = JSON.parse(cartData);
                      cart.items = cart.items.filter((i: any) => i._id !== itemId);
                      localStorage.setItem('cart', JSON.stringify(cart));
                      window.dispatchEvent(new Event('cartUpdated'));
                      showNotification('Item removed from cart', 'success');
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
                            onClick={() => handleRemoveFromCart(item._id)}
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
