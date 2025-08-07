# 环境配置化文档

## 概述

本项目实现了完整的环境配置化方案，支持通过环境变量动态配置应用的各项参数，提高了系统的灵活性和可维护性。

## 配置结构

### 1. 应用基础配置 (app)

- `REACT_APP_NAME`: 应用名称
- `REACT_APP_VERSION`: 应用版本
- `REACT_APP_BASE_URL`: 应用基础URL
- `REACT_APP_PORT`: 应用端口

### 2. 认证配置 (auth)

- `REACT_APP_LOGIN_URL`: 登录页面URL
- `REACT_APP_LOGOUT_URL`: 登出跳转URL
- `REACT_APP_TOKEN_KEY`: 本地存储的token键名

### 3. 微前端配置 (microfrontend)

- `REACT_APP_MF_HOST`: 微前端默认主机地址
- `REACT_APP_MF_PORT`: 微前端默认端口
- `REACT_APP_CORS_ENABLED`: 是否启用CORS

### 4. 开发环境配置 (development)

- `REACT_APP_ENABLE_MOCK`: 是否启用模拟数据
- `REACT_APP_HOT_RELOAD`: 是否启用热重载
- `REACT_APP_SHOW_DEV_TOOLS`: 是否显示开发工具
- `REACT_APP_LOG_LEVEL`: 日志级别 (debug/info/warn/error)

### 5. 生产环境配置 (production)

- `REACT_APP_ENABLE_ANALYTICS`: 是否启用分析
- `REACT_APP_ENABLE_ERROR_TRACKING`: 是否启用错误追踪
- `REACT_APP_CDN_ENABLED`: 是否启用CDN
- `REACT_APP_COMPRESSION_ENABLED`: 是否启用压缩

## 使用方法

### 1. 创建环境变量文件

```bash
# 复制示例文件
cp .env.example .env.local

# 编辑配置
vim .env.local
```

### 2. 在代码中使用

```typescript
import { environmentManager } from '@/config/environment';

// 获取当前环境配置
const config = environmentManager.getConfig();

// 构建认证URL
const loginUrl = environmentManager.buildAuthUrl('/dashboard');

// 构建微前端URL
const mfUrl = environmentManager.buildMicrofrontendUrl('template', 3003);

// 检查是否为开发环境
const isDev = environmentManager.isDevelopment();
```

### 3. 环境特定配置

#### 开发环境 (.env.local)

```env
REACT_APP_BASE_URL=http://localhost:3000
REACT_APP_MF_HOST=http://localhost
REACT_APP_ENABLE_MOCK=true
REACT_APP_LOG_LEVEL=debug
```

#### 生产环境 (.env.production)

```env
REACT_APP_BASE_URL=https://your-domain.com
REACT_APP_MF_HOST=https://your-domain.com
REACT_APP_ENABLE_MOCK=false
REACT_APP_LOG_LEVEL=error
```

## 配置优先级

1. 环境变量 (最高优先级)
2. .env.local 文件
3. .env.{NODE_ENV} 文件
4. .env 文件
5. 代码中的默认值 (最低优先级)

## 最佳实践

### 1. 安全性

- 敏感信息不要放在前端环境变量中
- 生产环境配置文件不要提交到版本控制
- 使用 REACT*APP* 前缀确保变量被正确注入

### 2. 可维护性

- 为每个环境创建对应的配置文件
- 使用有意义的变量名
- 提供合理的默认值
- 添加配置验证

### 3. 部署

- CI/CD 中通过环境变量覆盖配置
- 使用配置管理工具统一管理
- 定期检查配置的有效性

## 故障排除

### 1. 环境变量未生效

- 检查变量名是否以 REACT*APP* 开头
- 确认 .env 文件位置正确
- 重启开发服务器

### 2. 配置冲突

- 检查多个 .env 文件的优先级
- 使用 `console.log(process.env)` 调试
- 确认环境变量类型转换正确

### 3. 微前端连接失败

- 检查微前端主机和端口配置
- 确认 CORS 设置正确
- 验证网络连接

## 扩展配置

如需添加新的配置项：

1. 在 `EnvironmentConfig` 接口中添加类型定义
2. 在 `developmentConfig` 和 `productionConfig` 中添加默认值
3. 在 `.env.example` 中添加示例
4. 更新此文档

## 相关文件

- `src/config/environment.ts` - 环境配置管理器
- `src/config/microsystems.dev.ts` - 开发环境微前端配置
- `src/config/microsystems.prod.ts` - 生产环境微前端配置
- `.env.example` - 环境变量示例文件
- `src/utils/authUtils.ts` - 认证工具（使用环境配置）
