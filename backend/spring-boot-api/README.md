# Spring Boot API 服务

基于 Spring Boot 3.2 和 Java 21 开发的 RESTful API 服务。

## 技术栈

- Spring Boot 3.2
- Java 21
- MyBatis-Plus 3.5
- Sa-Token 认证
- Redis 缓存
- MySQL 8 数据库
- Stripe 支付集成

## 开发环境要求

- JDK 21+
- Maven 3.8+
- MySQL 8.0+
- Redis 6.2+

## 开发指南

### 配置数据库

1. 创建 MySQL 数据库
2. 修改 `application.yml` 中的数据库配置

### 编译和运行

```bash
# 编译
mvn clean package

# 运行
java -jar target/spring-boot-api-0.0.1-SNAPSHOT.jar
```

或者使用 Maven 直接运行：

```bash
mvn spring-boot:run
```

默认服务运行在 http://localhost:9090

## 模块结构

- `config`: 配置类
- `controller`: API 控制器
- `service`: 业务逻辑
- `repository`: 数据访问
- `model`: 数据模型
- `dto`: 数据传输对象
- `exception`: 异常处理
- `util`: 工具类

## API 文档

Swagger UI 访问地址：http://localhost:9090/swagger-ui/index.html

## 目录结构

```
spring-boot-api/
├── src/
│   ├── main/
│   │   ├── java/com/example/api/
│   │   │   ├── config/       # 配置类
│   │   │   ├── controller/   # API 控制器
│   │   │   ├── service/      # 业务逻辑
│   │   │   ├── repository/   # 数据访问
│   │   │   ├── model/        # 数据模型
│   │   │   ├── dto/          # 数据传输对象
│   │   │   ├── exception/    # 异常处理
│   │   │   ├── util/         # 工具类
│   │   │   └── ApiApplication.java
│   │   └── resources/
│   │       ├── application.yml   # 主配置文件
│   │       ├── application-dev.yml # 开发环境配置
│   │       ├── application-prod.yml # 生产环境配置
│   │       └── static/          # 静态资源
│   └── test/                  # 测试代码
├── .gitignore
├── pom.xml                   # Maven 依赖
└── README.md                 # 项目说明
```