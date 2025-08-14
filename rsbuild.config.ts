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
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.REACT_APP_SKIP_AUTH': JSON.stringify(
        process.env.REACT_APP_SKIP_AUTH
      ),
      // 微前端配置环境变量
      'process.env.SHELL_PORT': JSON.stringify(process.env.SHELL_PORT),
      'process.env.PUBLIC_PATH': JSON.stringify(process.env.PUBLIC_PATH),
      'process.env.TEMPLATE_NAME': JSON.stringify(process.env.TEMPLATE_NAME),
      'process.env.TEMPLATE_URL': JSON.stringify(process.env.TEMPLATE_URL),
      'process.env.TEMPLATE_PORT': JSON.stringify(process.env.TEMPLATE_PORT),
      'process.env.TEMPLATE_ENABLED': JSON.stringify(
        process.env.TEMPLATE_ENABLED
      ),
      'process.env.MARKETING_NAME': JSON.stringify(process.env.MARKETING_NAME),
      'process.env.MARKETING_URL': JSON.stringify(process.env.MARKETING_URL),
      'process.env.MARKETING_PORT': JSON.stringify(process.env.MARKETING_PORT),
      'process.env.MARKETING_ENABLED': JSON.stringify(
        process.env.MARKETING_ENABLED
      ),
      'process.env.FINANCE_NAME': JSON.stringify(process.env.FINANCE_NAME),
      'process.env.FINANCE_URL': JSON.stringify(process.env.FINANCE_URL),
      'process.env.FINANCE_PORT': JSON.stringify(process.env.FINANCE_PORT),
      'process.env.FINANCE_ENABLED': JSON.stringify(
        process.env.FINANCE_ENABLED
      ),
      // MF-Shared 配置
      'process.env.MF_SHARED_URL': JSON.stringify(
        process.env.MF_SHARED_URL || 'https://luozyiii.github.io/mf-shared/'
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
