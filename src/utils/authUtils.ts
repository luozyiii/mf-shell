// 用户类型定义
interface User {
  id: string | number;
  username: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

// @ts-expect-error - MF runtime
import { clearAppData } from 'mf-shared/store';
import { getVal, setVal } from '../store/keys';

// 认证相关工具类
export class AuthUtils {
  /**
   * 获取token
   */
  static getToken(): string | null {
    try {
      // 从 globalStore 读取
      return getVal('token') || null;
    } catch (error) {
      console.warn('Failed to get token:', error);
      return null;
    }
  }

  /**
   * 设置token
   */
  static setToken(token: string): void {
    try {
      setVal('token', token);
    } catch (error) {
      console.warn('Failed to set token:', error);
    }
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
    try {
      return getVal('user');
    } catch (error) {
      console.warn('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * 设置用户数据
   */
  static setUserData(userData: User): void {
    try {
      setVal('user', userData);
    } catch (error) {
      console.warn('Failed to set user data:', error);
    }
  }

  /**
   * 获取权限数据
   */
  static getPermissions(): any {
    try {
      return getVal('permissions');
    } catch (error) {
      console.warn('Failed to get permissions:', error);
      return null;
    }
  }

  /**
   * 设置权限数据
   */
  static setPermissions(permissions: any): void {
    try {
      setVal('permissions', permissions);
    } catch (error) {
      console.warn('Failed to set permissions:', error);
    }
  }

  /**
   * 退出登录 - 仅清理数据，不处理页面导航
   * 调用者需要自行处理导航到登录页面
   */
  static logout(): void {
    try {
      // 获取当前应用的存储键名
      const storageKey =
        (window as any)?.globalStore?.options?.storageKey || 'mf-shell-store';

      // 使用新的 clearAppData 方法清理所有应用数据
      clearAppData(storageKey);
    } catch (error) {
      console.warn('Failed to logout:', error);
    }
  }

  /**
   * 检查token是否过期（简单实现）
   */
  static isTokenExpired(): boolean {
    const token = AuthUtils.getToken();
    return !token;
  }
}
