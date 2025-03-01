'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem } from './types';

interface CartContextType {
  cart: Cart | null;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ 
  children,
  storeId,
  subdomain 
}: { 
  children: React.ReactNode;
  storeId: string;
  subdomain: string;
}) {
  const [cart, setCart] = useState<Cart | null>(null);

  // Initialize cart from localStorage on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem(`cart-${subdomain}`);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        initializeCart();
      }
    } else {
      initializeCart();
    }
  }, [subdomain, storeId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem(`cart-${subdomain}`, JSON.stringify(cart));
    }
  }, [cart, subdomain]);

  // Initialize an empty cart
  const initializeCart = () => {
    setCart({
      items: [],
      storeId,
      subdomain,
      total: 0
    });
  };

  // Add an item to the cart
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart(prevCart => {
      if (!prevCart) return null;

      // Check if the item already exists in the cart
      const existingItemIndex = prevCart.items.findIndex(
        cartItem => cartItem.productId === item.productId
      );

      let newItems;
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + item.quantity
        };
      } else {
        // Add new item if it doesn't exist
        const newItem: CartItem = {
          ...item,
          id: `${item.productId}-${Date.now()}`
        };
        newItems = [...prevCart.items, newItem];
      }

      // Calculate new total
      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );

      return {
        ...prevCart,
        items: newItems,
        total
      };
    });
  };

  // Remove an item from the cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      if (!prevCart) return null;

      const newItems = prevCart.items.filter(
        item => item.productId !== productId
      );

      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );

      return {
        ...prevCart,
        items: newItems,
        total
      };
    });
  };

  // Update the quantity of an item
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      if (!prevCart) return null;

      const newItems = prevCart.items.map(item => 
        item.productId === productId 
          ? { ...item, quantity } 
          : item
      );

      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );

      return {
        ...prevCart,
        items: newItems,
        total
      };
    });
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart({
      items: [],
      storeId,
      subdomain,
      total: 0
    });
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 