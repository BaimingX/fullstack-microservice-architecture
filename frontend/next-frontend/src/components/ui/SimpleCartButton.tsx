"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';

interface SimpleCartButtonProps {
  product: {
    id: number;
    name: string;
    originPrice: number;
    hasDiscount: boolean;
    discountPrice?: number;
    hasFlash: boolean;
    flashPrice?: number;
    img: string;
    flashTime?: string;
  };
  isFlashSaleValid: (flashTime?: string) => boolean;
  className?: string;
  iconSize?: number;
}

const SimpleCartButton: React.FC<SimpleCartButtonProps> = ({ 
  product, 
  isFlashSaleValid, 
  className = "p-1.5 bg-pink-600 hover:bg-pink-700 rounded-full text-white",
  iconSize = 14
}) => {
  const { addItem } = useCart();
  
  // 计算实际价格
  const getActualPrice = () => {
    if (product.hasFlash && product.flashPrice && isFlashSaleValid(product.flashTime)) {
      return product.flashPrice;
    } else if (product.hasDiscount && product.discountPrice) {
      return product.discountPrice;
    } else {
      return product.originPrice;
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止链接跳转
    e.stopPropagation(); // 阻止事件冒泡
    
    const price = getActualPrice();
    
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: price,
      originalPrice: product.originPrice,
      quantity: 1,
      img: product.img
    };
    
    // 简单地添加到购物车，不需要复杂的动画
    addItem(item);
  };
  
  return (
    <button 
      className={className}
      onClick={handleAddToCart}
      aria-label="添加到购物车"
    >
      <ShoppingCart size={iconSize} />
    </button>
  );
};

export default SimpleCartButton; 