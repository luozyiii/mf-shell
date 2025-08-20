import { Button, Result, Spin } from 'antd';
import type React from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getShellConfig } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredApp?: string;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredApp,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAppAccess, hasRole } = usePermissions();
  const location = useLocation();

  // 如果还在加载认证状态，显示加载指示器
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: '16px',
        }}
      >
        <Spin size="large" />
        <div style={{ color: '#666', fontSize: '14px' }}>正在验证身份...</div>
      </div>
    );
  }

  // 检查是否已登录
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    const { basename } = getShellConfig();
    const loginPath = basename ? `${basename}/login` : '/login';
    return <Navigate to={`${loginPath}?returnUrl=${returnUrl}`} replace />;
  }

  // 检查应用权限
  if (requiredApp && !hasAppAccess(requiredApp as any)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此应用。"
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回
          </Button>
        }
      />
    );
  }

  // 检查角色权限
  if (requiredRole && !hasRole(requiredRole as any)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};
