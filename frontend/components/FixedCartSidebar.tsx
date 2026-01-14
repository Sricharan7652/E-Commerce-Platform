'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrencyWithCommas } from '@/lib/currency';
import { cartApi } from '@/lib/api';

interface FixedCartSidebarProps {
  items: any[];
}

export default function FixedCartSidebar({ items = [] }: FixedCartSidebarProps) {
  const isReady = true;

  const updateQuantity = async (itemIndex: number, quantity: number) => {
    try {
      const item = items[itemIndex];
      if (!item) return;

      const itemId = item.id; // Cart item ID

      if (quantity <= 0) {
        await cartApi.removeFromCart(itemId);
      } else {
        await cartApi.updateQuantity(itemId, quantity);
      }

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (itemIndex: number) => {
    try {
      const item = items[itemIndex];
      if (!item) return;

      const itemId = item.id;

      await cartApi.removeFromCart(itemId);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const cartItems = items;
  const totalItems = cartItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
  const subtotal = cartItems.reduce((acc: number, item: any) => {
    return acc + (item.price * (item.quantity || 0));
  }, 0);

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-[calc(100vh-100px)] sticky top-[100px] flex flex-col overflow-hidden ml-auto">
      {/* Cart Header */}
      <div className="bg-white border-b p-4 flex-shrink-0 z-10">
        <h3 className="text-base font-bold text-gray-900">Cart</h3>
      </div>

      {/* Cart Items - Scrollable area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            {cartItems.map((item: any, idx: number) => {
              const productImage = item.images && item.images.length > 0
                ? item.images[0]
                : 'https://via.placeholder.com/150?text=No+Image';

              return (
                <div
                  key={item._id || idx}
                  className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0"
                >
                  <Link
                    href={`/product/${item._id}`}
                    className="w-16 h-16 flex-shrink-0 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={productImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4='}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUU4QUEiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRnVuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item._id}`}
                      className="text-sm font-medium text-blue-700 hover:text-orange-600 hover:underline transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <div className="text-sm font-bold text-gray-900 mt-1">
                      {formatCurrencyWithCommas(item.price)}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-700">Qty:</span>
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-2 py-1 min-w-[2.5rem] text-center border-x border-gray-300 font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-blue-600 hover:text-red-600 hover:underline font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm font-medium">Your cart is empty</p>
            <p className="text-xs mt-2 text-gray-400">Add items to see them here</p>
          </div>
        )}
      </div>

      {/* Cart Summary - Fixed at bottom */}
      <div className="border-t p-4 bg-white shadow-lg mt-auto z-10">
        <div className="mb-4">
          <p className="text-lg font-bold text-gray-900">
            Cart subtotal: <span className="text-red-700">{formatCurrencyWithCommas(subtotal)}</span>
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <Link
            href="/checkout"
            className="block w-full bg-[#FFD814] hover:bg-[#F7CA00] rounded-full py-2.5 text-center text-sm font-medium shadow-sm border border-[#FCD200] transition-colors"
          >
            Proceed to Buy ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </Link>
          <Link
            href="/cart"
            className="block w-full bg-white border border-gray-300 hover:bg-gray-50 rounded-full py-2.5 text-center text-sm font-medium transition-colors shadow-sm"
          >
            Go to Cart
          </Link>
        </div>

        <p className="text-xs text-gray-600 text-center">
          For best experience{' '}
          <Link href="/login" className="text-blue-600 hover:text-orange-600 hover:underline transition-colors">
            sign in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
