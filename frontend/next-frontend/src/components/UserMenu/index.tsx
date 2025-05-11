"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, ChevronDown, LogOut, Package, Heart, Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";

type UserMenuProps = {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

export default function UserMenu({ user }: UserMenuProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // 处理Google头像URL
  useEffect(() => {
    if (user?.image) {
      // 检查是否是Google头像URL
      if (user.image.includes('googleusercontent.com')) {
        try {
          // 从URL中提取原始Google头像URL
          const url = decodeURIComponent(user.image.replace(/^.*?url=(.*?)(&|$).*$/, '$1'));
          console.log('解码后的Google头像URL:', url);
          setImageUrl(url);
        } catch (error) {
          console.error('解码Google头像URL失败:', error);
          // 失败时使用原始URL
          setImageUrl(user.image);
        }
      } else {
        setImageUrl(user.image);
      }
    }
  }, [user?.image]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    // Close menu before logging out to avoid UI flicker
    setIsUserMenuOpen(false);
    
    // Use NextAuth signOut
    await signOut({ redirect: false });
    
    // Optional: Redirect to home after sign out
    window.location.href = "/";
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={userMenuRef}>
      <button 
        className="flex items-center space-x-2 hover:text-pink-500"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="User Avatar" 
            width={32} 
            height={32} 
            className="rounded-full w-8 h-8 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : user?.image ? (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            {user.name?.charAt(0) || 'U'}
          </div>
        ) : (
          <User className="w-6 h-6" />
        )}
        <span className="text-base font-semibold hidden sm:inline">
          {user.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* User Menu */}
      <AnimatePresence>
        {isUserMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
          >
            <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </Link>
            <Link href="/myorders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Package className="w-4 h-4 mr-2" />
              My Orders
            </Link>
            <Link href="/wishlist" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Heart className="w-4 h-4 mr-2" />
              Wishlist
            </Link>
            
            <hr className="my-1" />
            <button 
              onClick={handleSignOut}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 