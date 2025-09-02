/**
 * Module Federation 类型声明
 * 用于解决动态导入的 TypeScript 类型错误
 */

declare module 'template/Dashboard' {
  import type React from 'react';
  const Dashboard: React.ComponentType;
  export default Dashboard;
}

declare module 'template/Feature1' {
  import type React from 'react';
  const Feature1: React.ComponentType;
  export default Feature1;
}

declare module 'template/Feature2' {
  import type React from 'react';
  const Feature2: React.ComponentType;
  export default Feature2;
}

declare module 'template/Settings' {
  import type React from 'react';
  const Settings: React.ComponentType;
  export default Settings;
}

declare module 'template/App' {
  import type React from 'react';
  const App: React.ComponentType;
  export default App;
}

declare module 'template/StoreDemo' {
  import type React from 'react';
  const StoreDemo: React.ComponentType;
  export default StoreDemo;
}

declare module 'template/I18nDemo' {
  import type React from 'react';
  const I18nDemo: React.ComponentType;
  export default I18nDemo;
}

declare module 'template/routes' {
  export interface RouteConfig {
    path: string;
    component: string;
    name: string;
    icon?: string;
  }

  const routes: RouteConfig[];
  export default routes;
}

// mf-shared/store 模块类型声明
declare module 'mf-shared/store' {
  export function initGlobalStore(options?: {
    enablePersistence?: boolean;
    enableEncryption?: boolean;
    storageKey?: string;
  }): void;

  export function getStoreValue<T = any>(key: string): T | undefined;
  export function setStoreValue(key: string, value: any): void;
  export function subscribeStore(
    key: string,
    callback: (key: string, newValue: any, oldValue?: any) => void
  ): () => void;

  export function configureStoreStrategy(
    keyOrPrefix: string,
    strategy: {
      medium: 'memory' | 'local' | 'session';
      encrypted?: boolean;
    }
  ): void;

  export function clearAppData(appStorageKey: string): void;
}

// 扩展 Window 接口，添加调试工具
declare global {
  interface Window {
    __MF_CACHE_STATS__?: () => any;
    __MF_CLEAR_CACHE__?: () => void;
    __MF_PATH_CACHE__?: Map<string, string>;
    globalStore?: any;
  }
}
