// app/product/[id]/loading.tsx
import React from "react";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Product Image Skeleton */}
          <div className="md:w-1/2">
            <div className="bg-gray-900 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square w-full"></div>
            </div>
          </div>
          
          {/* Product Info Skeleton */}
          <div className="md:w-1/2">
            {/* Title */}
            <div className="h-8 bg-gray-800 rounded-lg w-3/4 mb-4 animate-pulse"></div>
            
            {/* Price */}
            <div className="h-10 bg-gray-800 rounded-lg w-1/2 mb-6 animate-pulse"></div>
            
            {/* Flash Sale Box */}
            <div className="h-20 bg-gray-800 rounded-lg w-full mb-6 animate-pulse"></div>
            
            {/* Purchase Options */}
            <div className="mb-6">
              <div className="h-6 bg-gray-800 rounded-lg w-1/3 mb-3 animate-pulse"></div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-800 rounded-lg w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-800 rounded-lg w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-800 rounded-lg w-24 animate-pulse"></div>
              </div>
            </div>
            
            {/* Quantity Selector */}
            <div className="mb-6">
              <div className="h-6 bg-gray-800 rounded-lg w-1/4 mb-3 animate-pulse"></div>
              <div className="h-10 bg-gray-800 rounded-lg w-32 animate-pulse"></div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <div className="h-12 bg-gray-800 rounded-lg flex-1 animate-pulse"></div>
              <div className="h-12 bg-gray-800 rounded-lg flex-1 animate-pulse"></div>
              <div className="h-12 w-12 bg-gray-800 rounded-full animate-pulse"></div>
            </div>
            
            {/* Product Details */}
            <div className="border-t border-gray-800 pt-6">
              <div className="h-6 bg-gray-800 rounded-lg w-1/3 mb-4 animate-pulse"></div>
              
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-16 bg-gray-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}