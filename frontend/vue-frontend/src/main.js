import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import '@/assets/css/manager.css'
import '@/assets/css/global.css'

// 添加CSP策略头，防止XSS攻击
if (typeof document !== 'undefined') {
  // 根据环境设置不同的CSP策略
  const isDev = import.meta.env.MODE === 'development';
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  if (isDev) {
    // 开发环境下放宽限制
    meta.content = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src * 'self'";
  } else {
    // 生产环境使用严格策略
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://auscoolstuff.com.au https://admin.auscoolstuff.com.au; style-src 'self' 'unsafe-inline'; img-src 'self' data: http://* https://* auscoolstuff.com.au https://auscoolstuff.com.au; media-src 'self' blob: http://* https://* auscoolstuff.com.au https://auscoolstuff.com.au;";
  }
  document.head.appendChild(meta);
}

const app = createApp(App)

app.use(router)
app.use(ElementPlus, {
    locale: zhCn
})
app.mount('#app')

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}