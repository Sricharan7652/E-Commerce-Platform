import { Suspense } from 'react';
import OrderConfirmationClient from './OrderConfirmationClient';

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <OrderConfirmationClient />
    </Suspense>
  );
}
