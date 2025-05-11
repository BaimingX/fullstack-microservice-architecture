# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 1. 声明并接收构建时变量
ARG STRIPE_SECRET_KEY
# 2. 将其注入环境变量（可选）
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY

# 单独复制依赖文件，优化缓存层
COPY package.json package-lock.json ./

# 使用--prefer-offline和--no-audit加速安装
RUN npm ci --prefer-offline --no-audit

# 先复制非源代码文件，这样源代码变更不会使整个缓存失效
COPY next.config.ts .
COPY tsconfig.json .
COPY public ./public
COPY .env* ./
COPY tailwind.config.ts postcss.config.mjs eslint.config.mjs next-env.d.ts ./

# 最后复制源代码（这些文件最频繁变化）
COPY src ./src

# 构建
RUN npm run build


# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# 复制最小集合的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 安全考虑：使用非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
