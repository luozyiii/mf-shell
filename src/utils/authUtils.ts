// 用户类型定义
interface User {
  id: string | number;
  username: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

// @ts-ignore - MF runtime
import {
  clearStoreByPrefix,
  getStoreValue,
  setStoreValue,
} from 'mf-shared/store';
import { clearByPrefix as clearShortKeys } from '../store/keys';

// 存储键名常量（兼容旧逻辑）
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  PERMISSIONS_DATA: 'permissions_data',
  REFRESH_TOKEN: 'refresh_token',
  LAST_LOGIN: 'last_login',
} as const;

// 安全的 sessionStorage 操作
class SafeStorage {
  static setItem(key: string, value: string): boolean {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to set sessionStorage item:', error);
      return false;
    }
  }

  static getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get sessionStorage item:', error);
      return null;
    }
  }

  static removeItem(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove sessionStorage item:', error);
      return false;
    }
  }

  static clear(): boolean {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
      return false;
    }
  }
}

// 认证相关工具类
export class AuthUtils {
  // 存储键名
  private static readonly TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;
  private static readonly USER_KEY = STORAGE_KEYS.USER_DATA;
  private static readonly PERMISSIONS_KEY = STORAGE_KEYS.PERMISSIONS_DATA;

  /**
   * 获取token
   */
  static getToken(): string | null {
    // 优先从 globalStore 获取
    try {
      const v = getStoreValue<string>('token');
      if (v) return v;
    } catch {}
    // 兼容旧逻辑
    return SafeStorage.getItem(AuthUtils.TOKEN_KEY);
  }

  /**
   * 设置token
   */
  static setToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      console.warn('Invalid token provided');
      return false;
    }
    try {
      // 同步写入 globalStore（简化键）
      setStoreValue('token', token);
    } catch {}
    return SafeStorage.setItem(AuthUtils.TOKEN_KEY, token);
  }

  /**
   * 移除token
   */
  static removeToken(): boolean {
    try {
      // 清理旧命名空间（mf-shell-*）
      clearStoreByPrefix('mf-shell-');
      // 清理现行简化键（容器内前缀为空，调用短键清理逻辑）
      clearShortKeys();
      // 物理删除 per-key 持久化条目（localStorage/sessionStorage）
      const win: any = window as any;
      const containers = [
        win?.globalStore?.options?.storageKey || 'mf-shell-store',
        'mf-global-store',
      ];
      const legacyPrefixes = ['mf-shell-', 'g:sh:'];
      const legacyKeys = [
        'mf-shell-appconfig',
        'mf-shell-userinfo',
        'mf-shell-permissions',
        'mf-shell-token',
      ];
      const simpleKeys = ['user', 'app', 'permissions', 'token'];
      containers.forEach((container) => {
        try {
          // 删除显式的简化键
          simpleKeys.forEach((k) => {
            try {
              localStorage.removeItem(`${container}:${k}`);
            } catch {}
            try {
              sessionStorage.removeItem(`${container}:${k}`);
            } catch {}
          });
          // 删除旧前缀项与遗留显式键
          const allKeys = Object.keys(localStorage);
          allKeys.forEach((fullKey) => {
            if (!fullKey.startsWith(`${container}:`)) return;
            const sub = fullKey.slice(container.length + 1);
            if (
              legacyPrefixes.some((p) => sub.startsWith(p)) ||
              legacyKeys.includes(sub)
            ) {
              try {
                localStorage.removeItem(fullKey);
              } catch {}
            }
          });
        } catch {}
      });
    } catch {}
    const results = [
      SafeStorage.removeItem(AuthUtils.TOKEN_KEY),
      SafeStorage.removeItem(AuthUtils.USER_KEY),
      SafeStorage.removeItem(AuthUtils.PERMISSIONS_KEY),
    ];
    return results.every((result) => result);
  }

  /**
   * 检查是否已登录
   */
  static isAuthenticated(): boolean {
    const token = AuthUtils.getToken();
    return !!token && token.length > 0;
  }

  /**
   * 验证 token 格式（简单验证）
   */
  static isValidToken(token?: string): boolean {
    const tokenToCheck = token || AuthUtils.getToken();
    if (!tokenToCheck) return false;

    // 简单的 JWT 格式检查
    const parts = tokenToCheck.split('.');
    return parts.length === 3;
  }

  /**
   * 获取用户数据
   */
  static getUserData(): User | null {
    try {
      const fromStore = getStoreValue<User>('user');
      if (fromStore) return fromStore as unknown as User;
    } catch {}

    const userData = SafeStorage.getItem(AuthUtils.USER_KEY);
    if (!userData) return null;

    try {
      const user = JSON.parse(userData) as User;

      // 基本验证用户对象结构
      if (!user.id || !user.username) {
        console.warn('Invalid user data structure');
        AuthUtils.removeUserData();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      AuthUtils.removeUserData();
      return null;
    }
  }

  /**
   * 设置用户数据
   */
  static setUserData(userData: User): boolean {
    if (!userData || typeof userData !== 'object') {
      console.warn('Invalid user data provided');
      return false;
    }

    if (!userData.id || !userData.username) {
      console.warn('User data missing required fields (id, username)');
      return false;
    }

    try {
      // 同步写入 globalStore（简化键）
      setStoreValue('user', userData as any);

      const userStr = JSON.stringify(userData);
      const success = SafeStorage.setItem(AuthUtils.USER_KEY, userStr);

      if (success) {
        // 记录最后登录时间
        SafeStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
      }

      return success;
    } catch (error) {
      console.error('Failed to serialize user data:', error);
      return false;
    }
  }

  /**
   * 移除用户数据
   */
  static removeUserData(): boolean {
    const success1 = SafeStorage.removeItem(AuthUtils.USER_KEY);
    const success2 = SafeStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
    return success1 && success2;
  }

  /**
   * 获取权限数据
   */
  static getPermissions(): Record<string, unknown> | null {
    try {
      const fromStore = getStoreValue<Record<string, unknown>>('permissions');
      if (fromStore) return fromStore;
    } catch {}

    const permissions = SafeStorage.getItem(AuthUtils.PERMISSIONS_KEY);
    if (!permissions) return null;

    try {
      return JSON.parse(permissions) as Record<string, unknown>;
    } catch (error) {
      console.error('Failed to parse permissions data:', error);
      AuthUtils.removePermissions();
      return null;
    }
  }

  /**
   * 设置权限数据
   */
  static setPermissions(permissions: Record<string, unknown>): boolean {
    if (!permissions || typeof permissions !== 'object') {
      console.warn('Invalid permissions data provided');
      return false;
    }

    try {
      setStoreValue('permissions', permissions as any);
      return SafeStorage.setItem(
        AuthUtils.PERMISSIONS_KEY,
        JSON.stringify(permissions)
      );
    } catch (error) {
      console.error('Failed to serialize permissions data:', error);
      return false;
    }
  }

  /**
   * 移除权限数据
   */
  static removePermissions(): boolean {
    return SafeStorage.removeItem(AuthUtils.PERMISSIONS_KEY);
  }

  /**
   * 获取最后登录时间
   */
  static getLastLoginTime(): Date | null {
    const lastLogin = SafeStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    if (!lastLogin) return null;

    try {
      return new Date(lastLogin);
    } catch {
      return null;
    }
  }

  /**
   * 检查用户是否完全登录（有token和用户数据）
   */
  static isFullyAuthenticated(): boolean {
    return AuthUtils.isAuthenticated() && !!AuthUtils.getUserData();
  }

  /**
   * 跳转到登录页面
   * @param returnUrl 登录成功后的回调地址
   */
  static redirectToLogin(_returnUrl?: string): void {
    // 简化登录跳转
    window.location.href = '/login';
  }

  /**
   * 退出登录
   */
  static logout(): void {
    AuthUtils.removeToken();
    // 简化登出跳转
    window.location.href = '/login';
  }

  /**
   * 检查token是否过期（简单实现）
   */
  static isTokenExpired(): boolean {
    const token = AuthUtils.getToken();
    return !token || !AuthUtils.isValidToken(token);
  }

  /**
   * 清除所有认证信息
   */
  static clearAll(): boolean {
    const results = [
      SafeStorage.removeItem(AuthUtils.TOKEN_KEY),
      SafeStorage.removeItem(AuthUtils.USER_KEY),
      SafeStorage.removeItem(AuthUtils.PERMISSIONS_KEY),
      SafeStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      SafeStorage.removeItem(STORAGE_KEYS.LAST_LOGIN),
    ];

    return results.every((result) => result);
  }

  /**
   * 获取存储使用情况（调试用）
   */
  static getStorageInfo(): { [key: string]: string | null } {
    return {
      token: AuthUtils.isAuthenticated() ? '[PRESENT]' : null,
      userData: AuthUtils.getUserData() ? '[PRESENT]' : null,
      permissions: AuthUtils.getPermissions() ? '[PRESENT]' : null,
      lastLogin: SafeStorage.getItem(STORAGE_KEYS.LAST_LOGIN),
    };
  }
}
