import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import moduleFederationConfig from './module-federation.config';

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig)],
  server: {
    port: 3000,
  },
  source: {
    define: {
      'process.env.REACT_APP_SKIP_AUTH': JSON.stringify(
        process.env.REACT_APP_SKIP_AUTH
      ),
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(
        process.env.REACT_APP_API_BASE_URL
      ),
      'process.env.REACT_APP_ENABLE_MOCK': JSON.stringify(
        process.env.REACT_APP_ENABLE_MOCK
      ),
      'process.env.REACT_APP_DEBUG': JSON.stringify(
        process.env.REACT_APP_DEBUG
      ),
    },
    entry: {
      index: './src/index.tsx',
    },
  },
  output: {
    // GitHub Pages 部署配置
    assetPrefix:
      process.env.NODE_ENV === 'production'
        ? '/mf-shell/' // 仓库名
        : '/',
    // 复制 public 目录下的文件
    copy: [
      { from: 'public', to: '.', globOptions: { ignore: ['**/index.html'] } },
    ],
  },
  html: {
    template: './public/index.html',
    title: '微前端主应用',
  },
});
