# 创建新子系统指南

本文档详细介绍如何在微前端架构中创建一个新的子系统。

## 📋 目录

- [快速开始](#快速开始)
- [详细步骤](#详细步骤)
- [配置说明](#配置说明)
- [开发规范](#开发规范)
- [集成测试](#集成测试)
- [部署配置](#部署配置)
- [常见问题](#常见问题)

## 🚀 快速开始

### 方法一：使用自动化脚本（推荐）

```bash
# 在项目根目录执行
chmod +x scripts/create-micro-frontend.sh
./scripts/create-micro-frontend.sh <模块名> <端口号> "<系统标题>"

# 示例：创建库存管理系统
./scripts/create-micro-frontend.sh inventory 3004 "库存管理系统"
```

### 方法二：使用模板脚本

```bash
# 进入模板目录
cd mf-template

# 执行模板创建脚本
chmod +x scripts/create-new-module.sh
./scripts/create-new-module.sh <模块名> <端口号> "<系统标题>"

# 示例：创建用户管理系统
./scripts/create-new-module.sh user 3005 "用户管理系统"
```

## 📝 详细步骤

### 1. 规划新子系统

在开始创建之前，需要确定以下信息：

| 配置项   | 说明                        | 示例                                |
| -------- | --------------------------- | ----------------------------------- |
| 模块名称 | 英文名，用于路由和配置      | `inventory`                         |
| 端口号   | 开发服务器端口（3000-9999） | `3004`                              |
| 系统标题 | 中文显示名称                | `库存管理系统`                      |
| 功能模块 | 主要功能页面列表            | 商品管理、库存查询、出入库记录      |
| 权限角色 | 访问权限定义                | `inventory:read`, `inventory:write` |

### 2. 创建项目结构

#### 自动创建（推荐）

```bash
# 使用根目录脚本
./scripts/create-micro-frontend.sh inventory 3004 "库存管理系统"
```

#### 手动创建

```bash
# 复制模板
cp -r mf-template mf-inventory

# 进入新项目
cd mf-inventory

# 清理模板文件
rm -rf node_modules dist .git scripts/create-new-module.sh
```

### 3. 配置文件修改

#### package.json

```json
{
  "name": "mf-inventory",
  "description": "库存管理系统",
  "scripts": {
    "dev": "rsbuild dev --port 3004"
  }
}
```

#### module-federation.config.ts

```typescript
export default {
  name: 'inventory',
  exposes: {
    './App': './src/App.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    antd: { singleton: true },
  },
};
```

#### rsbuild.config.ts

```typescript
export default defineConfig({
  server: {
    port: 3004,
  },
  html: {
    title: '库存管理系统',
  },
});
```

### 4. 路由配置

#### src/config/routes.config.ts

```typescript
export const appRouteConfig: AppRouteConfig = {
  appKey: 'inventory',
  appName: '库存管理系统',
  routePrefix: '/inventory',
  enabled: true,
  permissions: ['inventory:read'],
  routes: [
    {
      path: '/inventory/dashboard',
      name: '库存概览',
      icon: 'DashboardOutlined',
      component: 'Dashboard',
      showInMenu: true,
      menuOrder: 1,
    },
    {
      path: '/inventory/products',
      name: '商品管理',
      icon: 'AppstoreOutlined',
      component: 'Products',
      showInMenu: true,
      menuOrder: 2,
      permissions: ['inventory:write'],
    },
    // 更多路由...
  ],
};
```

### 5. 页面组件开发

#### 创建页面组件

```bash
# 在 src/pages/ 目录下创建页面
mkdir -p src/pages/Products
touch src/pages/Products/index.tsx
touch src/pages/Products/ProductList.tsx
touch src/pages/Products/ProductForm.tsx
```

#### 示例页面组件

```typescript
// src/pages/Products/index.tsx
import React from 'react';
import { Card, Table, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const Products: React.FC = () => {
  return (
    <Card
      title="商品管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          新增商品
        </Button>
      }
    >
      {/* 商品列表表格 */}
    </Card>
  );
};

export default Products;
```

### 6. 主应用集成

#### 更新主应用配置

在 `mf-shell/module-federation.config.ts` 中添加新的远程应用：

```typescript
export default {
  name: 'shell',
  remotes: {
    marketing: 'marketing@http://localhost:3001/remoteEntry.js',
    finance: 'finance@http://localhost:3002/remoteEntry.js',
    template: 'template@http://localhost:3003/remoteEntry.js',
    inventory: 'inventory@http://localhost:3004/remoteEntry.js', // 新增
  },
};
```

#### 注册路由

在主应用中注册新子系统的路由：

```typescript
// mf-shell/src/config/remoteApps.ts
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
  },
];
```

## ⚙️ 配置说明

### 环境变量配置

创建 `.env` 文件：

```bash
# 应用配置
MODULE_NAME=inventory
APP_DISPLAY_NAME=库存管理系统
PORT=3004

# API 配置
API_BASE_URL=http://localhost:8080/api
API_TIMEOUT=10000

# 部署配置
PUBLIC_PATH=/mf-inventory/
DEPLOY_URL=https://yourdomain.github.io/mf-inventory
```

### TypeScript 配置

确保 `tsconfig.json` 包含必要的类型定义：

```json
{
  "compilerOptions": {
    "types": ["node"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 样式配置

使用 CSS Modules 避免样式冲突：

```typescript
// src/pages/Products/index.module.css
.container {
  padding: 24px;
}

.header {
  margin-bottom: 16px;
}
```

## 🔧 开发规范

### 文件命名规范

- **组件文件**: PascalCase (如 `ProductList.tsx`)
- **工具文件**: camelCase (如 `formatPrice.ts`)
- **样式文件**: kebab-case (如 `product-list.module.css`)
- **配置文件**: kebab-case (如 `routes.config.ts`)

### 目录结构规范

```
mf-inventory/
├── src/
│   ├── components/          # 通用组件
│   │   ├── Layout/         # 布局组件
│   │   ├── ErrorBoundary/  # 错误边界
│   │   └── Loading/        # 加载组件
│   ├── pages/              # 页面组件
│   │   ├── Dashboard/      # 概览页面
│   │   ├── Products/       # 商品管理
│   │   └── Reports/        # 报表页面
│   ├── config/             # 配置文件
│   │   ├── routes.config.ts
│   │   └── deployment.ts
│   ├── utils/              # 工具函数
│   │   ├── api.ts          # API 请求
│   │   ├── format.ts       # 格式化函数
│   │   └── constants.ts    # 常量定义
│   └── types/              # 类型定义
│       ├── api.ts          # API 类型
│       └── common.ts       # 通用类型
├── public/                 # 静态资源
└── .github/workflows/      # CI/CD 配置
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 规范
- 组件使用 React Hooks
- 状态管理使用 useState/useReducer
- 副作用使用 useEffect

## 🧪 集成测试

### 1. 独立运行测试

```bash
cd mf-inventory
npm install
npm run dev
```

访问 http://localhost:3004 验证应用独立运行。

### 2. 主应用集成测试

```bash
# 启动新子系统
cd mf-inventory && npm run dev

# 启动主应用
cd mf-shell && npm run dev
```

访问 http://localhost:3000 验证集成效果。

### 3. 权限测试

- 使用不同角色账户登录
- 验证菜单显示和页面访问权限
- 测试路由跳转和权限控制

## 🚀 部署配置

### GitHub Pages 部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 生产环境配置

更新 `rsbuild.config.ts` 生产配置：

```typescript
export default defineConfig({
  output: {
    publicPath: process.env.NODE_ENV === 'production' ? '/mf-inventory/' : '/',
  },
});
```

## ❓ 常见问题

### Q1: 端口冲突怎么办？

```bash
# 查看端口占用
lsof -ti:3004

# 杀死占用进程
lsof -ti:3004 | xargs kill -9

# 或者使用其他端口
npm run dev -- --port 3005
```

### Q2: 模块加载失败？

```bash
# 检查远程入口文件
curl http://localhost:3004/remoteEntry.js

# 检查网络连接
ping localhost

# 重新构建
npm run build
```

### Q3: 样式冲突问题？

- 使用 CSS Modules
- 添加应用前缀
- 避免全局样式

### Q4: 类型定义问题？

```bash
# 安装类型定义
npm install --save-dev @types/node

# 更新 tsconfig.json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

## � 完整示例

### 创建用户管理系统完整流程

```bash
# 1. 创建新子系统
./scripts/create-micro-frontend.sh user 3005 "用户管理系统"

# 2. 进入项目目录
cd mf-user

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev

# 5. 验证独立运行
curl http://localhost:3005/remoteEntry.js
```

### 主应用集成配置

```typescript
// mf-shell/module-federation.config.ts
export default {
  name: 'shell',
  remotes: {
    // 现有应用...
    user: 'user@http://localhost:3005/remoteEntry.js',
  },
};

// mf-shell/src/config/remoteApps.ts
export const remoteApps = [
  // 现有应用...
  {
    name: 'user',
    url: 'http://localhost:3005',
    scope: 'user',
    module: './App',
    routePrefix: '/user',
    title: '用户管理系统',
    permissions: ['user:read'],
    icon: 'UserOutlined',
    menuOrder: 5,
  },
];
```

### 权限配置示例

```typescript
// 用户角色权限配置
export const USER_PERMISSIONS = {
  READ: 'user:read', // 查看用户
  WRITE: 'user:write', // 编辑用户
  DELETE: 'user:delete', // 删除用户
  ADMIN: 'user:admin', // 用户管理
} as const;

// 路由权限配置
export const userRoutes = [
  {
    path: '/user/list',
    name: '用户列表',
    permissions: [USER_PERMISSIONS.READ],
  },
  {
    path: '/user/create',
    name: '新增用户',
    permissions: [USER_PERMISSIONS.WRITE],
  },
  {
    path: '/user/settings',
    name: '用户设置',
    permissions: [USER_PERMISSIONS.ADMIN],
  },
];
```

## 🛠️ 开发工具和脚本

### 自动化脚本说明

#### 根目录脚本 (`scripts/create-micro-frontend.sh`)

- **功能**: 从项目根目录创建新子系统
- **特点**: 自动配置主应用集成
- **适用**: 完整的新系统创建

#### 模板脚本 (`mf-template/scripts/create-new-module.sh`)

- **功能**: 基于模板快速创建
- **特点**: 专注于子系统本身
- **适用**: 快速原型开发

### 开发辅助脚本

```bash
# 检查所有应用状态
./scripts/check-remote-apps.sh

# 格式化所有代码
./scripts/format-all-apps.sh

# 启动所有应用
./scripts/start-all-apps.sh

# 检查开发规范
./scripts/check-dev-standards.sh
```

### 自定义开发脚本

在新子系统中创建便捷脚本：

```bash
# scripts/dev-setup.sh
#!/bin/bash
echo "🚀 设置开发环境..."
npm install
npm run type-check
npm run lint
echo "✅ 开发环境就绪！"

# scripts/quick-test.sh
#!/bin/bash
echo "🧪 快速测试..."
npm run lint
npm run type-check
npm run build
echo "✅ 测试通过！"
```

## 📊 性能优化建议

### 1. 代码分割

```typescript
// 使用 React.lazy 懒加载页面
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UserList = React.lazy(() => import('./pages/UserList'));

// 路由配置
<Route path="/dashboard" element={
  <Suspense fallback={<Loading />}>
    <Dashboard />
  </Suspense>
} />
```

### 2. 依赖优化

```typescript
// module-federation.config.ts
export default {
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^18.0.0',
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.0.0',
    },
    antd: {
      singleton: true,
      requiredVersion: '^5.0.0',
    },
    // 避免共享过多依赖
  },
};
```

### 3. 构建优化

```typescript
// rsbuild.config.ts
export default defineConfig({
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
  output: {
    polyfill: 'off', // 减少 polyfill
  },
});
```

## 🔒 安全最佳实践

### 1. 环境变量安全

```bash
# .env.example (提交到版本控制)
MODULE_NAME=your-module
APP_DISPLAY_NAME=Your App Name
PORT=3000
API_BASE_URL=http://localhost:8080

# .env (不提交到版本控制)
API_SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
```

### 2. 权限验证

```typescript
// 权限验证 Hook
export const usePermission = (permission: string) => {
  const { user } = useAuth();
  return user?.permissions?.includes(permission) ?? false;
};

// 权限保护组件
export const ProtectedRoute: React.FC<{
  permission: string;
  children: React.ReactNode;
}> = ({ permission, children }) => {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};
```

### 3. API 安全

```typescript
// API 请求拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 错误处理
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 清除认证信息，跳转登录
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 📈 监控和调试

### 1. 错误监控

```typescript
// 错误边界组件
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 发送错误到监控服务
    console.error('微前端错误:', error, errorInfo);

    // 可以集成 Sentry 等监控服务
    // Sentry.captureException(error);
  }
}
```

### 2. 性能监控

```typescript
// 页面性能监控
export const usePagePerformance = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // 发送性能数据
      console.log(`${pageName} 加载时间: ${loadTime}ms`);
    };
  }, [pageName]);
};
```

### 3. 开发调试

```typescript
// 开发环境调试工具
if (process.env.NODE_ENV === 'development') {
  // 添加全局调试对象
  (window as any).__MF_DEBUG__ = {
    appName: process.env.MODULE_NAME,
    version: process.env.npm_package_version,
    routes: appRouteConfig.routes,
  };
}
```

## �📚 相关文档

- [微前端架构指南](README.md)
- [开发规范](DEVELOPMENT_STANDARDS.md)
- [模板使用指南](mf-template/README.md)
- [部署指南](mf-shell/README-DEPLOYMENT.md)
- [环境配置说明](ENV_CONFIG.md)

## 🎯 下一步计划

创建新子系统后的后续工作：

1. **功能开发**: 根据业务需求开发具体功能
2. **单元测试**: 编写组件和工具函数测试
3. **集成测试**: 与主应用和其他子系统的集成测试
4. **性能优化**: 根据实际使用情况优化性能
5. **文档完善**: 更新 API 文档和使用说明
6. **部署上线**: 配置生产环境并部署

---

**🎉 恭喜！您已经掌握了创建新子系统的完整流程。开始您的微前端开发之旅吧！**
