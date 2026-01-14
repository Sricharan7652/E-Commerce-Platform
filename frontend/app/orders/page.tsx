'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { formatCurrencyWithCommas } from '@/lib/currency';
import { orderApi, cartApi } from '@/lib/api';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const data = await orderApi.getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const data = await cartApi.getCart();
      const items = data.cart || [];
      const count = items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      setCartCount(count);
    } catch (err) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
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
      <Header cartCount={cartCount} onSearch={() => { }} />

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
              <div key={order.id || order._id} className="bg-white rounded-lg border border-[#D5D9D9] overflow-hidden hover:border-gray-400 transition-colors">
                {/* Amazon-style Card Header */}
                <div className="bg-[#F0F2F2] px-6 py-4 flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-[#565959] border-b border-[#D5D9D9]">
                  <div className="flex flex-col">
                    <span className="uppercase text-xs font-bold">Order Placed</span>
                    <span className="text-[#0F1111]">{formatDate(order.created_at || order.createdAt)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase text-xs font-bold">Total</span>
                    <span className="text-[#B12704] text-sm">{formatCurrencyWithCommas(order.total_price || order.total_price || order.totalPrice || 0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase text-xs font-bold">Ship To</span>
                    <span className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer truncate max-w-[150px]">
                      {order.shipping_address?.fullName || order.shippingAddress?.fullName}
                    </span>
                  </div>
                  <div className="flex-1 md:text-right">
                    <div className="flex flex-col md:items-end">
                      <span className="uppercase text-xs font-bold">Order # {order.id || order._id}</span>
                      <div className="flex gap-2 divide-x divide-gray-300">
                        <Link href={`/order-confirmation?orderId=${order.id || order._id}`} className="text-[#007185] hover:text-[#c45500] hover:underline">
                          View order details
                        </Link>
                        <span className="pl-2 text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer">
                          Invoice
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-lg text-[#0F1111]">
                      {order.status === 'Delivered' ? 'Delivered' : order.status}
                    </span>
                    {order.status === 'Delivered' && (
                      <span className="text-sm text-[#565959]">
                        Package was left near the front door or porch.
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {(order.order_items || order.orderItems || []).map((item: any, idx: number) => {
                      // Handle both joined product object and simple flat structure
                      const productId = item.product && typeof item.product === 'object' ? item.product._id || item.product.id : item.product;
                      const productName = item.name || (item.product && item.product.name) || 'Product';
                      const productImage = item.image || (item.product && item.product.images && item.product.images[0]) || 'https://via.placeholder.com/150?text=No+Image';

                      return (
                        <div key={idx} className="flex flex-col md:flex-row gap-6">
                          <Link href={productId ? `/product/${productId}` : '#'} className="flex-shrink-0">
                            <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
                              <img
                                src={productImage}
                                alt={productName}
                                className="w-full h-full object-contain hover:opacity-90"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4=';
                                }}
                              />
                            </div>
                          </Link>

                          <div className="flex-1">
                            <Link
                              href={productId ? `/product/${productId}` : '#'}
                              className="text-base font-medium text-[#007185] hover:text-[#c45500] hover:underline line-clamp-2"
                            >
                              {productName}
                            </Link>
                            <p className="text-xs text-[#565959] mt-1">Return window closed on {new Date(new Date(order.created_at || order.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                            <div className="mt-2 text-sm">
                              <button className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-md px-3 py-1 shadow-sm text-sm active:scale-95 transition-all text-[#0F1111]">
                                Buy it again
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="md:w-64 flex flex-col gap-2">
                            <button className="w-full border border-[#D5D9D9] rounded-lg py-1 shadow-sm text-sm hover:bg-[#F7FAFA] text-[#0F1111] transition-colors">
                              Track package
                            </button>
                            <Link href={productId ? `/product/${productId}#reviews` : '#'} className="w-full">
                              <button className="w-full border border-[#D5D9D9] rounded-lg py-1 shadow-sm text-sm hover:bg-[#F7FAFA] text-[#0F1111] transition-colors">
                                Write a product review
                              </button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
