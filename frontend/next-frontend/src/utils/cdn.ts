/**
 * CDN工具函数
 * 用于处理静态资源的CDN路径
 */

/**
 * 获取资源的CDN URL
 * @param path 资源路径，需要以/开头
 * @returns 完整的CDN URL
 */
export const getCdnUrl = (path: string): string => {
  // 确保路径以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 开发环境直接使用相对路径，生产环境使用CDN域名
  const cdnPrefix = process.env.NODE_ENV === 'production' 
    ? 'https://auscoolstuff.com.au' 
    : '';
    
  return `${cdnPrefix}${normalizedPath}`;
};

/**
 * 获取图片的CDN URL
 * @param imagePath 图片路径
 * @returns 完整的图片CDN URL
 */
export const getImageUrl = (imagePath: string): string => {
  // 如果路径已经包含/images前缀，则不再添加
  if (imagePath.startsWith('/images/')) {
    return getCdnUrl(imagePath);
  }
  
  // 如果是绝对URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // 否则添加/images前缀
  return getCdnUrl(`/images${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`);
};

/**
 * 获取静态资源的CDN URL
 * @param staticPath 静态资源路径
 * @returns 完整的静态资源CDN URL
 */
export const getStaticUrl = (staticPath: string): string => {
  return getCdnUrl(staticPath);
}; 