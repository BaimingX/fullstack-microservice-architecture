"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingCart, Timer, Heart, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Hls from "hls.js";
import serverAxios from "@/lib/axios-server";

import { useSession } from "next-auth/react";
import AuthModal from "./AuthModal";
import { useCart, CartItem } from '@/context/CartContext';
import { canStartAnimation, startAnimation, endAnimation, resetAnimation } from "@/utils/animationState";

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
  flashNum?: number;
  content?: string;
  type?: string;
}

interface Media {
  id: number;
  goodsId: number;
  mediaType: "image" | "video";
  url: string;
  thumbnailUrl?: string;
}

interface ProductDetailProps {
  product: Goods;
  galleryPosition?: "left" | "right"; // Desktop thumbnail position
}

// 新增的记忆化组件：倒计时组件
const FlashSaleCountdown = React.memo(({ 
  flashTime, 
  onCountdownEnd, 
  flashNum 
}: { 
  flashTime: string, 
  onCountdownEnd: () => void, 
  flashNum?: number 
}) => {
  const [countdown, setCountdown] = useState("00:00:00");
  
  useEffect(() => {
    if (!flashTime) return;

    const calculateRemainingTime = () => {
      const endTime = new Date(flashTime);
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        onCountdownEnd();
        return "00:00:00";
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    const updateCountdown = () => {
      const timeLeft = calculateRemainingTime();
      setCountdown(timeLeft);
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [flashTime, onCountdownEnd]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Flash Sale Ends In:</p>
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xl font-bold text-green-400 flex items-center"
        >
          <Timer className="w-5 h-5 mr-2" />
          <span>{countdown}</span>
        </motion.div>
      </div>
      {flashNum && (
        <p className="text-sm text-gray-400 mt-2">
          Limited offer: Only {flashNum} spots available
        </p>
      )}
    </div>
  );
});

// 新增的记忆化组件：产品图片组件
const ProductImage = React.memo(({ 
  url, 
  alt 
}: { 
  url: string, 
  alt: string 
}) => {
  return (
    <img
      src={url}
      alt={alt}
      className="w-full h-full object-contain"
    />
  );
});

// 新增的记忆化组件：视频缩略图组件
const VideoThumbnail = React.memo(({ 
  thumbnailUrl, 
  fallbackImg 
}: { 
  thumbnailUrl?: string, 
  fallbackImg: string 
}) => {
  return (
    <img
      src={thumbnailUrl || fallbackImg}
      alt="Video thumbnail"
      className="w-full h-full object-cover"
    />
  );
});

// 新增的记忆化组件：产品缩略图组件
const ProductThumbnail = React.memo(({ 
  media, 
  isSelected, 
  onClick,
  productImg
}: { 
  media: Media, 
  isSelected: boolean,
  onClick: () => void,
  productImg: string
}) => {
  return (
    <div
      className={`rounded-lg overflow-hidden cursor-pointer relative ${
        isSelected ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"
      }`}
      onClick={onClick}
    >
      <div className="w-20 h-20 md:w-16 md:h-16 lg:w-20 lg:h-20 relative">
        <img
          src={
            media.mediaType === "video"
              ? media.thumbnailUrl || productImg  // 直接使用产品主图作为视频缩略图
              : media.url
          }
          alt={`Thumbnail ${media.id}`}
          className="w-full h-full object-cover"
        />
        {media.mediaType === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
});

export default function ProductDetail({ 
  product, 
  galleryPosition = "left" // Default left display
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [countdown, setCountdown] = useState("00:00:00");
  const [isClient, setIsClient] = useState(false);
  const [purchaseType, setPurchaseType] = useState("regular");
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  // 新增状态，跟踪视频是否正在播放
  const [isVideoPlaying, setIsVideoPlaying] = useState<{[key: string]: boolean}>({});
  // 添加标签页状态
  const [activeTab, setActiveTab] = useState<string>("");
  // 商品类型标签
  const [typeTabs, setTypeTabs] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 使用 NextAuth 的 useSession hook
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // References for video elements and HLS instances
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const hlsInstancesRef = useRef<{ [key: string]: Hls | null }>({});

  // 添加购物车hook
  const { addItem } = useCart();

  // 添加动画管理的全局状态
  const AnimationManager = {
    ballElement: null as HTMLDivElement | null,
    initialized: false,
    eventListenerAdded: false,
    
    // 初始化一次性元素
    initialize() {
      if (this.initialized || this.ballElement) return this.ballElement;
      
      if (typeof document !== 'undefined') {
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
        this.initialized = true;
        
        if (!this.eventListenerAdded) {
          // 添加全局卸载监听器
          window.addEventListener('beforeunload', () => {
            this.cleanup();
          });
          
          // 在组件卸载时也添加清理
          document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
              this.reset();
            }
          });
          
          this.eventListenerAdded = true;
        }
      }
      return this.ballElement;
    },
    
    // 获取小球元素
    getBall() {
      return this.initialize();
    },
    
    // 重置小球状态但不完全清理
    reset() {
      if (this.ballElement) {
        this.ballElement.style.display = 'none';
        this.ballElement.style.transform = '';
      }
      resetAnimation();
    },
    
    // 完全清理资源
    cleanup() {
      if (this.ballElement && this.ballElement.parentNode) {
        this.ballElement.parentNode.removeChild(this.ballElement);
        this.ballElement = null;
      }
      this.initialized = false;
      resetAnimation();
    }
  };

  // 资源清理函数
  const cleanupMediaResources = useCallback(() => {
    // 清理所有视频标签
    Object.keys(videoRefs.current).forEach(videoId => {
      const videoEl = videoRefs.current[videoId];
      if (videoEl) {
        try {
          // 立即停止播放并移除所有事件
          videoEl.pause();
          // 停止视频下载
          videoEl.src = '';
          videoEl.removeAttribute('src');
          videoEl.load(); // 强制清空缓冲区
          // 移除所有事件监听器
          videoEl.onloadedmetadata = null;
          videoEl.onerror = null;
          videoEl.onended = null;
          videoEl.onpause = null;
          videoEl.onplay = null;
          videoEl.onseeking = null;
          videoEl.oncanplay = null;
          // 清空视频引用
          videoRefs.current[videoId] = null;
        } catch (e) {
          console.error('Failed to clean up video element:', e);
        }
      }
    });
    
    // 清理所有HLS实例
    Object.keys(hlsInstancesRef.current).forEach(key => {
      if (hlsInstancesRef.current[key]) {
        try {
          const hls = hlsInstancesRef.current[key];
          // 移除所有事件监听器
          if (hls) {
            hls.off(Hls.Events.ERROR);
            hls.off(Hls.Events.MANIFEST_PARSED);
            hls.off(Hls.Events.MEDIA_DETACHED);
            hls.off(Hls.Events.MEDIA_ATTACHED);
            // 分离媒体元素
            hls.detachMedia();
            // 销毁HLS实例
            hls.destroy();
          }
        } catch (e) {
          console.error('Failed to destroy HLS instance:', e);
        }
        hlsInstancesRef.current[key] = null;
      }
    });
    
    // 重置视频播放状态
    setIsVideoPlaying({});
    
    // 完全重置引用对象，帮助垃圾回收
    videoRefs.current = {};
    hlsInstancesRef.current = {};
    
    // 强制垃圾回收（如果浏览器支持）
    if (typeof window !== 'undefined' && 'gc' in window) {
      try {
        // @ts-ignore
        window.gc();
      } catch (e) {
        // gc可能不可用，忽略错误
      }
    }
  }, []);

  // 监听页面可见性和组件卸载，移除多余的清理逻辑
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        
        // 页面隐藏时停止视频播放并清理资源
        cleanupMediaResources();
      }
    };
    
    // 页面卸载前清理资源
    const handleBeforeUnload = () => {
      
      cleanupMediaResources();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // 清理动画资源
      AnimationManager.reset();
      // 清理视频资源
      cleanupMediaResources();
    };
  }, [cleanupMediaResources]);

  // 检查客户端挂载
  useEffect(() => {
    setIsClient(true);
    
    // 清理函数
    return () => {
      cleanupMediaResources();
    };
  }, [cleanupMediaResources]);

  // 在客户端初始化购买类型
  useEffect(() => {
    if (isClient) {
      // 检查秒杀是否有效
      const isFlashValid = product.hasFlash && product.flashTime && isFlashSaleValid(product.flashTime);
      
      if (isFlashValid) {
        setPurchaseType("flash");
      } else if (product.hasDiscount && product.discountPrice) {
        setPurchaseType("discount");
      } else {
        setPurchaseType("regular");
      }
    }
  }, [isClient, product]);

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

  // =============== 1. 加载媒体列表，视频优先排序 ===============
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await serverAxios.get(`/media/goods/${product.id}`);
        
        if (Array.isArray(response.data)) {
          const sortedMedia = [...response.data].sort((a, b) => {
            if (a.mediaType === "video" && b.mediaType !== "video") return -1;
            if (a.mediaType !== "video" && b.mediaType === "video") return 1;
            return 0;
          });
          setMediaItems(sortedMedia);
          if (sortedMedia.length > 0) {
            setSelectedMedia(sortedMedia[0]);
            setCurrentMediaIndex(0);
          }
        } else {
          setMediaItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch media:", error);
        setMediaItems([]);
      }
    };
    
    if (product.id) {
      fetchMedia();
    }
  }, [product.id]);

  // 解析商品类型标签
  useEffect(() => {
    if (product.type) {
      const tabs = product.type.split(';').map(tab => tab.trim()).filter(tab => tab);
      setTypeTabs(tabs);
      if (tabs.length > 0) {
        setActiveTab(tabs[0]);
      }
    }
  }, [product.type]);

  // =============== 2. 设置 HLS 播放 ===============
  useEffect(() => {
    if (!selectedMedia || selectedMedia.mediaType !== "video") return;

    // 首先清理所有其他视频资源
    Object.keys(videoRefs.current).forEach(key => {
      const videoId = `video-${selectedMedia.id}`;
      // 不清理当前选中的视频
      if (key !== videoId && videoRefs.current[key]) {
        const videoEl = videoRefs.current[key];
        if (videoEl) {
          videoEl.pause();
          videoEl.src = '';
          videoEl.load();
        }
        
        // 清理对应的HLS实例
        if (hlsInstancesRef.current[key]) {
          try {
            hlsInstancesRef.current[key]?.destroy();
          } catch (e) {
            console.error('Failed to destroy other HLS instances:', e);
          }
          hlsInstancesRef.current[key] = null;
        }
      }
    });

    const videoId = `video-${selectedMedia.id}`;
    const videoEl = videoRefs.current[videoId];
    if (!videoEl) return;

    // 每次切换到新的视频时，设置为自动播放状态
    setIsVideoPlaying(prev => ({
      ...prev,
      [videoId]: true
    }));

    // 清理所有HLS实例
    Object.keys(hlsInstancesRef.current).forEach(key => {
      if (key !== videoId && hlsInstancesRef.current[key]) {
        try {
          hlsInstancesRef.current[key]?.destroy();
        } catch (e) {
          console.error('Failed to destroy other HLS instances:', e);
        }
        hlsInstancesRef.current[key] = null;
      }
    });

    // Clean up any existing HLS instance for this video
    if (hlsInstancesRef.current[videoId]) {
      try {
        hlsInstancesRef.current[videoId]?.destroy();
      } catch (e) {
        console.error('Failed to destroy current HLS instance:', e);
      }
      hlsInstancesRef.current[videoId] = null;
    }

    // 确保视频元素已清理
    videoEl.onloadedmetadata = null;
    videoEl.onerror = null;
    videoEl.onended = null; // 添加onended清理
    videoEl.pause();
    videoEl.src = '';
    videoEl.removeAttribute('src');
    videoEl.load();

    // 配置视频并自动播放
    if (selectedMedia.url.includes(".m3u8")) {
      if (Hls.isSupported()) {
        try {
          const hls = new Hls({
            enableWorker: false, // 关闭worker以减少内存使用
            lowLatencyMode: false, // 关闭低延迟模式
            startLevel: 0, // 从最低质量开始
            capLevelToPlayerSize: true, // 根据播放器大小调整质量
            maxBufferLength: 30, // 减少缓冲区长度
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
          
          // 错误处理
          const errorHandler = (event: any, data: any) => {
            if (data.fatal) {
              console.error(`HLS fatal error: ${data.type} - ${data.details}`);
              try {
                hls.destroy();
              } catch (e) {
                console.error('Failed to clean up HLS instance:', e);
              }
              hlsInstancesRef.current[videoId] = null;
              setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
            }
          };
          
          hls.on(Hls.Events.ERROR, errorHandler);
          
          // 添加详细日志以便调试
          console.log(`Loading HLS video: ${selectedMedia.url}`);
          
          hls.loadSource(selectedMedia.url);
          hls.attachMedia(videoEl);
          hlsInstancesRef.current[videoId] = hls;
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log(`HLS manifest parsed, attempting to play video ${videoId}`);
            videoEl.play().then(() => {
              console.log(`Video ${videoId} started playing successfully`);
              setIsVideoPlaying(prev => ({ ...prev, [videoId]: true }));
            }).catch(e => {
              console.error('Video play failed:', e);
              setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
            });
          });
          
          // 存储清理函数
          const cleanup = () => {
            hls.off(Hls.Events.ERROR, errorHandler);
          };
          
          // 当视频被卸载时执行清理
          videoEl.addEventListener('emptied', cleanup, { once: true });
        } catch (e) {
          console.error('Failed to create HLS instance:', e);
          setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
        }
      } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari浏览器原生支持HLS
        try {
          console.log(`Loading native HLS video in Safari: ${selectedMedia.url}`);
          videoEl.src = selectedMedia.url;
          videoEl.play().then(() => {
            console.log(`Safari native HLS video ${videoId} started playing successfully`);
            setIsVideoPlaying(prev => ({ ...prev, [videoId]: true }));
          }).catch(e => {
            console.error('Safari video play failed:', e);
            setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
          });
        } catch (e) {
          console.error('Safari video play error:', e);
          setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
        }
      }
    } else {
      // 非HLS视频
      try {
        console.log(`Loading standard video: ${selectedMedia.url}`);
        videoEl.src = selectedMedia.url;
        videoEl.play().then(() => {
          console.log(`Standard video ${videoId} started playing successfully`);
          setIsVideoPlaying(prev => ({ ...prev, [videoId]: true }));
        }).catch(e => {
          console.error('Video play failed:', e);
          setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
        });
      } catch (e) {
        console.error('Video play error:', e);
        setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
      }
    }

    // Cleanup function when changing media
    return () => {
      
      if (hlsInstancesRef.current[videoId]) {
        try {
          const hls = hlsInstancesRef.current[videoId];
          if (hls) {
            // 移除所有事件监听器
            hls.off(Hls.Events.ERROR);
            hls.off(Hls.Events.MANIFEST_PARSED);
            hls.off(Hls.Events.MEDIA_DETACHED);
            hls.off(Hls.Events.MEDIA_ATTACHED);
            // 分离媒体元素
            hls.detachMedia();
            // 销毁HLS实例
            hls.destroy();
          }
        } catch (e) {
          console.error('Failed to clean up HLS instance during component unmount:', e);
        }
        hlsInstancesRef.current[videoId] = null;
      }
      
      // 重置视频元素
      if (videoEl) {
        try {
          videoEl.pause();
          videoEl.src = '';
          videoEl.removeAttribute('src');
          videoEl.onloadedmetadata = null;
          videoEl.onerror = null;
          videoEl.onended = null;
          videoEl.load();
        } catch (e) {
          console.error('Failed to clean up video element during component unmount:', e);
        }
      }
    };
  }, [selectedMedia]);

  // =============== 3. 计算展示价格 & 折扣 ===============
  const getCurrentPrice = () => {
    if (purchaseType === "flash" && product.flashPrice) {
      return product.flashPrice;
    } else if (purchaseType === "discount" && product.discountPrice) {
      return product.discountPrice;
    }
    return product.originPrice;
  };

  const getDiscountPercentage = () => {
    const currentPrice = getCurrentPrice();
    if (currentPrice < product.originPrice) {
      return Math.round(
        ((product.originPrice - currentPrice) / product.originPrice) * 100
      );
    }
    return 0;
  };

  // =============== 4. 数量增减 ===============
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  
  const increaseQuantity = () => {
    const maxStock = product.store || 99;
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  // =============== 5. 秒杀倒计时 - 移除全局倒计时逻辑 ===============
  // 移除以下useEffect
  /*
  useEffect(() => {
    if (!isClient || !product.hasFlash || !product.flashTime) return;

    const calculateRemainingTime = () => {
      const endTime = new Date(product.flashTime as string);
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        if (product.hasDiscount && product.discountPrice) {
          setPurchaseType("discount");
        } else {
          setPurchaseType("regular");
        }
        return "00:00:00";
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    const updateCountdown = () => {
      const timeLeft = calculateRemainingTime();
      setCountdown(timeLeft);
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [isClient, product.hasFlash, product.flashTime, product.hasDiscount, product.discountPrice]);
  */

  // 处理倒计时结束的回调函数
  const handleCountdownEnd = useCallback(() => {
    if (product.hasDiscount && product.discountPrice) {
      setPurchaseType("discount");
    } else {
      setPurchaseType("regular");
    }
  }, [product.hasDiscount, product.discountPrice]);

  // =============== 7. 新增切换媒体功能 ===============
  const goToNextMedia = () => {
    if (mediaItems.length <= 1) return;
    
    const nextIndex = (currentMediaIndex + 1) % mediaItems.length;
    setSelectedMedia(mediaItems[nextIndex]);
    setCurrentMediaIndex(nextIndex);
  };

  const goToPrevMedia = () => {
    if (mediaItems.length <= 1) return;
    
    const prevIndex = (currentMediaIndex - 1 + mediaItems.length) % mediaItems.length;
    setSelectedMedia(mediaItems[prevIndex]);
    setCurrentMediaIndex(prevIndex);
  };

  // =============== 8. 播放视频功能 ===============
  const handleVideoPlay = (videoId: string) => {
    const videoEl = videoRefs.current[videoId];
    if (!videoEl) return;

    // 找到对应的媒体项
    const video = mediaItems.find(media => `video-${media.id}` === videoId);
    if (!video || video.mediaType !== 'video') return;
    
    // 设置HLS配置，使用低内存模式
    if (video.url.includes(".m3u8") && Hls.isSupported()) {
      // 清理现有实例
      if (hlsInstancesRef.current[videoId]) {
        try {
          hlsInstancesRef.current[videoId]?.destroy();
        } catch (e) {
          console.error('Failed to destroy HLS instance:', e);
        }
        hlsInstancesRef.current[videoId] = null;
      }
      
      // 确保视频元素已清理
      videoEl.onloadedmetadata = null;
      videoEl.onerror = null;
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
      
      // 创建新HLS实例，使用优化配置
      try {
        const hls = new Hls({
          enableWorker: false, // 关闭worker以减少内存使用
          lowLatencyMode: false, // 关闭低延迟模式
          startLevel: 0, // 从最低质量开始
          capLevelToPlayerSize: true, // 根据播放器大小调整质量
          maxBufferLength: 30, // 减少缓冲区长度
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
        
        // 错误处理
        const errorHandler = (event: any, data: any) => {
          if (data.fatal) {
            console.error(`HLS fatal error: ${data.type} - ${data.details}`);
            try {
              hls.destroy();
            } catch (e) {
              console.error('Failed to clean up HLS instance:', e);
            }
            hlsInstancesRef.current[videoId] = null;
            setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
          }
        };
        
        hls.on(Hls.Events.ERROR, errorHandler);
        
        // 添加详细日志以便调试
        console.log(`Loading HLS video: ${video.url}`);
        
        hls.loadSource(video.url);
        hls.attachMedia(videoEl);
        hlsInstancesRef.current[videoId] = hls;
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log(`HLS manifest parsed, attempting to play video ${videoId}`);
          videoEl.play().then(() => {
            console.log(`Video ${videoId} started playing successfully`);
            setIsVideoPlaying(prev => ({ ...prev, [videoId]: true }));
          }).catch(e => {
            console.error('Video play failed:', e);
            setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
          });
        });
        
        // 存储清理函数
        const cleanup = () => {
          hls.off(Hls.Events.ERROR, errorHandler);
        };
        
        // 当视频被卸载时执行清理
        videoEl.addEventListener('emptied', cleanup, { once: true });
      } catch (e) {
        console.error('Failed to create HLS instance:', e);
        setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
      }
    } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari浏览器原生支持HLS
      try {
        console.log(`Loading native HLS video in Safari: ${video.url}`);
        videoEl.src = video.url;
        videoEl.play().then(() => {
          console.log(`Safari native HLS video ${videoId} started playing successfully`);
          setIsVideoPlaying(prev => ({ ...prev, [videoId]: true }));
        }).catch(e => {
          console.error('Safari video play failed:', e);
          setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
        });
      } catch (e) {
        console.error('Safari video play error:', e);
        setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
      }
    } else {
      // 非HLS视频
      try {
        console.log(`Loading standard video: ${video.url}`);
        videoEl.src = video.url;
        videoEl.play().then(() => {
          console.log(`Standard video ${videoId} started playing successfully`);
          setIsVideoPlaying(prev => ({ ...prev, [videoId]: true }));
        }).catch(e => {
          console.error('Video play failed:', e);
          setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
        });
      } catch (e) {
        console.error('Video play error:', e);
        setIsVideoPlaying(prev => ({ ...prev, [videoId]: false }));
      }
    }
  };

  // =============== 9. 渲染缩略图函数 - 使用记忆化组件 ===============
  const renderThumbnail = useCallback((media: Media, index: number) => (
    <ProductThumbnail
      key={media.id}
      media={media}
      isSelected={selectedMedia ? selectedMedia.id === media.id : false}
      onClick={() => {
        setSelectedMedia(media);
        setCurrentMediaIndex(index);
      }}
      productImg={product.img}
    />
  ), [selectedMedia, product.img]);

  // 处理立即购买按钮点击
  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    // 从session中获取token
    const token = session?.backendToken || '';
    
    
    try {
      // 创建订单
      const response = await serverAxios.post('/coolStuffUser/createCoolStuffOrder', 
        {
          orderDetails: [{
            goodsId: product.id,
            num: quantity,
            type: activeTab || purchaseType || 'normal'
          }],
          totalPrice: getCurrentPrice() * quantity,
          status: "NOT_PAY"
        },
        {
          headers: {
            'headlesscmstoken': token
          }
        }
      );

      // 获取创建的订单号
      const orderNo = response.data.orderNo;

      // 跳转到订单详情页
      window.location.href = `/order/${orderNo}`;
    } catch (error: any) {
      
      // 显示错误信息
      alert(error.response?.data?.msg || '创建订单失败，请重试');
    }
  };

  // 移除原有的getControlPoints函数定义，替换为优化版本
  const getControlPoints = (startX: number, startY: number, endX: number, endY: number) => {
    // 基于产品ID创建确定性的控制点，避免每次随机生成
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
    
    return {
      cp1: { x: midX + offset.x1, y: midY + offset.y1 },
      cp2: { x: midX + offset.x2, y: midY + offset.y2 }
    };
  };

  // 创建飞入购物车的动画小球 (优化版)
  const createFlyingBall = () => {
    // 判断是否可以开始新动画
    if (!canStartAnimation()) {
      return;
    }
    
    // 标记动画开始
    startAnimation();
    
    // 查找购物车图标
    const cartIcon = document.getElementById("navbar-cart-icon") as HTMLElement;
    
    if (!cartIcon) {
      console.error("Shopping cart icon not found");
      endAnimation(); // 标记动画结束
      return;
    }
    
    // 查找添加购物车按钮
    const addToCartBtn = document.getElementById("add-to-cart-btn") as HTMLElement;
    
    if (!addToCartBtn) {
      console.error("Add to cart button not found");
      endAnimation(); // 标记动画结束
      return;
    }
    
    // 获取按钮位置
    const btnRect = addToCartBtn.getBoundingClientRect();
    const startX = btnRect.left + btnRect.width / 2;
    const startY = btnRect.top + btnRect.height / 2;
    
    // 获取购物车位置
    const cartRect = cartIcon.getBoundingClientRect();
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;
    
    // 使用AnimationManager获取小球元素
    const ball = AnimationManager.getBall();
    if (!ball) {
      console.error("Could not create flying ball element");
      endAnimation(); // 标记动画结束
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
    
    // 获取贝塞尔曲线控制点
    const controlPoints = getControlPoints(startX, startY, endX, endY);
    const cp1 = controlPoints.cp1;
    const cp2 = controlPoints.cp2;
    
    // 预定义动画关键帧，减少对象创建
    const keyframes = [
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
    ];
    
    // 创建动画并确保完成后清理
    try {
      const animation = ball.animate(
        keyframes, 
        { 
          duration: 600, // 减少动画时间提高性能
          easing: 'cubic-bezier(.17,.67,.83,.67)' 
        }
      );
      
      // 确保动画结束后进行清理
      animation.onfinish = () => {
        // 隐藏小球并清除所有样式
        if (ball) {
          ball.style.display = "none";
          ball.style.transform = '';
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
            // 有待处理的动画，稍后再次尝试
            setTimeout(() => {
              createFlyingBall();
            }, 100);
          }
        };
      };
      
      // 添加错误处理，确保动画未完成也能恢复状态
      animation.oncancel = () => {
        if (ball) {
          ball.style.display = "none";
          ball.style.transform = '';
        }
        endAnimation(); // 标记动画结束
      };
    } catch (e) {
      console.error("Animation error:", e);
      if (ball) {
        ball.style.display = "none";
        ball.style.transform = '';
      }
      endAnimation(); // 标记动画结束
    }
  };

  // 处理添加到购物车
  const handleAddToCart = () => {
    // 更新购物车中的商品
    const price = getCurrentPrice();
    
    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      price: price,
      originalPrice: product.originPrice,
      quantity: quantity,
      img: product.img
    };
    
    addItem(newItem);
    
    // 创建飞入购物车动画
    createFlyingBall();
  };

  // =============== 10. 组件渲染 ===============
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-[1504px]">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Product Media Gallery Section */}
          <div className="w-full md:w-3/5 flex flex-col md:flex-row gap-4">
            {/* 桌面端左侧缩略图 - 使用React.memo优化渲染 */}
            {mediaItems.length > 0 && galleryPosition === "left" && (
              <div className="hidden md:flex flex-col gap-2 w-20">
                {mediaItems.map((media, index) => renderThumbnail(media, index))}
              </div>
            )}

            {/* 主媒体显示区域 */}
            <div className="flex-1 flex flex-col gap-4 ">
              <div className="bg-gray-900 rounded-xl overflow-hidden relative aspect-square">
                {selectedMedia ? (
                  selectedMedia.mediaType === "video" ? (
                    <div className="w-full relative aspect-square bg-black">
                      {/* 视频播放器 */}
                      <video
                        ref={(el) => {
                          videoRefs.current[`video-${selectedMedia.id}`] = el;
                        }}
                        className="w-full h-full object-contain"
                        poster={selectedMedia.thumbnailUrl || product.img}
                        controls={true}
                        muted
                        loop
                        playsInline
                      />
                      
                      {/* 视频播放覆盖层 - 自动播放模式下不需要显示 */}
                      {!isVideoPlaying[`video-${selectedMedia.id}`] && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 cursor-pointer"
                          onClick={() => handleVideoPlay(`video-${selectedMedia.id}`)}
                        >
                          <div className="bg-white bg-opacity-80 rounded-full p-4">
                            <Play className="w-10 h-10 text-black" fill="black" />
                          </div>
                        </div>
                      )}
                      
                      {/* 为视频也添加导航箭头 */}
                      {mediaItems.length > 1 && (
                        <>
                          <button 
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 focus:outline-none z-10"
                            onClick={(e) => {
                              e.stopPropagation(); // 防止触发视频播放
                              goToPrevMedia();
                            }}
                          >
                            <ChevronLeft className="w-6 h-6 text-white" />
                          </button>
                          <button 
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 focus:outline-none z-10"
                            onClick={(e) => {
                              e.stopPropagation(); // 防止触发视频播放
                              goToNextMedia();
                            }}
                          >
                            <ChevronRight className="w-6 h-6 text-white" />
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="relative aspect-square">
                      {/* 使用优化的图片组件 */}
                      <ProductImage
                        url={selectedMedia.url}
                        alt={product.name}
                      />
                      
                      {/* 导航箭头 */}
                      {mediaItems.length > 1 && (
                        <>
                          <button 
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 focus:outline-none z-10"
                            onClick={goToPrevMedia}
                          >
                            <ChevronLeft className="w-6 h-6 text-white" />
                          </button>
                          <button 
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 focus:outline-none z-10"
                            onClick={goToNextMedia}
                          >
                            <ChevronRight className="w-6 h-6 text-white" />
                          </button>
                        </>
                      )}
                    </div>
                  )
                ) : (
                  // 如果还未选中任何媒体，就显示产品的封面图
                  <div className="aspect-square">
                    <ProductImage
                      url={product.img}
                      alt={product.name}
                    />
                  </div>
                )}
              </div>
              
              {/* 移动端缩略图 - 在主图下方显示，仅在md断点以下显示 */}
              {mediaItems.length > 0 && (
                <div className="md:hidden flex overflow-x-auto gap-2 pb-2">
                  {mediaItems.map((media, index) => renderThumbnail(media, index))}
                </div>
              )}
              
              {/* 商品富文本内容区域 - 移到media下方 */}
              {product.content && (
                <div className="mt-6 border-t border-gray-800 pt-6 pb-8">
                  <div 
                    className="rich-text-content text-white"
                    dangerouslySetInnerHTML={{ __html: product.content }}
                  />
                </div>
              )}
            </div>

            {/* 桌面端右侧缩略图 - 仅在md断点以上且galleryPosition为right时显示 */}
            {mediaItems.length > 0 && galleryPosition === "right" && (
              <div className="hidden md:flex flex-col gap-2 w-20">
                {mediaItems.map((media, index) => renderThumbnail(media, index))}
              </div>
            )}
          </div>

          {/* Product Info Section - 添加sticky定位使其随页面滚动 */}
          <div className="w-full md:w-2/5">
            <div className="md:sticky md:top-6 md:self-start">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>

              {/* Price Display */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-white">
                    ${getCurrentPrice().toFixed(2)}
                  </span>
                  {getDiscountPercentage() > 0 && (
                    <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">
                      {getDiscountPercentage()}% OFF
                    </span>
                  )}
                  {purchaseType === "flash" && (
                    <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">
                      Flash Sale
                    </span>
                  )}
                  {purchaseType === "discount" && (
                    <span 
                      className="bg-[#FFD700] text-black text-sm font-bold px-2 py-1 rounded"
                      
                    >
                      🏷️ Discount
                    </span>
                  )}
                </div>
                {getCurrentPrice() < product.originPrice && (
                  <p className="text-gray-400 line-through">
                    Original Price: ${product.originPrice.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Flash Sale Timer - 使用记忆化组件 */}
              {product.hasFlash && product.flashTime && isFlashSaleValid(product.flashTime) && (
                <FlashSaleCountdown 
                  flashTime={product.flashTime} 
                  flashNum={product.flashNum}
                  onCountdownEnd={handleCountdownEnd}
                />
              )}

              {/* 类型标签页 - 代替Purchase Options */}
              {typeTabs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Type:</h3>
                  <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-8">
                    {typeTabs.map((tab) => (
                      <button
                        key={tab}
                        className={`px-4 py-2 rounded-lg ${
                          activeTab === tab
                            ? "bg-white text-black"
                            : "bg-gray-800 text-white"
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Quantity:</h3>
                <div className="flex items-center">
                  <button
                    className="bg-gray-800 text-white w-10 h-10 rounded-l-lg flex items-center justify-center"
                    onClick={decreaseQuantity}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="bg-gray-900 text-white text-center w-16 h-10 border-0 focus:ring-0"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="bg-gray-800 text-white w-10 h-10 rounded-r-lg flex items-center justify-center"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                  {product.store !== undefined && (
                    <span className="ml-4 text-sm text-gray-400">
                      {product.store} items available
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  id="add-to-cart-btn"
                  className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg flex-1 flex items-center justify-center"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>

                <button 
                  className="bg-white text-black hover:bg-gray-200 flex items-center justify-center px-6 py-3 rounded-lg font-bold flex-1"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>

                <button
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isFavorite ? "bg-red-600 text-white" : "bg-gray-800 text-white"
                  }`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-white" : ""}`} />
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-xl font-semibold mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Product ID</p>
                    <p className="font-medium">{product.id}</p>
                  </div>

                  {product.date && (
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Listed Date</p>
                      <p className="font-medium">
                        {new Date(product.date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {product.store !== undefined && (
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Stock</p>
                      <p className="font-medium">{product.store} units</p>
                    </div>
                  )}

                  {product.hasFlash && product.flashTime && (
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Flash Sale Ends</p>
                      <p className="font-medium">
                        {new Date(product.flashTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="login"
      />
    </div>
  );
}

// 添加自定义防抖函数
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};