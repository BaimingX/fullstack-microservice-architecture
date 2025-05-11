// Server Component with SSG
import React from 'react';
import { headers } from "next/headers";
import serverAxios from "@/lib/axios-server";
import AIToysClient from "./client";

// API paths
const siteApiPath = "/site/selectAll";
const goodsApiPath = "/goods/selectPage";

// Similar to HomePage, revalidate the page every 60 seconds
export const revalidate = 60;

export default async function AIToysPage() {
  // Get the current domain from request headers
  const headersList = headers();
  const domain = (await headersList).get("host") || "";
 
  try {
    // Get site data
    const siteResponse = await serverAxios.get(siteApiPath, { params: { domain } });
    const siteList = siteResponse.data || [];
    const siteId = siteList.length > 0 ? siteList[0].id.toString() : "2";

    // Get AI toys products using numeric categoryId
    const goodsResponse = await serverAxios.get(goodsApiPath, {
      params: {
        pageNum: 1,
        pageSize: 100, // Fetch up to 100 items, client will handle pagination
        categoryId: 5, // Changed from "AiToys" to numeric value 2
        siteId: siteId,
      },
    });
    
    // Extract products from API response
    const goodsData = goodsResponse.data?.list || [];
    
    // Pass data to client component for rendering
    return <AIToysClient aiToys={goodsData} />;
  } catch (error) {
    console.error("API request error:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">AI Toys</h1>
        <p className="text-lg text-gray-600">Failed to load products. Please try again later.</p>
      </div>
    );
  }
} 