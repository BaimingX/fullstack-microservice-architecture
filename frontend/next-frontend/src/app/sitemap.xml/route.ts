import { NextRequest, NextResponse } from 'next/server';
import serverAxios from "@/lib/axios-server";

// 帮助函数，用于格式化日期为ISO格式
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 静态页面列表
const staticPages = [
  { url: "", lastModified: new Date(), changeFreq: "daily", priority: 1.0 },
  { url: "ai-toys", lastModified: new Date(), changeFreq: "weekly", priority: 0.8 },
  { url: "novelty", lastModified: new Date(), changeFreq: "weekly", priority: 0.8 },
  { url: "flash-sale", lastModified: new Date(), changeFreq: "daily", priority: 0.9 },
  { url: "coolest", lastModified: new Date(), changeFreq: "weekly", priority: 0.8 },
  { url: "faq", lastModified: new Date(), changeFreq: "monthly", priority: 0.5 },
  { url: "contact", lastModified: new Date(), changeFreq: "monthly", priority: 0.5 },
  { url: "returns", lastModified: new Date(), changeFreq: "monthly", priority: 0.5 },
  { url: "shipping", lastModified: new Date(), changeFreq: "monthly", priority: 0.5 },
];

// 产品名称转换为slug的函数
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // 移除特殊字符
    .split(/\s+/)
    .slice(0, 8)                  // 取前8个词
    .join("-");
}

export async function GET(request: NextRequest) {
  try {
    // 获取当前域名
    const hostname = request.headers.get('host') || 'auscoolstuff.com.au';
    const baseUrl = `https://${hostname}`;
    
    // 获取所有商品
    const goodsApiPath = "/goods/selectAll";
    const siteId = process.env.DEFAULT_SITE_ID || "2";

    // 获取商品数据
    const goodsResponse = await serverAxios.get(goodsApiPath, {
      params: {
        siteId: siteId,
      },
    });
    
    let products: any[] = [];
    if (goodsResponse.data && Array.isArray(goodsResponse.data)) {
      products = goodsResponse.data;
    }
    
    // 开始构建XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // 添加静态页面
    staticPages.forEach((page) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${page.url}</loc>\n`;
      xml += `    <lastmod>${formatDate(page.lastModified)}</lastmod>\n`;
      xml += `    <changefreq>${page.changeFreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // 添加产品页面
    products.forEach((product) => {
      const productSlug = `${product.id}-${slugify(product.name)}`;
      const lastModified = product.date 
        ? new Date(product.date) 
        : new Date();
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/product/${productSlug}</loc>\n`;
      xml += `    <lastmod>${formatDate(lastModified)}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
    
    // 关闭XML
    xml += '</urlset>';
    
    // 返回XML响应
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error("生成站点地图时出错:", error);
    // 出错时返回简单的错误站点地图
    const errorXml = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://auscoolstuff.com.au/</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(errorXml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
} 