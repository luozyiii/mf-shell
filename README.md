# 🏠 微前端主应用 (mf-shell)

## 📖 项目简介

这是一个基于 React + TypeScript + Module Federation 的微前端主应用（Shell），作为整个微前端系统的容器和协调者，负责统一的用户认证、路由管理、布局框架和微前端应用的动态加载。

## ✨ 主要功能

- 🔐 **统一认证**: 集中式用户登录/登出管理，支持 JWT Token
- 🧭 **路由协调**: 主应用和微前端应用的路由统一管理
- 📱 **响应式布局**: 基于 Ant Design 的现代化自适应界面
- 🔄 **动态加载**: 支持微前端应用的按需加载和卸载
- 🎨 **主题管理**: 统一的视觉风格和主题配置
- 📊 **仪表盘**: 系统概览、快速导航和数据展示
- 🛡️ **权限控制**: 基于角色的访问控制 (RBAC)
- 🌐 **国际化**: 多语言支持 (i18n)

## 🛠️ 技术栈

| 技术                  | 版本   | 说明           |
| --------------------- | ------ | -------------- |
| **React**             | 18.3.1 | 前端框架       |
| **TypeScript**        | 5.6.3  | 类型系统       |
| **Rsbuild**           | 1.1.8  | 现代化构建工具 |
| **Module Federation** | 0.17.1 | 微前端架构核心 |
| **Ant Design**        | 5.26.7 | UI 组件库      |
| **React Router**      | 7.7.1  | 路由管理       |
| **Biome**             | 2.1.0  | 代码检查和格式化工具 |

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 或 **pnpm**: >= 7.0.0
- **Git**: >= 2.0.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐)
pnpm install
```

### 启动开发服务器

```bash
# 启动主应用
npm run dev

# 或使用 pnpm
pnpm dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🔧 微前端集成

### 当前集成的微前端应用

| 应用名称         | 端口 | 路由前缀     | 状态    | 说明           |
| ---------------- | ---- | ------------ | ------- | -------------- |
| **mf-template**  | 3003 | `/template`  | ✅ 活跃 | 微前端模板系统 |
| **mf-marketing** | 3001 | `/marketing` | 🔧 可选 | 营销管理系统   |
| **mf-finance**   | 3002 | `/finance`   | 🔧 可选 | 财务管理系统   |

### 路由规则

```
主应用路由:
├── /                    # 首页重定向到 /dashboard
├── /dashboard           # 主应用仪表盘
├── /login               # 登录页面
├── /profile             # 用户个人资料
└── /settings            # 系统设置

微前端路由:
├── /template/*          # 模板系统路由
├── /marketing/*         # 营销系统路由 (可选)
└── /finance/*           # 财务系统路由 (可选)
```

### 添加新的微前端应用

1. **更新 Module Federation 配置**

编辑 `module-federation.config.ts`:

```typescript
export default createModuleFederationConfig({
  name: 'shell',
  remotes: {
    template: 'template@http://localhost:3003/remoteEntry.js',
    // 添加新的远程应用
    newApp: 'newApp@http://localhost:3004/remoteEntry.js',
  },
});
```

2. **注册应用路由**

编辑 `src/config/remoteApps.ts`:

```typescript
export const remoteApps = [
  // 现有应用...
  {
    name: 'newApp',
    url: 'http://localhost:3004',
    scope: 'newApp',
    module: './App',
    routePrefix: '/newapp',
    title: '新应用',
    permissions: ['newapp:read'],
    icon: 'AppstoreOutlined',
    menuOrder: 5,
  },
];
```

## 📁 项目结构

```
mf-shell/
├── public/                 # 静态资源
│   ├── index.html         # HTML 模板
│   └── favicon.ico        # 网站图标
├── src/
│   ├── components/        # 通用组件
│   │   ├── Layout/        # 布局组件
│   │   ├── ErrorBoundary/ # 错误边界
│   │   └── Loading/       # 加载组件
│   ├── config/            # 配置文件
│   │   ├── remoteApps.ts  # 远程应用配置
│   │   └── environment.ts # 环境配置
│   ├── hooks/             # 自定义 Hooks
│   │   ├── useAuth.ts     # 认证 Hook
│   │   └── usePermission.ts # 权限 Hook
│   ├── pages/             # 页面组件
│   │   ├── Dashboard/     # 仪表盘
│   │   ├── Login/         # 登录页
│   │   └── Profile/       # 个人资料
│   ├── services/          # API 服务
│   │   ├── auth.ts        # 认证服务
│   │   └── api.ts         # API 客户端
│   ├── store/             # 状态管理
│   │   ├── authStore.ts   # 认证状态
│   │   └── appStore.ts    # 应用状态
│   ├── types/             # 类型定义
│   │   ├── auth.ts        # 认证类型
│   │   └── common.ts      # 通用类型
│   ├── utils/             # 工具函数
│   │   ├── constants.ts   # 常量定义
│   │   └── helpers.ts     # 辅助函数
│   ├── App.tsx            # 主应用组件
│   ├── App.css            # 全局样式
│   └── main.tsx           # 应用入口
├── .env.example           # 环境变量示例
├── .env.local             # 本地环境配置
├── .env.production        # 生产环境配置
├── package.json           # 项目配置
├── rsbuild.config.ts      # 构建配置
├── module-federation.config.ts # 微前端配置
├── tsconfig.json          # TypeScript 配置
└── README.md              # 项目文档
```

## ⚙️ 配置说明

### 环境变量配置

创建 `.env.local` 文件进行本地开发配置：

```bash
# 复制示例配置
cp .env.example .env.local

# 编辑配置
vim .env.local
```

主要配置项：

```env
# 应用配置
SHELL_PORT=3000
PUBLIC_PATH=/

# 微前端应用配置
TEMPLATE_ENABLED=true
TEMPLATE_URL=http://localhost:3003
MARKETING_ENABLED=false
FINANCE_ENABLED=false

# 认证配置
REACT_APP_LOGIN_URL=/login
REACT_APP_TOKEN_KEY=auth_token

# API 配置
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

### Module Federation 配置

主应用作为 Host，配置如下：

```typescript
// module-federation.config.ts
export default createModuleFederationConfig({
  name: 'shell',
  remotes: {
    template: 'template@http://localhost:3003/remoteEntry.js',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    antd: { singleton: true },
  },
});
```

## 🔐 认证系统

### 认证流程

1. **登录**: 用户输入凭据，获取 JWT Token
2. **存储**: Token 存储在 localStorage 中
3. **验证**: 每次请求自动携带 Token
4. **刷新**: Token 过期自动刷新或重新登录
5. **登出**: 清除 Token 和用户信息

### 权限控制

```typescript
// 使用权限 Hook
const hasPermission = usePermission('template:read');

// 权限保护组件
<ProtectedRoute permission="admin:write">
  <AdminPanel />
</ProtectedRoute>
```

## 🧪 开发指南

### 本地开发

1. **启动所有应用**

```bash
# 使用自动化脚本启动所有应用
./mf-internal/scripts/start-all-apps.sh

# 或手动启动
# 终端1: 启动主应用
cd mf-shell && npm run dev

# 终端2: 启动模板应用
cd mf-template && npm run dev
```

2. **访问应用**

- 主应用: http://localhost:3000
- 默认登录: admin / admin123

### 代码规范

```bash
# 代码格式化（使用 Biome）
npm run format

# 代码检查和自动修复（使用 Biome）
npm run lint:fix

# 仅检查不修复
npm run lint

# 类型检查
npm run type-check

# 代码质量检查
npm run code-quality
```

### Biome 配置

项目使用 Biome 替代 ESLint + Prettier，提供更快的性能和更好的开发体验：

- **配置文件**: `biome.jsonc`
- **VS Code 扩展**: `biomejs.biome`
- **自动格式化**: 保存时自动格式化
- **Import 排序**: 自动整理 import 语句

### 调试技巧

1. **微前端加载调试**

```javascript
// 在浏览器控制台查看加载状态
window.__FEDERATION_DEBUG__ = true;
```

2. **路由调试**

```javascript
// 查看当前路由状态
console.log(window.location);
```

## 🚀 部署

### GitHub Pages 部署

项目已配置自动部署到 GitHub Pages：

1. **推送代码到 main 分支**
2. **GitHub Actions 自动构建和部署**
3. **访问**: https://your-username.github.io/mf-shell

### 手动部署

```bash
# 构建生产版本
npm run build

# 部署到服务器
npm run deploy
```

## 🔧 故障排除

### 常见问题

#### 1. 微前端应用加载失败

**症状**: 控制台显示 "Loading chunk failed" 或 "Module not found"

**解决方案**:

```bash
# 检查远程应用是否运行
curl http://localhost:3003/remoteEntry.js

# 重启远程应用
cd mf-template && npm run dev

# 清除浏览器缓存
```

#### 2. 认证状态丢失

**症状**: 刷新页面后需要重新登录

**解决方案**:

```bash
# 检查 localStorage
console.log(localStorage.getItem('auth_token'));

# 检查 Token 有效期
# 确保 Token 未过期
```

#### 3. 路由跳转异常

**症状**: 页面跳转到 404 或路由不匹配

**解决方案**:

```bash
# 检查路由配置
# 确保 basename 配置正确
# 检查微前端应用的路由前缀
```

### 性能优化

1. **代码分割**: 使用 React.lazy 懒加载页面
2. **缓存策略**: 配置合理的缓存策略
3. **依赖优化**: 避免重复加载相同依赖

## 📚 相关文档

- [创建新子系统指南](../mf-internal/docs/CREATE_NEW_SUBSYSTEM.md)
- [环境配置指南](../mf-internal/docs/ENV_CONFIG.md)
- [部署指南](../mf-internal/docs/DEPLOYMENT.md)
- [开发规范](../mf-internal/docs/DEV_STANDARDS.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License

---

**🎉 开始您的微前端开发之旅！**
