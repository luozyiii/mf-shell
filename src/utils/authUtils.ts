// 用户类型定义
interface User {
  id: string | number;
  username: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

// 存储键名常量
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
    return SafeStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * 设置token
   */
  static setToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      console.warn('Invalid token provided');
      return false;
    }
    return SafeStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * 移除token
   */
  static removeToken(): boolean {
    const results = [
      SafeStorage.removeItem(this.TOKEN_KEY),
      SafeStorage.removeItem(this.USER_KEY),
      SafeStorage.removeItem(this.PERMISSIONS_KEY),
    ];
    return results.every(result => result);
  }

  /**
   * 检查是否已登录
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token.length > 0;
  }

  /**
   * 验证 token 格式（简单验证）
   */
  static isValidToken(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return false;

    // 简单的 JWT 格式检查
    const parts = tokenToCheck.split('.');
    return parts.length === 3;
  }

  /**
   * 获取用户数据
   */
  static getUserData(): User | null {
    const userData = SafeStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      const user = JSON.parse(userData) as User;

      // 基本验证用户对象结构
      if (!user.id || !user.username) {
        console.warn('Invalid user data structure');
        this.removeUserData();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      this.removeUserData();
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
      const userStr = JSON.stringify(userData);
      const success = SafeStorage.setItem(this.USER_KEY, userStr);

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
    const success1 = SafeStorage.removeItem(this.USER_KEY);
    const success2 = SafeStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
    return success1 && success2;
  }

  /**
   * 获取权限数据
   */
  static getPermissions(): Record<string, unknown> | null {
    const permissions = SafeStorage.getItem(this.PERMISSIONS_KEY);
    if (!permissions) return null;

    try {
      return JSON.parse(permissions) as Record<string, unknown>;
    } catch (error) {
      console.error('Failed to parse permissions data:', error);
      this.removePermissions();
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
      return SafeStorage.setItem(
        this.PERMISSIONS_KEY,
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
    return SafeStorage.removeItem(this.PERMISSIONS_KEY);
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
    return this.isAuthenticated() && !!this.getUserData();
  }

  /**
   * 跳转到登录页面
   * @param returnUrl 登录成功后的回调地址
   */
  static redirectToLogin(returnUrl?: string): void {
    const currentUrl = returnUrl || window.location.href;
    // 跳转到主应用登录页面
    window.location.href = `http://localhost:3000/login?returnUrl=${encodeURIComponent(currentUrl)}`;
  }

  /**
   * 退出登录
   */
  static logout(): void {
    this.removeToken();
    // 跳转到主应用登录页面，携带当前页面作为回调地址
    const currentUrl = window.location.href;
    window.location.href = `http://localhost:3000/login?returnUrl=${encodeURIComponent(currentUrl)}`;
  }

  /**
   * 检查token是否过期（简单实现）
   */
  static isTokenExpired(): boolean {
    const token = this.getToken();
    return !token || !this.isValidToken(token);
  }

  /**
   * 清除所有认证信息
   */
  static clearAll(): boolean {
    const results = [
      SafeStorage.removeItem(this.TOKEN_KEY),
      SafeStorage.removeItem(this.USER_KEY),
      SafeStorage.removeItem(this.PERMISSIONS_KEY),
      SafeStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      SafeStorage.removeItem(STORAGE_KEYS.LAST_LOGIN),
    ];

    return results.every(result => result);
  }

  /**
   * 获取存储使用情况（调试用）
   */
  static getStorageInfo(): { [key: string]: string | null } {
    return {
      token: this.isAuthenticated() ? '[PRESENT]' : null,
      userData: this.getUserData() ? '[PRESENT]' : null,
      permissions: this.getPermissions() ? '[PRESENT]' : null,
      lastLogin: SafeStorage.getItem(STORAGE_KEYS.LAST_LOGIN),
    };
  }
}
