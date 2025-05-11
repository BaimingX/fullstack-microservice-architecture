// app/product/[slug]/page.tsx
import React from "react";
import ProductDetail from "@/components/ProductDetail";
import serverAxios from "@/lib/axios-server";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

// API endpoint - 修改为与后端匹配的路径格式
const productApiPath = "/goods/selectById";

// Set revalidation period
export const revalidate = 60;

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // 移除特殊字符
    .split(/\s+/)
    .slice(0, 8)                  // 取前8个词
    .join("-");
}

// For each product page generate dynamic metadata
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Extract product ID from slug
  const productId = params.slug.split("-")[0];
  
  // If no product ID, return default metadata
  if (!productId) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
  
  try {
    // Fetch product data
    const productResponse = await serverAxios.get(`${productApiPath}/${productId}`);
    const product = productResponse.data;
    
    // If no product data, return default metadata
    if (!product || Object.keys(product).length === 0) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }
    
    // Get the product name for metadata
    const productName = product.name || "";
    
    // Generate price text for description
    const priceText = product.hasDiscount 
      ? `$${product.discountPrice} (was $${product.originPrice})` 
      : `$${product.originPrice}`;
    
    // Build product description using only the name
    // We'll use the first portion as title and the rest (if any) as description
    const nameParts = productName.split(' - ');
    const shortTitle = nameParts[0];
    
    // Create description from name or use a default format
    let description = "";
    if (nameParts.length > 1) {
      // Use the part after " - " as description
      description = nameParts.slice(1).join(' - ');
    } else {
      // Create description using the product name and price
      description = `${productName}. Shop now for ${priceText} at AusCoolStuff . Fast shipping and high quality products.`;
    }
    
    // Limit description length
    if (description.length > 160) {
      description = description.substring(0, 157) + "...";
    }
    
    // Extract keywords from product name and type
    const nameWords = productName.split(/\s+/).filter(word => word.length > 3);
    const typeWords = product.type ? product.type.split(',').map(t => t.trim()) : [];
    const keywords = [...new Set([...nameWords, ...typeWords])];
    
    // Build product URL
    const productUrl = `/product/${params.slug}`;
    
    return {
      title: `${shortTitle} | Buy Online at AusCoolStuff`,
      description,
      keywords,
      openGraph: {
        type: "website",
        url: productUrl,
        title: shortTitle,
        description,
        images: [
          {
            url: product.img,
            width: 800,
            height: 600,
            alt: shortTitle,
          }
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: shortTitle,
        description,
        images: [product.img],
      },
      // Product schema structured data
      other: {
        "product-json-ld": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": shortTitle,
          "image": product.img,
          "description": description,
          "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "AUD",
            "price": product.hasDiscount ? product.discountPrice : product.originPrice,
            "availability": product.store && product.store > 0 
              ? "https://schema.org/InStock" 
              : "https://schema.org/OutOfStock",
          }
        })
      }
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    // Return default metadata on error
    return {
      title: "Product - AusCoolStuff",
      description: "Discover amazing products at AusCoolStuff.",
    };
  }
}

// This generates static pages for each product at build time
export async function generateStaticParams() {
  try {
    // 获取所有商品的API路径
    const goodsApiPath = "/goods/selectAll";
    
    // 使用默认站点ID
    const siteId = process.env.DEFAULT_SITE_ID || "2";

    // 获取所有商品
    const goodsResponse = await serverAxios.get(goodsApiPath, {
      params: {
        siteId: siteId,
      },
    });
    
    // 检查响应数据是否有效
    if (goodsResponse.data && Array.isArray(goodsResponse.data)) {
      
      
      // 返回所有商品ID，用于预生成静态页面
      return goodsResponse.data.map((product) => ({ 
        slug: `${product.id}-${slugify(product.name)}`
      }));
    }
    
    
    return []; // 如果没有商品或数据格式不正确，则不生成静态页面
  } catch (error) {
    console.error("Error generating static params:", error);
    return []; // 出错时不生成静态页面
  }
}

// 使用原始类型，而不是解构
interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage(props: PageProps) {
  // 使用await操作符获取params属性
  const paramsData = await Promise.resolve(props.params);
  const slug = paramsData.slug;
  
  // 从slug中提取商品ID (第一个连字符前的部分)
  const productId = slug.split("-")[0];
  
  if (!productId) {
    notFound();
  }

  try {
    // 根据后端API格式，使用路径参数请求商品详情
    const productResponse = await serverAxios.get(`${productApiPath}/${productId}`);
    
    // 检查响应状态和数据
    if (!productResponse.data || Object.keys(productResponse.data).length === 0) {
      console.error("Empty product data received");
      notFound();
    }
    
    // 传递商品数据到客户端组件
    return (
      <>
        <ProductDetail product={productResponse.data} />
        {/* Product structured data */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": productResponse.data.name.split(' - ')[0],
              "image": productResponse.data.img,
              "description": productResponse.data.name.includes(' - ')
                ? productResponse.data.name.split(' - ').slice(1).join(' - ')
                : productResponse.data.name,
              "offers": {
                "@type": "Offer",
                "url": `/product/${slug}`,
                "priceCurrency": "AUD",
                "price": productResponse.data.hasDiscount 
                  ? productResponse.data.discountPrice 
                  : productResponse.data.originPrice,
                "availability": productResponse.data.store && productResponse.data.store > 0 
                  ? "https://schema.org/InStock" 
                  : "https://schema.org/OutOfStock",
              }
            })
          }}
        />
      </>
    );
  } catch (error: any) {
    // 增强错误日志，包含更多详细信息
    console.error("API request error:", error.message);
    if (error.response) {
      console.error("Error response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    // 使用Next.js的notFound函数返回404页面
    notFound();
  }
}