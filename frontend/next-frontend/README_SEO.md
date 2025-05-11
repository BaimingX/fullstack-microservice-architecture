# CoolStuff 电子商务网站 SEO 优化指南

本文档详细说明了在 Next.js 项目中实施的 SEO 优化措施。

## 已实施的 SEO 优化

1. **基础元数据配置**
   - 在根布局（`layout.tsx`）中设置了全站默认元数据
   - 添加了适当的标题模板（`%s | CoolStuff Australia`）
   - 配置了关键词、描述和作者信息
   - 设置了机器人索引规则

2. **社交媒体元标签**
   - 添加了 Open Graph 协议支持，优化在社交媒体平台的展示
   - 添加了 Twitter Card 元标签，优化 Twitter 分享展示
   - 设置了适当的社交媒体图片尺寸和描述

3. **动态产品页面 SEO**
   - 为每个产品页面生成唯一的元数据（标题、描述、关键词）
   - 产品描述会自动从产品内容中提取，并控制在适当的长度
   - 产品图片设置了符合 SEO 标准的 `alt` 属性

4. **结构化数据**
   - 添加了 JSON-LD 格式的组织结构化数据
   - 添加了产品页面的产品结构化数据
   - 添加了首页的 WebPage 和 ItemList 结构化数据

5. **站点地图和索引控制**
   - 创建了动态生成的 `robots.txt`，控制搜索引擎爬取规则
   - 实现了动态生成的 `sitemap.xml`，包含所有重要页面
   - 为不同类型的页面设置了合适的更新频率和优先级

6. **图片优化**
   - 使用 Next.js 的 Image 组件处理图片，优化加载性能
   - 为所有产品图片添加了描述性的 alt 文本
   - 设置了首屏图片的优先加载

7. **URL 结构优化**
   - 产品 URL 中包含产品 ID 和名称，增加可读性和 SEO 友好性
   - 实现了适当的 slug 生成逻辑

8. **语义化标签**
   - 使用 HTML5 语义化标签（如 `<h1>`、`<h2>`、`<h3>`、`<article>` 等）
   - 产品卡片中使用 `<h3>` 作为产品名称

## SEO 优化建议

1. **页面性能优化**
   - 继续优化网站加载速度，使用 Lighthouse 测试并提高分数
   - 考虑实现图片的懒加载（已在产品卡片中实现）

2. **内容优化**
   - 为产品添加更丰富的描述内容
   - 考虑添加产品评论系统，增加用户生成内容

3. **后续优化**
   - 实现面包屑导航，改善用户体验并提高 SEO
   - 添加内部链接策略，增强相关产品之间的连接
   - 定期检查并修复 404 错误
   - 监控搜索引擎控制台，及时处理索引问题

4. **技术 SEO 检查清单**
   - 定期使用 Google Search Console 和 Bing Webmaster Tools 检查索引状态
   - 检查移动端友好度
   - 验证架构标记正确性
   - 监控页面加载速度，尤其是移动端的首次内容渲染时间

## 使用说明

**添加新页面时的 SEO 配置**

使用 App Router 时，在页面组件文件中导出 `metadata` 对象或 `generateMetadata` 函数：

```tsx
// 静态元数据
export const metadata = {
  title: "页面标题",
  description: "页面描述...",
};

// 或动态元数据
export async function generateMetadata({ params }) {
  // 获取数据...
  return {
    title: `${data.title} - CoolStuff`,
    description: data.description,
    // 其他元数据...
  };
}
```

**图片 Alt 文本最佳实践**

为所有图片添加描述性的 alt 文本，例如：

```tsx
<Image
  src={product.img}
  alt={`${product.name} - ${product.hasDiscount ? '优惠' : '新品'}`}
  // ...其他属性
/>
```

## 资源

- [Next.js 官方 SEO 文档](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google SEO 指南](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org 结构化数据文档](https://schema.org/docs/gs.html) 