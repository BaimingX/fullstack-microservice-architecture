# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制包管理文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 部署阶段
FROM nginx:1.21-alpine

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]