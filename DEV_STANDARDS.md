# mf-shell 开发规范

## 📋 概述

本文档定义了 mf-shell 微前端主应用的开发规范，确保代码质量、一致性和可维护性。

## 🎯 项目特点

mf-shell 作为微前端主应用，具有以下特点：

- 负责用户认证和权限管理
- 管理微前端应用的路由和加载
- 提供统一的 UI 框架和组件库
- 处理应用间的通信和状态管理

## 🔧 开发工具配置

### 已配置的工具

✅ **ESLint** - 代码质量检查  
✅ **Prettier** - 代码格式化  
✅ **TypeScript** - 类型检查  
✅ **Husky** - Git hooks  
✅ **lint-staged** - 提交前检查  
✅ **Commitlint** - 提交信息规范

### 配置文件

- `.eslintrc.js` - ESLint 配置
- `.prettierrc` - Prettier 配置
- `.prettierignore` - Prettier 忽略文件
- `.commitlintrc.js` - Commitlint 配置
- `tsconfig.json` - TypeScript 配置
- `.husky/` - Git hooks 配置

## 📝 可用脚本

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码质量检查
npm run lint              # ESLint 检查
npm run lint:fix          # ESLint 自动修复
npm run format            # Prettier 格式化
npm run format:check      # Prettier 检查
npm run type-check        # TypeScript 类型检查
npm run code-quality      # 运行所有质量检查
```

## 🏗️ 项目结构规范

```
src/
├── components/           # 通用组件
│   ├── Layout.tsx       # 主布局组件
│   ├── ProtectedRoute.tsx # 路由保护组件
│   └── ModuleFederationLoader.tsx # 微前端加载器
├── contexts/            # React Context
│   └── AuthContext.tsx # 认证上下文
├── hooks/               # 自定义 Hooks
│   └── usePermissions.ts # 权限管理 Hook
├── pages/               # 页面组件
│   ├── Login.tsx        # 登录页面
│   └── Dashboard.tsx    # 仪表板页面
├── services/            # API 服务
│   └── auth.ts          # 认证服务
├── types/               # 类型定义
│   ├── auth.ts          # 认证相关类型
│   └── microsystem.ts   # 微系统相关类型
├── utils/               # 工具函数
│   └── configValidator.ts # 配置验证
├── config/              # 配置文件
│   └── microsystems.ts  # 微系统配置
└── constants/           # 常量定义
    └── routes.ts        # 路由常量
```

## 📋 编码规范

### 1. 命名规范

```typescript
// 组件命名：PascalCase
export const UserProfile: React.FC = () => {};

// 函数命名：camelCase
const handleUserLogin = () => {};

// 常量命名：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// 接口命名：I + PascalCase 或直接 PascalCase
interface UserData {
  id: string;
  name: string;
}

// 类型命名：PascalCase + Type 后缀
type AuthContextType = {
  user: User | null;
  login: (credentials: LoginForm) => Promise<void>;
};
```

### 2. 导入规范

```typescript
// 第三方库导入
import React, { useState, useEffect } from 'react';
import { Button, Card, Layout } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 本地模块导入（按层级排序）
import { AuthProvider } from './contexts/AuthContext';
import { usePermissions } from './hooks/usePermissions';
import { authService } from './services/auth';
import { ROUTES } from './constants/routes';

// 类型导入
import type { User, Permissions } from './types/auth';
import type { MicrosystemConfig } from './types/microsystem';
```

### 3. 组件规范

```typescript
import React, { useState, useEffect } from 'react';
import { Card, Button, Spin } from 'antd';
import type { User } from '../types/auth';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  loading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  loading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 组件副作用逻辑
  }, [user.id]);

  const handleEdit = (): void => {
    setIsEditing(true);
    onEdit?.(user);
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <Card
      title={user.name}
      actions={[
        <Button key="edit" onClick={handleEdit}>
          编辑
        </Button>
      ]}
    >
      {/* 组件内容 */}
    </Card>
  );
};
```

### 4. 微前端特定规范

```typescript
// 微系统配置
interface MicrosystemConfig {
  name: string;
  url: string;
  remoteEntry: string;
  enabled: boolean;
  permissions: string[];
}

// 权限检查
const hasPermission = (
  userPermissions: string[],
  required: string
): boolean => {
  return userPermissions.includes(required);
};

// 动态导入微前端组件
const loadMicrofrontend = async (name: string, component: string) => {
  try {
    const module = await import(`${name}/${component}`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load ${name}/${component}:`, error);
    throw error;
  }
};
```

## 🔍 代码质量检查

### 自动检查

- **提交前检查**：自动运行 ESLint 和 Prettier
- **提交信息检查**：验证提交信息格式
- **类型检查**：TypeScript 严格模式

### 手动检查

```bash
# 运行所有质量检查
npm run code-quality

# 单独运行检查
npm run lint          # ESLint 检查
npm run format:check  # Prettier 检查
npm run type-check    # TypeScript 检查
```

## 📋 提交规范

### 提交信息格式

```
type(scope): subject

body

footer
```

### 类型说明

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI 配置
- `build`: 构建系统
- `revert`: 回滚

### 示例

```bash
feat(auth): 添加用户权限验证功能

- 实现基于角色的权限控制
- 添加权限检查中间件
- 更新用户界面权限显示

Closes #123
```

## ✅ 开发检查清单

### 新功能开发

- [ ] 代码符合 ESLint 规则
- [ ] 代码已格式化（Prettier）
- [ ] TypeScript 类型检查通过
- [ ] 组件有适当的 Props 类型定义
- [ ] 错误处理完善
- [ ] 权限检查正确实现
- [ ] 微前端集成测试通过
- [ ] 提交信息符合规范

### 代码审查

- [ ] 代码逻辑清晰
- [ ] 性能考虑充分
- [ ] 安全性检查
- [ ] 可访问性支持
- [ ] 响应式设计
- [ ] 错误边界处理
- [ ] 测试覆盖充分

## 🚀 最佳实践

### 1. 性能优化

- 使用 React.lazy 和 Suspense 进行代码分割
- 合理使用 useMemo 和 useCallback
- 避免不必要的重渲染
- 优化微前端加载策略

### 2. 安全性

- 严格的权限验证
- XSS 防护
- CSRF 防护
- 安全的路由保护

### 3. 可维护性

- 模块化设计
- 清晰的代码注释
- 完善的类型定义
- 统一的错误处理

### 4. 微前端最佳实践

- 独立部署和版本控制
- 共享依赖管理
- 统一的设计系统
- 应用间通信规范

---

**遵循此规范，确保 mf-shell 项目的代码质量和团队协作效率。**
