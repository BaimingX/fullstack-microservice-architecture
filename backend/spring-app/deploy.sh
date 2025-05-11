#!/bin/bash

# 部署脚本（源码构建 + Docker 多阶段构建）

# 彩色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 开始部署 SpringBoot 应用（源码构建模式）...${NC}"

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${RED}❌ 缺少 .env 文件！${NC}"
    echo "请复制 .env.example 为 .env 并填写配置"
    exit 1
fi

# SSL 检查
mkdir -p ssl
if [ ! -f "ssl/server.crt" ] || [ ! -f "ssl/server.key" ]; then
    echo -e "${YELLOW}⚠️ 未找到 SSL 证书，请上传 ssl/server.crt 和 ssl/server.key${NC}"
fi

# 生成 dhparam.pem
if [ ! -f "ssl/dhparam.pem" ]; then
    echo -e "${YELLOW}🔐 生成 DH 参数（可能需要几分钟）...${NC}"
    openssl dhparam -out ssl/dhparam.pem 2048
fi

# 创建目录
echo -e "${GREEN}📂 创建必要目录...${NC}"
mkdir -p logs upload init-scripts nginx

# 检查 nginx 配置
if [ ! -f "nginx/default.conf" ]; then
    echo -e "${RED}❌ 缺少 nginx/default.conf 文件！${NC}"
    exit 1
fi

# 权限
chmod -R 600 ssl/* 2>/dev/null || true
chmod +x deploy.sh

# 停止旧容器
echo -e "${GREEN}🛑 停止旧容器（如果存在）...${NC}"
docker compose down

# 清理旧资源
docker system prune -f

# 拉取基础镜像（适用于公共镜像）
docker compose pull

# 构建 + 启动服务
echo -e "${GREEN}🏗️ 构建并启动容器...${NC}"
docker compose up -d --build

# 显示运行状态
docker compose ps

# 展示 IP
IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}✅ 部署成功！应用已在：https://${IP}${NC}"
echo -e "🔍 查看日志命令：docker compose logs -f app"
