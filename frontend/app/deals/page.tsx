'use client';
import Link from 'next/link';
import HeaderWithSuspense from '@/components/HeaderWithSuspense';
import { formatCurrencyWithCommas } from '@/lib/currency';

const dummyDeals = [
  {
    id: 'deal-1',
    title: 'Wireless Earbuds with Charging Case',
    price: 59.99,
    oldPrice: 99.99,
    discount: '40% off',
    image:
      'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'deal-2',
    title: '4K Ultra HD Smart TV 43"',
    price: 349.99,
    oldPrice: 499.99,
    discount: '30% off',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'deal-3',
    title: 'Stainless Steel Cookware Set – 10 Piece',
    price: 129.99,
    oldPrice: 199.99,
    discount: '35% off',
    image:
      'https://images.unsplash.com/photo-1544022613-8b063aae13d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'deal-4',
    title: 'Classic Cotton Hoodie for Men',
    price: 34.99,
    oldPrice: 59.99,
    discount: '40% off',
    image:
      'https://images.unsplash.com/photo-1528701800489-20be3c30c1d5?w=600&auto=format&fit=crop&q=80',
  },
];

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <HeaderWithSuspense cartCount={0} onSearch={() => {}} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-2">Today&apos;s Deals</h1>
        <p className="text-sm text-gray-600 mb-6">
          Great discounts across electronics, fashion, and home. These are sample deals for the Amazon clone.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {dummyDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex flex-col gap-2">
                <p className="text-sm font-medium line-clamp-2 text-gray-900">{deal.title}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-red-700">
                    {formatCurrencyWithCommas(deal.price)}
                  </span>
                  <span className="text-xs line-through text-gray-500">
                    {formatCurrencyWithCommas(deal.oldPrice)}
                  </span>
                  <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    {deal.discount}
                  </span>
                </div>
                <button className="mt-1 bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 text-sm font-medium rounded-md py-1.5">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        <Link href="/" className="text-blue-600 hover:underline text-sm">
          Back to Home
        </Link>
      </main>
    </div>
  );
}


