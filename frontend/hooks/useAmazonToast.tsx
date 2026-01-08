'use client';
import { useState, useCallback } from 'react';
import AmazonToast from '@/components/AmazonToast';

export const useAmazonToast = () => {
  const [toast, setToast] = useState<{
    message: string;
  } | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ message });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const ToastComponent = toast ? (
    <AmazonToast
      message={toast.message}
      onClose={hideToast}
    />
  ) : null;

  return { showToast, hideToast, ToastComponent };
};
