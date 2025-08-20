// 应用配置常量
export const APP_CONFIG = {
  // 应用名称
  APP_NAME: '云平台微前端系统',
  APP_SHORT_NAME: 'MF',

  // 注意：微前端应用配置已迁移到 src/config/microsystems.ts
  // 请使用 microsystemManager 来获取微前端配置

  // 基础路由配置
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    ROOT: '/',
  },

  // 布局配置
  LAYOUT: {
    SIDER_WIDTH: 200,
    SIDER_COLLAPSED_WIDTH: 80,
    HEADER_HEIGHT: 64,
    CONTENT_PADDING: 24,
  },

  // 主题配置
  THEME: {
    PRIMARY_COLOR: '#1890ff',
    SUCCESS_COLOR: '#52c41a',
    WARNING_COLOR: '#fa8c16',
    ERROR_COLOR: '#ff4d4f',
    BORDER_RADIUS: 12,
    BOX_SHADOW: '0 2px 12px rgba(0, 0, 0, 0.04)',
  },
} as const;

// 环境配置
export const ENV_CONFIG = {
  isDevelopment:
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'development',
  isProduction:
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'production',
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
  LOGIN_FAILED: '用户名或密码错误',
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  PERMISSION_DENIED: '您没有权限访问此功能',
  SESSION_EXPIRED: '登录已过期，请重新登录',
  UNKNOWN_ERROR: '发生未知错误，请稍后重试',
} as const;

// 成功消息常量
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功',
} as const;
