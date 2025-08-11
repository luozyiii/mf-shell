import { useCallback } from 'react';
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

// useComponentPerformance 已移至独立文件 ./useComponentPerformance.ts
// 请使用: import { useComponentPerformance } from './useComponentPerformance';

// useApiPerformance 已移至独立文件 ./useApiPerformance.ts
// 请使用: import { useApiPerformance } from './useApiPerformance';
