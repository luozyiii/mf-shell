import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import { generateRemotes } from './src/config/remotes.config';

export default createModuleFederationConfig({
  name: 'shell',
  remotes: generateRemotes(),
  shared: {
    react: {
      singleton: true,
      eager: false,
    },
    'react-dom': {
      singleton: true,
      eager: false,
    },
    'react-router-dom': {
      singleton: true,
      eager: false,
    },
    antd: {
      singleton: true,
      eager: false,
    },
  },
});
