'use client';
import Link from 'next/link';
import Header from '@/components/Header';

const registryTypes = [
  {
    title: 'Wedding Registry',
    description: 'Create a list of gifts you love for your big day.',
  },
  {
    title: 'Baby Registry',
    description: 'Get everything you need for your new arrival.',
  },
  {
    title: 'Housewarming Registry',
    description: 'Build your dream home with curated items.',
  },
];

export default function RegistryPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header cartCount={0} onSearch={() => {}} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-2">Registry</h1>
        <p className="text-sm text-gray-600 mb-6">
          Choose a registry type and share it with friends and family. This is a dummy layout similar to
          Amazon&apos;s registry landing page.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {registryTypes.map((reg) => (
            <div
              key={reg.title}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-start hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{reg.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{reg.description}</p>
              <button className="mt-auto bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 rounded-md px-3 py-1.5 text-sm font-medium">
                Create registry
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


