import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 导入全局存储
async function initGlobalStore() {
  try {
    // 动态导入 mf-shared 的存储模块
    // @ts-ignore - Module Federation 动态导入，运行时存在
    const { initGlobalStore, setStoreValue } = await import('mf-shared/store');

    // 初始化全局存储
    initGlobalStore({
      enablePersistence: true,
      enableEncryption: true,
      storageKey: 'mf-global-store',
    });

    // 设置一些初始数据（模拟用户信息）
    setStoreValue('userinfo', {
      name: '张三',
      age: 18,
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
    });

    setStoreValue('appConfig', {
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

  console.log(
    '🔧 Module Federation initialized:',
    (window as any).__webpack_share_scopes__
  );
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
