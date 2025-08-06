/// <reference types="@rsbuild/core/types" />
/// <reference types="react" />

import type { ComponentType } from 'react';

// Module Federation 类型声明
declare const __webpack_init_sharing__: () => Promise<void>;
declare const __webpack_share_scopes__: {
  default: Record<string, unknown>;
};

// 远程容器类型
interface RemoteContainer {
  init(): Promise<void>;
  get(): Promise<() => unknown>;
}

declare global {
  interface Window {
    [key: string]: RemoteContainer | unknown;
  }
}

// 模块联邦远程模块声明
declare module 'template/Dashboard' {
  const Dashboard: ComponentType<Record<string, unknown>>;
  export default Dashboard;
}

declare module 'template/Feature1' {
  const Feature1: ComponentType<Record<string, unknown>>;
  export default Feature1;
}

declare module 'template/Feature2' {
  const Feature2: ComponentType<Record<string, unknown>>;
  export default Feature2;
}

declare module 'template/Settings' {
  const Settings: ComponentType<Record<string, unknown>>;
  export default Settings;
}

declare module 'template/routes' {
  const routes: Record<string, unknown>;
  export default routes;
}
