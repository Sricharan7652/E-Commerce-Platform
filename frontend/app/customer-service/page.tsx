'use client';
import Link from 'next/link';
import Header from '@/components/Header';

const helpTopics = [
  {
    title: 'Your Orders',
    description: 'Track packages, edit or cancel orders, print invoices.',
  },
  {
    title: 'Returns & Refunds',
    description: 'Return items or learn more about our refund timelines.',
  },
  {
    title: 'Payment Settings',
    description: 'Manage saved cards, UPI IDs, and other payment methods.',
  },
  {
    title: 'Account Settings',
    description: 'Change your email, password, or address book.',
  },
];

export default function CustomerServicePage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header cartCount={0} onSearch={() => {}} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-2">Customer Service</h1>
        <p className="text-sm text-gray-600 mb-6">
          Get help with your orders, payments, and account. These are sample help topics to mimic Amazon&apos;s
          support page.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {helpTopics.map((topic) => (
            <div
              key={topic.title}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{topic.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
              <button className="text-sm text-blue-600 hover:text-orange-600 hover:underline">
                Learn more
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


