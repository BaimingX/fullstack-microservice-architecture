"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  originPrice: number;
  hasDiscount: boolean;
  discountPrice?: number;
  hasFlash: boolean; 
  flashPrice?: number;
  img: string;
  flashTime?: string;
  flashNum?: number;
  type?: string;
}

// 将产品名称转换为URL友好的slug
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // 移除特殊字符
    .split(/\s+/)
    .slice(0, 8)                  // 取前8个词
    .join("-");
}

interface ProductCardProps {
  product: Product;
  imagePriority?: boolean; // 是否优先加载图片（对于首屏可见图片很重要）
}

const ProductCard: React.FC<ProductCardProps> = ({ product, imagePriority = false }) => {
  const router = useRouter();
  const productUrl = `/product/${product.id}-${slugify(product.name)}`;
  
  // 计算折扣百分比
  const getDiscountPercentage = () => {
    if (product.hasDiscount && product.discountPrice && product.originPrice) {
      const discount = ((product.originPrice - product.discountPrice) / product.originPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };
  
  // 确定当前显示的价格
  const getCurrentPrice = () => {
    if (product.hasFlash && product.flashPrice) {
      return product.flashPrice;
    } else if (product.hasDiscount && product.discountPrice) {
      return product.discountPrice;
    }
    return product.originPrice;
  };
  
  // 是否显示原价（有折扣时才显示）
  const showOriginalPrice = product.hasDiscount || product.hasFlash;
  
  // 判断闪购是否有效
  const isFlashSaleValid = () => {
    if (!product.flashTime) return false;
    const endTime = new Date(product.flashTime);
    const now = new Date();
    return endTime > now;
  };
  
  // 产品点击处理
  const handleProductClick = () => {
    router.push(productUrl);
  };
  
  // 准备适当的图片alt文本
  const imgAlt = `${product.name} - ${
    product.hasDiscount 
      ? `Sale ${getDiscountPercentage()}% off` 
      : ''
  }`.trim();
  
  return (
    <div 
      className="product-card bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={handleProductClick}
      data-testid={`product-card-${product.id}`}
    >
      <Link href={productUrl} prefetch={false} aria-label={`View details of ${product.name}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* 使用Next.js Image组件，优化加载性能 */}
          <Image
            src={product.img}
            alt={imgAlt}
            className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-105"
            width={300}
            height={300}
            loading={imagePriority ? "eager" : "lazy"}
            priority={imagePriority}
          />
          
          {/* 折扣标签 */}
          {product.hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              {getDiscountPercentage()}% OFF
            </div>
          )}
          
          {/* 闪购标签 */}
          {product.hasFlash && isFlashSaleValid() && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded z-10 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Flash Sale
            </div>
          )}
        </div>
        
        <div className="p-3">
          {/* 产品名称 - 使用语义化标签h3 */}
          <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2" title={product.name}>
            {product.name}
          </h3>
          
          {/* 价格区域 */}
          <div className="flex items-center">
            <span className="text-lg font-bold text-indigo-600">
              ${getCurrentPrice().toFixed(2)}
            </span>
            
            {showOriginalPrice && (
              <span className="ml-2 text-xs text-gray-500 line-through">
                ${product.originPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* 类型标签 */}
          {product.type && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.type.split(',').slice(0, 2).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard; 