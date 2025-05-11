"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 定义购物车内商品数据接口
export interface CartItem {
  id: number;
  name: string;
  price: number; // 实际价格（可能是折扣价或原价）
  originalPrice: number;
  quantity: number;
  img: string;
}

// 购物车上下文接口
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

// 创建购物车上下文
const CartContext = createContext<CartContextType | undefined>(undefined);

// 购物车提供者Props
interface CartProviderProps {
  children: ReactNode;
}

// 购物车提供者组件
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // 初始化时从localStorage加载购物车数据
  useEffect(() => {
    const storedCart = localStorage.getItem('coolStuffCart');
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart data from localStorage:', e);
        localStorage.removeItem('coolStuffCart');
      }
    }
  }, []);
  
  // 购物车数据变更时保存到localStorage
  useEffect(() => {
    localStorage.setItem('coolStuffCart', JSON.stringify(items));
  }, [items]);
  
  // 添加商品到购物车
  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      // 检查商品是否已在购物车中
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // 如果已存在，增加数量
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return updatedItems;
      } else {
        // 如果不存在，添加新商品
        return [...currentItems, item];
      }
    });
  };
  
  // 从购物车移除商品
  const removeItem = (id: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };
  
  // 更新购物车中商品数量
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // 清空购物车
  const clearCart = () => {
    setItems([]);
  };
  
  // 获取购物车中商品总数
  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };
  
  // 获取购物车总价
  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // 提供上下文值
  const contextValue: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotal
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// 便捷的自定义Hook来使用购物车上下文
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 