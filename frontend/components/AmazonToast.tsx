'use client';
import { useEffect } from 'react';
import { CheckCircle, ShoppingCart } from 'lucide-react';

interface AmazonToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function AmazonToast({ message, onClose, duration = 3000 }: AmazonToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-white border border-gray-300 rounded-md shadow-2xl px-6 py-4 flex items-center gap-4 min-w-[350px] max-w-md">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <ShoppingCart className="w-4 h-4" />
            <span>{message}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
