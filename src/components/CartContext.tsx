"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Prisma } from "@prisma/client";

// Define the lottery type
type LotteryWithStock = Prisma.LotteryGetPayload<{
  include: {
    Stock: true;
  };
}>;


// Define cart item type
export type CartItem = {
  ticket: LotteryWithStock;
  quantity: number;
};

// Define the context type
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (ticket: LotteryWithStock, quantity: number) => void;
  removeFromCart: (ticketId: number) => void;
  updateQuantity: (ticketId: number, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalCommission: () => number;
};

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage when component mounts
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (ticket: LotteryWithStock, quantity: number) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.ticket.LotteryID === ticket.LotteryID);
      
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, { ticket, quantity }];
      }
    });
  };

  const removeFromCart = (ticketId: number) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.ticket.LotteryID !== ticketId)
    );
  };

  const updateQuantity = (ticketId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(ticketId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.ticket.LotteryID === ticketId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.ticket.UnitPrice || 0) * item.quantity, 0
    );
  };

  const getTotalCommission = () => {
    return cartItems.reduce((total, item) => 
      total + (item.ticket.UnitCommission || 0) * item.quantity, 0
    );
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        getSubtotal,
        getTotalCommission
      }}
    >
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