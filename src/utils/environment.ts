// 统一环境检查工具
export class Environment {
  /**
   * 检查是否为开发环境
   */
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * 检查是否为生产环境
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * 检查是否为测试环境
   */
  static isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  /**
   * 获取环境变量值
   */
  static getEnvVar(key: string, defaultValue: string = ''): string {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  }

  /**
   * 检查是否在浏览器环境
   */
  static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * 检查是否支持某个 API
   */
  static hasAPI(apiName: string): boolean {
    if (!Environment.isBrowser()) return false;
    return apiName in window;
  }

  /**
   * 安全获取 window 对象上的属性
   */
  static getWindowProperty<T>(property: string, defaultValue: T): T {
    if (!Environment.isBrowser()) return defaultValue;
    return (window as any)[property] || defaultValue;
  }
}
