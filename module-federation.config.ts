import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import { microsystemManager } from './src/config/microsystems';

// 从配置系统动态生成 remotes 配置
const generateRemotes = () => {
  const enabledMicrosystems = microsystemManager.getEnabledMicrosystems();
  const remotes: Record<string, string> = {};

  enabledMicrosystems.forEach(microsystem => {
    remotes[microsystem.name] = `${microsystem.name}@${microsystem.remoteEntry}`;
  });

  return remotes;
};

const remotes = generateRemotes();

export default createModuleFederationConfig({
  name: 'shell',
  remotes,
  shareStrategy: 'loaded-first',
  shared: {
    react: {
      singleton: true,
      requiredVersion: false,
      eager: true
    },
    'react-dom': {
      singleton: true,
      requiredVersion: false,
      eager: true
    },
    'react-router-dom': {
      singleton: true,
      requiredVersion: false,
      eager: false
    },
    antd: {
      singleton: true,
      requiredVersion: false,
      eager: false
    },
  },
});
