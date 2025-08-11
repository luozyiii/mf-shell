import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import { LayoutSkeleton } from './components/LayoutSkeleton';
import { ModuleFederationLoader } from './components/ModuleFederationLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
// import PerformanceDevTools from './components/PerformanceDevTools';
import { useDynamicRoutes } from './components/DynamicRoutes';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';

import './utils/configValidator'; // 自动执行配置验证
import './App.css';

// 初始化监控工具
import './utils/performanceMonitor';
import './utils/errorMonitor';
import './utils/networkMonitor';

// GitHub Pages 路由基础路径
const basename: string =
  process.env['NODE_ENV'] === 'production' ? '/mf-shell' : '';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, isInitializing } = useAuth();
  const { isLoading: routesLoading, getAllDynamicRoutes } = useDynamicRoutes();

  // GitHub Pages SPA 路由支持
  useEffect(() => {
    // 检查是否有从 404.html 重定向的路径
    const search = window.location.search;
    if (search.includes('/?/')) {
      const redirectPath = search.replace('/?/', '/').replace(/&/g, '&');
      window.history.replaceState(null, '', redirectPath as string);
    }
  }, []);

  if (isInitializing) {
    return <LayoutSkeleton />;
  }

  if (isLoading && isAuthenticated) {
    return <LayoutSkeleton />;
  }

  // 获取所有动态路由
  const dynamicRoutes = getAllDynamicRoutes();

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 动态微前端路由 - 根据配置自动生成 */}
        {!routesLoading &&
          dynamicRoutes.map(({ microsystem, routeConfig }) => (
            <Route
              key={routeConfig.path}
              path={routeConfig.path}
              element={
                <ProtectedRoute requiredApp={microsystem.name}>
                  <Layout>
                    <ModuleFederationLoader
                      name={microsystem.name}
                      componentName={routeConfig.component}
                    />
                  </Layout>
                </ProtectedRoute>
              }
            />
          ))}

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* 404 页面 - 必须放在最后 */}
        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ConfigProvider locale={zhCN}>
          <AuthProvider>
            <AppContent />
            {/* 性能监控开发工具 - 仅在开发环境显示 */}
            {/* <PerformanceDevTools /> */}
          </AuthProvider>
        </ConfigProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
