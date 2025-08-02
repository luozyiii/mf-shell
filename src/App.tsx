import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import { LayoutSkeleton } from './components/LayoutSkeleton';
import { MicroFrontendLoader } from './components/MicroFrontendLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { microsystemManager } from './config/microsystems';
import './utils/configValidator'; // 自动执行配置验证
import './App.css';

// GitHub Pages 路由基础路径
const basename = process.env.NODE_ENV === 'production' ? '/mf-shell' : '';

const AppContent: React.FC = () => {
  const { isInitializing, isAuthenticated, isLoading } = useAuth();

  // GitHub Pages SPA 路由支持
  useEffect(() => {
    // 检查是否有从 404.html 重定向的路径
    const search = window.location.search;
    if (search.includes('/?/')) {
      const redirectPath = search.replace('/?/', '/').replace(/&/g, '&');
      window.history.replaceState(null, '', redirectPath);
    }
  }, []);

  // 在初始化阶段显示骨架屏
  if (isInitializing) {
    return <LayoutSkeleton />;
  }

  // 如果还在加载中且用户已认证，继续显示骨架屏（静默验证）
  if (isLoading && isAuthenticated) {
    return <LayoutSkeleton />;
  }

  // 动态生成微前端路由
  const generateMicrosystemRoutes = () => {
    const enabledMicrosystems = microsystemManager.getEnabledMicrosystems();

    return enabledMicrosystems.map(microsystem => (
      <Route
        key={microsystem.name}
        path={`${microsystem.route}/*`}
        element={
          <ProtectedRoute requiredApp={microsystem.name}>
            <Layout>
              <MicroFrontendLoader
                name={microsystem.name}
                host={microsystem.host}
              />
            </Layout>
          </ProtectedRoute>
        }
      />
    ));
  };

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

          {/* 动态生成的微前端路由 */}
          {generateMicrosystemRoutes()}

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
