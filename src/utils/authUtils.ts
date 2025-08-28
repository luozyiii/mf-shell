// @ts-expect-error - MF runtime
import { clearAppData } from 'mf-shared/store';
import { getVal, setVal } from '../store/keys';
import type { User } from '../types/auth';
import { ErrorHandler } from './errorHandler';

// 认证相关工具类
export class AuthUtils {
  /**
   * 获取token
   */
  static getToken(): string | null {
    return ErrorHandler.safeExecute(
      () => getVal('token') || null,
      null,
      'Failed to get token'
    );
  }

  /**
   * 设置token
   */
  static setToken(token: string): void {
    ErrorHandler.safeCall(() => setVal('token', token), 'Failed to set token');
  }

  /**
   * 检查是否已登录
   */
  static isAuthenticated(): boolean {
    const token = AuthUtils.getToken();
    return !!token;
  }

  /**
   * 获取用户数据
   */
  static getUserData(): User | null {
    return ErrorHandler.safeExecute(
      () => getVal('user'),
      null,
      'Failed to get user data'
    );
  }

  /**
   * 设置用户数据
   */
  static setUserData(userData: User): void {
    ErrorHandler.safeCall(
      () => setVal('user', userData),
      'Failed to set user data'
    );
  }

  /**
   * 获取权限数据
   */
  static getPermissions(): any {
    return ErrorHandler.safeExecute(
      () => getVal('permissions'),
      null,
      'Failed to get permissions'
    );
  }

  /**
   * 设置权限数据
   */
  static setPermissions(permissions: any): void {
    ErrorHandler.safeCall(
      () => setVal('permissions', permissions),
      'Failed to set permissions'
    );
  }

  /**
   * 退出登录 - 仅清理数据，不处理页面导航
   * 调用者需要自行处理导航到登录页面
   */
  static logout(): void {
    ErrorHandler.safeCall(() => {
      // 获取当前应用的存储键名
      const storageKey =
        (window as any)?.globalStore?.options?.storageKey || 'mf-shell-store';

      // 使用新的 clearAppData 方法清理所有应用数据
      clearAppData(storageKey);
    }, 'Failed to logout');
  }

  /**
   * 检查token是否过期（简单实现）
   */
  static isTokenExpired(): boolean {
    const token = AuthUtils.getToken();
    return !token;
  }
}
