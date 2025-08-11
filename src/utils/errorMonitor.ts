/**
 * 错误监控工具
 * 提供全局错误收集、分析和报告功能
 */

// 错误信息接口
export interface ErrorInfo {
  readonly id: string;
  readonly message: string;
  readonly stack?: string;
  readonly timestamp: number;
  readonly url: string;
  readonly userAgent: string;
  readonly userId?: string;
  readonly sessionId: string;
  readonly level: ErrorLevel;
  readonly source: ErrorSource;
  readonly metadata?: Record<string, unknown>;
}

// 错误级别枚举
export enum ErrorLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 错误来源枚举
export enum ErrorSource {
  JAVASCRIPT = 'javascript',
  PROMISE = 'promise',
  RESOURCE = 'resource',
  NETWORK = 'network',
  CUSTOM = 'custom',
}

// 错误报告接口
export interface ErrorReport {
  readonly totalErrors: number;
  readonly errorsByLevel: Record<ErrorLevel, number>;
  readonly errorsBySource: Record<ErrorSource, number>;
  readonly recentErrors: ReadonlyArray<ErrorInfo>;
  readonly topErrors: ReadonlyArray<{ message: string; count: number }>;
  readonly timeRange: { start: number; end: number };
}

/**
 * 错误监控器类
 */
export class ErrorMonitor {
  private readonly errors: ErrorInfo[] = [];
  private readonly maxErrors: number;
  private readonly sessionId: string;
  private userId?: string;

  constructor(maxErrors: number = 500) {
    this.maxErrors = maxErrors;
    this.sessionId = this.generateSessionId();

    // 设置全局错误监听
    this.setupGlobalErrorHandlers();
  }

  /**
   * 设置用户ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * 记录错误
   */
  public recordError(
    error: Error | string,
    level: ErrorLevel = ErrorLevel.MEDIUM,
    source: ErrorSource = ErrorSource.CUSTOM,
    metadata?: Record<string, unknown>
  ): string {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      level,
      source,
      metadata,
    };

    this.errors.push(errorInfo);

    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors.splice(0, this.errors.length - this.maxErrors);
    }

    // 根据错误级别进行不同处理
    this.handleErrorByLevel(errorInfo);

    return errorInfo.id;
  }

  /**
   * 记录网络错误
   */
  public recordNetworkError(
    url: string,
    status: number,
    statusText: string,
    metadata?: Record<string, unknown>
  ): string {
    return this.recordError(
      `Network Error: ${status} ${statusText} - ${url}`,
      this.getNetworkErrorLevel(status),
      ErrorSource.NETWORK,
      {
        url,
        status,
        statusText,
        ...metadata,
      }
    );
  }

  /**
   * 记录资源加载错误
   */
  public recordResourceError(
    resourceUrl: string,
    resourceType: string,
    metadata?: Record<string, unknown>
  ): string {
    return this.recordError(
      `Resource Load Error: ${resourceType} - ${resourceUrl}`,
      ErrorLevel.MEDIUM,
      ErrorSource.RESOURCE,
      {
        resourceUrl,
        resourceType,
        ...metadata,
      }
    );
  }

  /**
   * 获取错误报告
   */
  public getErrorReport(): ErrorReport {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentErrors = this.errors.filter(e => e.timestamp >= oneHourAgo);

    // 统计错误级别
    const errorsByLevel = {
      [ErrorLevel.LOW]: 0,
      [ErrorLevel.MEDIUM]: 0,
      [ErrorLevel.HIGH]: 0,
      [ErrorLevel.CRITICAL]: 0,
    };

    // 统计错误来源
    const errorsBySource = {
      [ErrorSource.JAVASCRIPT]: 0,
      [ErrorSource.PROMISE]: 0,
      [ErrorSource.RESOURCE]: 0,
      [ErrorSource.NETWORK]: 0,
      [ErrorSource.CUSTOM]: 0,
    };

    // 统计错误消息频次
    const errorCounts = new Map<string, number>();

    this.errors.forEach(error => {
      errorsByLevel[error.level]++;
      errorsBySource[error.source]++;

      const count = errorCounts.get(error.message) || 0;
      errorCounts.set(error.message, count + 1);
    });

    // 获取最频繁的错误
    const topErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    return {
      totalErrors: this.errors.length,
      errorsByLevel,
      errorsBySource,
      recentErrors,
      topErrors,
      timeRange: {
        start: this.errors.length > 0 ? this.errors[0].timestamp : now,
        end: now,
      },
    };
  }

  /**
   * 获取指定级别的错误
   */
  public getErrorsByLevel(level: ErrorLevel): ReadonlyArray<ErrorInfo> {
    return this.errors.filter(e => e.level === level);
  }

  /**
   * 获取指定来源的错误
   */
  public getErrorsBySource(source: ErrorSource): ReadonlyArray<ErrorInfo> {
    return this.errors.filter(e => e.source === source);
  }

  /**
   * 清空错误记录
   */
  public clearErrors(): void {
    this.errors.length = 0;
  }

  /**
   * 导出错误数据
   */
  public exportErrors(): string {
    const report = this.getErrorReport();
    return JSON.stringify(
      {
        report,
        errors: this.errors,
      },
      null,
      2
    );
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 根据网络状态码获取错误级别
   */
  private getNetworkErrorLevel(status: number): ErrorLevel {
    if (status >= 500) return ErrorLevel.HIGH;
    if (status >= 400) return ErrorLevel.MEDIUM;
    return ErrorLevel.LOW;
  }

  /**
   * 根据错误级别进行处理
   */
  private handleErrorByLevel(errorInfo: ErrorInfo): void {
    switch (errorInfo.level) {
      case ErrorLevel.CRITICAL:
        console.error('🔴 Critical Error:', errorInfo);
        // 这里可以添加立即通知逻辑
        break;
      case ErrorLevel.HIGH:
        console.error('🟠 High Priority Error:', errorInfo);
        break;
      case ErrorLevel.MEDIUM:
        console.warn('🟡 Medium Priority Error:', errorInfo);
        break;
      case ErrorLevel.LOW:
        console.info('🔵 Low Priority Error:', errorInfo);
        break;
    }
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalErrorHandlers(): void {
    // JavaScript错误
    window.addEventListener('error', event => {
      this.recordError(
        event.error || event.message,
        ErrorLevel.HIGH,
        ErrorSource.JAVASCRIPT,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    });

    // Promise拒绝错误
    window.addEventListener('unhandledrejection', event => {
      this.recordError(
        event.reason instanceof Error ? event.reason : String(event.reason),
        ErrorLevel.HIGH,
        ErrorSource.PROMISE,
        {
          type: 'unhandledrejection',
        }
      );
    });

    // 资源加载错误
    window.addEventListener(
      'error',
      event => {
        if (event.target && event.target !== window) {
          const target = event.target as HTMLElement;
          const tagName = target.tagName?.toLowerCase();

          if (['img', 'script', 'link', 'source'].includes(tagName)) {
            this.recordResourceError(
              (target as any).src || (target as any).href || 'unknown',
              tagName,
              {
                tagName,
                outerHTML: target.outerHTML?.substring(0, 200),
              }
            );
          }
        }
      },
      true
    );
  }
}

// 创建全局错误监控实例
export const errorMonitor = new ErrorMonitor();

// 在开发环境下暴露到全局对象，便于调试
if (process.env.NODE_ENV === 'development') {
  (window as any).errorMonitor = errorMonitor;
}
