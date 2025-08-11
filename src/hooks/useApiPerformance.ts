import { useCallback } from 'react';
import { performanceMonitor, MetricType } from '../utils/performanceMonitor';
import { networkMonitor } from '../utils/networkMonitor';

/**
 * API性能监控Hook
 */
export const useApiPerformance = () => {
  /**
   * 包装API调用以进行性能监控
   */
  const wrapApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      apiName: string,
      metadata?: Record<string, any>
    ): Promise<T> => {
      const startTime = (globalThis as any).performance?.now() || Date.now();

      try {
        const result = await apiCall();
        const endTime = (globalThis as any).performance?.now() || Date.now();
        const duration = endTime - startTime;

        // 记录成功的API调用
        performanceMonitor.recordMetric({
          name: `api_${apiName}`,
          value: duration,
          type: MetricType.TIMING,
          metadata: {
            ...metadata,
            status: 'success',
            apiName,
          },
        });

        return result;
      } catch (error) {
        const endTime = (globalThis as any).performance?.now() || Date.now();
        const duration = endTime - startTime;

        // 记录失败的API调用
        performanceMonitor.recordMetric({
          name: `api_${apiName}_error`,
          value: duration,
          type: MetricType.TIMING,
          metadata: {
            ...metadata,
            status: 'error',
            apiName,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        throw error;
      }
    },
    []
  );

  /**
   * 获取API性能统计
   */
  const getApiStats = useCallback(() => {
    return networkMonitor.getNetworkStats();
  }, []);

  /**
   * 获取慢API调用
   */
  const getSlowApiCalls = useCallback((threshold: number = 1000) => {
    return networkMonitor.getSlowRequests(threshold);
  }, []);

  /**
   * 获取失败的API调用
   */
  const getFailedApiCalls = useCallback(() => {
    return networkMonitor.getFailedRequests();
  }, []);

  return {
    wrapApiCall,
    getApiStats,
    getSlowApiCalls,
    getFailedApiCalls,
  };
};
