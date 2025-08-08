# GitHub Pages 部署指南

本文档介绍如何将微前端主应用 (mf-shell) 部署到 GitHub Pages。

## 🚀 自动部署设置

### 1. GitHub 仓库设置

1. **推送代码到 GitHub**：

   ```bash
   git add .
   git commit -m "feat: add GitHub Pages deployment"
   git push origin main
   ```

2. **启用 GitHub Pages**：
   - 进入 GitHub 仓库页面
   - 点击 `Settings` 选项卡
   - 在左侧菜单中找到 `Pages`
   - 在 `Source` 部分选择 `GitHub Actions`

3. **配置仓库权限**：
   - 在 `Settings` > `Actions` > `General` 中
   - 确保 `Workflow permissions` 设置为 `Read and write permissions`
   - 勾选 `Allow GitHub Actions to create and approve pull requests`

### 2. 自动部署流程

GitHub Actions workflow (`.github/workflows/deploy.yml`) 会在以下情况下自动触发：

- 推送代码到 `main` 分支
- 手动触发 workflow

**部署流程**：

1. 检出代码
2. 设置 Node.js 环境
3. 安装依赖
4. 构建项目
5. 部署到 GitHub Pages

### 3. 访问部署的应用

部署完成后，应用将可通过以下 URL 访问：

```
https://<your-username>.github.io/mf-shell/
```

## 🛠️ 手动部署

如果需要手动部署，可以执行以下步骤：

### 1. 本地构建

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2. 验证构建

```bash
# 预览构建结果
npm run preview
```

## ⚙️ 配置说明

### 微前端部署注意事项

由于这是一个微前端主应用，部署时需要注意以下几点：

1. **远程模块配置**: 在生产环境中，需要更新 `module-federation.config.ts` 中的远程模块地址
2. **跨域问题**: 确保远程微前端应用支持跨域访问
3. **资源路径**: 配置正确的资源路径前缀

### Rsbuild 配置

需要在 `rsbuild.config.ts` 中添加 GitHub Pages 相关设置：

```typescript
export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig)],
  server: {
    port: 3000,
  },
  output: {
    // GitHub Pages 部署配置
    assetPrefix:
      process.env.NODE_ENV === 'production'
        ? '/mf-shell/' // 仓库名
        : '/',
  },
  html: {
    title: '微前端主应用',
  },
});
```

### 重要配置项

1. **assetPrefix**: 设置资源路径前缀，确保在 GitHub Pages 子路径下正确加载资源
2. **Module Federation**: 微前端模块联邦配置
3. **html.title**: 设置页面标题

## 🔧 自定义配置

### 修改仓库名

如果你的仓库名不是 `mf-shell`，需要修改以下文件：

1. **rsbuild.config.ts**：

   ```typescript
   assetPrefix: process.env.NODE_ENV === 'production'
     ? '/your-repo-name/' // 替换为你的仓库名
     : '/',
   ```

2. **DEPLOYMENT.md** (本文件)：
   更新访问 URL 中的仓库名

### 配置远程微前端应用

在生产环境中，需要更新 `module-federation.config.ts` 中的远程模块地址：

```typescript
export default createModuleFederationConfig({
  name: 'shell',
  remotes: {
    // 生产环境中的远程模块地址
    marketing:
      'marketing@https://your-username.github.io/mf-marketing/remoteEntry.js',
    finance:
      'finance@https://your-username.github.io/mf-finance/remoteEntry.js',
  },
  // ... 其他配置
});
```

### 自定义域名

如果要使用自定义域名：

1. 在仓库根目录创建 `public/CNAME` 文件：

   ```
   your-domain.com
   ```

2. 在 GitHub 仓库设置中配置自定义域名

## 📋 部署检查清单

部署前请确认：

- [ ] 代码已推送到 `main` 分支
- [ ] GitHub Pages 已启用并设置为 GitHub Actions
- [ ] 仓库权限已正确配置
- [ ] `rsbuild.config.ts` 中的 `assetPrefix` 路径正确
- [ ] 所有依赖都在 `package.json` 中正确声明
- [ ] 微前端远程模块地址已配置为生产环境地址
- [ ] 远程微前端应用已部署并可访问

## 🐛 常见问题

### 1. 资源加载失败

**问题**: 页面加载后样式或 JS 文件 404
**解决**: 检查 `assetPrefix` 配置是否与仓库名匹配

### 2. 微前端模块加载失败

**问题**: 远程微前端模块无法加载
**解决**:

- 检查远程模块地址是否正确
- 确认远程微前端应用已部署并可访问
- 检查跨域配置是否正确

### 3. 路由问题

**问题**: 刷新页面后出现 404
**解决**: GitHub Pages 不支持 SPA 路由，考虑使用 Hash 路由或配置 404.html

### 4. 构建失败

**问题**: GitHub Actions 构建失败
**解决**:

- 检查 Node.js 版本兼容性
- 确认所有依赖都已正确安装
- 查看 Actions 日志获取详细错误信息

## 📞 支持

如果遇到部署问题：

1. 查看 GitHub Actions 运行日志
2. 检查浏览器开发者工具的控制台错误
3. 验证远程微前端模块的可访问性
4. 参考 [GitHub Pages 官方文档](https://docs.github.com/en/pages)
5. 参考 [Rsbuild 部署文档](https://rsbuild.dev/guide/basic/deploy)

## 🔗 相关链接

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Rsbuild 部署指南](https://rsbuild.dev/guide/basic/deploy)
- [Module Federation 部署](https://module-federation.github.io/)
- [微前端架构指南](https://micro-frontends.org/)
