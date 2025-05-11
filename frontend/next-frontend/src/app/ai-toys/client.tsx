"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import serverAxios from "@/lib/axios-server";
import Hls from "hls.js";
import OptimizedCartButton from '@/components/ui/OptimizedCartButton';

// Interface for goods data
interface Goods {
  id: number;
  name: string;
  originPrice: number;
  hasDiscount: boolean;
  discountPrice?: number;
  hasFlash: boolean;
  flashPrice?: number;
  img: string;
  date?: string;
  store?: number;
  flashTime?: string;
  description?: string;
  rating?: number;
  attributes?: {
    [key: string]: string;
  };
}

interface Media {
  id: number;
  goodsId: number;
  mediaType: "image" | "video";
  url: string;
  thumbnailUrl?: string;
}

interface AIToysClientProps {
  aiToys: Goods[];
}

// Helper function to create URL-friendly slugs
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .slice(0, 8)
    .join("-");
}

// Helper function to extract features from product attributes or generate fallbacks
function extractFeatures(product: Goods, seed: number): string[] {
  // If product has attributes, try to extract features
  if (product.attributes) {
    const features = [];
    
    // Common AI toy features to look for in attributes
    const featureKeys = ['intelligence', 'feature', 'capability', 'functionality', 'tech'];
    
    for (const [key, value] of Object.entries(product.attributes)) {
      // If the key contains any of the feature keywords, add it as a feature
      if (featureKeys.some(fKey => key.toLowerCase().includes(fKey))) {
        features.push(value);
      }
    }
    
    // If we found features, return them
    if (features.length > 0) {
      return features;
    }
  }
  
  // Use deterministic selection based on product id instead of random
  const fallbackFeatures = [
    "Voice Control",
    "Smart Learning",
    "Interactive Play",
    "App Connected",
    "Educational Content",
    "Customizable"
  ];
  
  // Use a deterministic approach instead of random
  const selectedFeatures = [];
  for (let i = 0; i < 4; i++) {
    const index = (seed + i) % fallbackFeatures.length;
    selectedFeatures.push(fallbackFeatures[index]);
  }
  
  return selectedFeatures;
}

// 计算剩余库存，使用确定性方法
const getRemainingStock = (item: Goods) => {
  if (item.store !== undefined) {
    return item.store;
  }
  // Use product id to generate a deterministic value instead of random
  return (item.id % 15) + 5; // Returns 5-19 based on id
};

// 判断秒杀是否有效
const isFlashSaleValid = (flashTime?: string) => {
  if (!flashTime) return false;
  
  try {
    // This check will be done on client side only
    // We avoid using current date on server
    const endTime = new Date(flashTime);
    const now = new Date();
    return endTime > now;
  } catch (e) {
    console.error("Error parsing flash sale time:", e);
    return false;
  }
};

export default function AIToysClient({ aiToys }: AIToysClientProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [mediaItems, setMediaItems] = useState<{ [key: number]: Media[] }>({});
  const [isHovering, setIsHovering] = useState<{[key: number]: boolean}>({});
  const [isPlaying, setIsPlaying] = useState<{[key: number]: boolean}>({});
  const [isClient, setIsClient] = useState(false);
  const hoverTimersRef = useRef<{[key: string]: NodeJS.Timeout}>({});
  
  // Mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 视频引用和HLS实例
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const hlsInstancesRef = useRef<{ [key: string]: Hls | null }>({});
  
  // Items per page for the grid display
  const itemsPerPage = 6;
  
  // Generate rating and features for products
  const enhancedProducts = useMemo(() => {
    return aiToys.map(product => {
      // Generate deterministic rating based on product id
      const rating = product.rating || ((product.id % 10) / 10 + 4).toFixed(1);
      
      // Generate deterministic review count based on product id
      const reviewCount = 24 + (product.id % 126);
      
      // Extract or generate features
      const features = extractFeatures(product, product.id);
      
      return {
        ...product,
        rating: typeof rating === 'string' ? parseFloat(rating) : rating,
        reviewCount,
        features
      };
    });
  }, [aiToys]);
  
  // Current page items
  const currentItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return enhancedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [enhancedProducts, currentPage, itemsPerPage]);
  
  // Total pages
  const totalPages = Math.ceil(enhancedProducts.length / itemsPerPage);

  // 优化后的媒体资源加载函数，仅在currentItems变化时触发
  useEffect(() => {
    // 防止空数组引起不必要的请求
    if (currentItems.length === 0) return;
    
    // 减少日志输出
    // console.log('AI Toys: Loading media resources, current products count:', currentItems.length);
    
    const fetchAllMedia = async () => {
      // 检查哪些产品需要获取媒体数据（过滤掉已经有数据的产品）
      const productsToFetch = currentItems.filter(product => 
        !mediaItems[product.id] || !Array.isArray(mediaItems[product.id])
      );
      
      if (productsToFetch.length === 0) {
        return; // 所有产品都已有缓存数据，无需再次请求
      }
      
      // 实现批处理请求，每批最多3个请求，减轻服务器压力
      const batchSize = 3;
      const newMediaItems: { [key: number]: Media[] } = {};
      
      // 分批处理请求
      for (let i = 0; i < productsToFetch.length; i += batchSize) {
        const batch = productsToFetch.slice(i, i + batchSize);
        
        try {
          // 并行执行当前批次的请求
          const batchResults = await Promise.all(
            batch.map(product => 
              serverAxios.get(`/media/goods/${product.id}`)
                .then(response => {
                  if (Array.isArray(response.data)) {
                    return { productId: product.id, media: response.data };
                  }
                  return { productId: product.id, media: [] };
                })
                .catch(error => {
                  console.error(`Failed to get product ${product.id} media:`, error);
                  return { productId: product.id, media: [] };
                })
            )
          );
          
          // 添加当前批次结果到新媒体项目中
          batchResults.forEach(result => {
            newMediaItems[result.productId] = result.media;
          });
          
          // 如果不是最后一批，添加延迟以减轻服务器压力
          if (i + batchSize < productsToFetch.length) {
            await new Promise(resolve => setTimeout(resolve, 300)); // 300ms延迟
          }
        } catch (error) {
          console.error('Error fetching batch of media:', error);
        }
      }
      
      // 合并新旧媒体数据
      setMediaItems(prev => ({...prev, ...newMediaItems}));
    };
    
    fetchAllMedia();
  }, [currentItems, mediaItems]);
  
  // 处理鼠标悬停开始播放视频
  const handleMouseEnter = useCallback((productId: number) => {
    setIsHovering(prev => ({ ...prev, [productId]: true }));
    
    // 清除任何现有的定时器
    if (hoverTimersRef.current[`${productId}`]) {
      clearTimeout(hoverTimersRef.current[`${productId}`]);
      delete hoverTimersRef.current[`${productId}`];
    }
    
    // 添加0.5秒延迟
    hoverTimersRef.current[`${productId}`] = setTimeout(() => {
      setIsPlaying(prev => ({ ...prev, [productId]: true }));
      
      const productMedia = mediaItems[productId];
      if (!productMedia) return;
      
      // 查找第一个视频
      const videoMedia = productMedia.find(media => media.mediaType === "video");
      if (!videoMedia) return;
      
      const videoId = `video-${productId}`;
      const videoEl = videoRefs.current[videoId];
      if (!videoEl) return;
      
      // 清理任何已存在的HLS实例
      if (hlsInstancesRef.current[videoId]) {
        try {
          hlsInstancesRef.current[videoId]?.destroy();
        } catch (e) {
          console.error('Error destroying HLS instance:', e);
        }
        hlsInstancesRef.current[videoId] = null;
      }
      
      // 确保视频元素已清理
      videoEl.onloadedmetadata = null;
      videoEl.onerror = null;
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
      
      // 配置视频并自动播放
      if (videoMedia.url.includes(".m3u8")) {
        if (Hls.isSupported()) {
          try {
            const hls = new Hls({ 
              enableWorker: false, // 关闭worker以减少内存使用
              lowLatencyMode: false, // 关闭低延迟模式
              startLevel: 0, // 从最低质量开始
              capLevelToPlayerSize: true, // 根据播放器大小调整质量
              maxBufferLength: 15 // 减少缓冲区长度
            });
            
            // 创建事件监听器引用以便后续可以移除
            const errorHandler = (event: any, data: any) => {
              if (data.fatal) {
                console.warn('HLS致命错误:', data);
                try {
                  hls.destroy();
                } catch (e) {
                  console.error('清理HLS实例失败:', e);
                }
                hlsInstancesRef.current[videoId] = null;
              }
            };
            
            hls.on(Hls.Events.ERROR, errorHandler);
            
            hls.loadSource(videoMedia.url);
            hls.attachMedia(videoEl);
            hlsInstancesRef.current[videoId] = hls;
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              videoEl.play().catch(e => {
                console.warn("自动播放失败:", e);
              });
            });
            
            // 存储清理函数
            const cleanup = () => {
              hls.off(Hls.Events.ERROR, errorHandler);
            };
            
            // 当视频被卸载时执行清理
            videoEl.addEventListener('emptied', cleanup, { once: true });
          } catch (e) {
            console.error('创建HLS实例失败:', e);
          }
        } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari 原生 HLS
          try {
            videoEl.src = videoMedia.url;
            videoEl.play().catch(e => {
              console.warn("自动播放失败:", e);
            });
          } catch (e) {
            console.error('Safari播放HLS失败:', e);
          }
        }
      } else {
        // 普通视频格式
        try {
          videoEl.src = videoMedia.url;
          videoEl.play().catch(e => {
            console.warn("自动播放失败:", e);
          });
        } catch (e) {
          console.error('播放视频失败:', e);
        }
      }
    }, 500); // 0.5秒延迟
  }, [mediaItems]);
  
  // 处理鼠标离开停止播放视频
  const handleMouseLeave = useCallback((productId: number) => {
    setIsHovering(prev => ({ ...prev, [productId]: false }));
    setIsPlaying(prev => ({ ...prev, [productId]: false }));
    
    // 清除悬停定时器
    if (hoverTimersRef.current[`${productId}`]) {
      clearTimeout(hoverTimersRef.current[`${productId}`]);
      delete hoverTimersRef.current[`${productId}`];
    }
    
    const videoId = `video-${productId}`;
    const videoEl = videoRefs.current[videoId];
    
    // 停止视频播放
    if (videoEl) {
      try {
        videoEl.pause();
        videoEl.currentTime = 0;
        videoEl.removeAttribute('src');
        videoEl.load(); // 强制清空缓冲区
      } catch (e) {
        console.error('清理视频元素失败:', e);
      }
    }
    
    // 清理HLS实例
    if (hlsInstancesRef.current[videoId]) {
      try {
        hlsInstancesRef.current[videoId]?.destroy();
      } catch (e) {
        console.error('销毁HLS实例失败:', e);
      }
      hlsInstancesRef.current[videoId] = null;
    }
  }, []);
  
  // 清理函数
  const cleanupResources = useCallback(() => {
    // 清理所有视频和HLS实例
    Object.keys(videoRefs.current).forEach(videoId => {
      const videoEl = videoRefs.current[videoId];
      if (videoEl) {
        try {
          videoEl.pause();
          videoEl.removeAttribute('src');
          videoEl.load();
          videoEl.onloadedmetadata = null;
          videoEl.onerror = null;
        } catch (e) {
          console.error('清理视频元素失败:', e);
        }
      }
    });
    
    // 清理HLS实例
    Object.keys(hlsInstancesRef.current).forEach(key => {
      if (hlsInstancesRef.current[key]) {
        try {
          hlsInstancesRef.current[key]?.destroy();
        } catch (e) {
          console.error('销毁HLS实例失败:', e);
        }
        hlsInstancesRef.current[key] = null;
      }
    });
    
    // 清理所有定时器
    Object.keys(hoverTimersRef.current).forEach(key => {
      clearTimeout(hoverTimersRef.current[key]);
    });
    
    // 重置状态
    setIsHovering({});
    setIsPlaying({});
    
    // 清空引用
    videoRefs.current = {};
    hlsInstancesRef.current = {};
    hoverTimersRef.current = {};
  }, []);

  // 组件卸载时清理所有HLS实例
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  // 页面切换时清理资源
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [currentPage, cleanupResources]);

  // 监听页面可见性变化，当隐藏时释放资源
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面不可见时清理资源
        cleanupResources();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cleanupResources]);

  // 监听窗口大小变化，避免视频播放期间的内存占用过高
  useEffect(() => {
    const handleResize = () => {
      // 视窗大小变化较大时，清理资源
      cleanupResources();
    };
    
    const debouncedResize = debounce(handleResize, 300);
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [cleanupResources]);

  // 防抖函数
  function debounce(fn: Function, ms = 300) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), ms);
    };
  }

  return (
    <div className="min-h-screen bg-black text-white container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">🚀 AI Toys</h1>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">What Are AI Toys?</h2>
        <p className="text-lg text-gray-300 mb-6">
          AI toys combine cutting-edge artificial intelligence with interactive play experiences. 
          These smart toys can learn, adapt, and respond to user behavior, creating personalized 
          experiences. From talking robots to image-recognition learning companions, 
          these innovations are transforming how we interact with technology.
        </p>
      </div>
      
      {enhancedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((product) => {
              const productMedia = mediaItems[product.id];
              const videoMedia = productMedia?.find(media => media.mediaType === "video");
              const hasVideo = !!videoMedia;
              const remainingStock = getRemainingStock(product);
              const isFlashActive = isClient && isFlashSaleValid(product.flashTime);
              
              return (
                <Link
                  href={`/product/${product.id}-${slugify(product.name)}`}
                  key={`ai-toy-${product.id}`}
                >
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl overflow-hidden shadow-lg border border-purple-800/30 h-full flex flex-col">
                    <div 
                      className="relative aspect-square w-full overflow-hidden"
                      onMouseEnter={() => hasVideo && handleMouseEnter(product.id)}
                      onMouseLeave={() => hasVideo && handleMouseLeave(product.id)}
                    >
                      <Image
                        src={product.img}
                        alt={product.name}
                        fill
                        className={`object-cover transition-transform duration-300 hover:scale-110 ${
                          isHovering[product.id] && hasVideo && videoMedia ? "opacity-0" : "opacity-100"
                        }`}
                      />
                      
                      {isHovering[product.id] && hasVideo && videoMedia && (
                        <video
                          ref={el => {
                            videoRefs.current[`video-${product.id}`] = el;
                          }}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                            isPlaying[product.id] ? "opacity-100" : "opacity-0"
                          }`}
                          muted
                          playsInline
                          loop
                        />
                      )}
                      
                      {remainingStock < 5 && (
                        <div className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 rounded-md text-sm font-bold">
                          Almost Sold Out
                        </div>
                      )}
                      
                      {product.hasDiscount && (
                        <div className="absolute top-2 right-2  bg-[#FFD700] text-black text-sm font-bold px-2 py-1 rounded-md text-sm font-bold">
                          🏷️ Discount
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h2 className="text-xl font-bold text-white">{product.name}</h2>
                        <div className="flex items-center">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-yellow-400" : "text-gray-500"}`} 
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-white">({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <p className="text-gray-300 mb-4 line-clamp-3">
                          {product.description || 
                            "This innovative AI toy provides an interactive learning experience. Designed with advanced technology to engage and educate."}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.features.map((feature, index) => (
                            <span key={index} className="bg-purple-900/50 text-purple-200 text-xs px-2 py-1 rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-2">
                          <span className="text-sm text-gray-400">Only {remainingStock} left in stock</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div>
                          {product.hasFlash && product.flashPrice && isFlashActive ? (
                            <div className="flex flex-col">
                              <span className="text-gray-400 line-through text-sm">${product.originPrice.toFixed(2)}</span>
                              <span className="text-xl font-bold text-red-300">${product.flashPrice.toFixed(2)}</span>
                            </div>
                          ) : product.hasDiscount && product.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="text-gray-400 line-through text-sm">${product.originPrice.toFixed(2)}</span>
                              <span className="text-xl font-bold text-purple-300">${product.discountPrice.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-purple-300">${product.originPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <OptimizedCartButton 
                          product={product}
                          isFlashSaleValid={isFlashSaleValid}
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white"
                          iconSize={16}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-4">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className={`p-2 rounded-full ${
                  currentPage === 0 ? "text-gray-600" : "text-white hover:bg-gray-800"
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex space-x-2 mt-3">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentPage === idx ? "bg-white w-6" : "bg-gray-500"
                    }`}
                    onClick={() => setCurrentPage(idx)}
                  />
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className={`p-2 rounded-full ${
                  currentPage === totalPages - 1 ? "text-gray-600" : "text-white hover:bg-gray-800"
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gray-900 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">No AI Toys Available</h2>
          <p className="text-gray-400">Check back soon for our cutting-edge AI toy collection!</p>
        </div>
      )}
    </div>
  );
} 