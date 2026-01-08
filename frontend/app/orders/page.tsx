'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { formatCurrencyWithCommas } from '@/lib/currency';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Use localStorage for orders
  const fetchOrders = () => {
    try {
      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        setOrders(Array.isArray(orders) ? orders : []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Use localStorage for cart
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

  useEffect(() => {
    fetchOrders();
    fetchCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header cartCount={cartCount} onSearch={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-medium mb-6">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <h2 className="text-xl font-medium mb-4">You haven't placed any orders yet</h2>
            <Link href="/" className="text-blue-600 hover:underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 pb-4 border-b border-gray-200 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium text-gray-900">Order Placed:</span> <span className="text-gray-700">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Order ID:</span>{' '}
                      <span className="font-mono text-blue-600 hover:text-orange-600 transition-colors">{order._id}</span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium text-gray-900">Total:</span>{' '}
                      <span className="text-lg font-bold text-red-700">
                        {formatCurrencyWithCommas(order.totalPrice || 0)}
                      </span>
                    </div>
                    <div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.orderItems?.map((item: any, idx: number) => {
                    const product = item.product;
                    const productId = product && typeof product === 'object' && product !== null ? product._id : null;
                    const productName = product && typeof product === 'object' && product !== null ? product.name : item.name || 'Product';
                    const productImage = item.image || 
                      (product && typeof product === 'object' && product !== null && product.images && product.images.length > 0
                        ? product.images[0]
                        : 'https://via.placeholder.com/150?text=No+Image');

                    return (
                      <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <Link href={productId ? `/product/${productId}` : '#'} className="flex-shrink-0">
                          <div className="w-24 h-24 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden hover:shadow-md transition-shadow">
                            <img 
                              src={productImage} 
                              alt={productName} 
                              className="w-full h-full object-contain" 
                              loading="lazy"
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          {productId ? (
                            <Link 
                              href={`/product/${productId}`}
                              className="text-base md:text-lg font-medium text-blue-700 hover:text-orange-600 hover:underline transition-colors line-clamp-2"
                            >
                              {productName}
                            </Link>
                          ) : (
                            <h3 className="text-base md:text-lg font-medium text-gray-900">{productName}</h3>
                          )}
                          <p className="text-sm text-gray-600 mt-1">Quantity: <span className="font-medium">{item.quantity}</span></p>
                          <p className="text-sm text-red-700 font-bold mt-1">
                            {formatCurrencyWithCommas(item.price || 0)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.shippingAddress && (
                  <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                    <p className="font-medium mb-1">Shipping Address:</p>
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
