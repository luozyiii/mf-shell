// 简化的工具函数集合
import { ErrorHandler } from './errorHandler';

/**
 * 简化的日期工具类
 */
export class DateUtil {
  private static readonly DEFAULT_LOCALE = 'zh-CN';

  /**
   * 格式化日期为中文格式
   */
  static formatToChineseDate(date: Date = new Date()): string {
    return ErrorHandler.safeExecute(
      () =>
        date.toLocaleDateString(DateUtil.DEFAULT_LOCALE, {
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        }),
      date.toLocaleDateString(),
      'DateUtil.formatToChineseDate failed'
    );
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
    return ErrorHandler.safeExecute(() => {
      const date = new Date(input);
      return DateUtil.isValidDate(date) ? date : null;
    }, null);
  }
}

/**
 * 简化的 URL 工具类
 */
export class UrlUtil {
  /**
   * 检查 URL 是否有效
   */
  static isValidUrl(url: string): boolean {
    return ErrorHandler.safeExecute(() => {
      new URL(url);
      return true;
    }, false);
  }

  /**
   * 安全构建 URL
   */
  static buildUrl(
    base: string,
    path: string,
    params?: Record<string, string | number>
  ): string {
    return ErrorHandler.safeExecute(
      () => {
        const url = new URL(path, base);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, String(value));
          });
        }
        return url.toString();
      },
      base + path,
      'UrlUtil.buildUrl failed'
    );
  }
}

/**
 * 简化的性能监控工具类
 */
export class PerformanceUtil {
  private static timers = new Map<string, number>();

  /**
   * 开始计时
   */
  static startTimer(name: string, usePerformanceMark = false): void {
    const startTime =
      typeof window !== 'undefined' && window.performance
        ? window.performance.now()
        : Date.now();

    PerformanceUtil.timers.set(name, startTime);

    if (
      usePerformanceMark &&
      typeof window !== 'undefined' &&
      window.performance
    ) {
      ErrorHandler.safeCall(() => {
        window.performance.mark(`${name}-start`);
      });
    }
  }

  /**
   * 结束计时并返回耗时
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
      usePerformanceMark &&
      typeof window !== 'undefined' &&
      window.performance
    ) {
      ErrorHandler.safeCall(() => {
        window.performance.mark(`${name}-end`);
        window.performance.measure(name, `${name}-start`, `${name}-end`);
      });
    }

    PerformanceUtil.timers.delete(name);
    return duration;
  }
}

/**
 * 简化的滚动工具类
 */
export class ScrollUtil {
  /**
   * 滚动到顶部
   */
  static scrollToTop(smooth = true): void {
    ErrorHandler.safeCall(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
    }, 'ScrollUtil.scrollToTop failed');
  }

  /**
   * 延迟滚动到顶部
   */
  static delayedScrollToTop(delay: number, smooth = true): () => void {
    const timer = setTimeout(() => {
      ScrollUtil.scrollToTop(smooth);
    }, delay);

    return () => clearTimeout(timer);
  }
}

export * from './environment';
export * from './errorHandler';
// 导出其他工具
export * from './pathUtils';
