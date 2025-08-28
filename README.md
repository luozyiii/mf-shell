# MF-Shell - 微前端主应用

<div align="center">

![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.27.1-blue?logo=antdesign)
![Module Federation](https://img.shields.io/badge/Module%20Federation-0.17.1-green)
![Rsbuild](https://img.shields.io/badge/Rsbuild-1.4.15-orange)

一个基于 **Module Federation** 的现代化微前端主应用，提供统一的用户界面、路由管理、状态共享和权限控制。

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [项目结构](#-项目结构) • [配置说明](#-配置说明) • [开发指南](#-开发指南)

</div>

## 🚀 功能特性

### 核心功能
- **🏗️ 微前端架构**: 基于 Module Federation 的微前端解决方案
- **🔐 统一认证**: 集成认证系统，支持权限控制和路由守卫
- **🌐 国际化支持**: 基于 react-i18next 的多语言支持
- **📱 响应式设计**: 基于 Ant Design 的现代化 UI 界面
- **🔄 状态共享**: 跨微前端应用的状态管理和数据共享

### 开发体验
- **⚡ 快速开发**: Rsbuild 构建工具，极速的开发体验
- **🛠️ 开发工具**: 内置性能监控、错误边界、调试工具
- **📊 性能监控**: 实时组件加载时间和内存使用监控
- **🔧 代码质量**: 集成 Biome 代码检查和格式化
- **🎯 类型安全**: 完整的 TypeScript 支持

### 技术栈
- **前端框架**: React 19.1.1 + TypeScript 5.9.2
- **构建工具**: Rsbuild 1.4.15 + Module Federation
- **UI 组件**: Ant Design 5.27.1
- **路由管理**: React Router DOM 7.8.1
- **状态管理**: 基于 Context API 和共享存储
- **国际化**: react-i18next 15.7.2
- **代码质量**: Biome + Husky + lint-staged

## 🏃‍♂️ 快速开始

### 环境要求
- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (推荐使用 pnpm)

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd mf-shell

# 安装依赖
pnpm install
```

### 环境配置
```bash
# 复制环境配置文件
cp .env.example .env.local

# 编辑配置文件
vim .env.local
```

### 启动开发服务器
```bash
# 启动主应用 (端口 3000)
pnpm dev

# 确保相关微前端应用也已启动:
# - mf-shared: http://localhost:2999
# - mf-template: http://localhost:3001
```

### 构建生产版本
```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📁 项目结构

```
mf-shell/
├── src/
│   ├── components/          # 通用组件
│   │   ├── Layout.tsx       # 主布局组件
│   │   ├── LazyMicroFrontend.tsx  # 微前端懒加载组件
│   │   ├── PerformanceMonitor.tsx # 性能监控组件
│   │   ├── ErrorBoundary.tsx      # 错误边界组件
│   │   └── ...
│   ├── config/              # 配置文件
│   │   ├── index.ts         # 主配置管理器
│   │   └── remotes.config.ts # 远程模块配置
│   ├── contexts/            # React Context
│   │   └── AuthContext.tsx  # 认证上下文
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useAuth.ts       # 认证 Hook
│   │   ├── usePermissions.ts # 权限 Hook
│   │   └── useMenuItems.tsx # 菜单 Hook
│   ├── i18n/                # 国际化
│   │   ├── index.ts         # i18n 配置
│   │   ├── locales/         # 语言文件
│   │   └── LanguageSwitcher.tsx # 语言切换组件
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx    # 仪表板
│   │   ├── Login.tsx        # 登录页
│   │   └── NotFound.tsx     # 404 页面
│   ├── store/               # 状态管理
│   │   └── keys.ts          # 存储键管理
│   ├── types/               # 类型定义
│   │   └── auth.ts          # 认证相关类型
│   ├── utils/               # 工具函数
│   │   ├── index.ts         # 通用工具
│   │   ├── errorHandler.ts  # 错误处理
│   │   ├── environment.ts   # 环境工具
│   │   └── ...
│   ├── App.tsx              # 应用根组件
│   ├── bootstrap.tsx        # 应用启动文件
│   └── index.tsx            # 入口文件
├── public/                  # 静态资源
├── @mf-types/              # Module Federation 类型定义
├── module-federation.config.ts # Module Federation 配置
├── rsbuild.config.ts       # Rsbuild 配置
├── package.json            # 项目依赖
└── README.md               # 项目文档
```

## ⚙️ 配置说明

### 环境变量配置
```bash
# .env.local
NODE_ENV=development
SHELL_PORT=3000
PUBLIC_PATH=

# 模板应用配置
TEMPLATE_NAME=模板应用
TEMPLATE_URL=http://localhost:3001
TEMPLATE_PORT=3001
TEMPLATE_ENABLED=true

# MF-Shared 共享模块配置
MF_SHARED_URL=http://localhost:2999
```

### Module Federation 配置
```typescript
// module-federation.config.ts
export default createModuleFederationConfig({
  name: 'shell',
  remotes: generateRemotes(),
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    antd: { singleton: true, eager: false },
    // ... 其他共享依赖
  },
});
```

### 微前端应用配置
```typescript
// src/config/index.ts
const microFrontends = {
  template: {
    name: 'template',
    displayName: '模板应用',
    url: 'http://localhost:3001',
    permissions: ['template:read'],
    icon: 'AppstoreOutlined',
    enabled: true,
  },
};
```

## 🛠️ 开发指南

### 添加新的微前端应用

1. **更新微前端配置**
```typescript
// src/config/index.ts
microFrontends.newApp = {
  name: 'newApp',
  displayName: '新应用',
  url: 'http://localhost:3002',
  permissions: ['newApp:read'],
  icon: 'AppstoreOutlined',
  enabled: true,
};
```

2. **更新远程模块配置**
```typescript
// src/config/remotes.config.ts
export const remoteConfigs = {
  newApp: {
    name: 'newApp',
    url: 'newApp',
    development: 'http://localhost:3002/remoteEntry.js',
    production: '/newApp/remoteEntry.js',
  },
};
```

3. **更新组件导入映射**
```typescript
// src/components/LazyMicroFrontend.tsx
const dynamicImportMap = {
  newApp: {
    Dashboard: () => import('newApp/Dashboard'),
    Settings: () => import('newApp/Settings'),
  },
};
```

### 权限管理系统

```typescript
// 使用权限 Hook
const { hasPermission, isAdmin, isDeveloper } = usePermissions();

// 检查特定权限
if (hasPermission('template:read')) {
  // 用户有权限访问模板应用
}

// 检查管理员权限
if (isAdmin) {
  // 显示管理员功能
}
```

### 状态共享机制

```typescript
// 使用全局存储
import { getVal, setVal } from './store/keys';

// 设置用户信息
setVal('user', { id: 1, name: 'John' });

// 获取用户信息
const user = getVal('user');

// 清除所有数据
import { clearAppData } from 'mf-shared/store';
clearAppData('mf-shell-store');
```

### 国际化使用

```typescript
// 在组件中使用
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('welcome')}</h1>;
};

// 语言切换
import LanguageSwitcher from './i18n/LanguageSwitcher';
<LanguageSwitcher />
```

## 📊 性能监控

### 内置性能监控工具
开发环境下，右下角会显示性能监控按钮，提供以下功能：

- **📈 组件加载时间**: 监控微前端组件的加载性能
- **💾 内存使用情况**: 实时显示 JavaScript 堆内存使用率
- **🔄 缓存管理**: 查看和清理组件缓存
- **📊 性能统计**: 平均加载时间和性能趋势

### 性能优化策略

#### 共享依赖优化
```typescript
// 核心依赖预加载
react: { singleton: true, eager: true }
'react-dom': { singleton: true, eager: true }

// 大型库按需加载
antd: { singleton: true, eager: false }
```

#### 代码分割策略
- **路由级分割**: 每个页面独立打包
- **组件级分割**: 大型组件懒加载
- **微前端分割**: 按需加载微前端应用

#### 缓存机制
- **组件缓存**: 已加载的微前端组件自动缓存
- **路由缓存**: 路由配置缓存优化
- **资源缓存**: 静态资源长期缓存策略

## 🔧 可用脚本

```bash
# 开发相关
pnpm dev              # 启动开发服务器 (http://localhost:3000)
pnpm build            # 构建生产版本
pnpm preview          # 预览构建结果

# 代码质量
pnpm lint             # 运行 Biome 代码检查
pnpm lint:fix         # 自动修复代码问题
pnpm format           # 格式化代码
pnpm format:check     # 检查代码格式
pnpm type-check       # TypeScript 类型检查
pnpm code-quality     # 完整的代码质量检查

# 其他
pnpm prepare          # 安装 Git hooks
```

## 🏗️ 架构设计

### 微前端架构图
```
┌─────────────────────────────────────────────────────────┐
│                    MF-Shell (主应用)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │   Layout    │ │    Auth     │ │   Performance       │ │
│  │   System    │ │   System    │ │    Monitor          │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                  Module Federation                      │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│ │ MF-Shared   │ │ MF-Template │ │   Future Apps       │ │
│ │ (共享模块)   │ │ (模板应用)   │ │   (扩展应用)         │ │
│ └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 核心组件说明

#### LazyMicroFrontend 组件
- **动态加载**: 根据路由动态加载微前端组件
- **错误处理**: 完善的错误边界和降级机制
- **缓存优化**: 智能的组件缓存策略
- **性能监控**: 集成加载时间监控

#### Layout 组件
- **响应式布局**: 基于 Ant Design 的响应式设计
- **菜单管理**: 基于权限的动态菜单生成
- **主题支持**: 支持亮色/暗色主题切换
- **国际化**: 完整的多语言支持

#### PerformanceMonitor 组件
- **实时监控**: 组件加载时间和内存使用
- **可视化界面**: 直观的性能数据展示
- **开发工具**: 仅在开发环境显示
- **缓存管理**: 一键清理缓存功能

## 🌟 最佳实践

### 组件开发规范
```typescript
// 使用 memo 优化性能
const MyComponent = memo(() => {
  // 组件逻辑
});

// 使用 ErrorBoundary 包装
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// 使用 Suspense 处理懒加载
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### 状态管理规范
```typescript
// 最小化全局状态
const globalState = {
  user: null,
  permissions: [],
  theme: 'light',
};

// 使用 Context 进行状态共享
const AuthContext = createContext(null);

// 避免不必要的重新渲染
const memoizedValue = useMemo(() => computeValue(), [deps]);
```

### 错误处理规范
```typescript
// 使用统一的错误处理
import { ErrorHandler } from './utils/errorHandler';

const result = ErrorHandler.safeExecute(
  () => riskyOperation(),
  defaultValue,
  'Operation failed'
);

// 异步错误处理
const result = await ErrorHandler.safeExecuteAsync(
  () => asyncOperation(),
  defaultValue,
  'Async operation failed'
);
```

## 🚀 部署指南

### 开发环境部署
```bash
# 启动所有服务
pnpm dev:all

# 或分别启动
pnpm --filter mf-shared dev &
pnpm --filter mf-template dev &
pnpm --filter mf-shell dev
```

### 生产环境部署
```bash
# 构建所有应用
pnpm build:all

# 部署到服务器
# 1. 上传构建产物到对应目录
# 2. 配置 Nginx 反向代理
# 3. 设置正确的 CORS 头
```

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 主应用
    location / {
        root /var/www/mf-shell;
        try_files $uri $uri/ /index.html;
    }

    # 微前端应用
    location /template/ {
        root /var/www/mf-template;
        add_header Access-Control-Allow-Origin *;
    }

    # 共享模块
    location /shared/ {
        root /var/www/mf-shared;
        add_header Access-Control-Allow-Origin *;
    }
}
```

## 🤝 贡献指南

### 开发流程
1. **Fork 项目** 到你的 GitHub 账户
2. **创建功能分支** (`git checkout -b feature/amazing-feature`)
3. **提交更改** (`git commit -m 'Add amazing feature'`)
4. **推送分支** (`git push origin feature/amazing-feature`)
5. **创建 Pull Request**

### 代码规范
- 遵循 TypeScript 最佳实践
- 使用 Biome 进行代码检查和格式化
- 编写有意义的提交信息
- 添加适当的测试用例
- 更新相关文档

### 提交信息规范
```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- **技术文档**
  - [Module Federation 官方文档](https://module-federation.github.io/)
  - [Rsbuild 官方文档](https://rsbuild.dev/)
  - [Ant Design 官方文档](https://ant.design/)
  - [React 官方文档](https://react.dev/)

- **相关项目**
  - [MF-Shared - 共享模块](../mf-shared/README.md)
  - [MF-Template - 模板应用](../mf-template/README.md)

## 📞 支持与反馈

如果你在使用过程中遇到问题或有改进建议，欢迎：

- 🐛 [提交 Issue](../../issues)
- 💡 [功能建议](../../discussions)
- 📧 [邮件联系](mailto:your-email@example.com)

---

<div align="center">
  <p>由 ❤️ 和 ☕ 驱动开发</p>
  <p>© 2024 MF-Shell Team. All rights reserved.</p>
</div>
```
