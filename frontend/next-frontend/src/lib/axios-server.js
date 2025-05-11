// lib/axios-server.js
import axios from 'axios';

// 创建一个适用于服务器端的axios实例
const serverAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  }
});

// 响应拦截器
serverAxios.interceptors.response.use(
  response => {
    // 在开发环境添加调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Server API] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    
    let res = response.data;
    
    // 如果是返回的文件
    if (response.config.responseType === 'blob') {
      return res;
    }
    
    // 兼容服务端返回的字符串数据
    if (typeof res === 'string') {
      res = res ? JSON.parse(res) : res;
    }
    
    // 注意：在服务器组件中无法使用router.push和ElMessage等客户端功能
    // 在服务器组件中，我们只需返回响应数据，错误处理会在Page组件中进行
    return res;
  },
  error => {
    // 在开发环境添加错误日志
    if (process.env.NODE_ENV === 'development') {
      console.error('[Server API Error]', error);
    }
    
    return Promise.reject(error);
  }
);

export default serverAxios;