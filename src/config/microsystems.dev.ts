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
    useModuleFederation: true, // 使用模块联邦
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
