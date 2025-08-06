// 开发环境微前端子系统配置
export const devMicrosystems = {
  // 模板系统（开发测试用）- 使用模块联邦
  template: {
    name: 'template',
    displayName: '模板系统',
    description: '微前端子系统模板和示例',
    icon: 'AppstoreOutlined',
    host: 'http://localhost:3003',
    remoteEntry: 'http://localhost:3003/remoteEntry.js',
    route: '/template', // 保持基础路由，但具体页面使用模块联邦
    enabled: true, // 启用模块联邦方式
    permissions: ['template:read'], // 改为模板系统专用权限
    menuOrder: 1,
    category: 'development',
    // 新增模块联邦配置
    useMicroFrontend: false, // 不使用 iframe
    useModuleFederation: true // 使用模块联邦
  },

  // 营销系统
  marketing: {
    name: 'marketing',
    displayName: '营销系统',
    description: '营销活动管理、客户管理、数据分析',
    icon: 'RocketOutlined',
    host: 'http://localhost:3001',
    remoteEntry: 'http://localhost:3001/remoteEntry.js',
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
    host: 'http://localhost:3002',
    remoteEntry: 'http://localhost:3002/remoteEntry.js',
    route: '/finance',
    enabled: true,
    permissions: ['finance:read', 'finance:write'],
    menuOrder: 3,
    category: 'business'
  }
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
    cors: true
  },

  // 调试配置
  debug: {
    showLoadingTime: true,
    logMicrofrontendEvents: true,
    enablePerformanceMonitor: true
  }
} as const;
