import { useAuth } from '../contexts/AuthContext';
import { AppPermissionType, UserRoleType } from '../types/microsystem';
import { AppPermission } from '../types/auth';

export const usePermissions = () => {
  const { permissions, user } = useAuth();

  const hasAppAccess = (app: AppPermissionType): boolean => {
    // 特殊处理模板系统 - 所有登录用户都可以访问
    if (app === 'template') {
      return true;
    }

    // 原有的权限检查逻辑
    if (app === 'marketing' || app === 'finance') {
      return permissions?.[app as keyof typeof permissions] || false;
    }

    // 其他应用默认拒绝访问
    return false;
  };

  const isAdmin = (): boolean => {
    return user?.roles.includes('admin') || false;
  };

  const hasRole = (role: UserRoleType): boolean => {
    return user?.roles.includes(role as any) || false;
  };

  return {
    hasAppAccess,
    isAdmin,
    hasRole,
    permissions
  };
};
