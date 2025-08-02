import React from 'react';
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
import './App.css';

const AppContent: React.FC = () => {
  const { isInitializing, isAuthenticated, isLoading } = useAuth();

  // 在初始化阶段显示骨架屏
  if (isInitializing) {
    return <LayoutSkeleton />;
  }

  // 如果还在加载中且用户已认证，继续显示骨架屏（静默验证）
  if (isLoading && isAuthenticated) {
    return <LayoutSkeleton />;
  }

  return (
    <Router>
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
          <Route
            path="/marketing/*"
            element={
              <ProtectedRoute requiredApp="marketing">
                <Layout>
                  <MicroFrontendLoader
                    name="marketing"
                    host="http://localhost:3001"
                  />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/*"
            element={
              <ProtectedRoute requiredApp="finance">
                <Layout>
                  <MicroFrontendLoader
                    name="finance"
                    host="http://localhost:3002"
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
