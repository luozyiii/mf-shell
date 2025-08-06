import { useAuth } from '../contexts/AuthContext';
import { AppPermissionType, UserRoleType } from '../types/microsystem';
import { Permissions, UserRole } from '../types/auth';

export const usePermissions = (): {
  // eslint-disable-next-line no-unused-vars
  hasAppAccess: (_app: AppPermissionType) => boolean;
  isAdmin: () => boolean;
  // eslint-disable-next-line no-unused-vars
  hasRole: (_role: UserRoleType) => boolean;
  permissions: Permissions | null;
} => {
  const { permissions, user } = useAuth();

  const hasAppAccess = (_app: AppPermissionType): boolean => {
    // 特殊处理模板系统 - 所有登录用户都可以访问
    if (_app === 'template') {
      return true;
    }

    // 其他应用默认拒绝访问
    return false;
  };

  const isAdmin = (): boolean => {
    return user?.roles.includes(UserRole.ADMIN) || false;
  };

  const hasRole = (role: UserRoleType): boolean => {
    return user?.roles.includes(role as UserRole) || false;
  };

  return {
    hasAppAccess,
    isAdmin,
    hasRole,
    permissions,
  };
};
