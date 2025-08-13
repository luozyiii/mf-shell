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

// 扩展 Window 接口，添加调试工具
declare global {
  interface Window {
    __MF_CACHE_STATS__?: () => any;
    __MF_CLEAR_CACHE__?: () => void;
    __MF_PATH_CACHE__?: Map<string, string>;
  }
}

export {};
