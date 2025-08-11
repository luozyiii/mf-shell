import { useEffect, useRef } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

/**
 * 组件性能监控Hook
 */
export const useComponentPerformance = (componentName: string) => {
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    // 记录组件挂载时间
    mountTimeRef.current = (globalThis as any).performance?.now() || Date.now();

    performanceMonitor.recordMetric({
      name: `component_mount_${componentName}`,
      value: mountTimeRef.current,
      type: 'timing' as any,
      metadata: {
        component: componentName,
        action: 'mount',
      },
    });

    return () => {
      // 记录组件卸载时间
      const unmountTime = (globalThis as any).performance?.now() || Date.now();
      const lifeTime = unmountTime - mountTimeRef.current;

      performanceMonitor.recordMetric({
        name: `component_lifetime_${componentName}`,
        value: lifeTime,
        type: 'timing' as any,
        metadata: {
          component: componentName,
          action: 'unmount',
          renderCount: renderCountRef.current,
        },
      });
    };
  }, [componentName]);

  useEffect(() => {
    // 记录每次渲染
    renderCountRef.current += 1;

    performanceMonitor.recordMetric({
      name: `component_render_${componentName}`,
      value: (globalThis as any).performance?.now() || Date.now(),
      type: 'counter' as any,
      metadata: {
        component: componentName,
        action: 'render',
        renderCount: renderCountRef.current,
      },
    });
  });

  return {
    renderCount: renderCountRef.current,
    mountTime: mountTimeRef.current,
  };
};
