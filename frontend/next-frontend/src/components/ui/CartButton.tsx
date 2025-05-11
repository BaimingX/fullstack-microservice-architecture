"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { canStartAnimation, startAnimation, endAnimation } from '@/utils/animationState';

interface CartButtonProps {
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

// 防抖函数
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

const CartButton: React.FC<CartButtonProps> = ({ 
  product, 
  isFlashSaleValid, 
  className = "p-1.5 bg-pink-600 hover:bg-pink-700 rounded-full text-white",
  iconSize = 14
}) => {
  const { addItem } = useCart();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  
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
  
  // 生成安全的贝塞尔曲线控制点，限制计算范围
  const getControlPoints = (startX: number, startY: number, endX: number, endY: number) => {
    // 使用确定性计算而不是完全随机，降低计算开销
    const seed = product.id % 5; // 使用产品ID做种子，减少随机性
    
    // 预定义的控制点偏移组合，避免每次重新计算
    const controlPointSets = [
      { x1: -150, y1: -100, x2: 150, y2: -150 },
      { x1: 200, y1: -120, x2: -100, y2: -100 },
      { x1: -100, y1: -150, x2: 100, y2: -50 },
      { x1: 120, y1: -80, x2: -120, y2: -120 },
      { x1: -180, y1: -120, x2: 80, y2: -80 }
    ];
    
    // 使用预设值而不是随机生成
    const offset = controlPointSets[seed];
    
    // 计算中点
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // 返回两个控制点
    return {
      cp1: {
        x: midX + offset.x1,
        y: midY + offset.y1
      },
      cp2: {
        x: midX + offset.x2,
        y: midY + offset.y2
      }
    };
  };
  
  // 使用useCallback缓存创建飞入购物车的动画小球函数，避免重复创建
  const createFlyingBall = useCallback((startX: number, startY: number) => {
    // 判断是否可以开始新动画
    if (!canStartAnimation()) {
      return;
    }
    
    // 标记动画开始
    startAnimation();
    
    // 查找购物车元素
    const cartIcon = document.getElementById("navbar-cart-icon") as HTMLElement;
    
    if (!cartIcon) {
      console.error("Shopping cart icon not found");
      endAnimation(); // 标记动画结束
      return;
    }
    
    // 获取购物车位置
    const cartRect = cartIcon.getBoundingClientRect();
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;
    
    // 使用缓存池复用DOM元素，而不是每次创建新元素
    let ball = document.getElementById("flying-ball-element") as HTMLElement;
    
    if (!ball) {
      ball = document.createElement("div");
      ball.id = "flying-ball-element";
      ball.className = "flying-ball";
      document.body.appendChild(ball);
    }
    
    ball.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background-color: #ec4899;
      border-radius: 50%;
      z-index: 9999;
      opacity: 0.8;
      left: ${startX}px;
      top: ${startY}px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      display: block;
    `;
    
    // 获取贝塞尔曲线控制点
    const controlPoints = getControlPoints(startX, startY, endX, endY);
    const cp1 = controlPoints.cp1;
    const cp2 = controlPoints.cp2;
    
    // 创建动画并确保完成后清理
    const animation = ball.animate(
      [
        { 
          left: `${startX}px`, 
          top: `${startY}px`,
          transform: 'translate(-50%, -50%) rotate(0deg) scale(1)'
        },
        { 
          left: `${cp1.x}px`, 
          top: `${cp1.y}px`,
          transform: 'translate(-50%, -50%) rotate(180deg) scale(1.2)'
        },
        { 
          left: `${cp2.x}px`, 
          top: `${cp2.y}px`,
          transform: 'translate(-50%, -50%) rotate(270deg) scale(1.1)'
        },
        { 
          left: `${endX}px`, 
          top: `${endY}px`,
          transform: 'translate(-50%, -50%) rotate(360deg) scale(0.5)'
        }
      ], 
      { 
        duration: 800, 
        easing: 'cubic-bezier(.17,.67,.83,.67)' 
      }
    );
    
    // 确保动画结束后进行清理
    animation.onfinish = () => {
      // 隐藏而不是移除，重用DOM元素
      if (ball) {
        ball.style.display = "none";
      }
      
      // 添加购物车缩放动画效果
      const cartAnimation = cartIcon.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.3)' },
          { transform: 'scale(1)' }
        ],
        { duration: 300, easing: 'ease-out' }
      );
      
      // 获取数量标签
      const countElement = document.getElementById("navbar-cart-count");
      if (countElement) {
        countElement.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.5)' },
            { transform: 'scale(1)' }
          ],
          { duration: 300, easing: 'ease-out' }
        );
      }
      
      cartAnimation.onfinish = () => {
        // 检查是否有待处理的动画
        if (endAnimation()) {
          // 如果有待处理的动画，进行下一个
          setTimeout(() => {
            if (buttonRef.current) {
              const buttonRect = buttonRef.current.getBoundingClientRect();
              const startX = buttonRect.left + buttonRect.width / 2;
              const startY = buttonRect.top + buttonRect.height / 2;
              createFlyingBall(startX, startY);
            }
          }, 100);
        }
      };
    };
    
    // 添加错误处理，确保动画未完成也能恢复状态
    animation.oncancel = () => {
      if (ball) ball.style.display = "none";
      endAnimation(); // 标记动画结束
    };
  }, [product.id]);
  
  // 使用防抖处理点击事件
  const debouncedAddToCart = useCallback(
    debounce((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const price = getActualPrice();
      
      const item: CartItem = {
        id: product.id,
        name: product.name,
        price: price,
        originalPrice: product.originPrice,
        quantity: 1,
        img: product.img
      };
      
      // 创建飞入购物车的小球动画
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const startX = buttonRect.left + buttonRect.width / 2;
        const startY = buttonRect.top + buttonRect.height / 2;
        
        createFlyingBall(startX, startY);
      }
      
      // 延迟添加商品到购物车，与动画同步
      setTimeout(() => {
        addItem(item);
        // 重置按钮状态
        setIsDisabled(false);
      }, 800);
    }, 300),
    [addItem, createFlyingBall, getActualPrice, product]
  );
  
  const handleAddToCart = (e: React.MouseEvent) => {
    if (isDisabled) return;
    
    // 立即禁用按钮，防止多次点击
    setIsDisabled(true);
    
    // 使用防抖函数处理
    debouncedAddToCart(e);
  };
  
  // 组件卸载时清理资源
  useEffect(() => {
    // 页面卸载前清理资源
    const handleBeforeUnload = () => {
      console.log("页面卸载，清理CartButton资源");
      const ball = document.getElementById("flying-ball-element");
      if (ball && ball.parentNode) {
        ball.parentNode.removeChild(ball);
      }
    };
    
    // 页面可见性变化处理
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("页面隐藏，清理CartButton资源");
        const ball = document.getElementById("flying-ball-element");
        if (ball) {
          ball.style.display = "none";
        }
      }
    };
    
    // 添加事件监听器
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      console.log("CartButton组件卸载，清理资源");
      // 清理飞行球元素
      const ball = document.getElementById("flying-ball-element");
      if (ball && ball.parentNode) {
        ball.parentNode.removeChild(ball);
      }
      
      // 移除事件监听器
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return (
    <button 
      ref={buttonRef}
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleAddToCart}
      disabled={isDisabled}
      aria-label="添加到购物车"
    >
      <ShoppingCart size={iconSize} />
    </button>
  );
};

export default CartButton; 