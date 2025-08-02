# 微前端主应用 (mf-shell)

## 项目简介

这是一个基于 React + TypeScript + Module Federation 的微前端主应用，负责统一的用户认证、路由管理和微前端应用的加载。

## 主要功能

- 🔐 **用户认证**: 统一的登录/登出管理
- 🧭 **路由管理**: 主应用和微前端应用的路由协调
- 📱 **响应式布局**: 基于 Ant Design 的现代化界面
- 🔄 **微前端加载**: 动态加载营销系统和财务系统
- 🎨 **主题管理**: 统一的视觉风格和主题配置
- 📊 **仪表盘**: 系统概览和快速导航

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Rsbuild + Module Federation
- **UI组件**: Ant Design
- **路由**: React Router v6
- **状态管理**: React Context
- **样式**: CSS Modules + Ant Design

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

## 微前端集成

### 支持的微前端应用
- **营销系统** (mf-marketing): http://localhost:3001
- **财务系统** (mf-finance): http://localhost:3002

### 路由规则
- `/dashboard` - 主应用仪表盘
- `/marketing/*` - 营销系统路由
- `/finance/*` - 财务系统路由

## 开发说明

### 认证机制
- 使用 JWT Token 进行用户认证
- Token 存储在 localStorage 中
- 支持自动登录和登出

### 环境要求
- Node.js >= 16
- npm >= 8

### 开发模式
确保所有微前端应用都在运行：
1. 主应用: http://localhost:3000
2. 营销系统: http://localhost:3001
3. 财务系统: http://localhost:3002
