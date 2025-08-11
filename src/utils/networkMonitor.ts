/**
 * 网络监控工具
 * 监控API调用和网络请求的性能
 */

import { performanceMonitor } from './performanceMonitor';
import { errorMonitor } from './errorMonitor';

// 网络请求信息接口
export interface NetworkRequestInfo {
  readonly id: string;
  readonly url: string;
  readonly method: string;
  readonly startTime: number;
  readonly endTime?: number;
  readonly duration?: number;
  readonly status?: number;
  readonly statusText?: string;
  readonly requestSize?: number;
  readonly responseSize?: number;
  readonly success: boolean;
  readonly error?: string;
  readonly metadata?: Record<string, unknown>;
}

// 网络性能统计接口
export interface NetworkStats {
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly averageResponseTime: number;
  readonly slowestRequest: NetworkRequestInfo | null;
  readonly fastestRequest: NetworkRequestInfo | null;
  readonly requestsByStatus: Record<number, number>;
}

/**
 * 网络监控器类
 */
export class NetworkMonitor {
  private readonly requests: NetworkRequestInfo[] = [];
  private readonly maxRequests: number;
  private readonly originalFetch: typeof fetch;
  private readonly originalXHR: any;

  constructor(maxRequests: number = 1000) {
    this.maxRequests = maxRequests;
    this.originalFetch = globalThis.fetch;
    this.originalXHR = globalThis.XMLHttpRequest;

    // 拦截网络请求
    this.interceptFetch();
    this.interceptXHR();
  }

  /**
   * 记录网络请求
   */
  public recordRequest(requestInfo: Omit<NetworkRequestInfo, 'id'>): string {
    const id = this.generateRequestId();
    const fullRequestInfo: NetworkRequestInfo = {
      ...requestInfo,
      id,
    };

    this.requests.push(fullRequestInfo);

    // 限制请求记录数量
    if (this.requests.length > this.maxRequests) {
      this.requests.splice(0, this.requests.length - this.maxRequests);
    }

    // 记录性能指标
    if (fullRequestInfo.duration) {
      performanceMonitor.recordMetric({
        name: `network_${this.getUrlPath(requestInfo.url)}`,
        value: fullRequestInfo.duration,
        type: 'timing' as any,
        metadata: {
          method: requestInfo.method,
          status: requestInfo.status,
          url: requestInfo.url,
        },
      });
    }

    // 记录错误
    if (!fullRequestInfo.success && fullRequestInfo.error) {
      errorMonitor.recordNetworkError(
        requestInfo.url,
        requestInfo.status || 0,
        requestInfo.statusText || 'Unknown',
        {
          method: requestInfo.method,
          duration: requestInfo.duration,
        }
      );
    }

    return id;
  }

  /**
   * 获取网络统计信息
   */
  public getNetworkStats(): NetworkStats {
    const totalRequests = this.requests.length;
    const successfulRequests = this.requests.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;

    const completedRequests = this.requests.filter(
      r => r.duration !== undefined
    );
    const averageResponseTime =
      completedRequests.length > 0
        ? completedRequests.reduce((sum, r) => sum + (r.duration || 0), 0) /
          completedRequests.length
        : 0;

    const slowestRequest =
      completedRequests.length > 0
        ? completedRequests.reduce((prev, current) =>
            (prev.duration || 0) > (current.duration || 0) ? prev : current
          )
        : null;

    const fastestRequest =
      completedRequests.length > 0
        ? completedRequests.reduce((prev, current) =>
            (prev.duration || 0) < (current.duration || 0) ? prev : current
          )
        : null;

    // 统计状态码
    const requestsByStatus: Record<number, number> = {};
    this.requests.forEach(request => {
      if (request.status) {
        requestsByStatus[request.status] =
          (requestsByStatus[request.status] || 0) + 1;
      }
    });

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      slowestRequest,
      fastestRequest,
      requestsByStatus,
    };
  }

  /**
   * 获取所有请求记录
   */
  public getAllRequests(): ReadonlyArray<NetworkRequestInfo> {
    return [...this.requests];
  }

  /**
   * 获取失败的请求
   */
  public getFailedRequests(): ReadonlyArray<NetworkRequestInfo> {
    return this.requests.filter(r => !r.success);
  }

  /**
   * 获取慢请求
   */
  public getSlowRequests(
    threshold: number = 1000
  ): ReadonlyArray<NetworkRequestInfo> {
    return this.requests.filter(r => (r.duration || 0) > threshold);
  }

  /**
   * 清空请求记录
   */
  public clearRequests(): void {
    this.requests.length = 0;
  }

  /**
   * 导出网络数据
   */
  public exportData(): string {
    return JSON.stringify(
      {
        stats: this.getNetworkStats(),
        requests: this.requests,
      },
      null,
      2
    );
  }

  /**
   * 拦截fetch请求
   */
  private interceptFetch(): void {
    globalThis.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      const startTime = performance.now();

      const requestId = this.generateRequestId();

      try {
        const response = await this.originalFetch(input, init);
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordRequest({
          url,
          method,
          startTime,
          endTime,
          duration,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          metadata: {
            requestId,
            type: 'fetch',
          },
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordRequest({
          url,
          method,
          startTime,
          endTime,
          duration,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            requestId,
            type: 'fetch',
          },
        });

        throw error;
      }
    };
  }

  /**
   * 拦截XMLHttpRequest
   */
  private interceptXHR(): void {
    const self = this;

    globalThis.XMLHttpRequest = function () {
      const xhr = new self.originalXHR();
      let url = '';
      let method = 'GET';
      let startTime = 0;
      const requestId = self.generateRequestId();

      // 拦截open方法
      const originalOpen = xhr.open;
      xhr.open = function (
        m: string,
        u: string | URL,
        async: boolean = true,
        username?: string | null,
        password?: string | null
      ) {
        method = m;
        url = typeof u === 'string' ? u : u.toString();
        startTime = performance.now();
        return originalOpen.call(this, m, u, async, username, password);
      };

      // 拦截send方法
      const originalSend = xhr.send;
      xhr.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
        startTime = performance.now();

        // 监听请求完成
        xhr.addEventListener('loadend', () => {
          const endTime = performance.now();
          const duration = endTime - startTime;

          self.recordRequest({
            url,
            method,
            startTime,
            endTime,
            duration,
            status: xhr.status,
            statusText: xhr.statusText,
            success: xhr.status >= 200 && xhr.status < 300,
            error: xhr.status >= 400 ? `HTTP ${xhr.status}` : undefined,
            metadata: {
              requestId,
              type: 'xhr',
              readyState: xhr.readyState,
            },
          });
        });

        // 监听错误
        xhr.addEventListener('error', () => {
          const endTime = performance.now();
          const duration = endTime - startTime;

          self.recordRequest({
            url,
            method,
            startTime,
            endTime,
            duration,
            success: false,
            error: 'Network error',
            metadata: {
              requestId,
              type: 'xhr',
              readyState: xhr.readyState,
            },
          });
        });

        return originalSend.apply(this, [body]);
      };

      return xhr;
    } as any;

    // 复制原始构造函数的属性
    Object.setPrototypeOf(
      globalThis.XMLHttpRequest.prototype,
      self.originalXHR.prototype
    );
    Object.setPrototypeOf(globalThis.XMLHttpRequest, self.originalXHR);
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 从URL中提取路径
   */
  private getUrlPath(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname.split('/').pop() || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

// 创建全局网络监控实例
export const networkMonitor = new NetworkMonitor();

// 在开发环境下暴露到全局对象，便于调试
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  (globalThis as any).networkMonitor = networkMonitor;
}
