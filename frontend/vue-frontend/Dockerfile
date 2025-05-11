# ========== 阶段1：构建 ==========
FROM node:18-alpine AS build
WORKDIR /app

# 复制依赖文件并安装，使用缓存
COPY package*.json ./
RUN npm install --prefer-offline --no-audit

# 先复制非源代码文件
COPY vite.config.js .
COPY index.html .
COPY .env* ./

# 最后复制变化最频繁的源代码目录
COPY src ./src

# 运行构建（通常产物在 /app/dist）
RUN npm run build

# ========== 阶段2：运行（Nginx 托管静态文件） ==========
FROM nginx:1.21-alpine

# 创建必要的Nginx缓存目录并调整权限
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    && chmod 700 /var/cache/nginx/* \
    && chown -R nginx:nginx /var/cache/nginx

# 拷贝编译后的静态文件到 Nginx 默认目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制我们的nginx配置文件来处理Vue Router的history模式
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 设置正确的权限
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# 修改默认的nginx.conf，使用root用户运行
RUN sed -i 's/user  nginx;/user  root;/' /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
