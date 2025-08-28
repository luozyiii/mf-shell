// 简化的微前端配置系统
import { remoteConfigs } from './remotes.config';

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

// 获取 basename，确保开发环境始终为空
const getBasename = (): string => {
  // 直接检查 NODE_ENV，不依赖 isDev 变量
  const nodeEnv = process.env.NODE_ENV;
  const isDevEnvironment = nodeEnv !== 'production';

  if (isDevEnvironment) {
    return ''; // 开发环境始终不使用 basename
  }

  return getEnvVar('PUBLIC_PATH', '/mf-shell');
};

const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : false;

// 基础配置
const BASE_CONFIG = {
  // 主应用配置
  shell: {
    port: parseInt(getEnvVar('SHELL_PORT', '3000'), 10),
    basename: getBasename(),
  },

  // 微前端应用配置
  microFrontends: {
    template: {
      name: 'template',
      displayName: getEnvVar('TEMPLATE_NAME', '模板应用'),
      url: getEnvVar('TEMPLATE_URL', `http://localhost:3001`),
      port: parseInt(getEnvVar('TEMPLATE_PORT', '3001'), 10),
      enabled: getEnvVar('TEMPLATE_ENABLED', 'true') === 'true',
      permissions: ['template:read'],
      icon: 'AppstoreOutlined',
      description: '微前端模板应用',
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
    const isDev =
      typeof process !== 'undefined' && process.env ? process.env.NODE_ENV !== 'production' : true; // 默认为开发模式

    // 使用 remotes.config.ts 中的配置
    Object.values(remoteConfigs).forEach((config) => {
      const url = isDev ? config.development : config.production;
      remotes[config.name] = `${config.url}@${url}`;
    });

    // mf-shared 是必需的共享模块，始终包含
    const enabledRemotes: Record<string, string> = {};

    // 首先添加 mf-shared（必需）
    if (remotes['mf-shared']) {
      enabledRemotes['mf-shared'] = remotes['mf-shared'];
    }

    // 然后添加已启用的微前端应用
    const enabledMicroFrontends = this.getEnabledMicroFrontends();
    enabledMicroFrontends.forEach((mf) => {
      if (remotes[mf.name] && mf.name !== 'mf-shared') {
        enabledRemotes[mf.name] = remotes[mf.name];
      }
    });

    return enabledRemotes;
  }

  // 获取远程模块URL（用于动态加载）
  getRemoteUrl(remoteName: string): string {
    const config = remoteConfigs[remoteName];
    if (!config) {
      throw new Error(`Remote module "${remoteName}" not found in configuration`);
    }

    const isDev =
      typeof process !== 'undefined' && process.env ? process.env.NODE_ENV !== 'production' : true; // 默认为开发模式
    return isDev ? config.development : config.production;
  }

  // 获取用户可访问的微前端
  getAccessibleMicroFrontends(userPermissions: string[]): MicroFrontendConfig[] {
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

// 导出常用方法 - 使用绑定的方法保持 this 上下文
export const getEnabledMicroFrontends = () => configManager.getEnabledMicroFrontends();
export const getMicroFrontend = (name: string) => configManager.getMicroFrontend(name);
export const isEnabled = (name: string) => configManager.isEnabled(name);
export const generateRemotes = () => configManager.generateRemotes();
export const getRemoteUrl = (remoteName: string) => configManager.getRemoteUrl(remoteName);
export const getAccessibleMicroFrontends = (userPermissions: string[]) =>
  configManager.getAccessibleMicroFrontends(userPermissions);
export const getMenuItems = (userPermissions?: string[]) =>
  configManager.getMenuItems(userPermissions);
export const getShellConfig = () => configManager.getShellConfig();
export const getAllConfig = () => configManager.getAllConfig();

// 导出类型（已在接口定义时导出）

// 默认导出
export default configManager;
