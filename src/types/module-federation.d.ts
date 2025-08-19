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

declare module 'mf-shared/store' {
  export type StorageStrategy = {
    medium: 'memory' | 'local' | 'session';
    encrypted?: boolean;
  };
  export function initGlobalStore(options?: any): void;
  export function setStoreValue(key: string, value: any, callback?: any): void;
  export function getStoreValue<T = any>(key: string): T | undefined;
  export function subscribeStore(
    key: string,
    callback: (key: string, newVal: any, oldVal?: any) => void
  ): () => void;
  export function unsubscribeStore(key: string, callback: any): void;
  export function clearStore(): void;
  export function configureStoreStrategy(
    keyOrPrefix: string,
    strategy: StorageStrategy
  ): void;
  export function clearStoreByPrefix(prefix: string): void;
  const _default: any;
  export default _default;
}

// 扩展 Window 接口，添加调试工具
declare global {
  interface Window {
    __MF_CACHE_STATS__?: () => any;
    __MF_CLEAR_CACHE__?: () => void;
    __MF_PATH_CACHE__?: Map<string, string>;
  }
}

// 允许 TS 认识动态 import('mf-shared/store')
declare const __MF_SHARED_STORE__: any;
