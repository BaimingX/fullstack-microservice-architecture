"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';

interface OptimizedCartButtonProps {
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

// 全局动画管理 - 使用单例模式避免每个组件重复创建
const AnimationManager = {
  isAnimating: false,
  lastAnimationTime: 0,
  animationQueue: 0,
  ballElement: null as HTMLDivElement | null,
  
  // 初始化一次性元素
  initialize() {
    if (!this.ballElement && typeof document !== 'undefined') {
      // 先检查是否已存在相同id的元素，避免重复创建
      const existingBall = document.getElementById('flying-ball-element');
      if (existingBall) {
        existingBall.remove();
      }
      
      this.ballElement = document.createElement('div');
      this.ballElement.className = 'flying-ball';
      this.ballElement.style.display = 'none';
      this.ballElement.id = 'flying-ball-element';
      document.body.appendChild(this.ballElement);
    }
  },
  
  // 获取小球元素
  getBall() {
    this.initialize();
    return this.ballElement;
  },
  
  // 检查是否可以开始新动画
  canAnimate() {
    const now = Date.now();
    return !this.isAnimating || (now - this.lastAnimationTime > 1000);
  },
  
  // 标记动画开始
  startAnimation() {
    this.isAnimating = true;
    this.lastAnimationTime = Date.now();
  },
  
  // 标记动画结束
  endAnimation() {
    this.isAnimating = false;
    
    // 处理队列中的下一个动画
    if (this.animationQueue > 0) {
      this.animationQueue--;
      return true;
    }
    return false;
  },
  
  // 将动画添加到队列
  queueAnimation() {
    // 最多只加入3个等待的动画
    this.animationQueue = Math.min(this.animationQueue + 1, 3);
  },
  
  // 清理资源
  cleanup() {
    if (this.ballElement && this.ballElement.parentNode) {
      this.ballElement.parentNode.removeChild(this.ballElement);
      this.ballElement = null;
    }
    this.isAnimating = false;
    this.animationQueue = 0;
  }
};

// 添加全局窗口卸载监听，确保清理资源
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    AnimationManager.cleanup();
  });
}

const OptimizedCartButton: React.FC<OptimizedCartButtonProps> = ({ 
  product, 
  isFlashSaleValid, 
  className = "p-1.5 bg-pink-600 hover:bg-pink-700 rounded-full text-white",
  iconSize = 14
}) => {
  const { addItem } = useCart();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  
  // 在组件卸载时清理
  useEffect(() => {
    return () => {
      // 如果只有一个动画实例在运行，完全清理它
      if (document.querySelectorAll('.flying-ball').length <= 1) {
        AnimationManager.cleanup();
      }
    };
  }, []);
  
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
  
  // 创建飞入购物车的动画
  const createFlyingBall = () => {
    // 获取购物车图标
    const cartIcon = document.getElementById('navbar-cart-icon');
    if (!cartIcon || !buttonRef.current) {
      addToCartDirect();
      return;
    }
    
    // 获取位置信息
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();
    
    // 设置起始位置和目标位置
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;
    
    // 获取小球元素
    const ball = AnimationManager.getBall();
    if (!ball) {
      addToCartDirect();
      return;
    }
    
    // 设置小球样式 - 重置所有可能的样式以防止样式累积
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
      box-shadow: 0 0 10px rgba(236, 72, 153, 0.6);
    `;
    
    // 计算控制点 - 使用产品ID作为种子保持一致性
    const seed = product.id % 5;
    const controlSets = [
      { x1: -150, y1: -100, x2: 150, y2: -150 },
      { x1: 200, y1: -120, x2: -100, y2: -100 },
      { x1: -100, y1: -150, x2: 100, y2: -50 },
      { x1: 120, y1: -80, x2: -120, y2: -120 },
      { x1: -180, y1: -120, x2: 80, y2: -80 }
    ];
    
    const offset = controlSets[seed];
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const cp1 = { x: midX + offset.x1, y: midY + offset.y1 };
    const cp2 = { x: midX + offset.x2, y: midY + offset.y2 };
    
    // 创建动画
    try {
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
          duration: 600, // 减少动画时间提高性能
          easing: 'cubic-bezier(.17,.67,.83,.67)' 
        }
      );
      
      // 动画完成时的处理
      animation.onfinish = () => {
        // 隐藏小球并清除所有样式
        if (ball) {
          ball.style.display = 'none';
          // 清除转换以避免样式累积
          ball.style.transform = '';
        }
        
        // 购物车动画效果
        const cartAnimation = cartIcon.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.3)' },
            { transform: 'scale(1)' }
          ],
          { duration: 300, easing: 'ease-out' }
        );
        
        // 显示购物车数量标签动画
        const countElement = document.getElementById('navbar-cart-count');
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
        
        // 处理完成
        cartAnimation.onfinish = () => {
          // 标记动画结束
          const hasNextAnimation = AnimationManager.endAnimation();
          
          // 如果有待处理的动画，处理下一个
          if (hasNextAnimation && buttonRef.current) {
            setTimeout(createFlyingBall, 100);
          }
          
          // 重置按钮状态
          setIsDisabled(false);
        };
        
        // 添加到购物车
        addToCartDirect();
      };
      
      // 错误处理
      animation.oncancel = () => {
        if (ball) {
          ball.style.display = 'none';
          // 清除转换以避免样式累积
          ball.style.transform = '';
        }
        AnimationManager.endAnimation();
        setIsDisabled(false);
        addToCartDirect();
      };
    } catch (error) {
      // 出现错误，直接添加到购物车
      console.error('Animation error:', error);
      if (ball) {
        ball.style.display = 'none';
        // 清除转换以避免样式累积
        ball.style.transform = '';
      }
      AnimationManager.endAnimation();
      setIsDisabled(false);
      addToCartDirect();
    }
  };
  
  // 直接添加到购物车（无动画）
  const addToCartDirect = () => {
    const price = getActualPrice();
    
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: price,
      originalPrice: product.originPrice,
      quantity: 1,
      img: product.img
    };
    
    addItem(item);
  };
  
  // 处理点击事件
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 防止重复点击
    if (isDisabled) return;
    setIsDisabled(true);
    
    // 检查是否可以开始动画
    if (AnimationManager.canAnimate()) {
      AnimationManager.startAnimation();
      createFlyingBall();
    } else {
      // 将动画加入队列
      AnimationManager.queueAnimation();
      // 直接添加到购物车，不等待动画
      addToCartDirect();
      // 延迟恢复按钮状态
      setTimeout(() => setIsDisabled(false), 300);
    }
  };
  
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

export default OptimizedCartButton; 