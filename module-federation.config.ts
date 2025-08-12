import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

// 动态生成 remotes 配置
const generateRemotes = () => {
  const isDev = process.env.NODE_ENV !== 'production';

  return {
    template: `template@http://localhost:${isDev ? '3003' : '3003'}/remoteEntry.js`,
    // 可以根据环境变量动态添加更多微前端应用
    // marketing: `marketing@http://localhost:${isDev ? '3001' : '3001'}/remoteEntry.js`,
    // finance: `finance@http://localhost:${isDev ? '3002' : '3002'}/remoteEntry.js`,
  };
};

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
