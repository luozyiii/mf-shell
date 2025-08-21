# MF-Shell

微前端主应用，基于 Module Federation 2.0 的容器应用，负责统一认证、路由管理和微前端应用协调。

## ✨ 核心功能

- **🔐 统一认证** - 集中式用户登录/登出管理，支持 JWT Token
- **🚦 路由协调** - 主应用和微前端应用的统一路由管理
- **⚡ 动态加载** - 支持微前端应用的按需加载和卸载
- **🎨 响应式布局** - 基于 Ant Design 的现代化自适应界面
- **🛡️ 权限控制** - 基于角色的访问控制 (RBAC)
- **📊 性能监控** - 异步性能监控和错误边界处理

## 🛠️ 技术栈

- **React 19** + **TypeScript** - 现代化前端开发
- **Module Federation 2.0** - 微前端架构核心
- **Ant Design 5** - 企业级 UI 组件库
- **React Router 7** - 路由管理
- **Rsbuild** - 高性能构建工具
- **Biome** - 代码检查和格式化

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 7.0.0

### 安装和启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 访问 http://localhost:3000
```

### 构建部署

```bash
# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview
```

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── Layout.tsx      # 主布局组件
│   ├── LazyMicroFrontend.tsx  # 微前端懒加载
│   ├── ProtectedRoute.tsx     # 路由保护
│   └── ErrorBoundary.tsx      # 错误边界
├── contexts/           # React Context
│   └── AuthContext.tsx # 认证上下文
├── pages/              # 页面组件
│   ├── Dashboard.tsx   # 仪表盘
│   ├── Login.tsx       # 登录页
│   └── NotFound.tsx    # 404页面
├── config/             # 配置文件
│   ├── index.ts        # 通用配置
│   └── remotes.config.ts  # 远程模块配置
├── hooks/              # 自定义Hook
│   └── usePermissions.ts  # 权限Hook
├── types/              # 类型定义
└── utils/              # 工具函数
```

## ⚙️ 微前端配置

### 远程模块配置

在 `src/config/remotes.config.ts` 中配置远程微前端应用：

```typescript
export const remoteConfigs: Record<string, RemoteConfig> = {
  'mf-shared': {
    name: 'mf-shared',
    url: 'mfShared',
    development: 'http://localhost:2999/remoteEntry.js',
    production: 'https://your-domain.com/mf-shared/remoteEntry.js',
  },
  template: {
    name: 'template',
    url: 'template',
    development: 'http://localhost:3001/remoteEntry.js',
    production: 'https://your-domain.com/mf-template/remoteEntry.js',
  }
};
```

### 共享依赖

主要共享依赖包括：
- React 19 (单例，预加载)
- React DOM 19 (单例，预加载)
- Ant Design 5 (单例，按需加载)
- React Router 7 (单例，按需加载)

## 🔐 认证系统

### 默认测试账户

```
管理员: admin / admin123
开发者: developer / dev123
普通用户: user / user123
```

### 权限控制示例

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

## 🌍 环境变量

```bash
# 开发环境配置
NODE_ENV=development
REACT_APP_SKIP_AUTH=true  # 跳过认证（开发模式）

# 主应用配置
SHELL_PORT=3000
PUBLIC_PATH=

# 微前端应用配置
TEMPLATE_URL=http://localhost:3001
MF_SHARED_URL=http://localhost:2999
```

## 📝 开发命令

```bash
pnpm run dev          # 开发模式
pnpm run build        # 构建生产版本
pnpm run preview      # 预览构建结果
pnpm run lint         # 代码检查
pnpm run format       # 格式化代码
pnpm run type-check   # 类型检查
pnpm run code-quality # 代码质量检查
```

## 🚀 部署

### GitHub Pages

1. 配置 `rsbuild.config.ts` 中的 `assetPrefix`
2. 设置正确的 `basename` 路径
3. 使用 GitHub Actions 自动部署

### Docker

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

## 🔧 故障排除

### 常见问题

1. **微前端加载失败** - 检查远程模块 URL 和应用运行状态
2. **认证问题** - 检查 `REACT_APP_SKIP_AUTH` 环境变量
3. **路由问题** - 确认 `basename` 配置和路由设置

### 调试模式

```typescript
// 开启调试模式
window.__MF_DEBUG__ = true;

// 查看全局存储状态
console.log(window.globalStore?.data);
```

## 📄 许可证

MIT License
