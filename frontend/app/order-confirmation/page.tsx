'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import { formatCurrencyWithCommas } from '@/lib/currency';

export default function OrderConfirmation() {
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

  // Use localStorage for orders
  const fetchOrder = () => {
    try {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        const foundOrder = orders.find((o: any) => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        }
      }
    } catch (err) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-green-500">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="text-green-500 w-12 h-12 flex-shrink-0" />
            <h1 className="text-3xl font-bold text-green-700">Order Placed Successfully!</h1>
          </div>
          
          {order && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
              <p className="text-lg">
                <span className="font-bold text-gray-900">Order ID:</span>{' '}
                <span className="text-blue-600 font-mono hover:text-orange-600 transition-colors">{order._id}</span>
              </p>
              <p className="text-lg">
                <span className="font-bold text-gray-900">Total Amount:</span>{' '}
                <span className="text-red-700 font-bold text-xl">{formatCurrencyWithCommas(order.totalPrice || 0)}</span>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                ✓ Confirmation email has been sent to your email address.
              </p>
            </div>
          )}

          {order && order.orderItems && order.orderItems.length > 0 && (
            <div className="mb-6 border-t border-gray-200 pt-4">
              <h2 className="font-bold text-lg mb-4 text-gray-900">Order Items:</h2>
              <div className="space-y-3">
                {order.orderItems.map((item: any, idx: number) => {
                  const product = item.product;
                  const productName = product && typeof product === 'object' && product !== null ? product.name : item.name || 'Product';
                  return (
                    <div key={idx} className="flex gap-4 pb-3 border-b border-gray-100 last:border-b-0">
                      <div className="w-20 h-20 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image && (
                          <img src={item.image} alt={productName} className="w-full h-full object-contain" loading="lazy" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{productName}</p>
                        <p className="text-sm text-gray-600 mt-1">Quantity: <span className="font-medium">{item.quantity}</span></p>
                        <p className="text-sm text-red-700 font-bold mt-1">{formatCurrencyWithCommas(item.price || 0)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <Link href="/orders" className="text-blue-600 hover:text-orange-600 hover:underline font-medium transition-colors">
              View Your Orders
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/" className="text-blue-600 hover:text-orange-600 hover:underline font-medium transition-colors">
              Continue Shopping
            </Link>
          </div>

          <hr className="my-6 border-gray-200" />
          
          <Link href="/">
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 px-6 py-3 rounded-md shadow-sm text-sm font-medium border border-yellow-600 transition-all duration-200 active:scale-95">
              Continue Shopping
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
