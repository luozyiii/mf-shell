import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import { microsystemManager } from './src/config/microsystems';
import { getBaseMFConfig } from './shared-config';

// 从配置系统动态生成 remotes 配置
const remotes = microsystemManager.generateModuleFederationRemotes();

export default createModuleFederationConfig(
  getBaseMFConfig('shell', {
    remotes,
  })
);
