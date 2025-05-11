"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from "framer-motion";
import { ShoppingCart, Timer, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Hls from "hls.js";
import serverAxios from "@/lib/axios-server";

// Interface for goods data
interface Goods {
  id: number;
  name: string;
  originPrice: number;
  hasGroup: boolean;
  groupPrice?: number;
  hasFlash: boolean;
  flashPrice?: number;
  img: string;
  date?: string;
  store?: number;
  flashTime?: string;
  flashNum?: number;
}

// 新增媒体数据接口
interface Media {
  id: number;
  goodsId: number;
  mediaType: "image" | "video";
  url: string;
  thumbnailUrl?: string;
}

interface FlashSaleClientProps {
  flashSaleItems: Goods[];
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

export default function FlashSaleClient({ flashSaleItems }: FlashSaleClientProps) {
  const [flashSalePage, setFlashSalePage] = useState(0);
  const [processedItems, setProcessedItems] = useState<Goods[]>([]);
  // 新增媒体状态
  const [mediaItems, setMediaItems] = useState<{ [key: number]: Media[] }>({});
  const [isHovering, setIsHovering] = useState<{[key: number]: boolean}>({});
  // 添加延迟播放状态
  const [isPlaying, setIsPlaying] = useState<{[key: number]: boolean}>({});
  // 添加定时器引用
  const hoverTimersRef = useRef<{[key: number]: NodeJS.Timeout}>({});
  
  // 使用useRef替代useState存储倒计时状态
  const countdownsRef = useRef<{[key: number]: string}>({});
  // 创建一个简单状态只用于触发UI更新
  const [countdownTrigger, setCountdownTrigger] = useState(0);
  
  // 视频引用和HLS实例
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const hlsInstancesRef = useRef<{ [key: string]: Hls | null }>({});
  
  // Items per page for the grid display
  const itemsPerPage = 8;
  
  // Calculate remaining time for flash sales
  const calculateRemainingTime = useCallback((flashTime?: string) => {
    if (!flashTime) return "00:00:00";
    
    const endTime = new Date(flashTime);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return "00:00:00";
    
    // Calculate remaining time
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Format time
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }, []);
  
  // 计算当前页面要显示的商品，使用useMemo以避免不必要的重新计算
  const currentItems = useMemo(() => {
    const startIndex = flashSalePage * itemsPerPage;
    return processedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [processedItems, flashSalePage, itemsPerPage]);
  
  // 初始化时和翻页时过滤有效的Flash Sale商品，不依赖倒计时状态
  useEffect(() => {
    // 过滤出所有具有Flash Sale功能的商品，同时检查倒计时是否已过期
    const validItems = flashSaleItems.filter(item => {
      if (item.hasFlash && item.flashPrice && item.flashTime) {
        const timeLeft = calculateRemainingTime(item.flashTime);
        return timeLeft !== "00:00:00"; // 过滤掉已过期的商品
      }
      return false;
    });
    
    setProcessedItems(validItems);
  }, [flashSaleItems, calculateRemainingTime]);
  
  // 单独的倒计时逻辑，不影响商品列表
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: {[key: number]: string} = {};
      processedItems.forEach(item => {
        if (item.flashTime) {
          const timeLeft = calculateRemainingTime(item.flashTime);
          newCountdowns[item.id] = timeLeft;
        }
      });
      
      // 只更新倒计时引用，不触发重新渲染
      countdownsRef.current = newCountdowns;
      // 轻量级触发器更新UI
      setCountdownTrigger(prev => prev + 1);
    };
    
    // 初始更新
    updateCountdowns();
    
    // 每秒更新倒计时，但不触发其他依赖链
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [processedItems, calculateRemainingTime]);
  
  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };
  
  // Total pages
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  
  // Calculate remaining stock (replacing sold percentage)
  const getRemainingStock = (item: Goods) => {
    if (item.store !== undefined) {
      return item.store;
    }
    // Fallback random stock between 1-20 if no data
    return Math.floor(Math.random() * 20) + 1;
  };

  // 2. 减少不必要的媒体加载，使用缓存
  const [mediaCache, setMediaCache] = useState<{[key: number]: Media[]}>({});

  // 修改media加载逻辑，避免重复请求
  useEffect(() => {
    if (currentItems.length === 0) return;
    
    const fetchAllMedia = async () => {
      const newMediaItems = {...mediaCache};
      const itemsToFetch = currentItems.filter(item => !mediaCache[item.id]);
      
      if (itemsToFetch.length === 0) {
        setMediaItems(mediaCache);
        return;
      }
      
      // 只请求未缓存的商品媒体
      const mediaPromises = itemsToFetch.map(product => 
        serverAxios.get(`/media/goods/${product.id}`)
          .then(response => {
            if (Array.isArray(response.data)) {
              return { productId: product.id, media: response.data };
            }
            return { productId: product.id, media: [] };
          })
          .catch(error => {
            console.error(`获取产品 ${product.id} 媒体失败:`, error);
            return { productId: product.id, media: [] };
          })
      );
      
      // 并行执行所有请求
      const results = await Promise.all(mediaPromises);
      
      // 整理媒体数据
      results.forEach(result => {
        newMediaItems[result.productId] = result.media;
      });
      
      // 更新缓存
      setMediaCache({...mediaCache, ...newMediaItems});
      setMediaItems(newMediaItems);
    };
    
    fetchAllMedia();
  }, [currentItems, mediaCache]);
  
  // 处理鼠标悬停开始播放视频
  const handleMouseEnter = useCallback((productId: number) => {
    setIsHovering(prev => ({ ...prev, [productId]: true }));
    
    // 添加0.5秒延迟
    hoverTimersRef.current[productId] = setTimeout(() => {
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
        hlsInstancesRef.current[videoId]?.destroy();
        hlsInstancesRef.current[videoId] = null;
      }
      
      // 配置视频并自动播放
      if (videoMedia.url.includes(".m3u8")) {
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(videoMedia.url);
          hls.attachMedia(videoEl);
          hlsInstancesRef.current[videoId] = hls;
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoEl.play().catch(e => {
              console.warn("自动播放失败，可能是浏览器策略限制:", e);
            });
          });
        } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari 原生 HLS
          videoEl.src = videoMedia.url;
          videoEl.play().catch(e => {
            console.warn("自动播放失败，可能是浏览器策略限制:", e);
          });
        }
      } else {
        // 普通视频格式
        videoEl.src = videoMedia.url;
        videoEl.play().catch(e => {
          console.warn("自动播放失败，可能是浏览器策略限制:", e);
        });
      }
    }, 500); // 0.5秒延迟
  }, [mediaItems]);
  
  // 处理鼠标离开停止播放视频
  const handleMouseLeave = useCallback((productId: number) => {
    setIsHovering(prev => ({ ...prev, [productId]: false }));
    setIsPlaying(prev => ({ ...prev, [productId]: false }));
    
    // 清除悬停定时器
    if (hoverTimersRef.current[productId]) {
      clearTimeout(hoverTimersRef.current[productId]);
      delete hoverTimersRef.current[productId];
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
    }
  }, []);
  
  // 组件卸载时清理所有HLS实例和定时器
  useEffect(() => {
    return () => {
      // 强制清理所有视频元素
      Object.keys(videoRefs.current).forEach(key => {
        const video = videoRefs.current[key];
        if (video) {
          video.src = "";
          video.load();
        }
      });
      
      // 先暂停所有视频再销毁HLS
      Object.keys(hlsInstancesRef.current).forEach(key => {
        const hls = hlsInstancesRef.current[key];
        if (hls) {
          try {
            hls.stopLoad();
            hls.detachMedia();
            hls.destroy();
          } catch (e) {
            console.error("HLS清理错误:", e);
          }
        }
      });
      
      hlsInstancesRef.current = {};
      videoRefs.current = {};
      
      // 清理所有定时器
      Object.values(hoverTimersRef.current).forEach(clearTimeout);
      hoverTimersRef.current = {};
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">🔥 Flash Sale</h1>
      
      {processedItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentItems.map((item) => {
              const remainingStock = getRemainingStock(item);
              const discountPercentage = item.flashPrice 
                ? getDiscountPercentage(item.originPrice, item.flashPrice)
                : 0;
              
              // 检查是否有视频
              const productMedia = mediaItems[item.id] || [];
              const hasVideo = productMedia.some(media => media.mediaType === "video");
              const videoMedia = hasVideo ? productMedia.find(media => media.mediaType === "video") : null;
                
              return (
                <Link
                  href={`/product/${item.id}-${slugify(item.name)}`}
                  key={`flash-sale-${item.id}`}
                >
                  <div 
                    className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div 
                      className="relative aspect-square w-full overflow-hidden"
                      onMouseEnter={() => hasVideo && handleMouseEnter(item.id)}
                      onMouseLeave={() => hasVideo && handleMouseLeave(item.id)}
                    >
                      <Image
                        src={item.img}
                        alt={item.name}
                        fill
                        className={`object-cover transition-transform duration-300 hover:scale-110 ${
                          isHovering[item.id] && isPlaying[item.id] && hasVideo && videoMedia ? "opacity-0" : "opacity-100"
                        }`}
                      />
                      
                      {isHovering[item.id] && hasVideo && videoMedia && (
                        <video
                          ref={el => {
                            videoRefs.current[`video-${item.id}`] = el;
                          }}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                            isPlaying[item.id] ? "opacity-100" : "opacity-0"
                          }`}
                          muted
                          playsInline
                          loop
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-bold">
                        {discountPercentage}% OFF
                      </div>
                      {remainingStock < 5 && (
                        <div className="absolute bottom-2 left-2 bg-orange-600 text-white px-2 py-1 rounded-md text-sm font-bold">
                          Almost Sold Out
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h2 className="text-xl font-semibold mb-2 text-white">{item.name}</h2>
                      <div className="flex items-center mb-2">
                        <span className="text-red-500 font-bold text-xl">${item.flashPrice?.toFixed(2)}</span>
                        <span className="text-gray-400 line-through ml-2">${item.originPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Only {remainingStock} left in stock</span>
                      </div>
                      
                      <button className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-md font-medium flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                      </button>
                      
                      <div className="mt-3 flex items-center justify-center text-sm text-gray-400">
                        <div className="flex items-center">
                          <Timer className="w-4 h-4 mr-1 text-red-500" /> 
                          <span className="text-red-500 font-bold">{countdownsRef.current[item.id]}</span>
                        </div>
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
                onClick={() => setFlashSalePage(prev => Math.max(0, prev - 1))}
                disabled={flashSalePage === 0}
                className={`p-2 rounded-full ${
                  flashSalePage === 0 ? "text-gray-600" : "text-white hover:bg-gray-800"
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex space-x-2 mt-3">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all ${
                      flashSalePage === idx ? "bg-white w-6" : "bg-gray-500"
                    }`}
                    onClick={() => setFlashSalePage(idx)}
                  />
                ))}
              </div>
              
              <button 
                onClick={() => setFlashSalePage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={flashSalePage === totalPages - 1}
                className={`p-2 rounded-full ${
                  flashSalePage === totalPages - 1 ? "text-gray-600" : "text-white hover:bg-gray-800"
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gray-900 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">No Active Flash Sales</h2>
          <p className="text-gray-400">Check back soon for exciting deals!</p>
        </div>
      )}
    </div>
  );
} 