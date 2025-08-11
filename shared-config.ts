/**
 * 共享的 Module Federation 配置
 * 用于统一管理所有微前端应用的共享依赖策略
 */

export const sharedDependencies = {
  react: {
    singleton: true,
    requiredVersion: '^18.3.1',
    strictVersion: false,
    eager: true,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^18.3.1',
    strictVersion: false,
    eager: true,
  },
  'react-router-dom': {
    singleton: true,
    requiredVersion: '^7.7.1',
    strictVersion: false,
    eager: false,
  },
  antd: {
    singleton: true,
    requiredVersion: '^5.26.7',
    strictVersion: false,
    eager: false,
  },
  'react-helmet-async': {
    singleton: true,
    requiredVersion: '^2.0.5',
    strictVersion: false,
    eager: false,
  },
};

/**
 * 共享策略配置
 */
export const shareStrategy = 'loaded-first' as const;

/**
 * DTS 配置
 */
export const dtsConfig = {
  generateTypes: false,
  consumeTypes: false,
};

/**
 * 获取优化后的共享配置
 * @param additionalShared 额外的共享依赖
 * @returns 完整的共享配置
 */
export function getSharedConfig(additionalShared: Record<string, any> = {}) {
  return {
    ...sharedDependencies,
    ...additionalShared,
  };
}

/**
 * 获取完整的 Module Federation 基础配置
 * @param name 应用名称
 * @param additionalConfig 额外配置
 * @returns 基础配置对象
 */
export function getBaseMFConfig(name: string, additionalConfig: any = {}) {
  return {
    name,
    shareStrategy,
    dts: dtsConfig,
    shared: getSharedConfig(additionalConfig.shared),
    ...additionalConfig,
  };
}
