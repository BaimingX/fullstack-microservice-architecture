// app/page.tsx (Server Component by default)
import React from "react";
import HomePage from "@/components/HomePage";
import { headers } from "next/headers";
import serverAxios from "@/lib/axios-server";
import { Metadata } from "next";

// 首页元数据
export const metadata: Metadata = {
  title: "AusCoolStuff | Trending & Viral Products You'll Love",
  description: "Shop the internet's most viral and trending products all in one place. Discover TikTok famous gadgets, quirky gifts, and innovative items you didn't know you needed. Free shipping on orders over $50.",
  keywords: ["cool gadgets", "trending products", "TikTok famous", "viral products", "quirky gifts", "Australia", "cool stuff", "innovative gadgets"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "AusCoolStuff | Trending & Viral Products",
    description: "Shop the internet's most viral and trending products all in one place. Discover TikTok famous gadgets and quirky gifts.",
    siteName: "AusCoolStuff",
    images: [
      {
        url: "/images/home-og.jpg",
        width: 1200,
        height: 630,
        alt: "AusCoolStuff Featured Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AusCoolStuff | Trending Products",
    description: "Shop the internet's most viral and trending products all in one place.",
    images: ["/images/home-twitter.jpg"],
  },
};

// API 端点
const siteApiPath = "/site/selectAll";
const carouselApiPath = "/carousel/selectPage";
const goodsApiPath = "/goods/selectAll";

// 设置默认每 60 秒重新生成一次页面（类似 getStaticProps 的 revalidate）
export const revalidate = 60;

// 声明为 async，使我们能在这里直接用 await fetch
export default async function Page() {
  // 获取当前请求的域名
  const headersList = headers();
  // 使用正确的方法获取 host 值
  const domain = (await headersList).get("host") || "";
 
  try {
    // 获取站点数据
    const siteResponse = await serverAxios.get(siteApiPath, { params: { domain } });
    const siteList = siteResponse.data || [];
    const siteId = siteList.length > 0 ? siteList[0].id.toString() : "2";

    // 获取轮播图数据
    const carouselResponse = await serverAxios.get(carouselApiPath, {
      params: {
        pageNum: 1,
        pageSize: 20,
        name: "",
        siteId: siteId,
      },
    });

    const goodsResponse = await serverAxios.get(goodsApiPath, {
      params: {
        siteId: siteId,
      },
    });
    

    const carouselData = carouselResponse.data?.list || [];
    const goodsData = goodsResponse.data || [];
    

    // 传递数据到客户端组件渲染
    return (
      <>
        <HomePage carouselData={carouselData} allGoods={goodsData} />
        {/* 为首页添加的额外结构化数据 */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "AusCoolStuff - Trending & Viral Products",
              "description": "Shop the internet's most viral and trending products all in one place.",
              "url": "/",
              "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", ".home-intro"]
              },
              "mainEntity": {
                "@type": "ItemList",
                "itemListElement": goodsData.slice(0, 10).map((item: any, index: number) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "Product",
                    "name": item.name,
                    "image": item.img,
                    "url": `/product/${item.id}-${item.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").split(/\s+/).slice(0, 8).join("-")}`,
                    "offers": {
                      "@type": "Offer",
                      "price": item.hasDiscount ? item.discountPrice : item.originPrice,
                      "priceCurrency": "AUD"
                    }
                  }
                }))
              }
            })
          }}
        />
      </>
    );
  } catch (error) {
    console.error("API 请求错误:", error);
    throw new Error("Failed to fetch data");
  }
}