# 全栈微服务架构项目

基于Docker容器化的全栈微服务架构项目，包含Next.js前端、Vue管理后台和Spring Boot后端。

## 项目结构

```
fullstack-microservice-architecture/
├── frontend/                  # 前端代码
│   ├── nextjs-main-site/      # Next.js主站前端
│   └── vue-admin-dashboard/   # Vue管理后台
├── backend/                   # 后端代码
│   └── spring-boot-api/       # Spring Boot API服务
├── nginx/                     # Nginx配置
├── docker/                    # Docker相关配置
│   ├── docker-compose.yml     # 容器编排配置
│   └── .env.example           # 环境变量示例
└── docs/                      # 项目文档
    └── 项目架构综述.md          # 项目架构详细说明
```

## 快速开始

### 前置条件

- Docker 和 Docker Compose
- Node.js 16+
- Java 21
- Maven 3.8+

### 开发环境启动

```bash
# 克隆仓库
git clone https://github.com/BaimingX/fullstack-microservice-architecture.git
cd fullstack-microservice-architecture

# 配置环境变量
cp docker/.env.example docker/.env
# 编辑 .env 文件设置必要的环境变量

# 启动所有服务
docker-compose -f docker/docker-compose.yml up -d
```

### 访问服务

- 主站: http://localhost:3000
- 管理后台: http://localhost:8080
- API服务: http://localhost:9090/api

## 技术栈

### 前端

- **Next.js主站**: Next.js 13+, React, TypeScript, Tailwind CSS
- **Vue管理后台**: Vue 3, Vite, TypeScript

### 后端

- **API服务**: Spring Boot 3.2, Java 21, MyBatis-Plus, Sa-Token

### 数据存储

- MySQL 8.0
- Redis 6.2

### 部署

- Docker & Docker Compose
- Nginx

## 详细文档

更多详细信息请参阅 [项目架构综述](docs/项目架构综述.md)。

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 `git checkout -b feature/your-feature`
3. 提交您的更改 `git commit -m 'Add some feature'`
4. 推送到分支 `git push origin feature/your-feature`
5. 创建新的 Pull Request

## 许可证

MIT