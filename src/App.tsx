import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type React from 'react';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import { LayoutSkeleton } from './components/LayoutSkeleton';
import { LazyMicroFrontend } from './components/LazyMicroFrontend';
import { ProtectedRoute } from './components/ProtectedRoute';
import { configManager } from './config';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

// 微前端包装组件，用于获取当前路径
const MicroFrontendWrapper: React.FC<{
  appName: string;
  displayName: string;
}> = ({ appName, displayName }) => {
  const location = useLocation();
  return (
    <LazyMicroFrontend
      appName={appName}
      pathname={location.pathname}
      displayName={displayName}
    />
  );
};

import './App.css';

// GitHub Pages 路由基础路径
const basename: string =
  process.env.NODE_ENV === 'production' ? '/mf-shell' : '';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, isInitializing } = useAuth();

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

        {/* 动态微前端路由 */}
        {configManager.getEnabledMicroFrontends().map((mf) => (
          <Route
            key={mf.name}
            path={`/${mf.name}/*`}
            element={
              <ProtectedRoute>
                <Layout>
                  <MicroFrontendWrapper
                    appName={mf.name}
                    displayName={mf.displayName}
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
