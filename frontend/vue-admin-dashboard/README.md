# Vue 管理后台

基于 Vue 3 和 Vite 构建的管理后台项目。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Element Plus

## 开发环境要求

- Node.js 16+
- npm 或 yarn

## 开发指南

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

浏览器访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 预览生产版本

```bash
npm run preview
# 或
yarn preview
```

## 目录结构

```
vue-admin-dashboard/
├── public/           # 静态资源
├── src/              # 源代码
│   ├── api/          # API 请求
│   ├── assets/       # 静态资源
│   ├── components/   # 通用组件
│   ├── layouts/      # 页面布局
│   ├── router/       # 路由配置
│   ├── stores/       # Pinia 存储
│   ├── styles/       # 全局样式
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue       # 根组件
│   ├── main.ts       # 入口文件
├── .env.example      # 环境变量示例
├── index.html        # HTML 模板
├── package.json      # 项目依赖
├── tsconfig.json     # TypeScript 配置
├── vite.config.ts    # Vite 配置
```