// 应用配置常量
export const APP_CONFIG = {
  // 应用名称
  APP_NAME: '云平台微前端系统',
  APP_SHORT_NAME: 'MF',
  
  // 本地存储键名
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    PERMISSIONS_DATA: 'permissions_data',
    THEME_SETTINGS: 'theme_settings',
    LAYOUT_SETTINGS: 'layout_settings'
  },
  
  // 微前端应用配置
  MICRO_APPS: {
    MARKETING: {
      name: 'marketing',
      displayName: '营销系统',
      host: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
        ? 'https://luozyiii.github.io/mf-marketing'
        : 'http://localhost:3001',
      remoteEntry: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
        ? 'https://luozyiii.github.io/mf-marketing/remoteEntry.js'
        : 'http://localhost:3001/remoteEntry.js',
      icon: 'ShoppingOutlined',
      description: '营销活动管理、客户管理、数据分析'
    },
    FINANCE: {
      name: 'finance',
      displayName: '财务系统',
      host: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
        ? 'https://luozyiii.github.io/mf-finance'
        : 'http://localhost:3002',
      remoteEntry: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
        ? 'https://luozyiii.github.io/mf-finance/remoteEntry.js'
        : 'http://localhost:3002/remoteEntry.js',
      icon: 'DollarOutlined',
      description: '财务报表、账务管理、成本分析'
    }
  },
  
  // 路由配置
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    MARKETING: '/marketing',
    FINANCE: '/finance',
    ROOT: '/'
  },
  
  // 布局配置
  LAYOUT: {
    SIDER_WIDTH: 200,
    SIDER_COLLAPSED_WIDTH: 80,
    HEADER_HEIGHT: 64,
    CONTENT_PADDING: 24
  },
  
  // 主题配置
  THEME: {
    PRIMARY_COLOR: '#1890ff',
    SUCCESS_COLOR: '#52c41a',
    WARNING_COLOR: '#fa8c16',
    ERROR_COLOR: '#ff4d4f',
    BORDER_RADIUS: 12,
    BOX_SHADOW: '0 2px 12px rgba(0, 0, 0, 0.04)'
  }
} as const;

// 环境配置
export const ENV_CONFIG = {
  isDevelopment: typeof process !== 'undefined' && process.env?.NODE_ENV === 'development',
  isProduction: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production',
  apiBaseUrl: (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) || 'http://localhost:8080/api',
  enableMockData: typeof process !== 'undefined' && process.env?.REACT_APP_ENABLE_MOCK === 'true'
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
  LOGIN_FAILED: '用户名或密码错误',
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  PERMISSION_DENIED: '您没有权限访问此功能',
  SESSION_EXPIRED: '登录已过期，请重新登录',
  UNKNOWN_ERROR: '发生未知错误，请稍后重试'
} as const;

// 成功消息常量
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功'
} as const;
