/**
 * 性能监控工具
 * 提供简单而有效的性能监控功能
 */

// 性能指标类型定义
export interface PerformanceMetric {
  readonly name: string;
  readonly value: number;
  readonly timestamp: number;
  readonly type: MetricType;
  readonly metadata?: Record<string, unknown>;
}

// 指标类型枚举
export enum MetricType {
  TIMING = 'timing',
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

// 性能报告接口
export interface PerformanceReport {
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly metrics: ReadonlyArray<PerformanceMetric>;
  readonly summary: PerformanceSummary;
}

// 性能摘要接口
export interface PerformanceSummary {
  readonly totalMetrics: number;
  readonly averageResponseTime: number;
  readonly slowestOperation: string | null;
  readonly fastestOperation: string | null;
  readonly errorCount: number;
}

// 计时器接口
interface Timer {
  readonly name: string;
  readonly startTime: number;
}

// 性能阈值配置
interface PerformanceThresholds {
  readonly warning: number; // 警告阈值(ms)
  readonly critical: number; // 严重阈值(ms)
}

/**
 * 性能监控器类
 * 提供性能指标收集、分析和报告功能
 */
export class PerformanceMonitor {
  private readonly metrics: PerformanceMetric[] = [];
  private readonly timers: Map<string, Timer> = new Map();
  private readonly startTime: number;
  private readonly thresholds: PerformanceThresholds;
  private readonly maxMetrics: number;

  constructor(
    thresholds: PerformanceThresholds = { warning: 1000, critical: 3000 },
    maxMetrics: number = 1000
  ) {
    this.startTime = (globalThis as any).performance?.now() || Date.now();
    this.thresholds = thresholds;
    this.maxMetrics = maxMetrics;

    // 监听页面性能事件
    this.setupPerformanceObserver();
  }

  /**
   * 开始计时
   */
  public startTimer(name: string): void {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Timer name must be a non-empty string');
    }

    this.timers.set(name, {
      name: name.trim(),
      startTime: (globalThis as any).performance?.now() || Date.now(),
    });
  }

  /**
   * 结束计时并记录指标
   */
  public endTimer(name: string, metadata?: Record<string, unknown>): number {
    const timer = this.timers.get(name);
    if (!timer) {
      throw new Error(`Timer '${name}' not found`);
    }

    const duration =
      ((globalThis as any).performance?.now() || Date.now()) - timer.startTime;
    this.timers.delete(name);

    this.recordMetric({
      name,
      value: duration,
      type: MetricType.TIMING,
      metadata,
    });

    // 检查性能阈值
    this.checkThreshold(name, duration);

    return duration;
  }

  /**
   * 记录自定义指标
   */
  public recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // 限制指标数量，防止内存泄漏
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.splice(0, this.metrics.length - this.maxMetrics);
    }

    // 检查性能阈值
    if (metric.type === MetricType.TIMING) {
      this.checkThreshold(metric.name, metric.value);
    }
  }

  /**
   * 记录计数器指标
   */
  public incrementCounter(
    name: string,
    value: number = 1,
    metadata?: Record<string, unknown>
  ): void {
    this.recordMetric({
      name,
      value,
      type: MetricType.COUNTER,
      metadata,
    });
  }

  /**
   * 记录仪表盘指标
   */
  public recordGauge(
    name: string,
    value: number,
    metadata?: Record<string, unknown>
  ): void {
    this.recordMetric({
      name,
      value,
      type: MetricType.GAUGE,
      metadata,
    });
  }

  /**
   * 记录用户交互
   */
  public recordInteraction(
    action: string,
    target?: string,
    metadata?: Record<string, unknown>
  ): void {
    this.recordMetric({
      name: `interaction_${action}`,
      value: 1,
      type: MetricType.COUNTER,
      metadata: {
        target,
        ...metadata,
      },
    });
  }

  /**
   * 记录资源加载时间
   */
  public recordResourceLoadTime(
    resourceName: string,
    loadTime: number,
    metadata?: Record<string, unknown>
  ): void {
    this.recordMetric({
      name: `resource_${resourceName}`,
      value: loadTime,
      type: MetricType.TIMING,
      metadata,
    });
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport(): PerformanceReport {
    const endTime = (globalThis as any).performance?.now() || Date.now();
    const duration = endTime - this.startTime;

    const timingMetrics = this.metrics.filter(
      m => m.type === MetricType.TIMING
    );
    const averageResponseTime =
      timingMetrics.length > 0
        ? timingMetrics.reduce((sum, m) => sum + m.value, 0) /
          timingMetrics.length
        : 0;

    const slowestOperation =
      timingMetrics.length > 0
        ? timingMetrics.reduce((prev, current) =>
            prev.value > current.value ? prev : current
          ).name
        : null;

    const fastestOperation =
      timingMetrics.length > 0
        ? timingMetrics.reduce((prev, current) =>
            prev.value < current.value ? prev : current
          ).name
        : null;

    const errorCount = this.metrics.filter(
      m => m.name.includes('error') || m.name.includes('exception')
    ).length;

    return {
      startTime: this.startTime,
      endTime,
      duration,
      metrics: [...this.metrics], // 返回副本
      summary: {
        totalMetrics: this.metrics.length,
        averageResponseTime,
        slowestOperation,
        fastestOperation,
        errorCount,
      },
    };
  }

  /**
   * 获取指定类型的指标
   */
  public getMetricsByType(type: MetricType): ReadonlyArray<PerformanceMetric> {
    return this.metrics.filter(m => m.type === type);
  }

  /**
   * 获取指定名称的指标
   */
  public getMetricsByName(name: string): ReadonlyArray<PerformanceMetric> {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * 清空所有指标
   */
  public clearMetrics(): void {
    this.metrics.length = 0;
    this.timers.clear();
  }

  /**
   * 导出性能数据
   */
  public exportData(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * 检查性能阈值
   */
  private checkThreshold(name: string, duration: number): void {
    if (duration > this.thresholds.critical) {
      console.warn(
        `🔴 Critical performance issue: ${name} took ${duration.toFixed(2)}ms`
      );
    } else if (duration > this.thresholds.warning) {
      console.warn(
        `🟡 Performance warning: ${name} took ${duration.toFixed(2)}ms`
      );
    }
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObserver(): void {
    if (typeof (globalThis as any).PerformanceObserver === 'undefined') {
      return;
    }

    try {
      // 观察导航性能
      const navObserver = new (globalThis as any).PerformanceObserver(
        (list: any) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry);
            }
          }
        }
      );
      navObserver.observe({ entryTypes: ['navigation'] });

      // 观察资源加载性能
      const resourceObserver = new (globalThis as any).PerformanceObserver(
        (list: any) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              this.recordResourceMetrics(entry);
            }
          }
        }
      );
      resourceObserver.observe({ entryTypes: ['resource'] });

      // 观察长任务
      if (
        (globalThis as any).PerformanceObserver.supportedEntryTypes &&
        'longtask' in
          (globalThis as any).PerformanceObserver.supportedEntryTypes
      ) {
        const longtaskObserver = new (globalThis as any).PerformanceObserver(
          (list: any) => {
            for (const entry of list.getEntries()) {
              this.recordMetric({
                name: 'longtask',
                value: entry.duration,
                type: MetricType.TIMING,
                metadata: {
                  startTime: entry.startTime,
                  attribution: (entry as any).attribution,
                },
              });
            }
          }
        );
        longtaskObserver.observe({ entryTypes: ['longtask'] });
      }
    } catch (error) {
      console.warn('Failed to setup performance observer:', error);
    }
  }

  /**
   * 记录导航性能指标
   */
  private recordNavigationMetrics(entry: any): void {
    const metrics = [
      {
        name: 'dns_lookup',
        value: entry.domainLookupEnd - entry.domainLookupStart,
      },
      { name: 'tcp_connect', value: entry.connectEnd - entry.connectStart },
      {
        name: 'request_response',
        value: entry.responseEnd - entry.requestStart,
      },
      {
        name: 'dom_parse',
        value:
          entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      },
      { name: 'page_load', value: entry.loadEventEnd - entry.loadEventStart },
      {
        name: 'total_load_time',
        value: entry.loadEventEnd - (entry as any).navigationStart,
      },
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          type: MetricType.TIMING,
        });
      }
    });
  }

  /**
   * 记录资源性能指标
   */
  private recordResourceMetrics(entry: any): void {
    const resourceName = entry.name.split('/').pop() || 'unknown';
    const loadTime = entry.responseEnd - entry.startTime;

    if (loadTime > 0) {
      this.recordResourceLoadTime(resourceName, loadTime, {
        size: entry.transferSize,
        type: this.getResourceType(entry.name),
      });
    }
  }

  /**
   * 获取资源类型
   */
  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();

    if (!extension) return 'unknown';

    if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) return 'script';
    if (['css', 'scss', 'sass'].includes(extension)) return 'stylesheet';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension))
      return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) return 'font';

    return 'other';
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 在开发环境下暴露到全局对象，便于调试
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  (globalThis as any).performanceMonitor = performanceMonitor;
}
