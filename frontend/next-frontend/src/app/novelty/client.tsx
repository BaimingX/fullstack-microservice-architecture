"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import serverAxios from "@/lib/axios-server";
import Image from 'next/image';
import Hls from "hls.js";
import DiscountBadge from '@/components/ui/DiscountBadge';
import OptimizedCartButton from '@/components/ui/OptimizedCartButton';

// 定义最大同时播放视频数量
const MAX_ACTIVE_VIDEOS = 2;

// 视频加载状态跟踪
const videoLoadingState = {
  activeVideos: 0,
  pendingVideos: [] as Array<{id: string, requestTime: number}>,
  cleanup() {
    this.activeVideos = 0;
    this.pendingVideos = [];
  }
};

// 防抖函数
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

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
  attributes?: {
    [key: string]: string;
  };
}

// Interface for media data
interface Media {
  id: number;
  goodsId: number;
  mediaType: "image" | "video";
  url: string;
  thumbnailUrl?: string;
}

interface NoveltyClientProps {
  noveltyItems: Goods[];
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

export default function NoveltyClient({ noveltyItems }: NoveltyClientProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [processedItems, setProcessedItems] = useState<Goods[]>([]);
  const [mediaItems, setMediaItems] = useState<{ [key: number]: Media[] }>({});
  const [isHovering, setIsHovering] = useState<{[key: number]: boolean}>({});
  const [isPlaying, setIsPlaying] = useState<{[key: number]: boolean}>({});
  const [isClient, setIsClient] = useState(false);
  
  // 视频引用和HLS实例
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const hlsInstancesRef = useRef<{ [key: string]: Hls | null }>({});
  const hoverTimersRef = useRef<{ [key: string]: NodeJS.Timeout | undefined }>({});
  
  // 添加重置函数
  const resetVideoState = useCallback(() => {
    // 停止所有视频播放
    Object.keys(videoRefs.current).forEach(key => {
      const video = videoRefs.current[key];
      if (video) {
        try {
          // 移除所有事件监听器
          video.onloadedmetadata = null;
          video.onerror = null;
          video.onended = null;
          video.pause();
          video.removeAttribute('src');
          video.load(); // 强制清空视频缓冲区
          video.currentTime = 0;
        } catch (e) {
          console.error('Error cleaning up video:', e);
        }
      }
    });
    
    // 清理所有HLS实例
    Object.keys(hlsInstancesRef.current).forEach(key => {
      if (hlsInstancesRef.current[key]) {
        try {
          hlsInstancesRef.current[key]?.destroy();
        } catch (e) {
          console.error('Error destroying HLS instance:', e);
        }
        hlsInstancesRef.current[key] = null;
      }
    });
    
    // 清理所有定时器
    Object.keys(hoverTimersRef.current).forEach(key => {
      if (hoverTimersRef.current[key]) {
        clearTimeout(hoverTimersRef.current[key]);
        delete hoverTimersRef.current[key];
      }
    });
    
    // 重置所有状态
    setIsHovering({});
    setIsPlaying({});
    videoLoadingState.cleanup();
    
    // 清空引用
    videoRefs.current = {};
    hlsInstancesRef.current = {};
  }, []);
  
  // Mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
    return () => {
      // 确保组件卸载时清理所有资源
      resetVideoState();
    };
  }, [resetVideoState]);
  
  // 添加页面可见性监听，当页面不可见时暂停所有视频
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetVideoState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetVideoState]);
  
  // 页面切换时重置所有视频状态
  useEffect(() => {
    resetVideoState();
  }, [currentPage, resetVideoState]);
  
  // Items per page for the grid display
  const itemsPerPage = 10; // Show 8 items per page to match design
  
  // 在组件初始化时处理商品数据，而不是在每次渲染时
  useEffect(() => {
    setProcessedItems(noveltyItems);
  }, [noveltyItems]);
  
  // 使用useMemo计算当前页面要显示的商品，避免不必要的计算
  const currentItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return processedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [processedItems, currentPage, itemsPerPage]);
  
  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(processedItems.length / itemsPerPage);
  }, [processedItems, itemsPerPage]);

  // 计算剩余库存，使用确定性方法
  const getRemainingStock = (item: Goods) => {
    if (item.store !== undefined) {
      return item.store;
    }
    // 使用商品ID生成确定性的库存数量，避免随机性
    return (item.id % 15) + 5; // 返回5-19之间的值
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

  // 优化后的媒体资源加载函数，仅在currentItems变化时触发
  useEffect(() => {
    // 防止空数组引起不必要的请求
    if (currentItems.length === 0) return;
    
    // 减少日志输出以节省内存
    // console.log('Novelty: Loading media resources, current products count:', currentItems.length);
    
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

  // 优化后的视频处理函数，使用优先级队列和限流
  const processNextPendingVideo = useCallback(() => {
    if (videoLoadingState.activeVideos >= MAX_ACTIVE_VIDEOS || videoLoadingState.pendingVideos.length === 0) {
      return;
    }
    
    // 处理队列中的下一个视频
    const nextVideo = videoLoadingState.pendingVideos.shift();
    if (!nextVideo) return;
    
    const videoId = nextVideo.id;
    const videoEl = videoRefs.current[videoId];
    
    if (!videoEl) return;
    
    // 根据ID解析productId
    const videoIdParts = videoId.split('-');
    if (videoIdParts.length !== 2) return;
    
    const productId = parseInt(videoIdParts[1], 10);
    if (isNaN(productId)) return;
    
    const productMedia = mediaItems[productId];
    if (!productMedia) return;
    
    // 查找第一个视频
    const videoMedia = productMedia.find(media => media.mediaType === "video");
    if (!videoMedia) return;
    
    videoLoadingState.activeVideos++;
    
    // 清理任何已存在的HLS实例
    if (hlsInstancesRef.current[videoId]) {
      try {
        hlsInstancesRef.current[videoId]?.destroy();
      } catch (e) {
        console.error('Error destroying existing HLS instance:', e);
      }
      hlsInstancesRef.current[videoId] = null;
    }
    
    // 确保视频元素已清理
    videoEl.onloadedmetadata = null;
    videoEl.onerror = null;
    videoEl.onended = null;
    videoEl.removeAttribute('src');
    videoEl.load();
    
    // 配置视频并自动播放
    if (videoMedia.url.includes(".m3u8")) {
      if (Hls.isSupported()) {
        // 使用HLS.js优化加载配置，降低内存占用
        const hls = new Hls({ 
          enableWorker: false, // 关闭worker以减少内存使用
          lowLatencyMode: false, // 关闭低延迟模式
          startLevel: 0, // 从最低质量开始
          capLevelToPlayerSize: true, // 根据播放器大小调整质量
          maxBufferLength: 15, // 减少缓冲区长度
          maxMaxBufferLength: 30, // 减少最大缓冲区长度
        });
        
        // 设置错误处理和资源释放
        const errorHandler = function(event: any, data: any) {
          if (data.fatal) {
            try {
              hls.destroy();
            } catch (e) {
              console.error('Error destroying HLS on error:', e);
            }
            hlsInstancesRef.current[videoId] = null;
            videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
            processNextPendingVideo();
          }
        };
        
        hls.on(Hls.Events.ERROR, errorHandler);
        
        // 视频加载完成后处理下一个等待中的视频
        const detachedHandler = function() {
          videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
          processNextPendingVideo();
        };
        
        hls.on(Hls.Events.MEDIA_DETACHED, detachedHandler);
        
        try {
          hls.loadSource(videoMedia.url);
          hls.attachMedia(videoEl);
          hlsInstancesRef.current[videoId] = hls;
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoEl.play().catch(e => {
              videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
              // 视频播放失败，释放资源
              try {
                hls.destroy();
              } catch (e) {
                console.error('Error destroying HLS after play failure:', e);
              }
              hlsInstancesRef.current[videoId] = null;
              processNextPendingVideo();
            });
          });
          
          // 存储清理函数
          const cleanup = () => {
            hls.off(Hls.Events.ERROR, errorHandler);
            hls.off(Hls.Events.MEDIA_DETACHED, detachedHandler);
          };
          
          // 当视频被卸载时执行清理
          videoEl.addEventListener('emptied', cleanup, { once: true });
          
        } catch (e) {
          console.error('HLS setup error:', e);
          videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
          processNextPendingVideo();
        }
      } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari 原生 HLS
        const loadedHandler = () => {
          videoEl.play().catch(e => {
            videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
            processNextPendingVideo();
          });
        };
        
        const errorHandler = () => {
          videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
          processNextPendingVideo();
        };
        
        videoEl.addEventListener('loadedmetadata', loadedHandler);
        videoEl.addEventListener('error', errorHandler);
        
        // 存储清理函数
        const cleanup = () => {
          videoEl.removeEventListener('loadedmetadata', loadedHandler);
          videoEl.removeEventListener('error', errorHandler);
        };
        
        // 当视频被卸载时执行清理
        videoEl.addEventListener('emptied', cleanup, { once: true });
        
        videoEl.src = videoMedia.url;
      }
    } else {
      // 普通视频格式
      const loadedHandler = () => {
        videoEl.play().catch(e => {
          videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
          processNextPendingVideo();
        });
      };
      
      const errorHandler = () => {
        videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
        processNextPendingVideo();
      };
      
      videoEl.addEventListener('loadedmetadata', loadedHandler);
      videoEl.addEventListener('error', errorHandler);
      
      // 存储清理函数
      const cleanup = () => {
        videoEl.removeEventListener('loadedmetadata', loadedHandler);
        videoEl.removeEventListener('error', errorHandler);
      };
      
      // 当视频被卸载时执行清理
      videoEl.addEventListener('emptied', cleanup, { once: true });
      
      videoEl.src = videoMedia.url;
    }
    
    // 添加视频结束事件监听，释放资源
    const endedHandler = () => {
      videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
      processNextPendingVideo();
    };
    
    videoEl.addEventListener('ended', endedHandler);
    
    // 存储清理函数
    const endedCleanup = () => {
      videoEl.removeEventListener('ended', endedHandler);
    };
    
    // 当视频被卸载时执行清理
    videoEl.addEventListener('emptied', endedCleanup, { once: true });
    
  }, [mediaItems]);

  // 处理鼠标悬停开始播放视频，使用防抖
  const handleMouseEnter = useCallback((productId: number) => {
    setIsHovering(prev => ({ ...prev, [productId]: true }));
    
    // 清除任何现有的定时器
    if (hoverTimersRef.current[`${productId}`]) {
      clearTimeout(hoverTimersRef.current[`${productId}`]);
      delete hoverTimersRef.current[`${productId}`];
    }
    
    // 添加延迟
    hoverTimersRef.current[`${productId}`] = setTimeout(() => {
      setIsPlaying(prev => ({ ...prev, [productId]: true }));
      
      const productMedia = mediaItems[productId];
      if (!productMedia) return;
      
      // 查找第一个视频
      const videoMedia = productMedia.find(media => media.mediaType === "video");
      if (!videoMedia) return;
      
      const videoId = `video-${productId}`;
      
      // 将此视频添加到处理队列
      const now = Date.now();
      
      // 检查是否已经在队列中
      if (!videoLoadingState.pendingVideos.some(video => video.id === videoId)) {
        videoLoadingState.pendingVideos.push({
          id: videoId,
          requestTime: now
        });
        
        // 尝试处理下一个视频
        processNextPendingVideo();
      }
    }, 500); // 0.5秒延迟
  }, [mediaItems, processNextPendingVideo]);
  
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
      videoEl.pause();
      videoEl.currentTime = 0;
    }
    
    // 清理HLS实例
    if (hlsInstancesRef.current[videoId]) {
      hlsInstancesRef.current[videoId]?.destroy();
      hlsInstancesRef.current[videoId] = null;
      
      // 减少活跃视频计数
      videoLoadingState.activeVideos = Math.max(0, videoLoadingState.activeVideos - 1);
      
      // 尝试处理队列中的下一个视频
      processNextPendingVideo();
    }
    
    // 从队列中移除此视频（如果存在）
    videoLoadingState.pendingVideos = videoLoadingState.pendingVideos.filter(
      video => video.id !== videoId
    );
  }, [processNextPendingVideo]);
  
  // 组件卸载时清理所有HLS实例
  useEffect(() => {
    // 页面变为可见时强制垃圾回收
    if (typeof window !== 'undefined' && 'gc' in window) {
      const tryGc = () => {
        try {
          // @ts-ignore
          window.gc();
        } catch (e) {
          // gc可能不可用，忽略错误
        }
      };
      
      window.addEventListener('focus', tryGc);
      
      return () => {
        window.removeEventListener('focus', tryGc);
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      // 清理所有资源
      resetVideoState();
      
      // 额外尝试触发一次垃圾回收
      setTimeout(() => {
        if (typeof window !== 'undefined' && 'gc' in window) {
          try {
            // @ts-ignore
            window.gc();
          } catch (e) {
            // gc可能不可用，忽略错误
          }
        }
      }, 100);
    };
  }, [resetVideoState]);

  return (
    <div className="min-h-screen bg-black text-white container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">🎮 Novelty Items</h1>
      
      {processedItems.length > 0 ? (
        <>
          {/* Product grid display */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentItems.map((product) => {
              const remainingStock = getRemainingStock(product);
              
              // 检查是否有视频
              const productMedia = mediaItems[product.id] || [];
              const hasVideo = productMedia.some(media => media.mediaType === "video");
              const videoMedia = hasVideo ? productMedia.find(media => media.mediaType === "video") : null;
              
              return (
                <Link 
                  href={`/product/${product.id}-${slugify(product.name)}`}
                  key={`novelty-${product.id}`}
                >
                  <div className="group bg-gray-900 rounded-lg overflow-hidden shadow-lg relative">
                    {/* Product image container */}
                    <div 
                      className="aspect-square relative overflow-hidden"
                      onMouseEnter={() => hasVideo && handleMouseEnter(product.id)}
                      onMouseLeave={() => hasVideo && handleMouseLeave(product.id)}
                    >
                      <Image 
                        src={product.img} 
                        alt={product.name}
                        fill
                        className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                          isHovering[product.id] && isPlaying[product.id] && hasVideo && videoMedia ? "opacity-0" : "opacity-100"
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
                        <div className="absolute bottom-2 left-2 bg-orange-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                          Almost Sold Out
                        </div>
                      )}
                      {product.hasDiscount && (
                        <div className="absolute top-2 right-2  bg-[#FFD700] text-black text-sm font-bold px-2 py-1 rounded-md text-sm font-bold">
                          🏷️ Discount
                        </div>
                      )}
                    </div>
                    
                    {/* Product information */}
                    <div className="p-3">
                      <h3 className="text-sm font-medium line-clamp-2 h-10 mb-2">
                        {product.name}
                      </h3>
                      
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
                          className="p-1.5 bg-pink-600 hover:bg-pink-700 rounded-full text-white"
                          iconSize={14}
                        />
                      </div>
                      
                      <div className="mt-2 flex justify-start">
                        <span className="text-xs text-gray-400">Only {remainingStock} left in stock</span>
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
          <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
          <p className="text-gray-400">Please check back later to see our collection of novelty items!</p>
        </div>
      )}
    </div>
  );
}