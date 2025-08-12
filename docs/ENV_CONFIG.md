# 环境配置说明

## 📁 配置文件结构

```
mf-shell/
├── .env.example     # 配置示例文件 (模板)
├── .env.local       # 开发环境配置
└── .env.production  # 生产环境配置
```

## 🔧 配置文件说明

### `.env.example` - 配置模板

- 包含所有可配置的环境变量
- 提供默认值和说明
- 新开发者参考此文件创建本地配置

### `.env.local` - 开发环境

- 本地开发使用的配置
- 启用模板应用，禁用其他应用
- 使用 localhost 地址

### `.env.production` - 生产环境

- 生产部署使用的配置
- 启用所有应用
- 使用生产环境 URL

## 🚀 使用方法

### 开发环境

```bash
# 1. 复制示例文件
cp .env.example .env.local

# 2. 根据需要修改配置
# 3. 启动开发服务
pnpm dev
```

### 生产环境

```bash
# 1. 使用生产配置构建
NODE_ENV=production pnpm build

# 2. 或者复制生产配置
cp .env.production .env.local
pnpm build
```

## ⚙️ 配置项说明

### 主应用配置

- `SHELL_PORT`: 主应用端口号
- `PUBLIC_PATH`: 应用部署路径

### 微前端配置

每个微前端应用包含以下配置：

- `{APP}_NAME`: 应用显示名称
- `{APP}_URL`: 应用访问地址
- `{APP}_PORT`: 应用端口号
- `{APP}_ENABLED`: 是否启用该应用

### 支持的微前端应用

- `TEMPLATE`: 模板应用
- `MARKETING`: 营销系统
- `FINANCE`: 财务系统

## 📝 配置示例

### 开发环境示例

```bash
NODE_ENV=development
SHELL_PORT=3000
TEMPLATE_ENABLED=true
MARKETING_ENABLED=false
FINANCE_ENABLED=false
```

### 生产环境示例

```bash
NODE_ENV=production
SHELL_PORT=3000
PUBLIC_PATH=/mf-shell
TEMPLATE_ENABLED=true
MARKETING_ENABLED=true
FINANCE_ENABLED=true
```

## 🔒 安全注意事项

1. **不要提交敏感信息**: `.env.local` 已在 `.gitignore` 中
2. **生产环境配置**: 通过 CI/CD 或环境变量注入
3. **API 密钥**: 生产环境中使用环境变量而非文件

## 🛠️ 故障排除

### 配置不生效

1. 检查文件名是否正确
2. 确认变量名拼写
3. 重启开发服务器

### 微前端加载失败

1. 检查 `{APP}_ENABLED` 是否为 `true`
2. 验证 `{APP}_URL` 是否可访问
3. 确认端口号是否正确
