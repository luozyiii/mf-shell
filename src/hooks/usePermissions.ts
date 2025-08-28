import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getVal, subscribeVal } from '../store/keys';
import { type AppPermission, UserRole } from '../types/auth';

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

  // 基础认证状态检查逻辑
  const validateAuthState = useCallback((): PermissionCheckResult | null => {
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

    return null; // 认证状态正常
  }, [isAuthenticated, user]);

  // 从 globalStore 读取权限（优先）
  const [gsPermissions, setGsPermissions] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    try {
      const initial = (getVal('permissions') as Record<string, boolean>) || null;
      setGsPermissions(initial);
      const unsub = subscribeVal('permissions', (_k: string, newVal: any) => {
        setGsPermissions((newVal as Record<string, boolean>) || null);
      });
      return () => {
        try {
          unsub?.();
        } catch {}
      };
    } catch {}
  }, []);

  // 检查是否有特定应用权限（增强版）
  const hasAppAccess = useCallback(
    (app: AppPermission): PermissionCheckResult => {
      // 使用公共的认证状态检查
      const authCheck = validateAuthState();
      if (authCheck) {
        return { ...authCheck, requiredPermission: app };
      }

      const effectivePermissions = gsPermissions || permissions;
      if (!effectivePermissions) {
        return {
          hasPermission: false,
          reason: '权限信息不存在',
          requiredPermission: app,
        };
      }

      // 管理员拥有所有权限
      if (user?.role === UserRole.ADMIN) {
        return { hasPermission: true };
      }

      // 检查具体权限
      const hasPermission = effectivePermissions[app] === true;
      return {
        hasPermission,
        reason: hasPermission ? undefined : `缺少 ${app} 权限`,
        requiredPermission: app,
      };
    },
    [user, permissions, gsPermissions, validateAuthState]
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
    return user?.role === UserRole.ADMIN || user?.permissions?.includes(UserRole.ADMIN) || false;
  }, [user]);

  // 检查是否有开发者权限
  const isDeveloper = useMemo(() => {
    if (!user) return false;
    return (
      user.role === UserRole.DEVELOPER ||
      user.role === UserRole.ADMIN ||
      user.permissions?.includes(UserRole.DEVELOPER) ||
      user.permissions?.includes(UserRole.ADMIN) ||
      false
    );
  }, [user]);

  // 检查是否有特定角色（增强版）
  const hasRole = useCallback(
    (role: UserRole): PermissionCheckResult => {
      // 使用公共的认证状态检查
      const authCheck = validateAuthState();
      if (authCheck) {
        return { ...authCheck, requiredRole: role };
      }

      const hasPermission = user?.permissions?.includes(role) || user?.role === role || false;
      return {
        hasPermission,
        reason: hasPermission ? undefined : `缺少 ${role} 角色`,
        requiredRole: role,
      };
    },
    [user, validateAuthState]
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
    (permissions: UserRole[]): PermissionCheckResult => {
      // 使用公共的认证状态检查
      const authCheck = validateAuthState();
      if (authCheck) {
        return authCheck;
      }

      if (permissions.length === 0) {
        return {
          hasPermission: true,
          reason: '无角色要求',
        };
      }

      const hasPermission = permissions.some((role) => hasRoleSimple(role));
      return {
        hasPermission,
        reason: hasPermission ? undefined : `需要以下任一角色: ${permissions.join(', ')}`,
      };
    },
    [hasRoleSimple, validateAuthState]
  );

  // 检查是否有所有角色
  const hasAllRoles = useCallback(
    (permissions: UserRole[]): PermissionCheckResult => {
      // 使用公共的认证状态检查
      const authCheck = validateAuthState();
      if (authCheck) {
        return authCheck;
      }

      if (permissions.length === 0) {
        return {
          hasPermission: true,
          reason: '无角色要求',
        };
      }

      const missingRoles = permissions.filter((role) => !hasRoleSimple(role));
      const hasPermission = missingRoles.length === 0;

      return {
        hasPermission,
        reason: hasPermission ? undefined : `缺少以下角色: ${missingRoles.join(', ')}`,
      };
    },
    [hasRoleSimple, validateAuthState]
  );

  // 检查复合权限（角色 + 应用权限）
  const hasComplexPermission = useCallback(
    (requiredRoles: UserRole[], requiredApps: AppPermission[]): PermissionCheckResult => {
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
    const effectivePermissions = gsPermissions || permissions;
    if (!user || !effectivePermissions) {
      return {
        isAuthenticated: false,
        permissions: [],
        isAdmin: false,
        isDeveloper: false,
      };
    }

    return {
      isAuthenticated: true,
      permissions: user?.permissions || [user?.role].filter(Boolean),
      isAdmin,
      isDeveloper,
      userId: user.id,
      username: user.username,
    };
  }, [user, permissions, isAdmin, isDeveloper, gsPermissions]);

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
            role: user?.role,
            permissions: user.permissions,
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
