# Next.js 主站

基于 Next.js 13+ 的项目主站前端。

## 技术栈

- Next.js 13+
- React 18
- TypeScript
- Tailwind CSS
- NextAuth.js
- Stripe 支付集成

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

浏览器访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 启动生产服务

```bash
npm run start
# 或
yarn start
```

## 目录结构

```
nextjs-main-site/
├── app/               # Next.js App Router
│   ├── api/           # API 路由
│   ├── components/    # 共享组件
│   ├── lib/           # 工具函数
│   ├── styles/        # 全局样式
│   ├── (routes)/      # 页面路由
├── public/             # 静态资源
├── .env.example       # 环境变量示例
├── next.config.js      # Next.js 配置
├── package.json        # 项目依赖
├── postcss.config.js   # PostCSS 配置
├── tailwind.config.js  # Tailwind CSS 配置
├── tsconfig.json       # TypeScript 配置
```