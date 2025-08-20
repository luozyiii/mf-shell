# MF-Shell

微前端主应用，基于 Module Federation 2.0 的容器应用，负责统一认证、路由管理和微前端应用协调。

## 功能特性

- **统一认证** - 集中式用户登录/登出管理，支持 JWT Token
- **路由协调** - 主应用和微前端应用的统一路由管理
- **动态加载** - 支持微前端应用的按需加载和卸载
- **响应式布局** - 基于 Ant Design 的现代化自适应界面
- **权限控制** - 基于角色的访问控制 (RBAC)
- **性能监控** - 异步性能监控和错误边界处理
- **主题管理** - 统一的视觉风格和主题配置
- **国际化支持** - 多语言切换能力

## 技术栈

- **React 19** - 前端框架
- **TypeScript** - 类型安全
- **Module Federation 2.0** - 微前端架构核心
- **Ant Design 5** - UI 组件库
- **React Router 7** - 路由管理
- **Rsbuild** - 现代化构建工具
- **Biome** - 代码检查和格式化

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 7.0.0

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
pnpm run build
```

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── Layout.tsx      # 主布局组件
│   ├── Layout.module.css  # 布局样式
│   ├── LazyMicroFrontend.tsx  # 微前端懒加载
│   ├── ProtectedRoute.tsx     # 路由保护
│   ├── ErrorBoundary.tsx      # 错误边界
│   ├── AsyncPerformanceMonitor.tsx  # 异步性能监控
│   ├── PerformanceMonitor.tsx       # 性能监控
│   ├── LayoutSkeleton.tsx           # 布局骨架屏
│   ├── LayoutSkeleton.module.css    # 骨架屏样式
│   ├── ScrollToTop.tsx              # 滚动到顶部
│   └── StoreDemo.tsx                # 存储演示组件
├── contexts/           # React Context
│   └── AuthContext.tsx # 认证上下文
├── pages/              # 页面组件
│   ├── Dashboard.tsx   # 仪表盘
│   ├── Dashboard.module.css  # 仪表盘样式
│   ├── Login.tsx       # 登录页
│   └── NotFound.tsx    # 404页面
├── config/             # 配置文件
│   ├── index.ts        # 通用配置
│   └── remotes.config.ts  # 远程模块配置
├── constants/          # 常量定义
│   └── index.ts        # 应用常量
├── hooks/              # 自定义Hook
│   ├── index.ts        # Hook导出
│   └── usePermissions.ts  # 权限Hook
├── store/              # 状态管理
│   └── keys.ts         # 存储键定义
├── types/              # 类型定义
│   ├── auth.ts         # 认证类型
│   ├── mf-shared-store.d.ts  # 共享存储类型
│   └── module-federation.d.ts  # 模块联邦类型
├── utils/              # 工具函数
│   ├── index.ts        # 工具导出
│   ├── authUtils.ts    # 认证工具
│   └── routeLoader.ts  # 路由加载器
├── mock/               # 模拟数据
│   └── userinfo.json  # 用户信息模拟
├── App.tsx             # 应用根组件
├── App.css             # 应用样式
├── bootstrap.tsx       # 应用启动文件
├── index.tsx           # 应用入口
└── env.d.ts            # 环境变量类型
```

## 微前端配置

### 远程模块配置

在 `src/config/remotes.config.ts` 中配置远程微前端应用：

```typescript
export const remoteConfigs: Record<string, RemoteConfig> = {
  'mf-shared': {
    name: 'mf-shared',
    url: 'mfShared',
    development: 'http://localhost:2999/remoteEntry.js',
    production: 'https://luozyiii.github.io/mf-shared/remoteEntry.js',
  },
  template: {
    name: 'template',
    url: 'template',
    development: 'http://localhost:3001/remoteEntry.js',
    production: 'https://luozyiii.github.io/mf-template/remoteEntry.js',
  }
};
```

### 共享依赖配置

```typescript
const sharedDependencies = {
  react: {
    singleton: true,
    eager: true,
    requiredVersion: '^18.0.0',
  },
  'react-dom': {
    singleton: true,
    eager: true,
    requiredVersion: '^18.0.0',
  },
  antd: {
    singleton: true,
    eager: false,
    requiredVersion: '^5.0.0',
  }
};
```

## 认证系统

### 用户角色

- **ADMIN** - 管理员，拥有所有权限
- **DEVELOPER** - 开发者，拥有开发相关权限
- **USER** - 普通用户，基础权限

### 默认测试账户

```
管理员: admin / admin123
开发者: developer / dev123
普通用户: user / user123
```

### 权限控制

```typescript
// 使用权限Hook
const { hasPermission } = usePermissions();

// 检查权限
if (hasPermission('template:read')) {
  // 有权限访问模板系统
}

// 路由保护
<ProtectedRoute requiredPermissions={['admin:read']}>
  <AdminPanel />
</ProtectedRoute>
```

## 布局系统

### 主布局特性

- 响应式侧边栏导航
- 可折叠菜单
- 面包屑导航
- 用户信息下拉菜单
- 主题切换支持

### 自定义布局

```typescript
// 在微前端应用中自定义布局
const CustomLayout: React.FC = ({ children }) => {
  return (
    <div className="custom-layout">
      {children}
    </div>
  );
};
```

## 性能优化

### 懒加载

- 微前端应用按需加载
- 路由级别的代码分割
- 组件级别的懒加载

### 缓存策略

- 远程模块缓存
- 静态资源缓存
- API 响应缓存

### 性能监控

```typescript
// 异步性能监控
<AsyncPerformanceMonitor>
  <LazyMicroFrontend appName="template" />
</AsyncPerformanceMonitor>
```

## 环境变量

```bash
# 开发环境
NODE_ENV=development
REACT_APP_SKIP_AUTH=true  # 跳过认证

# 主应用配置
SHELL_PORT=3000
PUBLIC_PATH=

# 模板应用配置
TEMPLATE_NAME=模板应用
TEMPLATE_URL=http://localhost:3001
TEMPLATE_PORT=3001
TEMPLATE_ENABLED=true

# MF-Shared 共享模块配置
MF_SHARED_URL=http://localhost:2999
SHARED_PORT=2999
```

## 开发命令

```bash
# 开发模式
pnpm run dev

# 构建
pnpm run build

# 预览构建结果
pnpm run preview

# 代码检查
pnpm run lint

# 格式化代码
pnpm run format

# 类型检查
pnpm run type-check

# 代码质量检查
pnpm run code-quality
```

## 部署

### GitHub Pages 部署

1. 配置 `rsbuild.config.ts` 中的 `assetPrefix`
2. 设置正确的 `basename` 路径
3. 配置 GitHub Actions 自动部署

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 故障排除

### 常见问题

1. **微前端加载失败**
   - 检查远程模块URL是否正确
   - 确认远程应用是否正常运行
   - 查看浏览器控制台错误信息

2. **认证问题**
   - 检查 `REACT_APP_SKIP_AUTH` 环境变量
   - 确认用户凭据是否正确
   - 查看 AuthContext 状态

3. **路由问题**
   - 检查 `basename` 配置
   - 确认路由配置是否正确
   - 查看浏览器历史记录

### 调试技巧

```typescript
// 开启调试模式
window.__MF_DEBUG__ = true;

// 查看全局存储状态
console.log(window.globalStore?.data);

// 监控性能
performance.mark('mf-load-start');
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
