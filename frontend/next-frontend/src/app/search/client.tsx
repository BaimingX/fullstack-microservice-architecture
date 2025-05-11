"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Product data interface
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
  description?: string;
}

interface SearchClientProps {
  searchResults: Goods[];
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// Convert product name to URL-friendly slug
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .split(/\s+/)
    .slice(0, 8)                  // Take first 8 words
    .join("-");
}

export default function SearchClient({ searchResults, searchQuery, currentPage, totalPages, totalItems }: SearchClientProps) {
  const [query, setQuery] = useState(searchQuery);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  // Mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Update local state when search query changes
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

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

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Generate pagination links
  const getPaginationLink = (page: number) => {
    return `/search?q=${encodeURIComponent(searchQuery)}&page=${page}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Search box */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex items-center bg-gray-900 rounded-lg overflow-hidden">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 bg-gray-900 focus:outline-none text-white"
              />
              <button 
                type="submit" 
                className="bg-neon-pink text-white p-3 hover:bg-neon-red"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Search results title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Search Results: "{searchQuery}"</h1>
          <p className="text-gray-400 mt-2">Found {totalItems} products</p>
        </div>

        {/* Search results */}
        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl">No products found matching "{searchQuery}"</p>
            <p className="text-gray-400 mt-2">Please try different keywords</p>
          </div>
        ) : (
          <>
            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.map((product) => (
                <Link
                  href={`/product/${product.id}-${slugify(product.name)}`}
                  key={`search-product-${product.id}`}
                >
                  <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg group">
                    {/* Product image */}
                    <div className="aspect-square relative">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Flash Sale label */}
                      {(product.hasFlash && product.flashPrice && isFlashSaleValid(product.flashTime)) && (
                        <div className="absolute top-2 left-2 bg-neon-red text-white px-2 py-1 rounded-md text-sm font-bold">
                          {Math.round(((product.originPrice - product.flashPrice) / product.originPrice) * 100)}% OFF
                        </div>
                      )}
                      
                      {/* Discount label */}
                      {(product.hasDiscount && product.discountPrice && !(product.hasFlash && product.flashPrice && isFlashSaleValid(product.flashTime))) && (
                        <div 
                          className="absolute top-2 right-2 bg-[#FFD700] text-black px-2 py-1 rounded-md text-sm font-bold"
                        >
                          🏷️ Discount
                        </div>
                      )}
                    </div>
                    
                    {/* Product info */}
                    <div className="p-4">
                      <h3 className="text-md font-medium line-clamp-2 h-12 mb-2">{product.name}</h3>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          {product.hasFlash && product.flashPrice && isFlashSaleValid(product.flashTime) ? (
                            <div className="flex flex-col">
                              <span className="text-gray-400 line-through text-sm">${product.originPrice.toFixed(2)}</span>
                              <span className="text-lg font-bold">${product.flashPrice.toFixed(2)}</span>
                            </div>
                          ) : product.hasDiscount && product.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="text-gray-400 line-through text-sm">${product.originPrice.toFixed(2)}</span>
                              <span className="text-lg font-bold">${product.discountPrice.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold">${product.originPrice.toFixed(2)}</span>
                          )}
                        </div>
                        
                        <button className="bg-neon-pink hover:bg-neon-red p-2 rounded-lg">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {/* Previous page */}
                  <Link
                    href={currentPage > 1 ? getPaginationLink(currentPage - 1) : '#'}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === 1 
                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-800 hover:bg-neon-pink text-white'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    // Show page numbers near current page
                    let pageNum = 1;
                    
                    if (totalPages <= 5) {
                      // Show all pages if total pages ≤ 5
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      // Show first 5 pages when near start
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // Show last 5 pages when near end
                      pageNum = totalPages - 4 + idx;
                    } else {
                      // Show 5 pages centered around current page
                      pageNum = currentPage - 2 + idx;
                    }
                    
                    return (
                      <Link
                        key={`page-${pageNum}`}
                        href={getPaginationLink(pageNum)}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === pageNum 
                            ? 'bg-neon-pink text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                  
                  {/* Next page */}
                  <Link
                    href={currentPage < totalPages ? getPaginationLink(currentPage + 1) : '#'}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === totalPages 
                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-800 hover:bg-neon-pink text-white'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 