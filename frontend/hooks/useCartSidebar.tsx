'use client';
import { useState, useCallback } from 'react';
import CartSidebar from '@/components/CartSidebar';

export const useCartSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const showCartSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const hideCartSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const CartSidebarComponent = (
    <CartSidebar
      isOpen={isOpen}
      onClose={hideCartSidebar}
    />
  );

  return { showCartSidebar, hideCartSidebar, CartSidebarComponent };
};
