import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { AppPermissionType, UserRoleType } from '../types/microsystem';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredApp?: AppPermissionType;
  requiredRole?: UserRoleType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredApp,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAppAccess, hasRole } = usePermissions();

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
    return <Navigate to="/login" replace />;
  }

  // 检查应用权限
  if (requiredApp && !hasAppAccess(requiredApp)) {
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
  if (requiredRole && !hasRole(requiredRole)) {
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
