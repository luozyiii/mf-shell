import { environmentManager } from './environment';

// 生产环境微前端子系统配置
export const prodMicrosystems = {
  // 模板系统
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
    description: '用户账户、权限管理、组织架构',
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
    description: '库存监控、入库出库、库存分析',
    icon: 'InboxOutlined',
    host: environmentManager.buildMicrofrontendUrl('inventory'),
    remoteEntry: `${environmentManager.buildMicrofrontendUrl('inventory')}/remoteEntry.js`,
    route: '/inventory',
    enabled: environmentManager.isMicrofrontendAppEnabled('inventory'),
    permissions: ['inventory:read', 'inventory:write'],
    menuOrder: 5,
    category: 'business',
    routeModule: 'inventory/routes',
  },
} as const;

// 生产环境特定配置
export const prodConfig = {
  // 性能优化
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableCaching: true,
    preloadCriticalApps: ['template'],
  },

  // 监控配置
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableUserAnalytics: true,
    reportingEndpoint: '/api/monitoring',
  },

  // 安全配置
  security: {
    enableCSP: true,
    enableSRI: true,
    trustedHosts: ['luozyiii.github.io', 'cdn.jsdelivr.net'],
  },

  // CDN 配置
  cdn: {
    enabled: true,
    baseUrl: 'https://cdn.jsdelivr.net',
    fallbackEnabled: true,
  },
} as const;
