import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 获取主机域名，用于sitemap URL
  const hostname = request.headers.get('host') || 'auscoolstuff.com.au';
  const baseUrl = `https://${hostname}`;
  
  // 创建robots.txt内容
  const robotsTxt = `
# robots.txt for AusCoolStuff
User-agent: *
Allow: /

# 禁止爬取某些特定页面
Disallow: /api/
Disallow: /cart/
Disallow: /profile/
Disallow: /_next/

# 站点地图位置
Sitemap: ${baseUrl}/sitemap.xml
`.trim();

  // 返回纯文本响应
  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 