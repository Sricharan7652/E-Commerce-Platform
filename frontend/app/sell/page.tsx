'use client';
import Link from 'next/link';
import Header from '@/components/Header';

const sellingBenefits = [
  'Reach millions of customers across categories.',
  'Simple listing tools to upload and manage your products.',
  'Secure payments deposited directly to your bank account.',
  'Dedicated support for sellers getting started.',
];

export default function SellPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header cartCount={0} onSearch={() => {}} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-2">Sell on Amazon Clone</h1>
        <p className="text-sm text-gray-600 mb-6">
          Start your online business using this demo selling page. The content here is dummy text that mirrors the
          sections you&apos;d expect on Amazon&apos;s &quot;Sell&quot; experience.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Why sell with us?</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {sellingBenefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
          <button className="mt-4 bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 rounded-md px-4 py-2 text-sm font-medium">
            Start selling
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Step 1: Create account</h3>
            <p className="text-sm text-gray-600">
              Register as a seller using your email and basic business details.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Step 2: List products</h3>
            <p className="text-sm text-gray-600">
              Add titles, images, and prices for each item you want to sell.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Step 3: Ship & get paid</h3>
            <p className="text-sm text-gray-600">
              Ship orders to customers and receive secure payments.
            </p>
          </div>
        </div>

        <Link href="/" className="text-blue-600 hover:underline text-sm">
          Back to Home
        </Link>
      </main>
    </div>
  );
}


