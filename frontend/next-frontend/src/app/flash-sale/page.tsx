// Server Component with SSG
import React from 'react';
import { headers } from "next/headers";
import serverAxios from "@/lib/axios-server";
import FlashSaleClient from "./client";

// API paths
const siteApiPath = "/site/selectAll";
const goodsApiPath = "/goods/selectAll";

// Similar to HomePage, revalidate the page every 60 seconds
export const revalidate = 60;

export default async function FlashSalePage() {
  // Get the current domain from request headers
  const headersList = headers();
  const domain = (await headersList).get("host") || "";
 
  try {
    // Get site data
    const siteResponse = await serverAxios.get(siteApiPath, { params: { domain } });
    const siteList = siteResponse.data || [];
    const siteId = siteList.length > 0 ? siteList[0].id.toString() : "2";

    // Get all goods data to filter flash sale items on the client
    const goodsResponse = await serverAxios.get(goodsApiPath, {
      params: {
        siteId: siteId,
      },
    });
    
    const goodsData = goodsResponse.data || [];
    
    // Filter flash sale items - similar to HomePage logic
    const flashSaleItems = goodsData.filter((item: { hasFlash: any; flashPrice: any; }) => item.hasFlash && item.flashPrice);

    // Pass data to client component for rendering
    return <FlashSaleClient flashSaleItems={flashSaleItems} />;
  } catch (error) {
    console.error("API request error:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Flash Sale</h1>
        <p className="text-lg text-gray-600">Failed to load flash sale items. Please try again later.</p>
      </div>
    );
  }
} 