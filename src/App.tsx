import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import { LayoutSkeleton } from './components/LayoutSkeleton';
import { ModuleFederationLoader } from './components/ModuleFederationLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';

import './utils/configValidator'; // 自动执行配置验证
import './App.css';

// GitHub Pages 路由基础路径
const basename: string =
  process.env['NODE_ENV'] === 'production' ? '/mf-shell' : '';

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

        {/* Template 模块联邦路由 */}
        <Route
          path="/template/dashboard"
          element={
            <ProtectedRoute requiredApp="template">
              <Layout>
                <ModuleFederationLoader
                  name="template"
                  componentName="Dashboard"
                />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/template/feature1"
          element={
            <ProtectedRoute requiredApp="template">
              <Layout>
                <ModuleFederationLoader
                  name="template"
                  componentName="Feature1"
                />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/template/feature2"
          element={
            <ProtectedRoute requiredApp="template">
              <Layout>
                <ModuleFederationLoader
                  name="template"
                  componentName="Feature2"
                />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/template/settings"
          element={
            <ProtectedRoute requiredApp="template">
              <Layout>
                <ModuleFederationLoader
                  name="template"
                  componentName="Settings"
                />
              </Layout>
            </ProtectedRoute>
          }
        />

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
      <ConfigProvider locale={zhCN}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
