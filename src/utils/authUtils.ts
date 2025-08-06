// 认证相关工具类
export class AuthUtils {
  // 存储键名
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';
  private static readonly PERMISSIONS_KEY = 'permissions_data';

  /**
   * 获取token
   */
  static getToken(): string | null {
    try {
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch {
      // 静默处理错误，避免控制台输出
      return null;
    }
  }

  /**
   * 设置token
   */
  static setToken(token: string): void {
    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    } catch {
      // 静默处理错误，避免控制台输出
    }
  }

  /**
   * 移除token
   */
  static removeToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.PERMISSIONS_KEY);
    } catch {
      // 静默处理错误，避免控制台输出
    }
  }

  /**
   * 检查是否已登录
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * 获取用户数据
   */
  static getUserData(): Record<string, unknown> | null {
    try {
      const userData = sessionStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      // 静默处理错误，避免控制台输出
      return null;
    }
  }

  /**
   * 设置用户数据
   */
  static setUserData(userData: Record<string, unknown>): void {
    try {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    } catch {
      // 静默处理错误，避免控制台输出
    }
  }

  /**
   * 获取权限数据
   */
  static getPermissions(): Record<string, unknown> | null {
    try {
      const permissions = sessionStorage.getItem(this.PERMISSIONS_KEY);
      return permissions ? JSON.parse(permissions) : null;
    } catch {
      // 静默处理错误，避免控制台输出
      return null;
    }
  }

  /**
   * 设置权限数据
   */
  static setPermissions(permissions: Record<string, unknown>): void {
    try {
      sessionStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));
    } catch {
      // 静默处理错误，避免控制台输出
    }
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
    return !token;
  }
}
