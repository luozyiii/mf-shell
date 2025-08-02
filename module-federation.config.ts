import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'shell',
  remotes: {
    marketing: 'marketing@http://localhost:3001/remoteEntry.js',
    finance: 'finance@http://localhost:3002/remoteEntry.js',
  },
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
      eager: true
    },
    antd: {
      singleton: true,
      requiredVersion: false
    },
  },
});
