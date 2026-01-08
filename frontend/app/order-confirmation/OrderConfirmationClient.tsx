'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import HeaderWithSuspense from '@/components/HeaderWithSuspense';
import { formatCurrencyWithCommas } from '@/lib/currency';

export default function OrderConfirmationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCart();
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

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

  const fetchOrder = () => {
    try {
      const ordersData = localStorage.getItem('orders');
      const orders = ordersData ? JSON.parse(ordersData) : [];
      const foundOrder = orders.find((o: any) => o._id === orderId);
      setOrder(foundOrder);
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Order not found</h1>
          <Link href="/" className="text-blue-600 hover:text-orange-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <HeaderWithSuspense cartCount={cartCount} onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-semibold text-green-800">Order Confirmed</h1>
          </div>
          <p className="text-green-700">
            Thank you for your purchase! Your order has been successfully placed.
          </p>
          <p className="text-sm text-green-600 mt-2">
            Order ID: {order._id}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.name}<br />
                {order.shippingAddress?.address}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                {order.shippingAddress?.country}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
              <p className="text-sm text-gray-600">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item._id} className="flex gap-4">
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/80x80?text=No+Image'}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded border border-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrencyWithCommas(item.product?.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrencyWithCommas(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrencyWithCommas(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/orders"
            className="bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 text-sm font-medium rounded-md py-2.5 px-6 shadow-sm transition-all duration-200 active:scale-95"
          >
            View Your Orders
          </Link>
          <Link
            href="/"
            className="border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-md py-2.5 px-6 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
