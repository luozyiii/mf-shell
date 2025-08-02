// 生产环境微前端子系统配置
export const prodMicrosystems = {
  // 模板系统
  template: {
    name: 'template',
    displayName: '模板系统',
    description: '微前端子系统模板和示例',
    icon: 'AppstoreOutlined',
    host: 'https://luozyiii.github.io/mf-template',
    remoteEntry: 'https://luozyiii.github.io/mf-template/remoteEntry.js',
    route: '/template',
    enabled: true, // 生产环境也启用，用于展示
    permissions: ['admin:read'],
    menuOrder: 1,
    category: 'development'
  },

  // 营销系统
  marketing: {
    name: 'marketing',
    displayName: '营销系统',
    description: '营销活动管理、客户管理、数据分析',
    icon: 'RocketOutlined',
    host: 'https://luozyiii.github.io/mf-marketing',
    remoteEntry: 'https://luozyiii.github.io/mf-marketing/remoteEntry.js',
    route: '/marketing',
    enabled: true,
    permissions: ['marketing:read', 'marketing:write'],
    menuOrder: 2,
    category: 'business'
  },

  // 财务系统
  finance: {
    name: 'finance',
    displayName: '财务系统',
    description: '财务报表、账务管理、成本分析',
    icon: 'DollarOutlined',
    host: 'https://luozyiii.github.io/mf-finance',
    remoteEntry: 'https://luozyiii.github.io/mf-finance/remoteEntry.js',
    route: '/finance',
    enabled: true,
    permissions: ['finance:read', 'finance:write'],
    menuOrder: 3,
    category: 'business'
  },

  // 库存系统（示例 - 未来扩展）
  inventory: {
    name: 'inventory',
    displayName: '库存管理',
    description: '库存监控、入库出库、库存分析',
    icon: 'InboxOutlined',
    host: 'https://luozyiii.github.io/mf-inventory',
    remoteEntry: 'https://luozyiii.github.io/mf-inventory/remoteEntry.js',
    route: '/inventory',
    enabled: false, // 暂未部署，设为禁用
    permissions: ['inventory:read', 'inventory:write'],
    menuOrder: 4,
    category: 'business'
  },

  // 用户管理系统（示例 - 未来扩展）
  user: {
    name: 'user',
    displayName: '用户管理',
    description: '用户账户、权限管理、组织架构',
    icon: 'UserOutlined',
    host: 'https://luozyiii.github.io/mf-user',
    remoteEntry: 'https://luozyiii.github.io/mf-user/remoteEntry.js',
    route: '/user',
    enabled: false, // 暂未部署，设为禁用
    permissions: ['user:read', 'user:write', 'admin:read'],
    menuOrder: 5,
    category: 'system'
  }
} as const;

// 生产环境特定配置
export const prodConfig = {
  // 性能优化
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableCaching: true,
    preloadCriticalApps: ['marketing', 'finance']
  },

  // 监控配置
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableUserAnalytics: true,
    reportingEndpoint: '/api/monitoring'
  },

  // 安全配置
  security: {
    enableCSP: true,
    enableSRI: true,
    trustedHosts: [
      'luozyiii.github.io',
      'cdn.jsdelivr.net'
    ]
  },

  // CDN 配置
  cdn: {
    enabled: true,
    baseUrl: 'https://cdn.jsdelivr.net',
    fallbackEnabled: true
  }
} as const;
