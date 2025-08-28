import type React from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/auth';
import Layout from './Layout';
import { ProtectedRoute } from './ProtectedRoute';

interface ProtectedLayoutProps {
  children: ReactNode;
  requiredApp?: string;
  requiredRole?: UserRole;
}

/**
 * 统一的受保护布局组件
 * 将 ProtectedRoute 和 Layout 组合在一起，避免在路由配置中重复包装
 */
export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
  requiredApp,
  requiredRole,
}) => {
  return (
    <ProtectedRoute requiredApp={requiredApp} requiredRole={requiredRole}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
