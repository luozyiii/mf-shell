import type React from 'react';
import { lazy, memo, Suspense } from 'react';
import { Environment } from '../utils/environment';

// 异步加载性能监控组件
const LazyPerformanceMonitor = lazy(() =>
  import('./PerformanceMonitor').then((module) => ({
    default: module.PerformanceMonitor,
  }))
);

// 异步性能监控组件包装器
export const AsyncPerformanceMonitor: React.FC = memo(() => {
  // 只在开发环境显示
  if (!Environment.isDevelopment()) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyPerformanceMonitor />
    </Suspense>
  );
});

AsyncPerformanceMonitor.displayName = 'AsyncPerformanceMonitor';
