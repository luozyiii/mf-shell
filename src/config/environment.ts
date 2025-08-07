// 获取环境变量的辅助函数
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // 在浏览器环境中尝试从window.__ENV__获取
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }

  // 在Node.js环境中从process.env获取
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }

  return defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key);
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  return value === 'true';
};

// 环境配置管理
export interface EnvironmentConfig {
  // 应用基础配置
  app: {
    name: string;
    version: string;
    baseUrl: string;
    port: number;
  };

  // 认证配置
  auth: {
    loginUrl: string;
    logoutUrl: string;
    tokenKey: string;
  };

  // 微前端配置
  microfrontend: {
    defaultHost: string;
    corsEnabled: boolean;
    // 多个微前端应用配置
    apps: {
      [appName: string]: {
        port: number;
        host?: string; // 可选，如果不指定则使用 defaultHost:port
        enabled: boolean;
      };
    };
  };

  // 开发配置
  development?: {
    hotReload: boolean;
    showDevTools: boolean;
    enableMockData: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };

  // 生产配置
  production?: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    cdnEnabled: boolean;
    compressionEnabled: boolean;
  };
}

// 开发环境配置
const developmentConfig: EnvironmentConfig = {
  app: {
    name: getEnvVar('REACT_APP_NAME', '云平台微前端系统'),
    version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
    baseUrl: getEnvVar('REACT_APP_BASE_URL', 'http://localhost:3000'),
    port: getEnvNumber('REACT_APP_PORT', 3000),
  },
  auth: {
    loginUrl: getEnvVar('REACT_APP_LOGIN_URL', 'http://localhost:3000/login'),
    logoutUrl: getEnvVar('REACT_APP_LOGOUT_URL', 'http://localhost:3000/login'),
    tokenKey: getEnvVar('REACT_APP_TOKEN_KEY', 'auth_token'),
  },
  microfrontend: {
    defaultHost: getEnvVar('REACT_APP_MF_HOST', 'http://localhost'),
    corsEnabled: getEnvBoolean('REACT_APP_CORS_ENABLED', true),
    // 多个微前端应用配置
    apps: {
      template: {
        port: getEnvNumber('REACT_APP_MF_TEMPLATE_PORT', 3003),
        enabled: getEnvBoolean('REACT_APP_MF_TEMPLATE_ENABLED', true),
      },
      marketing: {
        port: getEnvNumber('REACT_APP_MF_MARKETING_PORT', 3001),
        enabled: getEnvBoolean('REACT_APP_MF_MARKETING_ENABLED', false),
      },
      finance: {
        port: getEnvNumber('REACT_APP_MF_FINANCE_PORT', 3002),
        enabled: getEnvBoolean('REACT_APP_MF_FINANCE_ENABLED', false),
      },
      user: {
        port: getEnvNumber('REACT_APP_MF_USER_PORT', 3004),
        enabled: getEnvBoolean('REACT_APP_MF_USER_ENABLED', false),
      },
      inventory: {
        port: getEnvNumber('REACT_APP_MF_INVENTORY_PORT', 3005),
        enabled: getEnvBoolean('REACT_APP_MF_INVENTORY_ENABLED', false),
      },
    },
  },
  development: {
    hotReload: getEnvBoolean('REACT_APP_HOT_RELOAD', true),
    showDevTools: getEnvBoolean('REACT_APP_SHOW_DEV_TOOLS', true),
    enableMockData: getEnvBoolean('REACT_APP_ENABLE_MOCK', false),
    logLevel: getEnvVar('REACT_APP_LOG_LEVEL', 'debug') as
      | 'debug'
      | 'info'
      | 'warn'
      | 'error',
  },
};

// 生产环境配置
const productionConfig: EnvironmentConfig = {
  app: {
    name: getEnvVar('REACT_APP_NAME', '云平台微前端系统'),
    version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
    baseUrl: getEnvVar(
      'REACT_APP_BASE_URL',
      'https://luozyiii.github.io/mf-shell'
    ),
    port: getEnvNumber('REACT_APP_PORT', 443),
  },
  auth: {
    loginUrl: getEnvVar(
      'REACT_APP_LOGIN_URL',
      'https://luozyiii.github.io/mf-shell/login'
    ),
    logoutUrl: getEnvVar(
      'REACT_APP_LOGOUT_URL',
      'https://luozyiii.github.io/mf-shell/login'
    ),
    tokenKey: getEnvVar('REACT_APP_TOKEN_KEY', 'auth_token'),
  },
  microfrontend: {
    defaultHost: getEnvVar('REACT_APP_MF_HOST', 'https://luozyiii.github.io'),
    corsEnabled: getEnvBoolean('REACT_APP_CORS_ENABLED', false),
    // 多个微前端应用配置
    apps: {
      template: {
        port: 443,
        host: getEnvVar(
          'REACT_APP_MF_TEMPLATE_HOST',
          'https://luozyiii.github.io/mf-template'
        ),
        enabled: getEnvBoolean('REACT_APP_MF_TEMPLATE_ENABLED', true),
      },
      marketing: {
        port: 443,
        host: getEnvVar(
          'REACT_APP_MF_MARKETING_HOST',
          'https://luozyiii.github.io/mf-marketing'
        ),
        enabled: getEnvBoolean('REACT_APP_MF_MARKETING_ENABLED', false),
      },
      finance: {
        port: 443,
        host: getEnvVar(
          'REACT_APP_MF_FINANCE_HOST',
          'https://luozyiii.github.io/mf-finance'
        ),
        enabled: getEnvBoolean('REACT_APP_MF_FINANCE_ENABLED', false),
      },
      user: {
        port: 443,
        host: getEnvVar(
          'REACT_APP_MF_USER_HOST',
          'https://luozyiii.github.io/mf-user'
        ),
        enabled: getEnvBoolean('REACT_APP_MF_USER_ENABLED', false),
      },
      inventory: {
        port: 443,
        host: getEnvVar(
          'REACT_APP_MF_INVENTORY_HOST',
          'https://luozyiii.github.io/mf-inventory'
        ),
        enabled: getEnvBoolean('REACT_APP_MF_INVENTORY_ENABLED', false),
      },
    },
  },
  production: {
    enableAnalytics: getEnvBoolean('REACT_APP_ENABLE_ANALYTICS', true),
    enableErrorTracking: getEnvBoolean('REACT_APP_ENABLE_ERROR_TRACKING', true),
    cdnEnabled: getEnvBoolean('REACT_APP_CDN_ENABLED', true),
    compressionEnabled: getEnvBoolean('REACT_APP_COMPRESSION_ENABLED', true),
  },
};

// 环境配置管理器
class EnvironmentManager {
  private config: EnvironmentConfig;
  private env: 'development' | 'production';

  constructor() {
    const nodeEnv = getEnvVar('NODE_ENV', 'development');
    this.env = nodeEnv === 'production' ? 'production' : 'development';
    this.config =
      this.env === 'production' ? productionConfig : developmentConfig;
  }

  /**
   * 获取当前环境
   */
  getEnvironment(): 'development' | 'production' {
    return this.env;
  }

  /**
   * 获取完整配置
   */
  getConfig(): EnvironmentConfig {
    return this.config;
  }

  /**
   * 获取应用配置
   */
  getAppConfig() {
    return this.config.app;
  }

  /**
   * 获取认证配置
   */
  getAuthConfig() {
    return this.config.auth;
  }

  /**
   * 获取微前端配置
   */
  getMicrofrontendConfig() {
    return this.config.microfrontend;
  }

  /**
   * 获取开发配置
   */
  getDevelopmentConfig() {
    return this.config.development;
  }

  /**
   * 获取生产配置
   */
  getProductionConfig() {
    return this.config.production;
  }

  /**
   * 是否为开发环境
   */
  isDevelopment(): boolean {
    return this.env === 'development';
  }

  /**
   * 是否为生产环境
   */
  isProduction(): boolean {
    return this.env === 'production';
  }

  /**
   * 构建微前端URL
   */
  buildMicrofrontendUrl(appName: string, port?: number): string {
    const { defaultHost, apps } = this.config.microfrontend;
    const appConfig = apps[appName];

    if (!appConfig) {
      console.warn(`微前端应用 '${appName}' 未在配置中找到`);
      // 回退到传统方式
      const targetPort = port || 3000;
      return this.isProduction()
        ? `${defaultHost}/mf-${appName}`
        : `${defaultHost}:${targetPort}`;
    }

    // 如果应用配置中指定了host，直接使用
    if (appConfig.host) {
      return appConfig.host;
    }

    // 否则使用 defaultHost:port 的格式
    const targetPort = port || appConfig.port;
    return this.isProduction()
      ? `${defaultHost}/mf-${appName}`
      : `${defaultHost}:${targetPort}`;
  }

  /**
   * 获取微前端应用配置
   */
  getMicrofrontendAppConfig(appName: string) {
    return this.config.microfrontend.apps[appName];
  }

  /**
   * 获取所有启用的微前端应用
   */
  getEnabledMicrofrontendApps(): string[] {
    const { apps } = this.config.microfrontend;
    return Object.keys(apps).filter(appName => apps[appName].enabled);
  }

  /**
   * 检查微前端应用是否启用
   */
  isMicrofrontendAppEnabled(appName: string): boolean {
    const appConfig = this.config.microfrontend.apps[appName];
    return appConfig?.enabled || false;
  }

  /**
   * 构建认证URL
   */
  buildAuthUrl(returnUrl?: string): string {
    const { loginUrl } = this.config.auth;
    if (returnUrl) {
      const separator = loginUrl.includes('?') ? '&' : '?';
      return `${loginUrl}${separator}returnUrl=${encodeURIComponent(
        returnUrl
      )}`;
    }
    return loginUrl;
  }
}

// 导出单例实例
export const environmentManager = new EnvironmentManager();
export default environmentManager;
