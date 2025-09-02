import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 导入全局存储
async function initGlobalStore() {
  try {
    // 动态导入 mf-shared 的存储模块
    const { initGlobalStore, setStoreValue, configureStoreStrategy } = await import(
      'mf-shared/store'
    );

    // 初始化全局存储（聚合）
    initGlobalStore({
      enablePersistence: true,
      enableEncryption: true,
      storageKey: 'mf-shell-store',
    });
    // 兼容迁移：如果检测到旧容器 mf-global-store 存在但当前容器为空，尝试从旧容器读出四大键迁移
    try {
      const win: any = window as any;
      if (win?.localStorage) {
        const readOld = (k: string) => {
          const raw = localStorage.getItem(`mf-global-store:${k}`) || '';
          try {
            return JSON.parse(raw);
          } catch {
            return undefined;
          }
        };
        const toMigrate = ['user', 'app', 'permissions', 'token'];
        for (const s of toMigrate) {
          // 仅当新容器中该键为空时迁移
          const newRaw = localStorage.getItem(`mf-shell-store:${s}`);
          if (!newRaw) {
            const oldVal = readOld(s);
            if (oldVal !== undefined && oldVal !== null) {
              try {
                setStoreValue(s, oldVal);
              } catch {}
            }
          }
        }
      }
    } catch {}

    // 配置细粒度存储策略（简化键）
    configureStoreStrategy('user', { medium: 'local', encrypted: true });
    configureStoreStrategy('token', { medium: 'local', encrypted: false });
    configureStoreStrategy('app', { medium: 'local', encrypted: false });
    configureStoreStrategy('permissions', {
      medium: 'local',
      encrypted: false,
    });

    // 示例：初始化默认 app（不初始化用户信息/令牌）
    setStoreValue('app', {
      theme: 'light',
      language: 'zh-CN',
      version: '1.0.0',
    });

    console.log('🗄️ Global Store initialized successfully');
  } catch (error) {
    console.error('Failed to initialize global store:', error);
  }
}

// 初始化模块联邦共享作用域
async function initModuleFederation() {
  // 确保 webpack 共享作用域存在
  if (typeof (window as any).__webpack_share_scopes__ === 'undefined') {
    (window as any).__webpack_share_scopes__ = {};
  }

  // 初始化默认作用域
  if (!(window as any).__webpack_share_scopes__.default) {
    (window as any).__webpack_share_scopes__.default = {};
  }

  console.log('🔧 Module Federation initialized:', (window as any).__webpack_share_scopes__);
}

// 启动应用
async function startApp() {
  try {
    await initModuleFederation();
    await initGlobalStore();

    const rootEl = document.getElementById('root');
    if (rootEl) {
      const root = ReactDOM.createRoot(rootEl);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }
  } catch (error) {
    console.error('Failed to start app:', error);
  }
}

startApp();
