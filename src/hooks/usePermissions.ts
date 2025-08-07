import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppPermission, UserRole } from '../types/auth';

// 权限检查结果接口
interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  requiredRole?: UserRole;
  requiredPermission?: AppPermission;
}

// 权限管理 Hook（增强版）
export const usePermissions = () => {
  const { user, permissions, isAuthenticated } = useAuth();

  // 检查是否有特定应用权限（增强版）
  const hasAppAccess = useCallback(
    (app: AppPermission): PermissionCheckResult => {
      if (!isAuthenticated) {
        return {
          hasPermission: false,
          reason: '用户未登录',
          requiredPermission: app,
        };
      }

      if (!user) {
        return {
          hasPermission: false,
          reason: '用户信息不存在',
          requiredPermission: app,
        };
      }

      if (!permissions) {
        return {
          hasPermission: false,
          reason: '权限信息不存在',
          requiredPermission: app,
        };
      }

      // 管理员拥有所有权限
      if (user.role === UserRole.ADMIN) {
        return { hasPermission: true };
      }

      // 检查具体权限
      const hasPermission = permissions[app] === true;
      return {
        hasPermission,
        reason: hasPermission ? undefined : `缺少 ${app} 权限`,
        requiredPermission: app,
      };
    },
    [user, permissions, isAuthenticated]
  );

  // 简化的权限检查（向后兼容）
  const hasAppPermission = useCallback(
    (app: AppPermission): boolean => {
      return hasAppAccess(app).hasPermission;
    },
    [hasAppAccess]
  );

  // 检查是否有管理员权限
  const isAdmin = useMemo(() => {
    return (
      user?.role === UserRole.ADMIN ||
      user?.roles?.includes(UserRole.ADMIN) ||
      false
    );
  }, [user]);

  // 检查是否有开发者权限
  const isDeveloper = useMemo(() => {
    if (!user) return false;
    return (
      user.role === UserRole.DEVELOPER ||
      user.role === UserRole.ADMIN ||
      user.roles?.includes(UserRole.DEVELOPER) ||
      user.roles?.includes(UserRole.ADMIN) ||
      false
    );
  }, [user]);

  // 检查是否有特定角色（增强版）
  const hasRole = useCallback(
    (role: UserRole): PermissionCheckResult => {
      if (!isAuthenticated) {
        return {
          hasPermission: false,
          reason: '用户未登录',
          requiredRole: role,
        };
      }

      if (!user) {
        return {
          hasPermission: false,
          reason: '用户信息不存在',
          requiredRole: role,
        };
      }

      const hasPermission =
        user.roles?.includes(role) || user.role === role || false;
      return {
        hasPermission,
        reason: hasPermission ? undefined : `缺少 ${role} 角色`,
        requiredRole: role,
      };
    },
    [user, isAuthenticated]
  );

  // 简化的角色检查（向后兼容）
  const hasRoleSimple = useCallback(
    (role: UserRole): boolean => {
      return hasRole(role).hasPermission;
    },
    [hasRole]
  );

  // 检查是否有任意一个角色
  const hasAnyRole = useCallback(
    (roles: UserRole[]): PermissionCheckResult => {
      if (!isAuthenticated) {
        return {
          hasPermission: false,
          reason: '用户未登录',
        };
      }

      if (!user) {
        return {
          hasPermission: false,
          reason: '用户信息不存在',
        };
      }

      if (roles.length === 0) {
        return {
          hasPermission: true,
          reason: '无角色要求',
        };
      }

      const hasPermission = roles.some(role => hasRoleSimple(role));
      return {
        hasPermission,
        reason: hasPermission
          ? undefined
          : `需要以下任一角色: ${roles.join(', ')}`,
      };
    },
    [user, isAuthenticated, hasRoleSimple]
  );

  // 检查是否有所有角色
  const hasAllRoles = useCallback(
    (roles: UserRole[]): PermissionCheckResult => {
      if (!isAuthenticated) {
        return {
          hasPermission: false,
          reason: '用户未登录',
        };
      }

      if (!user) {
        return {
          hasPermission: false,
          reason: '用户信息不存在',
        };
      }

      if (roles.length === 0) {
        return {
          hasPermission: true,
          reason: '无角色要求',
        };
      }

      const missingRoles = roles.filter(role => !hasRoleSimple(role));
      const hasPermission = missingRoles.length === 0;

      return {
        hasPermission,
        reason: hasPermission
          ? undefined
          : `缺少以下角色: ${missingRoles.join(', ')}`,
      };
    },
    [user, isAuthenticated, hasRoleSimple]
  );

  // 检查复合权限（角色 + 应用权限）
  const hasComplexPermission = useCallback(
    (
      requiredRoles: UserRole[],
      requiredApps: AppPermission[]
    ): PermissionCheckResult => {
      // 检查角色权限
      const roleCheck = hasAnyRole(requiredRoles);
      if (!roleCheck.hasPermission) {
        return roleCheck;
      }

      // 检查应用权限
      for (const app of requiredApps) {
        const appCheck = hasAppAccess(app);
        if (!appCheck.hasPermission) {
          return appCheck;
        }
      }

      return { hasPermission: true };
    },
    [hasAnyRole, hasAppAccess]
  );

  // 获取用户所有权限信息
  const getUserPermissionSummary = useMemo(() => {
    if (!user || !permissions) {
      return {
        isAuthenticated: false,
        roles: [],
        permissions: {},
        isAdmin: false,
        isDeveloper: false,
      };
    }

    return {
      isAuthenticated: true,
      roles: user.roles || [user.role].filter(Boolean),
      permissions,
      isAdmin,
      isDeveloper,
      userId: user.id,
      username: user.username,
    };
  }, [user, permissions, isAdmin, isDeveloper]);

  // 权限调试信息（仅开发环境）
  const getDebugInfo = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    return {
      user: user
        ? {
            id: user.id,
            username: user.username,
            role: user.role,
            roles: user.roles,
          }
        : null,
      permissions,
      isAuthenticated,
      isAdmin,
      isDeveloper,
      timestamp: new Date().toISOString(),
    };
  }, [user, permissions, isAuthenticated, isAdmin, isDeveloper]);

  return {
    // 增强版权限检查方法
    hasAppAccess,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasComplexPermission,

    // 简化版权限检查方法（向后兼容）
    hasAppPermission,
    hasRoleSimple,

    // 便捷属性
    isAdmin,
    isDeveloper,
    isAuthenticated,

    // 用户和权限信息
    user,
    permissions,
    getUserPermissionSummary,

    // 调试工具
    getDebugInfo,
  };
};

// 导出权限检查结果类型
export type { PermissionCheckResult };
