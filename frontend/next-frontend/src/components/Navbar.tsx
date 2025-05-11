"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "./UserMenu";
import AuthModal from "./AuthModal";
import { useSession } from "next-auth/react";
import { useCart } from '@/context/CartContext';

const offers = [
  "🚚 Enjoy free shipping on all products during our special promotion!",
  "🎉 Stay tuned – more amazing offers are on the way!",
];


export default function Navbar() {
  const [currentOffer, setCurrentOffer] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Use NextAuth session instead of local state
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user = session?.user || null;

  // 用于自动聚焦输入框
  const searchInputRef = useRef<HTMLInputElement>(null);
  // 用于检测点击外部关闭搜索框
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  // 轮播顶部提示文字
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 搜索框展开后自动聚焦
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // 点击输入框外部时，收起搜索框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 提交搜索逻辑
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  // Handle auth modal
  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Handle Google sign in
  const handleGoogleSignIn = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* 顶部优惠信息轮播 */}
      <div className="bg-gray-900 text-white py-1.5 text-center text-sm relative overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={offers[currentOffer]}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4"
          >
            {offers[currentOffer]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 主导航栏 */}
      <nav className="bg-white text-black px-6 py-2 shadow-md relative z-40">
        <div className="max-w-7xl mx-auto">
        <div className="container mx-auto flex justify-between items-center">
          {/* LOGO */}
          <Link href="/">
            <Image
              src="/icons/logo.png"
              alt="Logo"
              width={200}
              height={100}
              className="h-16 w-auto md:h-20"
              priority
            />
          </Link>

          {/* 中间菜单（桌面端） */}
          <div className="hidden md:flex space-x-6 text-lg font-semibold">
            <Link href="/flash-sale" className="hover:text-pink-500">
              🔥 Flash Sale
            </Link>
            <Link href="/coolest" className="hover:text-pink-500">
              😎 Coolest Gadgets
            </Link>
            <Link href="/ai-toys" className="hover:text-pink-500">
              🚀 AI Toys
            </Link>
            <Link href="/novelty" className="hover:text-pink-500">
              🎮 Novelty Items
            </Link>
          </div>

          {/* 右侧图标区 */}
          <div className="flex items-center space-x-4" ref={searchContainerRef}>
            {/* 搜索区域：初始只显示图标，点击后展开搜索框 */}
            {!isSearchOpen && (
              <button
                className="hover:text-pink-500 transition-colors"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-6 h-6" />
              </button>
            )}

            {/* 展开后的搜索框 */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.form
                  onSubmit={handleSearch}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "14rem", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center bg-white shadow-md rounded-full border border-gray-300 overflow-hidden"
                >
                  {/* 输入框 */}
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-2 text-sm focus:outline-none"
                  />
                  {/* 搜索按钮 */}
                  <button
                    type="submit"
                    className="bg-pink-500 text-white px-3 py-2 hover:bg-pink-600 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* 用户账号 - 根据登录状态显示不同内容 */}
            <div className="relative">
              {isLoggedIn ? (
                <UserMenu user={user} />
              ) : (
                <button 
                  className="flex items-center space-x-1 hover:text-pink-500 auth-modal-trigger"
                  onClick={() => openAuthModal('login')}
                >
                  <User className="w-5 h-5" />
                  <span>SIGN IN / REGISTER</span>
                </button>
              )}
            </div>

              {/* 购物车 */}
              <div className="relative">
                <Link href="/cart" className="hover:text-pink-500">
                  <ShoppingCart className="w-6 h-6" id="navbar-cart-icon" />
                </Link>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full" id="navbar-cart-count">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode}
      />
    </header>
  );
}
