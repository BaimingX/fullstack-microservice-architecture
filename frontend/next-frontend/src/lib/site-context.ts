import serverAxios from "./axios-server";

// 在lib/site-context.ts中创建一个简单的缓存
let cachedSiteId: string | null = null;

export async function getSiteId(domain: string) {
  // 如果已经有缓存，直接返回
  if (cachedSiteId) {
    return cachedSiteId;
  }

  // 否则，获取siteId并缓存
  try {
    const siteResponse = await serverAxios.get("/site/selectAll", { 
      params: { domain } 
    });
    const siteList = siteResponse.data || [];
    cachedSiteId = siteList.length > 0 ? siteList[0].id.toString() : "2";
    return cachedSiteId;
  } catch (error) {
    console.error("Error fetching site ID:", error);
    return "2"; // 默认站点ID
  }
}