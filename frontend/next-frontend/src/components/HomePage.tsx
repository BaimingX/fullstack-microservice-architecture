"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Timer, ChevronLeft, ChevronRight } from "lucide-react";
import Hls from "hls.js";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import serverAxios from "@/lib/axios-server";
import NeonWave from "./ui/NeonWave";
import { useCart, CartItem } from '@/context/CartContext';
import ProductImage from './ui/ProductImage';

// Updated media data interface
interface Media {
  id: number;
  goodsId: number;
  mediaType: "image" | "video";
  url: string;
  thumbnailUrl?: string;
}

// Backend response data structure
interface CarouselItem {
  id: number;
  goodsId: number;
  goodsName: string;
  img: string;
  mediaType: "image" | "video";
  siteId: number;
}

// Backend product data structure
interface Goods {
  id: number;                 // Product ID
  name: string;              // Product name
  originPrice: number;       // Original price
  hasDiscount: boolean;         // Has discount
  discountPrice?: number;       // Discount price (optional)
  hasFlash: boolean;         // Has flash sale
  flashPrice?: number;       // Flash sale price (optional)
  img: string;               // Product image
  date?: string;             // Release date (optional)
  store?: number;            // Stock (optional)
  flashTime?: string;        // Flash sale end time (optional)
  flashNum?: number;         // Flash sale quota (optional)
}

interface HomePageProps {
  carouselData: CarouselItem[];
  allGoods: Goods[];
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // 移除特殊字符
    .split(/\s+/)
    .slice(0, 8)                  // 取前8个词
    .join("-");
}

export default function HomePage({ carouselData, allGoods }: HomePageProps) {
  const [topCarouselIndex, setTopCarouselIndex] = useState(0);
  const [hotProductsPage, setHotProductsPage] = useState(0);
  const [flashSalePage, setFlashSalePage] = useState(0); // 新增: 闪购商品的分页状态
  const [isClient, setIsClient] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const hlsInstancesRef = useRef<{ [key: string]: Hls | null }>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const pathname = usePathname(); // 获取当前路径
  
  // Add video-related states
  const [mediaItems, setMediaItems] = useState<{ [key: string | number]: Media[] | boolean }>({});
  const [isHovering, setIsHovering] = useState<{[key: number]: boolean}>({});
  const [isPlaying, setIsPlaying] = useState<{[key: number]: boolean}>({});
  const hoverTimersRef = useRef<{[key: number]: NodeJS.Timeout}>({});
  
  // New: All Products related states
  const [visibleProductsCount, setVisibleProductsCount] = useState(5); // 初始仅显示5个产品，而非10个，减少初始加载
  const observerTarget = useRef(null);
  
  // Use useMemo to cache data
  const memoizedCarouselData = useMemo(() => carouselData, [carouselData]);
  const memoizedAllGoods = useMemo(() => allGoods || [], [allGoods]);
  
  // Modified: Move expired products from flash sale list to normal list for UI rendering
  const [processedGoods, setProcessedGoods] = useState<{
    validFlashProducts: Goods[];
    normalProducts: Goods[];
  }>({ validFlashProducts: [], normalProducts: [] });

  // Group products by goodsId
  const groupedProducts = useMemo(() => {
    const grouped: { [key: number]: CarouselItem[] } = {};
    
    memoizedCarouselData.forEach((item: CarouselItem) => {
      if (!grouped[item.goodsId]) {
        grouped[item.goodsId] = [];
      }
      grouped[item.goodsId].push(item);
    });
    
    return Object.values(grouped);
  }, [memoizedCarouselData]);

  // Top carousel images
  const topCarouselImages = [
    "/images/homePage/1.png",
    "/images/homePage/2.png",
    "/images/homePage/3.png"
  ];
  
  // Calculate hot products pagination
  const productsPerPage = 4;
  const totalPages = Math.ceil(groupedProducts.length / productsPerPage);
  const currentPageProducts = useMemo(() => {
    const startIndex = hotProductsPage * productsPerPage;
    return groupedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [groupedProducts, hotProductsPage]);

  // Handle countdown logic - calculate for each product individually
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

  // Update all product countdowns
  const [countdowns, setCountdowns] = useState<{[key: number]: string}>({});
  
  // Mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
    
    // 从本地存储加载缓存的媒体数据
    if (typeof window !== 'undefined') {
      try {
        const cachedMedia = localStorage.getItem('homepageMediaCache');
        if (cachedMedia) {
          const parsedCache = JSON.parse(cachedMedia);
          // 检查缓存是否是最近24小时内的，如果是则使用
          const cacheTime = parsedCache.timestamp || 0;
          const now = Date.now();
          if (now - cacheTime < 24 * 60 * 60 * 1000) { // 24小时有效期
            setMediaItems(parsedCache.data || {});
          } else {
            // 缓存过期，清除
            localStorage.removeItem('homepageMediaCache');
          }
        }
      } catch (e) {
        console.error('Error loading media cache:', e);
        // 出错时清除缓存
        localStorage.removeItem('homepageMediaCache');
      }
    }
  }, []);
  
  // Check if flash sale is valid
  const isFlashSaleValid = useCallback((flashTime?: string) => {
    if (!flashTime || !isClient) return false;
    
    try {
      const endTime = new Date(flashTime);
      const now = new Date();
      return endTime > now;
    } catch (e) {
      console.error("Error parsing flash sale time:", e);
      return false;
    }
  }, [isClient]);
  
  // Modified: Filter valid flash products and regular products based on flash sale time
  useEffect(() => {
    const validateGoods = () => {
      // Separate expired and valid flash sale products
      const validFlash: Goods[] = [];
      const normal: Goods[] = [];
      
      memoizedAllGoods.forEach((product: Goods) => {
        // Check if it's a flash sale product and time is valid
        if (product.hasFlash && product.flashTime && isClient) {
          const isValid = isFlashSaleValid(product.flashTime);
          
          // If countdown is zero, display as regular product
          if (!isValid) {
            // Create new object but set hasFlash to false
            normal.push({...product, hasFlash: false});
          } else {
            validFlash.push(product);
          }
        } else {
          // Non-flash sale product
          normal.push(product);
        }
      });
      
      setProcessedGoods({
        validFlashProducts: validFlash,
        normalProducts: normal
      });
      
      // Initialize countdown states
      const initialCountdowns: {[key: number]: string} = {};
      validFlash.forEach(product => {
        initialCountdowns[product.id] = calculateRemainingTime(product.flashTime);
      });
      setCountdowns(initialCountdowns);
    };
    
    // Execute immediately
    validateGoods();
    
    // Regularly check and update flash sale status (update every second)
    const interval = setInterval(() => {
      validateGoods();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [memoizedAllGoods, calculateRemainingTime, isClient, isFlashSaleValid]);
  
  // New: Handle flash sale products pagination
  const flashProductsPerPage = 2; // 2x2 grid
  const totalFlashPages = Math.ceil(processedGoods.validFlashProducts.length / flashProductsPerPage);
  const currentFlashProducts = useMemo(() => {
    const startIndex = flashSalePage * flashProductsPerPage;
    return processedGoods.validFlashProducts.slice(startIndex, startIndex + flashProductsPerPage);
  }, [processedGoods.validFlashProducts, flashSalePage]);

  const findProductByGoodsId = useCallback((goodsId: number) => {
    return memoizedAllGoods.find(item => item.id === goodsId);
  }, [memoizedAllGoods]);

  // Get visible all products (non-flash)
  const visibleProducts = useMemo(() => {
    if (!processedGoods.normalProducts || !Array.isArray(processedGoods.normalProducts)) {
      return [];
    }
    // 只返回需要显示的产品，而不是加载全部后再筛选显示
    return processedGoods.normalProducts.slice(0, visibleProductsCount);
  }, [processedGoods.normalProducts, visibleProductsCount]);

  // 添加商品数据的缓存功能，用于在标签页切换时保留数据
  useEffect(() => {
    // 如果已处理的商品数据有效且不为空
    if (processedGoods.normalProducts && Array.isArray(processedGoods.normalProducts) && 
        processedGoods.normalProducts.length > 0 &&
        processedGoods.validFlashProducts && Array.isArray(processedGoods.validFlashProducts)) {
      // 保存数据到 sessionStorage (跨标签页缓存)
      try {
        sessionStorage.setItem('homepage_products_cache', JSON.stringify({
          normalProducts: processedGoods.normalProducts,
          validFlashProducts: processedGoods.validFlashProducts,
          timestamp: Date.now()
        }));
        
        // 同时保存可见产品数量，保持滚动位置
        sessionStorage.setItem('homepage_visible_count', visibleProductsCount.toString());
      } catch (e) {
        console.error('Error saving products to sessionStorage:', e);
      }
    }
  }, [processedGoods, visibleProductsCount]);

  // 从缓存加载数据
  useEffect(() => {
    if (!isClient) return;
    
    try {
      // 检查是否有缓存数据
      const cachedProducts = sessionStorage.getItem('homepage_products_cache');
      if (cachedProducts) {
        const parsed = JSON.parse(cachedProducts);
        // 检查缓存是否在5分钟内的，防止太旧
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          setProcessedGoods({
            normalProducts: parsed.normalProducts || [],
            validFlashProducts: parsed.validFlashProducts || []
          });
          
          // 恢复滚动位置
          const savedCount = sessionStorage.getItem('homepage_visible_count');
          if (savedCount) {
            setVisibleProductsCount(Math.max(5, parseInt(savedCount, 10)));
          }
          
          // 记录使用了缓存数据
          console.log('Restored products from cache');
        }
      }
    } catch (e) {
      console.error('Error loading cached products:', e);
    }
  }, [isClient]);

  // Handle video playback
  const playVideo = (productId: string) => {
    if (videoRefs.current[productId]) {
      const videoEl = videoRefs.current[productId];
      
      if (videoEl) {
        // 存储播放状态标志
        const playPromise = videoEl.play();
        
        // 处理播放Promise以避免中断错误
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.warn("视频自动播放被阻止:", e);
          });
        }
      }
    }
  };

  const pauseVideo = (productId: string) => {
    if (videoRefs.current[productId]) {
      const videoEl = videoRefs.current[productId];
      
      if (videoEl) {
        // 检查是否有活动的播放Promise
        if (videoEl.paused || !videoEl.currentTime) {
          // 视频已暂停或尚未开始播放，不需要额外操作
          return;
        }
        
        try {
          videoEl.pause();
        } catch (e) {
          console.error("暂停视频时出错:", e);
        }
      }
    }
  };

  // 添加资源清理函数
  const cleanupAllMediaResources = useCallback(() => {
    

    // 清理所有视频元素
    Object.entries(videoRefs.current).forEach(([key, videoEl]) => {
      if (videoEl) {
        try {
          // 停止播放
          videoEl.pause();
          // 移除源
          videoEl.src = '';
          videoEl.removeAttribute('src');
          // 清空缓冲区
          videoEl.load();
          // 移除事件监听器
          videoEl.onloadedmetadata = null;
          videoEl.onerror = null;
          videoEl.onended = null;
          videoEl.oncanplay = null;
          videoEl.onplay = null;
          videoEl.onpause = null;
        } catch (e) {
          console.error('清理视频元素失败:', e);
        }
      }
      // 清空引用
      videoRefs.current[key] = null;
    });

    // 清理所有HLS实例
    Object.entries(hlsInstancesRef.current).forEach(([key, hls]) => {
      if (hls) {
        try {
          // 移除所有事件监听器
          hls.off(Hls.Events.ERROR);
          hls.off(Hls.Events.MANIFEST_PARSED);
          hls.off(Hls.Events.MEDIA_ATTACHED);
          hls.off(Hls.Events.MEDIA_DETACHED);
          // 分离媒体
          hls.detachMedia();
          // 销毁实例
          hls.destroy();
        } catch (e) {
          console.error('销毁HLS实例失败:', e);
        }
      }
      // 清空引用
      hlsInstancesRef.current[key] = null;
    });

    // 清理所有定时器
    Object.entries(hoverTimersRef.current).forEach(([key, timer]) => {
      clearTimeout(timer);
      delete hoverTimersRef.current[Number(key)];
    });

    // 重置状态
    setHoveredProduct(null);
    setIsHovering({});
    setIsPlaying({});
    
    // 重置引用对象，帮助垃圾回收
    videoRefs.current = {};
    hlsInstancesRef.current = {};
    
    // 清理可能残留的动画元素
    const flyingBalls = document.querySelectorAll('.flying-ball');
    flyingBalls.forEach(ball => {
      if (document.body.contains(ball)) {
        document.body.removeChild(ball);
      }
    });
  }, []);

  // Set up HLS video playback - Fixed: Added dependency on currentPageProducts or hotProductsPage
  useEffect(() => {
    // Initialize videos for current page products
    currentPageProducts.forEach((group) => {
      group.forEach(item => {
        if (item.mediaType === "video") {
          const productId = `${item.goodsId}-${item.id}`;
          
          // Need a small delay to ensure DOM is updated
          setTimeout(() => {
            if (videoRefs.current[productId]) {
              const videoEl = videoRefs.current[productId];
              
              if (videoEl && hoveredProduct === productId) { // 只有在当前悬停时才加载
                // Check if it's HLS format (.m3u8)
                if (item.img.includes('.m3u8')) {
                  if (Hls.isSupported()) {
                    // Clean up previous HLS instance
                    if (hlsInstancesRef.current[productId]) {
                      hlsInstancesRef.current[productId]?.destroy();
                    }
                    
                    // Create new HLS instance
                    const hls = new Hls({
                      enableWorker: false,
                      lowLatencyMode: false,
                      maxBufferLength: 30,
                      maxMaxBufferLength: 30,
                      backBufferLength: 30,
                      // 添加额外的配置以优化HTTP请求
                      fragLoadingTimeOut: 20000, // 增加片段加载超时时间
                      manifestLoadingTimeOut: 20000, // 增加清单加载超时时间
                      levelLoadingTimeOut: 20000, // 增加级别加载超时时间
                      // 添加缓存相关配置
                      xhrSetup: function(xhr) {
                        // 设置请求头告知CDN这是视频请求，以便正确缓存
                        xhr.setRequestHeader('Cache-Control', 'max-age=3600');
                      }
                    });
                    
                    // 添加错误处理器
                    const errorHandler = (event: any, data: any) => {
                      if (data.fatal) {
                        console.error(`HLS fatal error for ${productId}: ${data.type} - ${data.details}`);
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                          console.log('尝试恢复网络错误...');
                          hls.startLoad(); // 尝试重新加载
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                          console.log('尝试恢复媒体错误...');
                          hls.recoverMediaError(); // 尝试恢复媒体错误
                        } else {
                          // 无法恢复的错误，清理资源
                          try {
                            hls.destroy();
                          } catch (e) {
                            console.error('销毁HLS实例失败:', e);
                          }
                          hlsInstancesRef.current[productId] = null;
                        }
                      }
                    };
                    
                    hls.on(Hls.Events.ERROR, errorHandler);
                    
                    // 添加详细日志以便调试
                    console.log(`加载HLS视频: ${item.img}`);
                    
                    hls.loadSource(item.img);
                    hls.attachMedia(videoEl);
                    hlsInstancesRef.current[productId] = hls;
                    
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                      console.log(`HLS manifest解析完成，尝试播放视频 ${productId}`);
                      
                      // 检查鼠标是否还在元素上
                      if (hoveredProduct === productId) {
                        const playPromise = videoEl.play();
                        if (playPromise !== undefined) {
                          playPromise.then(() => {
                            console.log(`视频 ${productId} 开始成功播放`);
                          }).catch(e => {
                            console.warn("自动播放失败，可能是由于浏览器策略:", e);
                          });
                        }
                      }
                    });
                    
                    // 存储清理函数，确保在元素被卸载时清理事件监听器
                    const cleanup = () => {
                      console.log(`清理视频: ${productId}`);
                      hls.off(Hls.Events.ERROR, errorHandler);
                    };
                    
                    // 当视频被卸载时执行清理
                    videoEl.addEventListener('emptied', cleanup, { once: true });
                  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                    // Safari浏览器原生HLS支持
                    console.log(`在Safari中加载原生HLS视频: ${item.img}`);
                    videoEl.src = item.img;
                    
                    // 检查鼠标是否还在元素上
                    if (hoveredProduct === productId) {
                      const playPromise = videoEl.play();
                      if (playPromise !== undefined) {
                        playPromise.then(() => {
                          console.log(`Safari原生HLS视频 ${productId} 开始成功播放`);
                        }).catch(e => {
                          console.warn("Safari自动播放失败:", e);
                        });
                      }
                    }
                  }
                } else {
                  // 非HLS视频
                  console.log(`加载标准视频: ${item.img}`);
                  videoEl.src = item.img;
                  
                  // 检查鼠标是否还在元素上
                  if (hoveredProduct === productId) {
                    const playPromise = videoEl.play();
                    if (playPromise !== undefined) {
                      playPromise.then(() => {
                        console.log(`标准视频 ${productId} 开始成功播放`);
                      }).catch(e => {
                        console.warn("自动播放失败，可能是由于浏览器策略:", e);
                      });
                    }
                  }
                }
              }
            }
          }, 50);
        }
      });
    });
    
    // Clean up resources when component unmounts or hot products page changes
    return () => {
      // 清理当前页面的视频和HLS实例
      currentPageProducts.forEach((group) => {
        group.forEach(item => {
          if (item.mediaType === "video") {
            const productId = `${item.goodsId}-${item.id}`;
            // 清理视频
            if (videoRefs.current[productId]) {
              const videoEl = videoRefs.current[productId];
              if (videoEl) {
                try {
                  if (!videoEl.paused) {
                    videoEl.pause();
                  }
                  videoEl.src = '';
                  videoEl.load();
                } catch (e) {
                  console.error(`清理视频元素失败: ${productId}`, e);
                }
              }
            }
            
            // 清理HLS实例
            if (hlsInstancesRef.current[productId]) {
              try {
                const hls = hlsInstancesRef.current[productId];
                if (hls) {
                  hls.off(Hls.Events.ERROR);
                  hls.off(Hls.Events.MANIFEST_PARSED);
                  hls.detachMedia();
                  hls.destroy();
                }
              } catch (e) {
                console.error(`清理HLS实例失败: ${productId}`, e);
              }
              hlsInstancesRef.current[productId] = null;
            }
          }
        });
      });
    };
  }, [currentPageProducts, hoveredProduct]); // 添加hoveredProduct作为依赖

  // 添加页面可见性和组件卸载监听器
  useEffect(() => {
    // 页面可见性变化处理
    const handleVisibilityChange = () => {
      if (document.hidden) {
        
        cleanupAllMediaResources();
      }
    };
    
    // 页面卸载前清理
    const handleBeforeUnload = () => {
      
      cleanupAllMediaResources();
    };
    
    // 添加事件监听器
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 组件卸载时清理
    return () => {
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupAllMediaResources();
      
      // 移除可能残留的动画元素
      const flyingBalls = document.querySelectorAll('.flying-ball');
      flyingBalls.forEach(ball => {
        if (document.body.contains(ball)) {
          document.body.removeChild(ball);
        }
      });
    };
  }, [cleanupAllMediaResources]);

  // Control video play/pause when hover state changes
  useEffect(() => {
    if (hoveredProduct) {
      // 添加50ms延迟，确保DOM有时间更新
      setTimeout(() => {
        // 再次检查悬停状态是否仍然有效
        if (hoveredProduct) {
          playVideo(hoveredProduct);
        }
      }, 50);
    } else {
      // 延迟暂停所有视频，避免与播放请求冲突
      setTimeout(() => {
        Object.keys(videoRefs.current).forEach(key => {
          pauseVideo(key);
        });
      }, 50);
    }
  }, [hoveredProduct]);

  // Add function to fetch Limited Time Offers media resources - Optimize network requests
  useEffect(() => {
    if (!currentFlashProducts.length) return;
    
    // 全局媒体缓存标识符
    const MEDIA_CACHE_KEY = 'global_media_cache';
    
    // 首先检查全局缓存中是否已有这些商品的媒体数据
    let globalMediaCache: {[key: string | number]: Media[]} = {};
    try {
      const cachedGlobalMedia = localStorage.getItem(MEDIA_CACHE_KEY);
      if (cachedGlobalMedia) {
        globalMediaCache = JSON.parse(cachedGlobalMedia);
      }
    } catch (e) {
      console.error('Error loading global media cache:', e);
    }
    
    // 检查哪些产品需要请求媒体数据
    // 排除已经在本地状态和全局缓存中的产品
    const productsToFetch = currentFlashProducts.filter(product => {
      // 检查本地状态
      const inLocalState = mediaItems[product.id] && Array.isArray(mediaItems[product.id]);
      
      // 检查全局缓存
      const inGlobalCache = globalMediaCache[product.id];
      
      // 检查是否正在加载中以避免重复请求
      const isLoading = mediaItems[`loading-${product.id}`] === true;
      
      return !inLocalState && !inGlobalCache && !isLoading;
    });
    
    // 如果没有需要获取的产品，则应用缓存并返回
    if (productsToFetch.length === 0) {
      // 检查全局缓存中是否有当前页面的产品但还没加载到本地状态
      const productsToLoadFromCache = currentFlashProducts.filter(product => 
        globalMediaCache[product.id] && 
        (!mediaItems[product.id] || !Array.isArray(mediaItems[product.id]))
      );
      
      if (productsToLoadFromCache.length > 0) {
        // 从全局缓存加载到本地状态
        const newMediaItems = {...mediaItems};
        productsToLoadFromCache.forEach(product => {
          newMediaItems[product.id] = globalMediaCache[product.id];
        });
        setMediaItems(newMediaItems);
      }
      
      return; // 没有新的数据需要请求
    }
    
    // 创建一个取消令牌
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchFlashSaleMedia = async () => {
      // 仅获取视频媒体数据，避免重复加载图片
      // 实现批处理请求，每批最多2个请求，减轻服务器压力
      const batchSize = 2;
      const newMediaItems: { [key: string | number]: Media[] | boolean } = {};
      const newGlobalCache = {...globalMediaCache};
      
      // 标记所有将要加载的项目
      productsToFetch.forEach(product => {
        newMediaItems[`loading-${product.id}`] = true;
      });
      
      // 先更新加载状态，防止重复请求
      setMediaItems(prev => ({...prev, ...newMediaItems}));
      
      // 并行获取所有产品的媒体数据以提高效率
      try {
        const results = await Promise.all(
          productsToFetch.map(product => 
            serverAxios.get(`/media/goods/${product.id}`, { 
              signal,
              // 添加缓存控制头
              headers: {
                'Cache-Control': 'max-age=3600', // 告诉CDN和浏览器缓存1小时
                'Pragma': 'no-cache' // 兼容HTTP/1.0
              }
            })
            .then(response => {
              // 确保响应数据是数组
              if (Array.isArray(response.data)) {
                // 保留所有媒体数据，包括视频和图片
                return { productId: product.id, media: response.data };
              }
              return { productId: product.id, media: [] };
            })
            .catch(error => {
              if (error.name === 'CanceledError' || error.name === 'AbortError') {
                return { productId: product.id, media: [] };
              }
              console.error(`Failed to get media for product ${product.id}:`, error);
              return { productId: product.id, media: [] };
            })
          )
        );

        // 处理结果
        results.forEach(result => {
          // 删除加载标志
          delete newMediaItems[`loading-${result.productId}`];
          
          // 添加媒体数据到本地状态和全局缓存
          if (result.media && result.media.length > 0) {
            newMediaItems[result.productId] = result.media;
            newGlobalCache[result.productId] = result.media;
          }
        });
        
        // 更新全局缓存
        try {
          localStorage.setItem(MEDIA_CACHE_KEY, JSON.stringify(newGlobalCache));
        } catch (e) {
          console.error('Error saving global media cache:', e);
        }
        
        // 更新组件状态
        setMediaItems(prev => {
          const updatedMedia = {...prev, ...newMediaItems};
          
          // 更新本地存储缓存
          try {
            localStorage.setItem('homepageMediaCache', JSON.stringify({
              data: updatedMedia,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.error('Error saving media cache:', e);
          }
          
          return updatedMedia;
        });
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Error fetching media data:', error);
        }
        
        // 清除所有加载状态，以便后续可以重试
        productsToFetch.forEach(product => {
          delete newMediaItems[`loading-${product.id}`];
        });
        
        setMediaItems(prev => ({...prev, ...newMediaItems}));
      }
    };
    
    fetchFlashSaleMedia();
    
    // 组件卸载时取消所有正在进行的请求
    return () => {
      controller.abort();
    };
  }, [currentFlashProducts, mediaItems]);

  // Top carousel auto-rotation
  useEffect(() => {
    if (topCarouselImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setTopCarouselIndex(prev => (prev + 1) % topCarouselImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [topCarouselImages.length]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && processedGoods.normalProducts && Array.isArray(processedGoods.normalProducts) && visibleProductsCount < processedGoods.normalProducts.length) {
      // 更小的增量加载产品，每次只加载5个产品，减少同时加载的资源
      setVisibleProductsCount(prev => Math.min(prev + 5, processedGoods.normalProducts.length));
    }
  }, [visibleProductsCount, processedGoods.normalProducts]);

  // Set up Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    });
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [handleObserver]);

  // 提取视频设置逻辑到独立函数
  const setupVideo = useCallback((videoEl: HTMLVideoElement, videoId: string, videoMedia: Media) => {
    // Clean up any existing HLS instances
    if (hlsInstancesRef.current[videoId]) {
      try {
        hlsInstancesRef.current[videoId]?.destroy();
      } catch (e) {
        console.error(`销毁HLS实例失败: ${videoId}`, e);
      }
      hlsInstancesRef.current[videoId] = null;
    }
    
    // 重置视频元素
    videoEl.pause();
    videoEl.src = '';
    videoEl.removeAttribute('src');
    videoEl.load();
    
    // Configure video and autoplay
    if (videoMedia.url.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
          lowLatencyMode: false,
          maxBufferLength: 30,
          maxMaxBufferLength: 30,
          backBufferLength: 30
        });
        hls.loadSource(videoMedia.url);
        hls.attachMedia(videoEl);
        hlsInstancesRef.current[videoId] = hls;
        
        // 添加事件监听
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // 使用setTimeout延迟播放以确保HLS准备就绪
          setTimeout(() => {
            videoEl.play().catch(e => {
              console.warn("Autoplay failed:", e);
            });
          }, 100);
        });
        
        // 添加错误处理
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error(`HLS fatal error: ${data.type} - ${data.details}`);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              // 网络错误，尝试恢复
              hls.startLoad();
            }
          }
        });
      } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        videoEl.src = videoMedia.url;
        videoEl.onloadedmetadata = () => {
          videoEl.play().catch(e => {
            console.warn("Safari autoplay failed:", e);
          });
        };
      }
    } else {
      // Regular video format
      videoEl.src = videoMedia.url;
      videoEl.onloadeddata = () => {
        videoEl.play().catch(e => {
          console.warn("Regular video autoplay failed:", e);
        });
      };
    }
  }, []);

  // Add function to handle mouse enter to start playing video
  const handleMouseEnter = useCallback((productId: number) => {
    setIsHovering(prev => ({ ...prev, [productId]: true }));
    
    // 清理之前的定时器
    if (hoverTimersRef.current[productId]) {
      clearTimeout(hoverTimersRef.current[productId]);
    }
    
    // Add 0.5 second delay
    hoverTimersRef.current[productId] = setTimeout(() => {
      if (!isHovering[productId]) return;
      
      setIsPlaying(prev => ({ ...prev, [productId]: true }));
      
      const productMedia = mediaItems[productId];
      // 确保有媒体数据
      if (productMedia && Array.isArray(productMedia)) {
        // 查找第一个视频媒体
        const videoMedia = (productMedia as Media[]).find(media => media.mediaType === "video");
        if (videoMedia) {
          const videoId = `flash-${productId}`;
          const videoEl = videoRefs.current[videoId];
          if (videoEl) {
            setupVideo(videoEl, videoId, videoMedia);
          }
        }
      } else {
        // 如果没有媒体数据，尝试发起请求获取视频数据
        if (mediaItems[`loading-${productId}`] !== true) {
          // 标记为正在加载
          setMediaItems(prev => ({ ...prev, [`loading-${productId}`]: true }));
          
          // 请求视频媒体数据
          serverAxios.get(`/media/goods/${productId}`)
            .then(response => {
              if (Array.isArray(response.data) && response.data.length > 0) {
                setMediaItems(prev => {
                  const updatedMedia = { ...prev };
                  delete updatedMedia[`loading-${productId}`];
                  updatedMedia[productId] = response.data;
                  return updatedMedia;
                });
                
                // 如果视频已经请求完成而用户仍在悬停，则播放视频
                if (isHovering[productId]) {
                  // 找到第一个视频类型的媒体
                  const videoMedia = response.data.find((media: Media) => media.mediaType === "video");
                  if (videoMedia) {
                    // 延迟100ms确保DOM已更新
                    setTimeout(() => {
                      const videoId = `flash-${productId}`;
                      const videoEl = videoRefs.current[videoId];
                      if (videoEl) {
                        setupVideo(videoEl, videoId, videoMedia);
                      }
                    }, 100);
                  }
                }
              }
            })
            .catch(error => {
              console.error(`Failed to get video for product ${productId}:`, error);
              // 清除加载状态
              setMediaItems(prev => {
                const updatedMedia = { ...prev };
                delete updatedMedia[`loading-${productId}`];
                return updatedMedia;
              });
            });
        }
      }
    }, 500); // 0.5 second delay
  }, [mediaItems, isHovering, setupVideo]);
  
  // Add function to handle mouse leave to stop playing video
  const handleMouseLeave = useCallback((productId: number) => {
    setIsHovering(prev => ({ ...prev, [productId]: false }));
    setIsPlaying(prev => ({ ...prev, [productId]: false }));
    
    // Clear hover timer
    if (hoverTimersRef.current[productId]) {
      clearTimeout(hoverTimersRef.current[productId]);
      delete hoverTimersRef.current[productId];
    }
    
    const videoId = `flash-${productId}`;
    const videoEl = videoRefs.current[videoId];
    
    // 使用安全的暂停方法
    if (videoEl) {
      // 仅当视频正在播放时才尝试暂停
      if (!videoEl.paused) {
        try {
          videoEl.pause();
          videoEl.currentTime = 0;
        } catch (e) {
          console.error("暂停视频时出错:", e);
        }
      }
    }
    
    // 安全延迟清理HLS实例
    setTimeout(() => {
      if (hlsInstancesRef.current[videoId]) {
        try {
          hlsInstancesRef.current[videoId]?.destroy();
        } catch (e) {
          console.error('销毁HLS实例失败:', e);
        }
        hlsInstancesRef.current[videoId] = null;
      }
    }, 50);
  }, []);

  // Add shopping cart related states and functionality
  const { addItem } = useCart();
  const buyNowButtonRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  
  // Generate random control points for Bezier curve
  const getRandomControlPoints = (startX: number, startY: number, endX: number, endY: number) => {
    // Determine random offset range
    const minOffsetX = -200;
    const maxOffsetX = 200;
    const minOffsetY = -200;
    const maxOffsetY = -50;
    
    // Generate random offset values
    const randomOffsetX1 = Math.floor(Math.random() * (maxOffsetX - minOffsetX + 1)) + minOffsetX;
    const randomOffsetY1 = Math.floor(Math.random() * (maxOffsetY - minOffsetY + 1)) + minOffsetY;
    const randomOffsetX2 = Math.floor(Math.random() * (maxOffsetX - minOffsetX + 1)) + minOffsetX;
    const randomOffsetY2 = Math.floor(Math.random() * (maxOffsetY - minOffsetY + 1)) + minOffsetY;
    
    // Calculate midpoints
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Return two control points
    return {
      cp1: {
        x: midX + randomOffsetX1,
        y: midY + randomOffsetY1
      },
      cp2: {
        x: midX + randomOffsetX2,
        y: midY + randomOffsetY2
      }
    };
  };
  
  // Create flying ball animation
  const createFlyingBall = (startX: number, startY: number) => {
    // Find shopping cart element
    const cartIcon = document.getElementById("navbar-cart-icon") as HTMLElement;
    
    if (!cartIcon) {
      console.error("Shopping cart icon not found");
      return;
    }
    
    // Get shopping cart position
    const cartRect = cartIcon.getBoundingClientRect();
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;
    
    // Create ball element
    const ball = document.createElement("div");
    ball.className = "flying-ball";
    ball.setAttribute('data-created', Date.now().toString());
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
    `;
    
    document.body.appendChild(ball);
    
    // Get random Bezier curve control points
    const controlPoints = getRandomControlPoints(startX, startY, endX, endY);
    const cp1 = controlPoints.cp1;
    const cp2 = controlPoints.cp2;
    
    // Add animation
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
    
    // 设置安全定时器，确保动画完成后元素被移除
    const safetyTimeout = setTimeout(() => {
      if (document.body.contains(ball)) {
        document.body.removeChild(ball);
      }
    }, 1000); // 比动画持续时间稍长
    
    animation.onfinish = () => {
      // Animation ends, remove ball
      if (document.body.contains(ball)) {
        document.body.removeChild(ball);
      }
      
      clearTimeout(safetyTimeout);
      
      // Add shopping cart scaling animation effect
      cartIcon.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.3)' },
          { transform: 'scale(1)' }
        ],
        { duration: 300, easing: 'ease-out' }
      );
      
      // Get quantity label
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
    };
    
    animation.oncancel = () => {
      // 动画被取消时也需要移除元素
      if (document.body.contains(ball)) {
        document.body.removeChild(ball);
      }
      clearTimeout(safetyTimeout);
    };
  };
  
  // Handle adding to cart
  const handleAddToCart = (e: React.MouseEvent, product: Goods) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate actual price
    let price = product.originPrice;
    if (product.hasFlash && product.flashPrice && isFlashSaleValid(product.flashTime)) {
      price = product.flashPrice;
    } else if (product.hasDiscount && product.discountPrice) {
      price = product.discountPrice;
    }
    
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: price,
      originalPrice: product.originPrice,
      quantity: 1,
      img: product.img
    };
    
    // Get button position and create flying ball animation
    const buttonEl = buyNowButtonRefs.current[`buy-now-${product.id}`];
    if (buttonEl) {
      const buttonRect = buttonEl.getBoundingClientRect();
      const startX = buttonRect.left + buttonRect.width / 2;
      const startY = buttonRect.top + buttonRect.height / 2;
      
      createFlyingBall(startX, startY);
    }
    
    // Delay adding item to cart, synchronized with animation
    setTimeout(() => {
      addItem(item);
    }, 800);
  };

  // 添加路由监听和路径变化监听
  useEffect(() => {
    // 立即初始化一次清理，避免资源残留
    const cleanup = () => {
      
      // 强制清理所有资源，不等待垃圾回收
      cleanupAllMediaResources();
      
      // 清理所有飞入购物车的动画元素
      const flyingBalls = document.querySelectorAll('.flying-ball');
      flyingBalls.forEach(ball => {
        if (document.body.contains(ball)) {
          document.body.removeChild(ball);
        }
      });
      
      // 强制清理所有视频相关DOM元素引用
      Object.keys(videoRefs.current).forEach(key => {
        videoRefs.current[key] = null;
      });
      videoRefs.current = {};
      
      // 强制清理所有HLS实例
      Object.keys(hlsInstancesRef.current).forEach(key => {
        hlsInstancesRef.current[key] = null;
      });
      hlsInstancesRef.current = {};
      
      // 清理定时器
      Object.keys(hoverTimersRef.current).forEach(key => {
        clearTimeout(hoverTimersRef.current[Number(key)]);
        delete hoverTimersRef.current[Number(key)];
      });
      
      // 尝试触发浏览器垃圾回收
      if (typeof window !== 'undefined' && 'gc' in window) {
        try {
          // @ts-ignore
          window.gc();
        } catch (e) {
          // gc可能不可用，忽略错误
        }
      }
    };
    
    // 返回清理函数，在组件卸载或路径变化时执行
    return cleanup;
  }, [pathname, cleanupAllMediaResources]);

  // Handle no data case
  if (!carouselData.length) {
    return <div className="text-center mt-4">No data available</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center max-w-full overflow-hidden">
      {/* Cyberpunk Neon Wave effect */}
      <NeonWave />
      
      {/* 1. Top carousel - Adaptive size, maintain full width */}
      <div className="w-full relative aspect-[16/4] overflow-hidden">
        {topCarouselImages.map((image, index) => (
          <div
            key={`top-carousel-${index}`}
            className={`absolute inset-0 transition-opacity duration-700 ${
              topCarouselIndex === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {(topCarouselIndex === index || 
              topCarouselIndex === (index === 0 ? topCarouselImages.length - 1 : index - 1) || 
              topCarouselIndex === (index === topCarouselImages.length - 1 ? 0 : index + 1)) && (
              <ProductImage
                url={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-contain"
                priority={topCarouselIndex === index}
              />
            )}
          </div>
        ))}
        
        {/* 轮播指示器 */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
          {topCarouselImages.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full transition-all ${
                topCarouselIndex === idx ? "bg-white w-6" : "bg-gray-500"
              }`}
              onClick={() => setTopCarouselIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* 2. Hot products section - Limit max width to 1180px */}
      <div className="w-full flex justify-center">
        <div className="max-w-[1400px] w-full px-4 mt-10">
          <h2 className="text-3xl font-bold mb-8">Hot Products</h2>
          
          <div className="relative">
            {/* 热销商品展示区 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentPageProducts.map((productGroup, groupIndex) => {
              // 找出图片和视频
              const images = productGroup.filter(item => item.mediaType === "image");
              const videos = productGroup.filter(item => item.mediaType === "video");
              
              // 优先展示图片
              const displayItem = images.length > 0 ? images[0] : productGroup[0];
              const hasVideo = videos.length > 0;
              
              // 根据商品ID查找完整商品信息
              const productDetails = findProductByGoodsId(displayItem.goodsId);
              
              return (
                <Link 
                  href={`/product/${displayItem.goodsId}-${slugify(displayItem.goodsName)}`}
                  key={`product-group-${displayItem.goodsId}-${groupIndex}`}
                >
                  <div 
                    key={`product-group-${displayItem.goodsId}-${groupIndex}`}
                    className="relative rounded-xl overflow-hidden h-[400px] shadow-lg"
                    onMouseEnter={() => hasVideo && setHoveredProduct(`${displayItem.goodsId}-${videos[0].id}`)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* 图片显示 */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      hoveredProduct === `${displayItem.goodsId}-${videos[0]?.id}` && hasVideo 
                        ? "opacity-0" 
                        : "opacity-100"
                    }`}>
                      <ProductImage
                        url={displayItem.img}
                        alt={displayItem.goodsName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 视频显示（鼠标悬停时） */}
                    {hasVideo && (
                      <div className={`absolute inset-0 transition-opacity duration-300 ${
                        hoveredProduct === `${displayItem.goodsId}-${videos[0].id}` 
                          ? "opacity-100" 
                          : "opacity-0"
                      }`}>
                        <video
                          ref={(el) => { videoRefs.current[`${displayItem.goodsId}-${videos[0].id}`] = el; }}
                          className="w-full h-full object-cover"
                          playsInline
                          loop
                          muted
                        />
                      </div>
                    )}
                    
                    {/* 商品信息 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-xl font-semibold line-clamp-2 max-w-xs">{displayItem.goodsName}</h3>
                      
                      {/* 价格显示 - 根据商品信息动态显示 */}
                      {productDetails ? (
                        <div className="mt-1">
                          {/* 如果有闪购价且秒杀有效，显示闪购价和原价 */}
                          {productDetails.hasFlash && productDetails.flashPrice && isFlashSaleValid(productDetails.flashTime) ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">${productDetails.flashPrice.toFixed(2)}</span>
                              <span className="text-sm text-gray-400 line-through">${productDetails.originPrice.toFixed(2)}</span>
                            </div>
                          ) : 
                          /* 如果有折扣价，显示折扣价和原价 */
                          productDetails.hasDiscount && productDetails.discountPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">${productDetails.discountPrice.toFixed(2)}</span>
                              <span className="text-sm text-gray-400 line-through">${productDetails.originPrice.toFixed(2)}</span>
                            </div>
                          ) : 
                          /* 否则只显示原价 */
                          (
                            <p className="text-lg">${productDetails.originPrice.toFixed(2)}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-lg mt-1">Price Loading...</p>
                      )}
                      
                      {/* 添加ref属性和onClick事件处理 */}
                      <button 
                        ref={el => { buyNowButtonRefs.current[`buy-now-${displayItem.goodsId}`] = el; }}
                        className="mt-2 bg-neon-pink hover:bg-neon-red flex items-center px-3 py-1 rounded-lg text-sm"
                        onClick={(e) => {
                          const product = findProductByGoodsId(displayItem.goodsId);
                          if (product) {
                            handleAddToCart(e, product);
                          }
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" /> Buy Now
                      </button>
                    </div>
                  </div>
                </Link>
              );
              })}
            </div>
            
            {/* 分页导航 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-4">
                <button 
                  onClick={() => setHotProductsPage(prev => Math.max(0, prev - 1))}
                  disabled={hotProductsPage === 0}
                  className={`p-2 rounded-full ${
                    hotProductsPage === 0 ? "text-gray-500" : "text-white hover:bg-gray-800"
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex space-x-2 mt-3">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all ${
                        hotProductsPage === idx ? "bg-white w-6" : "bg-gray-500"
                      }`}
                      onClick={() => setHotProductsPage(idx)}
                    />
                  ))}
                </div>

                
                <button 
                  onClick={() => setHotProductsPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={hotProductsPage === totalPages - 1}
                  className={`p-2 rounded-full ${
                    hotProductsPage === totalPages - 1 ? "text-gray-500" : "text-white hover:bg-gray-800"
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
          
          {/* 3. Limited time discount area - Restructured to include flash sale products */}
          <div className="mt-12 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Limited Time Offers</h2>
              <Link href="/flash-sale" className="bg-neon-pink hover:bg-neon-red flex items-center px-4 py-2 rounded-lg text-sm">
                Explore More
              </Link>
            </div>
            
            {/* Flash sale products 2x2 grid */}
            {currentFlashProducts.length > 0 ? (
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {currentFlashProducts.map((product) => (
                    <Link 
                      href={`/product/${product.id}-${slugify(product.name)}`}
                      key={`flash-product-${product.id}`}
                    >
                      <div 
                        key={`flash-product-${product.id}`}
                        className="bg-gray-900 rounded-xl overflow-hidden shadow-lg flex h-64"
                      >
                        {/* 商品图片 - 占据左侧 */}
                        <div className="w-2/5 h-full relative" 
                          onMouseEnter={() => handleMouseEnter(product.id)}
                          onMouseLeave={() => handleMouseLeave(product.id)}
                        >
                          <img
                            src={product.img}
                            alt={product.name}
                            className={`w-full h-full object-cover ${
                              isPlaying[product.id] ? "opacity-0" : "opacity-100"
                            } transition-opacity duration-300`}
                            loading="lazy"
                            decoding="async"
                          />
                          
                          {/* 视频元素始终存在，但通过CSS控制显示与否 */}
                          <video
                            ref={el => { videoRefs.current[`flash-${product.id}`] = el; }}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                              isPlaying[product.id] ? "opacity-100" : "opacity-0"
                            }`}
                            muted
                            playsInline
                            loop
                          />
                          
                          {/* 折扣百分比标签 - 只有当flashPrice存在时才显示 */}
                          {product.flashPrice && (
                            <div className="absolute top-2 left-2 bg-neon-red text-white px-2 py-1 rounded-md font-bold">
                              {Math.round(((product.originPrice - product.flashPrice) / product.originPrice) * 100)}% OFF
                            </div>
                          )}
                        </div>
                        
                        {/* 商品信息 - 占据右侧 */}
                        <div className="w-3/5 p-4 flex flex-col justify-between bg-gray-900">
                          <div>
                            <h3 className="text-lg font-bold line-clamp-2">{product.name}</h3>
                            <div className="mt-3 flex flex-col">
                              {product.flashPrice ? (
                                <>
                                  <span className="text-gray-400 line-through">${product.originPrice.toFixed(2)}</span>
                                  <span className="text-neon-red font-bold text-lg mt-1">SAVE ${(product.originPrice - product.flashPrice).toFixed(2)}</span>
                                  <span className="text-3xl font-bold mt-1">${product.flashPrice.toFixed(2)}</span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold mt-1">${product.originPrice.toFixed(2)}</span>
                              )}
                              
                              {/* 显示倒计时 */}
                              <div className="flex items-center mt-2">
                                <p className="text-sm text-gray-400 mr-1">Limited Offer Ends In:</p>
                                <motion.div
                                  initial={{ scale: 1 }}
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className="text-sm font-bold text-neon-green flex items-center"
                                >
                                  <Timer className="w-3 h-3 mr-1" /> 
                                  <span>{countdowns[product.id]}</span>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 添加ref属性和onClick事件处理 */}
                          <button 
                            ref={el => { buyNowButtonRefs.current[`buy-now-${product.id}`] = el; }}
                            className="mt-4 bg-neon-pink hover:bg-neon-red flex items-center justify-center px-3 py-2 rounded-lg text-sm w-full"
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" /> Buy Now
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* 闪购商品分页 */}
                {totalFlashPages > 1 && (
                  <div className="flex justify-center mt-8 space-x-4">
                    <button 
                      onClick={() => setFlashSalePage(prev => Math.max(0, prev - 1))}
                      disabled={flashSalePage === 0}
                      className={`p-2 rounded-full ${
                        flashSalePage === 0 ? "text-gray-500" : "text-white hover:bg-gray-800"
                      }`}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="flex space-x-2 mt-3">
                      {Array.from({ length: totalFlashPages }).map((_, idx) => (
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
                      onClick={() => setFlashSalePage(prev => Math.min(totalFlashPages - 1, prev + 1))}
                      disabled={flashSalePage === totalFlashPages - 1}
                      className={`p-2 rounded-full ${
                        flashSalePage === totalFlashPages - 1 ? "text-gray-500" : "text-white hover:bg-gray-800"
                      }`}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-900 rounded-xl">
                <p className="text-lg text-gray-400">No flash sale items available right now.</p>
              </div>
            )}
          </div>
          
          {/* 4. All products section (including expired flash sale products) */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">All Products</h2>
            
            {/* All products grid - 5 per row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {visibleProducts.map((product) => (
                <Link
                  href={`/product/${product.id}-${slugify(product.name)}`}
                  key={`all-product-${product.id}`}
                >
                  <div 
                    key={`all-product-${product.id}`}
                    className="bg-gray-900 rounded-xl overflow-hidden shadow-lg group h-full flex flex-col relative z-10"
                  >
                    {/* 商品图片 - 使用ProductImage组件替换img标签 */}
                    <div className="aspect-square relative overflow-hidden">
                      <ProductImage
                        url={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      
                      {/* 折扣百分比标签 */}
                      {product.hasDiscount && product.discountPrice && (
                        <div className="absolute top-2 left-2 bg-neon-red text-white px-2 py-1 rounded-md text-xs font-bold">
                          {Math.round(((product.originPrice - product.discountPrice) / product.originPrice) * 100)}% OFF
                        </div>
                      )}
                      
                      {/* 库存提示 - 可选，如果有库存数据 */}
                      {product.store && product.store < 10 && (
                        <div className="absolute bottom-2 left-2 bg-orange-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                          Only {product.store} left
                        </div>
                      )}
                    </div>
                    
                    {/* 商品信息 */}
                    <div className="p-3 flex flex-col flex-grow relative z-30 bg-gray-900">
                      <h3 className="text-sm font-medium line-clamp-2 h-10 mb-2">{product.name}</h3>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <div className="relative z-30">
                          {product.hasDiscount && product.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="text-gray-400 line-through text-xs">${product.originPrice.toFixed(2)}</span>
                              <span className="text-white font-bold">${product.discountPrice.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="font-bold">${product.originPrice.toFixed(2)}</span>
                          )}
                        </div>
                        
                        {/* 添加ref属性和onClick事件处理 */}
                        <button 
                          ref={el => { buyNowButtonRefs.current[`buy-now-${product.id}`] = el; }}
                          className="p-1.5 bg-neon-pink hover:bg-neon-red rounded-full text-white relative z-30"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Infinite scroll observation element */}
            {processedGoods.normalProducts && Array.isArray(processedGoods.normalProducts) && visibleProductsCount < processedGoods.normalProducts.length && (
              <div 
                ref={observerTarget} 
                className="py-8 text-center text-gray-400"
              >
                Loading more products...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}