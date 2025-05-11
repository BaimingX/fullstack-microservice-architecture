# 第一阶段：构建应用
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# 设置Maven配置文件
COPY settings.xml /usr/share/maven/conf/settings.xml

# 设置Maven内存和超时参数
ENV MAVEN_OPTS="-Xmx1024m -Dhttp.connectionTimeout=120000 -Dhttp.socketTimeout=120000"

# 分层缓存Maven依赖：首先只复制pom.xml，下载依赖
COPY pom.xml .

# 下载依赖但不构建（仅当依赖发生变化时才会重新下载）
# 使用离线模式检查依赖，静默失败，保持缓存层
RUN mvn dependency:go-offline -B || echo "依赖下载可能不完整，但继续构建"

# 然后复制源代码
COPY src ./src

# 构建应用，使用已下载的依赖，跳过测试
RUN mvn clean package -B -DskipTests

# 第二阶段：运行时环境
FROM eclipse-temurin:21-jre

# 安装FFmpeg和curl
RUN apt-get update && apt-get install -y ffmpeg curl && apt-get clean

# 创建非root用户运行应用
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# 设置工作目录
WORKDIR /app

# 创建日志和上传目录
RUN mkdir -p /app/logs /app/upload /app/files && \
    chown -R appuser:appgroup /app

# 复制构建好的jar包
COPY --from=build /app/target/*.jar /app/app.jar

# 切换为非root用户
USER appuser:appgroup

# 暴露HTTP端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-Dserver.port=8080", \
  "-jar", "/app/app.jar"]
