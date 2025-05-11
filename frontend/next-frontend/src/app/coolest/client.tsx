"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Hls from "hls.js";
import serverAxios from "@/lib/axios-server";
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

// 新增媒体数据接口
interface Media {
  id: number;
  goodsId: number;
  mediaType: "image" | "video";
  url: string;
  thumbnailUrl?: string;
}

interface CoolestClientProps {
  coolProducts: Goods[];
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

export default function CoolestClient({ coolProducts }: CoolestClientProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 添加媒体和视频播放相关状态
  const [mediaItems, setMediaItems] = useState<{ [key: number]: Media[] }>({});
  const [isHovering, setIsHovering] = useState<{[key: number]: boolean}>({});
  const [isPlaying, setIsPlaying] = useState<{[key: number]: boolean}>({});
  const hoverTimersRef = useRef<{[key: string]: NodeJS.Timeout}>({});
  
  // 视频引用和HLS实例
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const hlsInstancesRef = useRef<{ [key: string]: Hls | null }>({});
  
  // Items per page for the grid display
  const itemsPerPage = 10;
  
  // Generate ratings for products that don't have them using deterministic approach
  const productsWithRatings = useMemo(() => {
    return coolProducts.map(product => {
      // If the product already has a rating, use it
      if (product.rating) return product;
      
      // Generate deterministic rating based on product id
      const rating = ((product.id % 12) / 10 + 3.8).toFixed(1);
      
      return {
        ...product,
        rating: parseFloat(rating)
      };
    });
  }, [coolProducts]);
  
  // Current page items
  const currentItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return productsWithRatings.slice(startIndex, startIndex + itemsPerPage);
  }, [productsWithRatings, currentPage, itemsPerPage]);
  
  // Total pages
  const totalPages = Math.ceil(productsWithRatings.length / itemsPerPage);
  
  // Check if an item was recently added (for display purposes)
  const isNewItem = (date?: string) => {
    if (!date) return false;
    
    const itemDate = new Date(date);
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    return itemDate > thirtyDaysAgo;
  };

  // 判断秒杀是否有效
  const isFlashSaleValid = (flashTime?: string) => {
    if (!flashTime || !isClient) return false;
    
    try {
      const endTime = new Date(flashTime);
      const now = new Date();
      return endTime > now;
    } catch (e) {
      console.error("Error parsing flash sale time:", e);
      return false;
    }
  };

  // 加载媒体资源
  useEffect(() => {
    // 防止空数组引起不必要的请求
    if (currentItems.length === 0) return;
    
    // 减少日志输出
    // console.log('Coolest: Loading media resources, current products count:', currentItems.length);
    
    // 添加节流控制，避免短时间内发送过多请求
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
              enableWorker: false, 
              lowLatencyMode: false,
              startLevel: 0,
              capLevelToPlayerSize: true,
              maxBufferLength: 15
            });
            
            // 创建事件监听器引用以便后续可以移除
            const errorHandler = (event: any, data: any) => {
              if (data.fatal) {
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
  
  // 组件卸载时清理资源
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
  
  // 页面可见性变化时清理资源
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupResources();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cleanupResources]);
  
  // 窗口大小变化时清理资源
  useEffect(() => {
    const handleResize = debounce(() => {
      cleanupResources();
    }, 300);
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
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
      <h1 className="text-3xl font-bold mb-8 text-center">😎 Coolest Gadgets</h1>
      
      {productsWithRatings.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentItems.map((product) => (
              <Link
                href={`/product/${product.id}-${slugify(product.name)}`}
                key={`cool-product-${product.id}`}
              >
                <div className="group bg-gray-900 rounded-lg overflow-hidden shadow-lg relative">
                  <div 
                    className="aspect-square relative overflow-hidden"
                    onMouseEnter={() => mediaItems[product.id]?.some(media => media.mediaType === "video") && handleMouseEnter(product.id)}
                    onMouseLeave={() => mediaItems[product.id]?.some(media => media.mediaType === "video") && handleMouseLeave(product.id)}
                  >
                    <Image
                      src={product.img}
                      alt={product.name}
                      fill
                      className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                        isHovering[product.id] && isPlaying[product.id] && mediaItems[product.id]?.some(media => media.mediaType === "video") 
                          ? "opacity-0" 
                          : "opacity-100"
                      }`}
                    />
                    
                    {mediaItems[product.id]?.some(media => media.mediaType === "video") && (
                      <div className="absolute inset-0">
                        {isHovering[product.id] && (
                          <video
                            ref={el => {
                              videoRefs.current[`video-${product.id}`] = el;
                            }}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                              isPlaying[product.id] ? "opacity-100" : "opacity-0"
                            }`}
                            muted
                            playsInline
                            loop
                          />
                        )}
                      </div>
                    )}
                    
                    {isNewItem(product.date) && (
                      <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                        New Arrival
                      </div>
                    )}
                    
                    {product.hasDiscount && (
                      <div className="absolute top-2 right-2 bg-[#FFD700] text-black px-2 py-1 rounded-md text-xs font-bold">
                        🏷️ Discount
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium line-clamp-2 h-10">
                        {product.name}
                      </h3>
                      <div className="flex items-center ml-2 shrink-0">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-xs text-gray-300">{product.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        {product.hasFlash && product.flashPrice && isFlashSaleValid(product.flashTime) ? (
                          <div className="flex flex-col h-[38px]">
                            <span className="text-gray-400 line-through text-xs">${product.originPrice.toFixed(2)}</span>
                            <span className="text-red-500 font-bold">${product.flashPrice.toFixed(2)}</span>
                          </div>
                        ) : product.hasDiscount && product.discountPrice ? (
                          <div className="flex flex-col h-[38px]">
                            <span className="text-gray-400 line-through text-xs">${product.originPrice.toFixed(2)}</span>
                            <span className="text-yellow-400 font-bold">${product.discountPrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col h-[38px]">
                            <span className="invisible text-xs">&nbsp;</span>
                            <span className="font-bold">${product.originPrice.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      
                      <OptimizedCartButton 
                        product={product}
                        isFlashSaleValid={isFlashSaleValid}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white" 
                        iconSize={14}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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
          <h2 className="text-2xl font-bold mb-4">No Coolest Gadgets Available</h2>
          <p className="text-gray-400">Check back soon for exciting new technology!</p>
        </div>
      )}
    </div>
  );
} 