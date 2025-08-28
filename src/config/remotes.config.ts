// 远程模块配置
export interface RemoteConfig {
  name: string;
  url: string;
  development: string;
  production: string;
}

// 安全获取环境变量的辅助函数
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

// 远程模块配置列表
export const remoteConfigs: Record<string, RemoteConfig> = {
  'mf-shared': {
    name: 'mf-shared',
    url: 'mfShared',
    development: `http://localhost:${getEnvVar('SHARED_PORT', '2999')}/remoteEntry.js`,
    production: `${getEnvVar('MF_SHARED_URL', 'https://luozyiii.github.io/mf-shared')}/remoteEntry.js`,
  },
  template: {
    name: 'template',
    url: 'template',
    development: `http://localhost:${getEnvVar('TEMPLATE_PORT', '3001')}/remoteEntry.js`,
    production: `${getEnvVar('TEMPLATE_URL', 'https://luozyiii.github.io/mf-template')}/remoteEntry.js`,
  },
  // 可以添加更多远程模块
};

// 注意：generateRemotes 和 getRemoteUrl 函数已迁移到 config/index.ts
// 请使用 import { generateRemotes, getRemoteUrl } from '../config' 来导入这些函数
