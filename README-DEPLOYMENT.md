# 部署配置说明

## 环境变量配置

### 环境配置文件

项目使用 `.env` 文件管理不同环境的配置：

- `.env` - 默认配置
- `.env.local` - 本地开发配置（不提交到 Git）
- `.env.production` - 生产环境配置

### 生产环境配置

生产环境配置在 `.env.production` 文件中：

```bash
# 生产环境配置
NODE_ENV=production

# 主应用配置
SHELL_PORT=3000
PUBLIC_PATH=/mf-shell

# 模板应用配置
TEMPLATE_NAME=模板应用
TEMPLATE_URL=https://luozyiii.github.io/mf-template
TEMPLATE_PORT=3003
TEMPLATE_ENABLED=true
```

### 本地测试生产构建

```bash
# 构建生产版本（自动读取 .env.production）
NODE_ENV=production pnpm build

# 预览构建结果
pnpm preview
```

## 部署地址配置

### 默认配置

如果不设置环境变量，将使用以下默认地址：

- **模板应用**: `https://luozyiii.github.io/mf-template`

### 自定义配置

你可以通过修改 `.env.production` 文件来自定义配置：

```bash
# 修改模板应用地址
TEMPLATE_URL=https://your-domain.com/template-app
```

## 添加新的远程模块

1. 在 `.env.production` 中添加新的配置：

```bash
# 营销系统配置
MARKETING_NAME=营销系统
MARKETING_URL=https://luozyiii.github.io/mf-marketing
MARKETING_PORT=3001
MARKETING_ENABLED=true
```

2. 在 `src/config/remotes.config.ts` 中添加对应的配置：

```typescript
marketing: {
  name: 'marketing',
  url: 'marketing',
  development: `http://localhost:${process.env.MARKETING_PORT || '3001'}/remoteEntry.js`,
  production: `${process.env.MARKETING_URL || 'https://luozyiii.github.io/mf-marketing'}/remoteEntry.js`
}
```

## 故障排除

### 常见问题

1. **远程模块加载失败**
   - 检查环境变量是否正确设置
   - 确认远程应用已正确部署
   - 检查 CORS 配置

2. **开发环境连接不上**
   - 确认子应用在对应端口运行
   - 检查防火墙设置

3. **生产环境 404 错误**
   - 确认远程应用的 `remoteEntry.js` 文件存在
   - 检查部署路径是否正确
