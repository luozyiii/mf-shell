import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
