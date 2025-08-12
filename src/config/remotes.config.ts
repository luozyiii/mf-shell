// 远程模块配置
export interface RemoteConfig {
  name: string;
  url: string;
  development: string;
  production: string;
}

// 远程模块配置列表
export const remoteConfigs: Record<string, RemoteConfig> = {
  template: {
    name: 'template',
    url: 'template',
    development: `http://localhost:${process.env.TEMPLATE_PORT || '3003'}/remoteEntry.js`,
    production: `${process.env.TEMPLATE_URL || 'https://luozyiii.github.io/mf-template'}/remoteEntry.js`,
  },
  // 可以添加更多远程模块
  // marketing: {
  //   name: 'marketing',
  //   url: 'marketing',
  //   development: `http://localhost:${process.env.MARKETING_PORT || '3001'}/remoteEntry.js`,
  //   production: `${process.env.MARKETING_URL || 'https://luozyiii.github.io/mf-marketing'}/remoteEntry.js`
  // },
  // finance: {
  //   name: 'finance',
  //   url: 'finance',
  //   development: `http://localhost:${process.env.FINANCE_PORT || '3002'}/remoteEntry.js`,
  //   production: `${process.env.FINANCE_URL || 'https://luozyiii.github.io/mf-finance'}/remoteEntry.js`
  // }
};

// 生成模块联邦的 remotes 配置
export const generateRemotes = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  const remotes: Record<string, string> = {};

  Object.values(remoteConfigs).forEach(config => {
    const url = isDev ? config.development : config.production;
    remotes[config.name] = `${config.url}@${url}`;
  });

  return remotes;
};

// 运行时获取远程模块 URL（用于动态加载）
export const getRemoteUrl = (remoteName: string): string => {
  const config = remoteConfigs[remoteName];
  if (!config) {
    throw new Error(`Remote module "${remoteName}" not found in configuration`);
  }

  const isDev = process.env.NODE_ENV !== 'production';
  return isDev ? config.development : config.production;
};
