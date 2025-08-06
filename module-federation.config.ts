import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import { microsystemManager } from './src/config/microsystems';

// 从配置系统动态生成 remotes 配置
const remotes = microsystemManager.generateModuleFederationRemotes();

export default createModuleFederationConfig({
  name: 'shell',
  remotes,
  shareStrategy: 'loaded-first',
  dts: {
    generateTypes: false,
    consumeTypes: false,
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: false,
      eager: true,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: false,
      eager: true,
    },
    'react-router-dom': {
      singleton: true,
      requiredVersion: false,
      eager: true,
    },
    antd: {
      singleton: true,
      requiredVersion: false,
      eager: true,
    },
  },
});
