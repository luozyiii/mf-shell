# 新子系统快速创建指南

> 🚀 5分钟快速创建一个新的微前端子系统

## 📋 准备工作

### 1. 确定基本信息

- **模块名称**: 英文名，如 `inventory`
- **端口号**: 3000-9999，如 `3004`
- **系统标题**: 中文名，如 `"库存管理系统"`

### 2. 检查端口是否可用

```bash
# 检查端口占用
lsof -ti:3004

# 如果有占用，杀死进程
lsof -ti:3004 | xargs kill -9
```

## 🚀 快速创建

### 方法一：一键创建（推荐）

```bash
# 在项目根目录执行
./scripts/create-micro-frontend.sh inventory 3004 "库存管理系统"
```

### 方法二：使用模板

```bash
# 进入模板目录
cd mf-template

# 执行创建脚本
./scripts/create-new-module.sh inventory 3004 "库存管理系统"
```

## ✅ 验证创建结果

### 1. 检查文件结构

```bash
ls -la mf-inventory/
# 应该看到：src/, public/, package.json, rsbuild.config.ts 等
```

### 2. 启动开发服务器

```bash
cd mf-inventory
npm install
npm run dev
```

### 3. 验证独立运行

访问 http://localhost:3004，应该看到新系统的首页。

### 4. 验证远程入口

```bash
curl http://localhost:3004/remoteEntry.js
# 应该返回 JavaScript 代码
```

## 🔧 主应用集成

### 1. 更新主应用配置

编辑 `mf-shell/module-federation.config.ts`：

```typescript
export default {
  name: 'shell',
  remotes: {
    // 现有应用...
    inventory: 'inventory@http://localhost:3004/remoteEntry.js',
  },
};
```

### 2. 注册应用路由

编辑 `mf-shell/src/config/remoteApps.ts`：

```typescript
export const remoteApps = [
  // 现有应用...
  {
    name: 'inventory',
    url: 'http://localhost:3004',
    scope: 'inventory',
    module: './App',
    routePrefix: '/inventory',
    title: '库存管理系统',
    permissions: ['inventory:read'],
    icon: 'AppstoreOutlined',
    menuOrder: 4,
  },
];
```

### 3. 重启主应用

```bash
cd mf-shell
npm run dev
```

## 🧪 集成测试

### 1. 启动所有应用

```bash
# 终端1：启动新子系统
cd mf-inventory && npm run dev

# 终端2：启动主应用
cd mf-shell && npm run dev
```

### 2. 测试访问

- 访问 http://localhost:3000
- 登录系统（admin/admin123）
- 检查左侧菜单是否显示"库存管理系统"
- 点击菜单项，验证页面跳转

### 3. 权限测试

- 使用不同角色登录
- 验证菜单显示和页面访问权限

## 📝 自定义开发

### 1. 添加新页面

```bash
# 创建页面组件
mkdir src/pages/ProductList
touch src/pages/ProductList/index.tsx
```

### 2. 更新路由配置

编辑 `src/config/routes.config.ts`：

```typescript
export const appRouteConfig: AppRouteConfig = {
  // 现有配置...
  routes: [
    // 现有路由...
    {
      path: '/inventory/products',
      name: '商品管理',
      icon: 'ShoppingOutlined',
      component: 'ProductList',
      showInMenu: true,
      menuOrder: 2,
    },
  ],
};
```

### 3. 添加路由映射

编辑 `src/App.tsx`，在路由配置中添加：

```typescript
<Route path="/products" element={<ProductList />} />
```

## 🔍 常见问题

### Q: 端口冲突怎么办？

```bash
# 查看占用进程
lsof -ti:3004

# 杀死进程
lsof -ti:3004 | xargs kill -9

# 或使用其他端口
npm run dev -- --port 3005
```

### Q: 模块加载失败？

```bash
# 检查远程入口
curl http://localhost:3004/remoteEntry.js

# 重新构建
npm run build

# 检查网络连接
ping localhost
```

### Q: 主应用看不到新菜单？

1. 检查 `remoteApps.ts` 配置
2. 确认权限配置正确
3. 重启主应用
4. 清除浏览器缓存

### Q: TypeScript 报错？

```bash
# 安装类型定义
npm install --save-dev @types/node

# 检查 tsconfig.json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

## 📋 检查清单

创建完成后，请确认以下项目：

- [ ] 新子系统可以独立运行（http://localhost:端口号）
- [ ] 远程入口文件可以访问（/remoteEntry.js）
- [ ] 主应用配置已更新（module-federation.config.ts）
- [ ] 应用路由已注册（remoteApps.ts）
- [ ] 主应用可以正常加载新子系统
- [ ] 菜单显示正确
- [ ] 页面跳转正常
- [ ] 权限控制生效
- [ ] 样式显示正常
- [ ] 无控制台错误

## 🎯 下一步

创建成功后，您可以：

1. **开发功能页面**: 在 `src/pages/` 添加业务页面
2. **配置路由**: 更新 `routes.config.ts` 添加新路由
3. **设置权限**: 配置页面访问权限
4. **编写测试**: 添加单元测试和集成测试
5. **优化性能**: 配置代码分割和懒加载
6. **部署上线**: 配置 CI/CD 自动部署

## 📚 相关文档

- [详细创建指南](CREATE_NEW_SUBSYSTEM.md) - 完整的创建文档
- [开发规范](DEVELOPMENT_STANDARDS.md) - 开发规范和最佳实践
- [模板说明](mf-template/README.md) - 模板使用说明

---

**🎉 恭喜！您的新子系统已经创建完成，开始开发吧！**
