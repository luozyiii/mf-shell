# 环境配置说明

本文档说明如何通过环境变量配置微前端主应用的各种功能。

## 环境变量配置

### 认证控制

#### REACT_APP_SKIP_AUTH

- **类型**: boolean (string)
- **默认值**: `false`
- **说明**: 控制是否跳过登录认证
- **用法**:
  - `true`: 开发模式下自动登录为管理员用户，跳过登录页面
  - `false`: 正常认证流程，需要用户手动登录

```bash
# 跳过认证（开发模式）
REACT_APP_SKIP_AUTH=true

# 正常认证（生产模式）
REACT_APP_SKIP_AUTH=false
```

### API 配置

#### REACT_APP_API_BASE_URL

- **类型**: string
- **默认值**: `http://localhost:8080/api`
- **说明**: API 服务的基础地址

#### REACT_APP_ENABLE_MOCK

- **类型**: boolean (string)
- **默认值**: `true`
- **说明**: 是否启用模拟数据

### 调试配置

#### REACT_APP_DEBUG

- **类型**: boolean (string)
- **默认值**: `true`
- **说明**: 是否启用调试模式

### 微前端应用地址配置

#### REACT_APP_TEMPLATE_HOST

- **类型**: string
- **默认值**: `http://localhost:3001`
- **说明**: Template 微前端应用的地址

#### REACT_APP_FINANCE_HOST

- **类型**: string
- **默认值**: `http://localhost:3002`
- **说明**: Finance 微前端应用的地址

#### REACT_APP_MARKETING_HOST

- **类型**: string
- **默认值**: `http://localhost:3003`
- **说明**: Marketing 微前端应用的地址

## 配置文件

### .env.local（开发环境）

创建 `.env.local` 文件用于本地开发环境配置：

```bash
# 开发环境配置
# 控制是否需要登录验证
REACT_APP_SKIP_AUTH=true

# API 基础地址
REACT_APP_API_BASE_URL=http://localhost:8080/api

# 是否启用模拟数据
REACT_APP_ENABLE_MOCK=true

# 开发模式下的调试选项
REACT_APP_DEBUG=true

# 微前端应用地址配置
REACT_APP_TEMPLATE_HOST=http://localhost:3001
REACT_APP_FINANCE_HOST=http://localhost:3002
REACT_APP_MARKETING_HOST=http://localhost:3003
```

### .env.production（生产环境）

生产环境建议配置：

```bash
# 生产环境配置
# 生产环境必须进行认证
REACT_APP_SKIP_AUTH=false

# 生产环境 API 地址
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api

# 生产环境禁用模拟数据
REACT_APP_ENABLE_MOCK=false

# 生产环境禁用调试
REACT_APP_DEBUG=false

# 生产环境微前端应用地址
REACT_APP_TEMPLATE_HOST=https://template.yourdomain.com
REACT_APP_FINANCE_HOST=https://finance.yourdomain.com
REACT_APP_MARKETING_HOST=https://marketing.yourdomain.com
```

## 使用说明

### 开发模式快速启动

1. 确保 `.env.local` 文件中设置了 `REACT_APP_SKIP_AUTH=true`
2. 启动开发服务器：`npm run dev`
3. 应用将自动以管理员身份登录，无需手动输入用户名密码

### 测试认证流程

1. 将 `.env.local` 中的 `REACT_APP_SKIP_AUTH` 设置为 `false`
2. 重启开发服务器
3. 访问应用将显示登录页面
4. 使用以下测试账户：
   - 管理员：`admin` / `admin123`
   - 开发者：`developer` / `dev123`
   - 普通用户：`user` / `user123`

### 环境变量优先级

1. `.env.local` - 本地开发环境（最高优先级）
2. `.env.development` - 开发环境
3. `.env.production` - 生产环境
4. `.env` - 默认环境（最低优先级）

## 注意事项

1. **安全性**: 生产环境中务必设置 `REACT_APP_SKIP_AUTH=false`
2. **环境变量**: 所有自定义环境变量必须以 `REACT_APP_` 开头
3. **重启**: 修改环境变量后需要重启开发服务器才能生效
4. **版本控制**: `.env.local` 文件不应提交到版本控制系统中

## 故障排除

### 环境变量不生效

1. 检查变量名是否以 `REACT_APP_` 开头
2. 确认文件名是否正确（`.env.local`）
3. 重启开发服务器
4. 检查控制台是否有相关错误信息

### 认证跳过不工作

1. 确认 `REACT_APP_SKIP_AUTH=true`（注意大小写）
2. 检查浏览器控制台是否有 JavaScript 错误
3. 清除浏览器缓存和本地存储
4. 重启开发服务器
