"use client";

import React from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/utils/cdn';

interface ProductImageProps {
  url: string;
  alt: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

/**
 * 优化的产品图片组件，用于处理CDN路径
 */
const ProductImage: React.FC<ProductImageProps> = ({ 
  url, 
  alt, 
  priority = false,
  className = "object-cover",
  fill = true,
  width,
  height
}) => {
  // 处理图片URL，使用CDN路径
  // 已在getImageUrl函数中处理了重复的/images前缀问题
  const imageUrl = url.startsWith('http') 
    ? url // 如果已经是绝对URL则不修改
    : getImageUrl(url); // 使用CDN工具函数处理相对路径
  
  // 确定图片尺寸属性
  const sizeProps = fill 
    ? { fill: true } 
    : { width: width || 400, height: height || 400 };
  
  return (
    <Image
      src={imageUrl}
      alt={alt}
      {...sizeProps}
      className={className}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
};

export default ProductImage; 