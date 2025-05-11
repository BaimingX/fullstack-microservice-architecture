// Server Component with SSG
import React from 'react';
import { headers } from "next/headers";
import serverAxios from "@/lib/axios-server";
import SearchClient from "./client";

// API paths
const siteApiPath = "/site/selectAll";
const goodsApiPath = "/goods/selectPage";

// Revalidate page every 60 seconds
export const revalidate = 60;

interface SearchPageProps {
  searchParams?: {
    q?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const searchQuery = searchParams?.q || "";
  const pageNum = parseInt(searchParams?.page || "1", 10);
  
  // Get the current domain from request headers
  const headersList = headers();
  const domain = (await headersList).get("host") || "";
 
  try {
    // Get site data
    const siteResponse = await serverAxios.get(siteApiPath, { params: { domain } });
    const siteList = siteResponse.data || [];
    const siteId = siteList.length > 0 ? siteList[0].id.toString() : "2";

    // Get search results
    const goodsResponse = await serverAxios.get(goodsApiPath, {
      params: {
        pageNum: pageNum,
        pageSize: 20,
        name: searchQuery,
        siteId: siteId
      }
    });
    
    // Extract search results and pagination info
    const goodsData = goodsResponse.data?.list || [];
    const totalItems = goodsResponse.data?.total || 0;
    const totalPages = Math.ceil(totalItems / 20);
    
    // Pass data to client component for rendering
    return (
      <SearchClient 
        searchResults={goodsData} 
        searchQuery={searchQuery} 
        currentPage={pageNum} 
        totalPages={totalPages}
        totalItems={totalItems}
      />
    );
  } catch (error) {
    console.error("API request error:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <p className="text-lg text-gray-600">Failed to load search results. Please try again later.</p>
      </div>
    );
  }
} 