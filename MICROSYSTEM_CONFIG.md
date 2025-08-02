# 微前端子系统配置化管理

## 🎯 概述

主应用现在支持通过简单的配置文件来管理所有微前端子系统，实现了配置化的子系统管理，无需修改代码即可添加、删除或配置子系统。

## 📁 配置文件结构

```
src/config/
├── microsystems.dev.ts    # 开发环境配置
├── microsystems.prod.ts   # 生产环境配置
└── microsystems.ts        # 配置管理器
```

## 🔧 配置文件说明

### 开发环境配置 (microsystems.dev.ts)

```typescript
export const devMicrosystems = {
  template: {
    name: 'template',
    displayName: '模板系统',
    description: '微前端子系统模板和示例',
    icon: 'AppstoreOutlined',
    host: 'http://localhost:3003',
    remoteEntry: 'http://localhost:3003/remoteEntry.js',
    route: '/template',
    enabled: true,
    permissions: ['admin:read'],
    menuOrder: 1,
    category: 'development'
  },
  // ... 其他系统配置
};
```

### 生产环境配置 (microsystems.prod.ts)

```typescript
export const prodMicrosystems = {
  template: {
    name: 'template',
    displayName: '模板系统',
    description: '微前端子系统模板和示例',
    icon: 'AppstoreOutlined',
    host: 'https://luozyiii.github.io/mf-template',
    remoteEntry: 'https://luozyiii.github.io/mf-template/remoteEntry.js',
    route: '/template',
    enabled: true,
    permissions: ['admin:read'],
    menuOrder: 1,
    category: 'development'
  },
  // ... 其他系统配置
};
```

## 📋 配置字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 模块名称，用于 Module Federation |
| `displayName` | string | 显示名称，用于菜单和界面 |
| `description` | string | 系统描述 |
| `icon` | string | 图标名称 (Ant Design 图标) |
| `host` | string | 子系统主机地址 |
| `remoteEntry` | string | Module Federation 入口文件 |
| `route` | string | 路由路径 |
| `enabled` | boolean | 是否启用 |
| `permissions` | string[] | 所需权限列表 |
| `menuOrder` | number | 菜单排序 |
| `category` | string | 分类 (business/system/development) |

## 🚀 当前配置的子系统

### 开发环境 & 生产环境

| 顺序 | 系统 | 名称 | 端口/URL | 状态 | 分类 |
|------|------|------|----------|------|------|
| 1 | template | 模板系统 | 3003 / mf-template | ✅ 启用 | development |
| 2 | marketing | 营销系统 | 3001 / mf-marketing | ✅ 启用 | business |
| 3 | finance | 财务系统 | 3002 / mf-finance | ✅ 启用 | business |
| 4 | inventory | 库存管理 | 3004 / mf-inventory | ❌ 禁用 | business |
| 5 | user | 用户管理 | 3005 / mf-user | ❌ 禁用 | system |

## 🔄 自动化功能

### 1. Module Federation 配置自动生成
配置管理器会自动生成 `module-federation.config.ts` 中的 remotes 配置：

```typescript
// 自动生成
const remotes = {
  template: 'template@http://localhost:3003/remoteEntry.js',
  marketing: 'marketing@http://localhost:3001/remoteEntry.js',
  finance: 'finance@http://localhost:3002/remoteEntry.js'
};
```

### 2. 路由配置自动生成
主应用会根据配置自动生成路由：

```typescript
// 自动生成路由
{enabledMicrosystems.map(microsystem => (
  <Route
    key={microsystem.name}
    path={`${microsystem.route}/*`}
    element={<MicroFrontendLoader name={microsystem.name} host={microsystem.host} />}
  />
))}
```

### 3. 菜单配置自动生成
导航菜单会根据用户权限和系统配置自动生成。

## 🔐 权限集成

### 权限映射
现有权限系统与新配置系统的映射：

```typescript
const userPermissions: string[] = [];
if (permissions?.marketing) userPermissions.push('marketing:read', 'marketing:write');
if (permissions?.finance) userPermissions.push('finance:read', 'finance:write');
if (user?.roles.includes('admin')) userPermissions.push('admin:read');
```

### 权限控制
- 只有拥有相应权限的用户才能看到对应的菜单项
- 路由访问也会进行权限检查
- 支持细粒度的权限控制

## 📦 添加新的子系统

### 1. 修改配置文件
在 `microsystems.dev.ts` 和 `microsystems.prod.ts` 中添加新系统配置：

```typescript
newSystem: {
  name: 'newSystem',
  displayName: '新系统',
  description: '新系统描述',
  icon: 'SettingOutlined',
  host: 'http://localhost:3006', // 开发环境
  // host: 'https://luozyiii.github.io/mf-newSystem', // 生产环境
  remoteEntry: 'http://localhost:3006/remoteEntry.js',
  route: '/newSystem',
  enabled: true,
  permissions: ['newSystem:read', 'newSystem:write'],
  menuOrder: 6,
  category: 'business'
}
```

### 2. 重新构建
修改配置后重新构建主应用即可生效，无需修改其他代码。

## 🎨 图标支持

支持的图标名称（可扩展）：
- `AppstoreOutlined`
- `RocketOutlined` 
- `DollarOutlined`
- `InboxOutlined`
- `UserOutlined`
- `SettingOutlined`
- `CloudServerOutlined`

## 🌟 优势

1. **简单明了** - 通过配置文件管理，无需修改代码
2. **环境隔离** - 开发和生产环境配置分离
3. **权限集成** - 与现有权限系统无缝集成
4. **自动化** - 路由、菜单、Module Federation 自动生成
5. **可扩展** - 轻松添加新的子系统
6. **类型安全** - TypeScript 类型检查
7. **标准化** - 统一的配置结构和管理方式

## 🔮 未来扩展

- 支持动态加载配置（从服务端获取）
- 支持更细粒度的权限控制
- 支持子系统的版本管理
- 支持子系统的健康检查
- 支持子系统的性能监控
