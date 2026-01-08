'use client';
import Link from 'next/link';
import HeaderWithSuspense from '@/components/HeaderWithSuspense';

const giftCardCategories = [
  {
    title: 'Email Gift Cards',
    description: 'Send a digital gift card directly to their inbox in minutes.',
  },
  {
    title: 'Print at Home',
    description: 'Print a personalized gift card that you can hand deliver.',
  },
  {
    title: 'Gift Boxes & Greeting Cards',
    description: 'Physical gift cards in premium boxes and envelopes.',
  },
];

export default function GiftCardsPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <HeaderWithSuspense cartCount={0} onSearch={() => {}} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-2">Gift Cards</h1>
        <p className="text-sm text-gray-600 mb-6">
          Explore different ways to gift for any occasion. This is sample content styled like Amazon&apos;s gift
          cards hub.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {giftCardCategories.map((cat) => (
            <div
              key={cat.title}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{cat.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{cat.description}</p>
              <button className="text-sm text-blue-600 hover:text-orange-600 hover:underline">
                Browse options
              </button>
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


