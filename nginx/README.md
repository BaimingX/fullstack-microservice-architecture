# Nginx配置

此目录包含项目的Nginx配置文件，用于反向代理和负载均衡。

## 配置说明

- `nginx.conf`: 主配置文件
- `conf.d/`: 包含各服务的具体配置
  - `nextjs.conf`: Next.js主站配置
  - `vue-admin.conf`: Vue管理后台配置
  - `api.conf`: API服务配置