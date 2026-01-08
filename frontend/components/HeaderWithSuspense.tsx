'use client';
import { Suspense } from 'react';
import Header from './Header';

export default function HeaderWithSuspense(props: any) {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
      <Header {...props} />
    </Suspense>
  );
}
