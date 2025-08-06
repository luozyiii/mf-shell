/// <reference types="@rsbuild/core/types" />

// Module Federation 类型声明
declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: {
  default: any;
};

// 远程容器类型
interface RemoteContainer {
  init(shareScope: any): Promise<void>;
  get(module: string): Promise<() => any>;
}

declare global {
  interface Window {
    [key: string]: RemoteContainer | any;
  }
}