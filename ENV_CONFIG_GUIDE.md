# 环境变量配置指南

本项目支持多环境配置，通过不同的环境变量文件来管理各种环境下的配置。

## 环境文件说明

### 1. `.env.example`

- **用途**: 环境变量模板文件
- **说明**: 包含所有可用的环境变量示例，新开发者可以复制此文件创建自己的配置
- **版本控制**: 需要提交到版本控制

### 2. `.env.development`

- **用途**: 开发环境配置
- **说明**: 用于 `npm run dev` 或 `NODE_ENV=development` 时的配置
- **特点**: 启用热重载、开发工具、调试日志等
- **版本控制**: 可以提交到版本控制

### 3. `.env.production`

- **用途**: 生产环境配置
- **说明**: 用于 `npm run build` 或 `NODE_ENV=production` 时的配置
- **特点**: 优化性能、启用压缩、错误追踪等
- **版本控制**: 可以提交到版本控制

### 4. `.env.test`

- **用途**: 测试环境配置
- **说明**: 用于测试环境部署的配置
- **特点**: 启用测试工具、模拟数据、部分调试功能
- **版本控制**: 可以提交到版本控制

### 5. `.env.local`

- **用途**: 本地个人配置
- **说明**: 开发者个人的本地配置，会覆盖其他环境文件的配置
- **特点**: 所有微前端应用默认启用，便于本地开发调试
- **版本控制**: **不应该**提交到版本控制（已在 .gitignore 中排除）

## 环境变量优先级

React 环境变量的加载优先级（从高到低）：

1. `.env.local` (最高优先级，本地覆盖)
2. `.env.development` / `.env.production` / `.env.test` (根据 NODE_ENV)
3. `.env` (通用配置)

## 主要配置项说明

### 应用基础配置

```bash
REACT_APP_NAME=应用名称
REACT_APP_VERSION=版本号
REACT_APP_BASE_URL=应用基础URL
REACT_APP_PORT=应用端口
```

### 认证配置

```bash
REACT_APP_LOGIN_URL=登录页面URL
REACT_APP_LOGOUT_URL=登出重定向URL
REACT_APP_TOKEN_KEY=Token存储键名
REACT_APP_SKIP_AUTH=是否跳过认证（仅开发环境）
```

### 微前端全局配置

```bash
REACT_APP_MF_HOST=微前端主机地址
REACT_APP_CORS_ENABLED=是否启用CORS
```

### 微前端应用配置

每个微前端应用都有以下配置项：

```bash
# 以 template 应用为例
REACT_APP_MF_TEMPLATE_PORT=端口号
REACT_APP_MF_TEMPLATE_HOST=主机地址（生产环境）
REACT_APP_MF_TEMPLATE_ENABLED=是否启用
```

支持的微前端应用：

- `TEMPLATE` - 模板系统
- `MARKETING` - 营销系统
- `FINANCE` - 财务系统
- `USER` - 用户管理系统
- `INVENTORY` - 库存管理系统

### 开发配置

```bash
REACT_APP_HOT_RELOAD=热重载
REACT_APP_SHOW_DEV_TOOLS=显示开发工具
REACT_APP_ENABLE_MOCK=启用模拟数据
REACT_APP_LOG_LEVEL=日志级别
REACT_APP_FAST_REFRESH=快速刷新
REACT_APP_SOURCE_MAP=源码映射
```

### 生产配置

```bash
REACT_APP_ENABLE_ANALYTICS=启用分析
REACT_APP_ENABLE_ERROR_TRACKING=启用错误追踪
REACT_APP_CDN_ENABLED=启用CDN
REACT_APP_COMPRESSION_ENABLED=启用压缩
```

## 使用方法

### 1. 新开发者设置

```bash
# 复制示例文件
cp .env.example .env.local

# 根据需要修改 .env.local 中的配置
```

### 2. 启用/禁用微前端应用

在对应的环境文件中修改：

```bash
# 启用营销系统
REACT_APP_MF_MARKETING_ENABLED=true

# 禁用财务系统
REACT_APP_MF_FINANCE_ENABLED=false
```

### 3. 修改微前端应用端口

```bash
# 修改模板系统端口
REACT_APP_MF_TEMPLATE_PORT=3010
```

### 4. 生产环境部署

确保 `.env.production` 中的配置正确：

```bash
# 检查生产环境配置
cat .env.production

# 构建生产版本
npm run build
```

## 注意事项

1. **环境变量必须以 `REACT_APP_` 开头**才能在 React 应用中使用
2. **不要在环境文件中存储敏感信息**（如密钥、密码等）
3. **`.env.local` 文件不应提交到版本控制**
4. **修改环境变量后需要重启开发服务器**
5. **生产环境的主机地址需要根据实际部署情况调整**

## 故障排除

### 环境变量不生效

1. 检查变量名是否以 `REACT_APP_` 开头
2. 重启开发服务器
3. 检查环境文件的优先级

### 微前端应用无法加载

1. 检查对应应用的 `ENABLED` 配置
2. 检查端口配置是否正确
3. 确认微前端应用服务是否正在运行

### 生产环境问题

1. 检查 `.env.production` 中的主机地址
2. 确认所有启用的微前端应用都已部署
3. 检查 CORS 配置
