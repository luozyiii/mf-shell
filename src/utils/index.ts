// 工具函数集合

/**
 * 存储操作结果接口
 */
interface StorageResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 存储配置接口
 */
interface StorageConfig {
  prefix?: string;
  expiration?: number; // 过期时间（毫秒）
  compress?: boolean;
}

/**
 * 增强版本地存储工具类
 */
export class StorageUtil {
  private static readonly DEFAULT_PREFIX = 'mf_shell_';
  private static readonly EXPIRATION_KEY_SUFFIX = '_exp';

  /**
   * 设置本地存储（增强版）
   */
  static setItem<T>(
    key: string,
    value: T,
    config: StorageConfig = {}
  ): StorageResult<T> {
    try {
      const { prefix = this.DEFAULT_PREFIX, expiration } = config;
      const fullKey = prefix + key;

      // 准备存储数据
      const storageData = {
        value,
        timestamp: Date.now(),
        ...(expiration && { expiration: Date.now() + expiration }),
      };

      const serializedValue = JSON.stringify(storageData);
      localStorage.setItem(fullKey, serializedValue);

      return { success: true, data: value };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '存储失败';
      console.warn(
        `StorageUtil.setItem failed for key "${key}":`,
        errorMessage
      );
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 获取本地存储（增强版）
   */
  static getItem<T>(key: string, config: StorageConfig = {}): StorageResult<T> {
    try {
      const { prefix = this.DEFAULT_PREFIX } = config;
      const fullKey = prefix + key;
      const item = localStorage.getItem(fullKey);

      if (!item) {
        return { success: false, error: '数据不存在' };
      }

      const parsedData = JSON.parse(item);

      // 检查数据格式
      if (typeof parsedData !== 'object' || !('value' in parsedData)) {
        // 兼容旧格式数据
        return { success: true, data: parsedData as T };
      }

      // 检查过期时间
      if (parsedData.expiration && Date.now() > parsedData.expiration) {
        this.removeItem(key, config);
        return { success: false, error: '数据已过期' };
      }

      return { success: true, data: parsedData.value as T };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取失败';
      console.warn(
        `StorageUtil.getItem failed for key "${key}":`,
        errorMessage
      );
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 移除本地存储（增强版）
   */
  static removeItem(
    key: string,
    config: StorageConfig = {}
  ): StorageResult<void> {
    try {
      const { prefix = this.DEFAULT_PREFIX } = config;
      const fullKey = prefix + key;
      localStorage.removeItem(fullKey);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除失败';
      console.warn(
        `StorageUtil.removeItem failed for key "${key}":`,
        errorMessage
      );
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 检查存储项是否存在
   */
  static hasItem(key: string, config: StorageConfig = {}): boolean {
    const result = this.getItem(key, config);
    return result.success;
  }

  /**
   * 清空所有带前缀的存储项
   */
  static clear(config: StorageConfig = {}): StorageResult<number> {
    try {
      const { prefix = this.DEFAULT_PREFIX } = config;
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(prefix)
      );

      keys.forEach(key => localStorage.removeItem(key));

      return { success: true, data: keys.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '清空失败';
      console.warn('StorageUtil.clear failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 获取存储使用情况
   */
  static getStorageInfo(): {
    used: number;
    available: number;
    total: number;
    percentage: number;
  } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // 大多数浏览器的 localStorage 限制约为 5-10MB
      const total = 5 * 1024 * 1024; // 5MB
      const available = total - used;
      const percentage = (used / total) * 100;

      return { used, available, total, percentage };
    } catch {
      return { used: 0, available: 0, total: 0, percentage: 0 };
    }
  }
}

/**
 * 日期格式化选项接口
 */
interface DateFormatOptions {
  locale?: string;
  timezone?: string;
  format?: 'short' | 'medium' | 'long' | 'full';
}

/**
 * 增强版日期格式化工具
 */
export class DateUtil {
  private static readonly DEFAULT_LOCALE = 'zh-CN';
  private static readonly DEFAULT_TIMEZONE = 'Asia/Shanghai';

  /**
   * 格式化日期为中文格式
   */
  static formatToChineseDate(
    date: Date = new Date(),
    options: DateFormatOptions = {}
  ): string {
    const { locale = this.DEFAULT_LOCALE, format = 'long' } = options;

    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: this.DEFAULT_TIMEZONE,
      };

      switch (format) {
        case 'short':
          formatOptions.month = 'numeric';
          formatOptions.day = 'numeric';
          break;
        case 'medium':
          formatOptions.month = 'short';
          formatOptions.day = 'numeric';
          formatOptions.weekday = 'short';
          break;
        case 'long':
          formatOptions.month = 'long';
          formatOptions.day = 'numeric';
          formatOptions.weekday = 'long';
          break;
        case 'full':
          formatOptions.year = 'numeric';
          formatOptions.month = 'long';
          formatOptions.day = 'numeric';
          formatOptions.weekday = 'long';
          break;
      }

      return date.toLocaleDateString(locale, formatOptions);
    } catch (error) {
      console.warn('DateUtil.formatToChineseDate failed:', error);
      return date.toLocaleDateString();
    }
  }

  /**
   * 格式化时间
   */
  static formatTime(
    date: Date = new Date(),
    options: DateFormatOptions = {}
  ): string {
    const { locale = this.DEFAULT_LOCALE } = options;

    try {
      return date.toLocaleTimeString(locale, {
        timeZone: this.DEFAULT_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      console.warn('DateUtil.formatTime failed:', error);
      return date.toLocaleTimeString();
    }
  }

  /**
   * 格式化日期时间
   */
  static formatDateTime(
    date: Date = new Date(),
    options: DateFormatOptions = {}
  ): string {
    const { locale = this.DEFAULT_LOCALE, format = 'medium' } = options;

    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: this.DEFAULT_TIMEZONE,
        year: 'numeric',
        month: format === 'short' ? 'numeric' : 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };

      if (format !== 'short') {
        formatOptions.second = '2-digit';
      }

      return date.toLocaleString(locale, formatOptions);
    } catch (error) {
      console.warn('DateUtil.formatDateTime failed:', error);
      return date.toLocaleString();
    }
  }

  /**
   * 获取相对时间（如：2小时前）
   */
  static getRelativeTime(
    date: Date,
    baseDate: Date = new Date(),
    locale: string = this.DEFAULT_LOCALE
  ): string {
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const diffInSeconds = (date.getTime() - baseDate.getTime()) / 1000;

      const intervals = [
        { unit: 'year' as const, seconds: 31536000 },
        { unit: 'month' as const, seconds: 2592000 },
        { unit: 'day' as const, seconds: 86400 },
        { unit: 'hour' as const, seconds: 3600 },
        { unit: 'minute' as const, seconds: 60 },
        { unit: 'second' as const, seconds: 1 },
      ];

      for (const interval of intervals) {
        const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
        if (count >= 1) {
          return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
        }
      }

      return rtf.format(0, 'second');
    } catch (error) {
      console.warn('DateUtil.getRelativeTime failed:', error);
      return '刚刚';
    }
  }

  /**
   * 检查日期是否有效
   */
  static isValidDate(date: unknown): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * 安全解析日期
   */
  static parseDate(input: string | number | Date): Date | null {
    try {
      const date = new Date(input);
      return this.isValidDate(date) ? date : null;
    } catch {
      return null;
    }
  }
}

/**
 * URL 工具类
 */
export class UrlUtil {
  /**
   * 安全构建 URL
   */
  static buildUrl(
    base: string,
    path: string,
    params?: Record<string, string | number>
  ): string {
    try {
      const url = new URL(path, base);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, String(value));
        });
      }

      return url.toString();
    } catch (error) {
      console.warn('UrlUtil.buildUrl failed:', error);
      return base + path;
    }
  }

  /**
   * 解析 URL 参数
   */
  static parseParams(url: string): Record<string, string> {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};

      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return params;
    } catch (error) {
      console.warn('UrlUtil.parseParams failed:', error);
      return {};
    }
  }

  /**
   * 检查 URL 是否有效
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 性能监控工具类
 */
export class PerformanceUtil {
  private static timers = new Map<string, number>();

  /**
   * 开始计时
   */
  static startTimer(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      this.timers.set(name, window.performance.now());
    } else {
      this.timers.set(name, Date.now());
    }
  }

  /**
   * 结束计时并返回耗时
   */
  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (startTime === undefined) {
      console.warn(`Timer "${name}" not found`);
      return 0;
    }

    const currentTime =
      typeof window !== 'undefined' && window.performance
        ? window.performance.now()
        : Date.now();
    const duration = currentTime - startTime;
    this.timers.delete(name);
    return duration;
  }

  /**
   * 测量函数执行时间
   */
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    this.startTimer(name);
    try {
      const result = await fn();
      const duration = this.endTimer(name);
      return { result, duration };
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  /**
   * 测量同步函数执行时间
   */
  static measure<T>(
    name: string,
    fn: () => T
  ): { result: T; duration: number } {
    this.startTimer(name);
    try {
      const result = fn();
      const duration = this.endTimer(name);
      return { result, duration };
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }
}

// 导出类型
export type { StorageResult, StorageConfig, DateFormatOptions };
