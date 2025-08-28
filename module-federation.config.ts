import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import { generateRemotes } from './src/config';

// 优化的共享依赖配置
const sharedDependencies = {
  // 核心 React 依赖 - 必须单例且预加载
  react: {
    singleton: true,
    eager: true, // 主应用预加载，提升性能
    requiredVersion: '^19.1.0',
    strictVersion: false, // 允许版本兼容
  },
  'react-dom': {
    singleton: true,
    eager: true,
    requiredVersion: '^19.1.0',
    strictVersion: false,
  },

  // 路由依赖 - 单例但懒加载
  'react-router-dom': {
    singleton: true,
    eager: false, // 按需加载，减少初始包大小
    requiredVersion: '^7.8.1',
    strictVersion: false,
  },

  // UI 库 - 单例且预加载核心部分
  antd: {
    singleton: true,
    eager: false, // 按需加载，因为 antd 较大
    requiredVersion: '^5.27.1',
    strictVersion: false,
  },

  // 工具库 - 按需共享
  'react-helmet-async': {
    singleton: true,
    eager: false,
    requiredVersion: '^2.0.5',
    strictVersion: false,
  },

  // 避免共享过大的依赖，让每个应用自己处理
  // 例如：moment、lodash 等大型库不共享，除非确实需要
};

export default createModuleFederationConfig({
  name: 'shell',
  remotes: generateRemotes(),
  shared: sharedDependencies,
});
