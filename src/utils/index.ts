// 工具函数集合
// 注意：存储功能已迁移到 mf-shared/store，请使用全局存储系统

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
    const { locale = DateUtil.DEFAULT_LOCALE, format = 'long' } = options;

    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: DateUtil.DEFAULT_TIMEZONE,
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
    const { locale = DateUtil.DEFAULT_LOCALE } = options;

    try {
      return date.toLocaleTimeString(locale, {
        timeZone: DateUtil.DEFAULT_TIMEZONE,
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
    const { locale = DateUtil.DEFAULT_LOCALE, format = 'medium' } = options;

    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: DateUtil.DEFAULT_TIMEZONE,
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
    locale: string = DateUtil.DEFAULT_LOCALE
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
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  /**
   * 安全解析日期
   */
  static parseDate(input: string | number | Date): Date | null {
    try {
      const date = new Date(input);
      return DateUtil.isValidDate(date) ? date : null;
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
   * 开始计时（支持浏览器性能标记）
   */
  static startTimer(name: string, usePerformanceMark = false): void {
    if (typeof window !== 'undefined' && window.performance) {
      if (usePerformanceMark) {
        // 使用浏览器性能标记，便于开发者工具分析
        window.performance.mark(`${name}-start`);
      }
      PerformanceUtil.timers.set(name, window.performance.now());
    } else {
      PerformanceUtil.timers.set(name, Date.now());
    }
  }

  /**
   * 结束计时并返回耗时（支持浏览器性能测量）
   */
  static endTimer(name: string, usePerformanceMark = false): number {
    const startTime = PerformanceUtil.timers.get(name);
    if (startTime === undefined) {
      console.warn(`Timer "${name}" not found`);
      return 0;
    }

    const currentTime =
      typeof window !== 'undefined' && window.performance
        ? window.performance.now()
        : Date.now();
    const duration = currentTime - startTime;

    if (
      typeof window !== 'undefined' &&
      window.performance &&
      usePerformanceMark
    ) {
      // 创建浏览器性能测量
      window.performance.mark(`${name}-end`);
      try {
        window.performance.measure(name, `${name}-start`, `${name}-end`);
      } catch (error) {
        console.warn(
          `Failed to create performance measure for "${name}":`,
          error
        );
      }
    }

    PerformanceUtil.timers.delete(name);
    return duration;
  }

  /**
   * 测量函数执行时间
   */
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    PerformanceUtil.startTimer(name);
    try {
      const result = await fn();
      const duration = PerformanceUtil.endTimer(name);
      return { result, duration };
    } catch (error) {
      PerformanceUtil.endTimer(name);
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
    PerformanceUtil.startTimer(name);
    try {
      const result = fn();
      const duration = PerformanceUtil.endTimer(name);
      return { result, duration };
    } catch (error) {
      PerformanceUtil.endTimer(name);
      throw error;
    }
  }
}

/**
 * 滚动工具类
 */
export class ScrollUtil {
  /**
   * 获取所有可滚动的目标元素
   */
  private static getScrollTargets(): HTMLElement[] {
    const contentElement = document.querySelector(
      '.ant-layout-content'
    ) as HTMLElement;
    const mainElement = document.querySelector('main') as HTMLElement;
    const bodyElement = document.body;
    const htmlElement = document.documentElement;

    return [contentElement, mainElement, bodyElement, htmlElement].filter(
      Boolean
    );
  }

  /**
   * 滚动单个元素到顶部
   */
  private static scrollElementToTop(
    element: HTMLElement,
    smooth: boolean
  ): void {
    try {
      if (
        smooth &&
        'scrollTo' in element &&
        typeof element.scrollTo === 'function'
      ) {
        // 平滑滚动
        element.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      } else {
        // 即时滚动
        element.scrollTop = 0;
        if ('scrollLeft' in element) {
          element.scrollLeft = 0;
        }
      }
    } catch (error) {
      // 降级处理
      console.warn('ScrollUtil: 元素滚动失败，使用降级方案', error);
      element.scrollTop = 0;
    }
  }

  /**
   * 滚动窗口到顶部
   */
  private static scrollWindowToTop(smooth: boolean): void {
    try {
      if (smooth && window.scrollTo) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      } else {
        window.scrollTo(0, 0);
      }
    } catch {
      // 降级处理
      window.scrollTo(0, 0);
    }
  }

  /**
   * 执行滚动到顶部操作
   * @param smooth - 是否使用平滑滚动
   * @param includeWindow - 是否包含窗口滚动
   */
  static performScrollToTop(smooth = true, includeWindow = true): void {
    // 滚动所有目标元素
    const targets = ScrollUtil.getScrollTargets();
    targets.forEach((target) => {
      if (target) {
        ScrollUtil.scrollElementToTop(target, smooth);
      }
    });

    // 滚动窗口
    if (includeWindow) {
      ScrollUtil.scrollWindowToTop(smooth);
    }
  }

  /**
   * 延迟滚动到顶部
   * @param delay - 延迟时间（毫秒）
   * @param smooth - 是否使用平滑滚动
   * @param includeWindow - 是否包含窗口滚动
   * @returns 清理函数
   */
  static delayedScrollToTop(
    delay: number,
    smooth = true,
    includeWindow = true
  ): () => void {
    const timer = setTimeout(() => {
      ScrollUtil.performScrollToTop(smooth, includeWindow);
    }, delay);

    return () => clearTimeout(timer);
  }
}

// 导出路径工具函数
export * from './pathUtils';

// 导出类型
export type { DateFormatOptions };
