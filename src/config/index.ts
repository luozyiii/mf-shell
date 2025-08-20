// 简化的微前端配置系统
export const STORE_PREFIX = 'mf-shell-';

export interface MicroFrontendConfig {
  name: string;
  displayName: string;
  url: string;
  port: number;
  enabled: boolean;
  permissions: string[];
  icon?: string;
  description?: string;
}

// 环境变量配置 - 兼容浏览器环境
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // 在构建时通过 webpack DefinePlugin 注入的环境变量
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

const isDev =
  typeof process !== 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : false;

// 基础配置
const BASE_CONFIG = {
  // 主应用配置
  shell: {
    port: parseInt(getEnvVar('SHELL_PORT', '3000'), 10),
    basename: getEnvVar('PUBLIC_PATH', isDev ? '' : '/mf-shell'),
  },

  // 微前端应用配置
  microFrontends: {
    template: {
      name: 'template',
      displayName: getEnvVar('TEMPLATE_NAME', '模板应用'),
      url: getEnvVar('TEMPLATE_URL', `http://localhost:3003`),
      port: parseInt(getEnvVar('TEMPLATE_PORT', '3003'), 10),
      enabled: getEnvVar('TEMPLATE_ENABLED', 'true') === 'true',
      permissions: ['template:read'],
      icon: 'AppstoreOutlined',
      description: '微前端模板应用',
    },
    marketing: {
      name: 'marketing',
      displayName: getEnvVar('MARKETING_NAME', '营销系统'),
      url: getEnvVar('MARKETING_URL', `http://localhost:3001`),
      port: parseInt(getEnvVar('MARKETING_PORT', '3001'), 10),
      enabled: getEnvVar('MARKETING_ENABLED', 'false') === 'true',
      permissions: ['marketing:view'],
      icon: 'RocketOutlined',
      description: '营销管理系统',
    },
    finance: {
      name: 'finance',
      displayName: getEnvVar('FINANCE_NAME', '财务系统'),
      url: getEnvVar('FINANCE_URL', `http://localhost:3002`),
      port: parseInt(getEnvVar('FINANCE_PORT', '3002'), 10),
      enabled: getEnvVar('FINANCE_ENABLED', 'false') === 'true',
      permissions: ['finance:view'],
      icon: 'DollarOutlined',
      description: '财务管理系统',
    },
  } as Record<string, MicroFrontendConfig>,
};

// 配置管理器
class ConfigManager {
  private config = BASE_CONFIG;

  // 获取所有启用的微前端
  getEnabledMicroFrontends(): MicroFrontendConfig[] {
    return Object.values(this.config.microFrontends).filter((mf) => mf.enabled);
  }

  // 获取指定微前端配置
  getMicroFrontend(name: string): MicroFrontendConfig | undefined {
    return this.config.microFrontends[name];
  }

  // 检查微前端是否启用
  isEnabled(name: string): boolean {
    return this.config.microFrontends[name]?.enabled || false;
  }

  // 生成 Module Federation remotes 配置
  generateRemotes(): Record<string, string> {
    const remotes: Record<string, string> = {};

    this.getEnabledMicroFrontends().forEach((mf) => {
      remotes[mf.name] = `${mf.name}@${mf.url}/remoteEntry.js`;
    });

    return remotes;
  }

  // 获取用户可访问的微前端
  getAccessibleMicroFrontends(
    userPermissions: string[]
  ): MicroFrontendConfig[] {
    return this.getEnabledMicroFrontends().filter((mf) => {
      // 支持简单权限名和详细权限名
      return mf.permissions.some((permission) => {
        // 如果用户权限包含完整权限名
        if (userPermissions.includes(permission)) {
          return true;
        }
        // 如果用户权限包含简化权限名（如 'template' 对应 'template:read'）
        const simpleName = permission.split(':')[0];
        return userPermissions.includes(simpleName);
      });
    });
  }

  // 获取菜单配置
  getMenuItems(userPermissions: string[] = []) {
    return this.getAccessibleMicroFrontends(userPermissions).map((mf) => ({
      key: mf.name,
      label: mf.displayName,
      icon: mf.icon,
      path: `/${mf.name}`,
      description: mf.description,
    }));
  }

  // 获取主应用配置
  getShellConfig() {
    return this.config.shell;
  }

  // 获取所有配置
  getAllConfig() {
    return this.config;
  }

  // 动态更新配置（用于运行时配置更新）
  updateMicroFrontend(name: string, updates: Partial<MicroFrontendConfig>) {
    if (this.config.microFrontends[name]) {
      this.config.microFrontends[name] = {
        ...this.config.microFrontends[name],
        ...updates,
      };
    }
  }

  // 添加新的微前端配置
  addMicroFrontend(config: MicroFrontendConfig) {
    this.config.microFrontends[config.name] = config;
  }

  // 获取环境信息
  getEnvironment() {
    return {
      isDev,
      nodeEnv: process.env.NODE_ENV || 'development',
      publicPath: this.config.shell.basename,
    };
  }
}

// 导出单例
export const configManager = new ConfigManager();

// 导出常用方法
export const {
  getEnabledMicroFrontends,
  getMicroFrontend,
  isEnabled,
  generateRemotes,
  getAccessibleMicroFrontends,
  getMenuItems,
  getShellConfig,
  getAllConfig,
} = configManager;

// 导出类型（已在接口定义时导出）

// 默认导出
export default configManager;
