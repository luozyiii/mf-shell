import { environmentManager } from './environment';

// 开发环境微前端子系统配置
export const devMicrosystems = {
  // 模板系统（开发测试用）- 使用模块联邦
  template: {
    name: 'template',
    displayName: '模板系统',
    description: '微前端子系统模板和示例',
    icon: 'AppstoreOutlined',
    host: environmentManager.buildMicrofrontendUrl('template'),
    remoteEntry: `${environmentManager.buildMicrofrontendUrl('template')}/remoteEntry.js`,
    route: '/template',
    enabled: environmentManager.isMicrofrontendAppEnabled('template'),
    permissions: ['template:read'],
    menuOrder: 1,
    category: 'development',
    routeModule: 'template/routes',
  },

  // 营销系统
  marketing: {
    name: 'marketing',
    displayName: '营销系统',
    description: '营销活动管理和数据分析',
    icon: 'RocketOutlined',
    host: environmentManager.buildMicrofrontendUrl('marketing'),
    remoteEntry: `${environmentManager.buildMicrofrontendUrl('marketing')}/remoteEntry.js`,
    route: '/marketing',
    enabled: environmentManager.isMicrofrontendAppEnabled('marketing'),
    permissions: ['marketing:read'],
    menuOrder: 2,
    category: 'business',
    routeModule: 'marketing/routes',
  },

  // 财务系统
  finance: {
    name: 'finance',
    displayName: '财务系统',
    description: '财务数据管理和报表分析',
    icon: 'DollarOutlined',
    host: environmentManager.buildMicrofrontendUrl('finance'),
    remoteEntry: `${environmentManager.buildMicrofrontendUrl('finance')}/remoteEntry.js`,
    route: '/finance',
    enabled: environmentManager.isMicrofrontendAppEnabled('finance'),
    permissions: ['finance:read'],
    menuOrder: 3,
    category: 'business',
    routeModule: 'finance/routes',
  },

  // 用户管理系统
  user: {
    name: 'user',
    displayName: '用户管理',
    description: '用户账户和权限管理',
    icon: 'UserOutlined',
    host: environmentManager.buildMicrofrontendUrl('user'),
    remoteEntry: `${environmentManager.buildMicrofrontendUrl('user')}/remoteEntry.js`,
    route: '/user',
    enabled: environmentManager.isMicrofrontendAppEnabled('user'),
    permissions: ['user:read', 'user:write', 'admin:read'],
    menuOrder: 4,
    category: 'system',
    routeModule: 'user/routes',
  },

  // 库存管理系统
  inventory: {
    name: 'inventory',
    displayName: '库存管理',
    description: '库存管理和供应链控制',
    icon: 'InboxOutlined',
    host: environmentManager.buildMicrofrontendUrl('inventory'),
    remoteEntry: `${environmentManager.buildMicrofrontendUrl('inventory')}/remoteEntry.js`,
    route: '/inventory',
    enabled: environmentManager.isMicrofrontendAppEnabled('inventory'),
    permissions: ['inventory:read'],
    menuOrder: 5,
    category: 'business',
    routeModule: 'inventory/routes',
  },
} as const;

// 开发环境特定配置
export const devConfig = {
  // 是否启用热重载
  hotReload: true,

  // 是否显示开发工具
  showDevTools: true,

  // 是否启用模拟数据
  enableMockData: true,

  // 开发服务器配置
  devServer: {
    port: 3000,
    host: 'localhost',
    cors: true,
  },

  // 调试配置
  debug: {
    showLoadingTime: true,
    logMicrofrontendEvents: true,
    enablePerformanceMonitor: true,
  },
} as const;
