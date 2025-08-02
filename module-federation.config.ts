import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'shell',
  remotes: {
    marketing: process.env.NODE_ENV === 'production'
      ? 'marketing@https://luozyiii.github.io/mf-marketing/remoteEntry.js'
      : 'marketing@http://localhost:3001/remoteEntry.js',
    finance: process.env.NODE_ENV === 'production'
      ? 'finance@https://luozyiii.github.io/mf-finance/remoteEntry.js'
      : 'finance@http://localhost:3002/remoteEntry.js',
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
