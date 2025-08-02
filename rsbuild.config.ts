import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import moduleFederationConfig from './module-federation.config';

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig)],
  server: {
    port: 3000,
  },
  output: {
    // GitHub Pages 部署配置
    assetPrefix: process.env.NODE_ENV === 'production'
      ? '/mf-shell/' // 仓库名
      : '/',
  },
  html: {
    title: '微前端主应用',
  },
});
