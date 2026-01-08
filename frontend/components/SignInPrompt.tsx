'use client';
import { X } from 'lucide-react';
import Link from 'next/link';

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  redirectUrl?: string;
}

export default function SignInPrompt({ isOpen, onClose, onContinue, redirectUrl = '/checkout' }: SignInPromptProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Sign in for the best experience</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-3">
              Sign in to your account to enjoy:
            </p>
            <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
              <li>Track your orders easily</li>
              <li>Faster checkout next time</li>
              <li>Save multiple addresses</li>
              <li>View complete order history</li>
              <li>Get personalized recommendations</li>
            </ul>
          </div>

          <div>
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
              onClick={onClose}
              className="block w-full bg-yellow-400 hover:bg-yellow-500 rounded-md py-2.5 text-center text-sm font-medium shadow-sm border border-yellow-600"
            >
              Sign in to your account
            </Link>
          </div>

          <p className="text-xs text-gray-600 mt-4 text-center">
            You must sign in to place an order.
          </p>
        </div>
      </div>
    </>
  );
}
