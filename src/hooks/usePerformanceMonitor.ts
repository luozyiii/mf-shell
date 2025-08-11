import { useCallback, useEffect, useRef } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

/**
 * 性能监控Hook
 * 提供组件级别的性能监控功能
 */
export const usePerformanceMonitor = () => {
  // 开始计时
  const startTimer = useCallback((name: string) => {
    performanceMonitor.startTimer(name);
  }, []);

  // 结束计时
  const endTimer = useCallback(
    (name: string, metadata?: Record<string, unknown>) => {
      return performanceMonitor.endTimer(name, metadata);
    },
    []
  );

  // 记录用户交互
  const recordInteraction = useCallback(
    (action: string, target?: string, metadata?: Record<string, unknown>) => {
      performanceMonitor.recordInteraction(action, target, metadata);
    },
    []
  );

  // 记录资源加载时间
  const recordResourceLoadTime = useCallback(
    (
      resourceName: string,
      loadTime: number,
      metadata?: Record<string, unknown>
    ) => {
      performanceMonitor.recordResourceLoadTime(
        resourceName,
        loadTime,
        metadata
      );
    },
    []
  );

  // 获取性能报告
  const getPerformanceReport = useCallback(() => {
    return performanceMonitor.getPerformanceReport();
  }, []);

  // 导出性能数据
  const exportPerformanceData = useCallback(() => {
    return performanceMonitor.exportData();
  }, []);

  // 清空性能数据
  const clearMetrics = useCallback(() => {
    performanceMonitor.clearMetrics();
  }, []);

  return {
    startTimer,
    endTimer,
    recordInteraction,
    recordResourceLoadTime,
    getPerformanceReport,
    exportPerformanceData,
    clearMetrics,
  };
};

/**
 * 组件性能监控Hook
 * 自动监控组件的挂载、更新和卸载性能
 */
export const useComponentPerformance = (componentName: string) => {
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    // 记录组件挂载时间
    mountTimeRef.current = performance.now();
    performanceMonitor.startTimer(`${componentName}_mount`);

    return () => {
      // 记录组件卸载
      const unmountTime = performance.now();
      const mountDuration = unmountTime - mountTimeRef.current;

      performanceMonitor.recordMetric({
        name: `${componentName}_unmount`,
        value: mountDuration,
        type: 'timing' as any,
        metadata: {
          renderCount: renderCountRef.current,
        },
      });
    };
  }, [componentName]);

  useEffect(() => {
    // 记录组件渲染
    renderCountRef.current += 1;

    if (renderCountRef.current === 1) {
      // 首次渲染完成
      performanceMonitor.endTimer(`${componentName}_mount`, {
        firstRender: true,
      });
    } else {
      // 后续渲染
      performanceMonitor.recordMetric({
        name: `${componentName}_render`,
        value: performance.now(),
        type: 'counter' as any,
        metadata: {
          renderCount: renderCountRef.current,
        },
      });
    }
  });

  return {
    renderCount: renderCountRef.current,
  };
};

/**
 * API调用性能监控Hook
 */
export const useApiPerformance = () => {
  const trackApiCall = useCallback(
    async <T>(
      apiName: string,
      apiCall: () => Promise<T>,
      metadata?: Record<string, unknown>
    ): Promise<T> => {
      const timerName = `api_${apiName}`;
      performanceMonitor.startTimer(timerName);

      try {
        const result = await apiCall();
        performanceMonitor.endTimer(timerName, {
          status: 'success',
          ...metadata,
        });
        return result;
      } catch (error) {
        performanceMonitor.endTimer(timerName, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          ...metadata,
        });
        throw error;
      }
    },
    []
  );

  return {
    trackApiCall,
  };
};
