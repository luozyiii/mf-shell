import { Spin } from 'antd';
import type React from 'react';
import { lazy, memo, Suspense, useCallback, useMemo } from 'react';
import { Environment, PerformanceUtil } from '../utils';
import { ErrorBoundary } from './ErrorBoundary';

// 使用统一的性能监控工具（支持浏览器性能标记）
const performanceMonitor = {
  startTimer: (name: string) => PerformanceUtil.startTimer(name, true),
  endTimer: (name: string) => PerformanceUtil.endTimer(name, true),
};

// 简单的加载组件 - 使用 memo 优化
const LoadingFallback: React.FC = memo(() => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    }}
  >
    <Spin size="large" />
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// 路径到组件名映射 - 根据实际的路由配置
const getComponentNameFromPath = (pathname: string): string => {
  const segments = pathname.split('/');
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) {
    return 'Dashboard'; // 默认组件
  }

  // 根据实际的路由配置映射
  const pathToComponentMap: Record<string, string> = {
    dashboard: 'Dashboard',
    'store-demo': 'StoreDemo',
    'i18n-demo': 'I18nDemo',
  };

  return pathToComponentMap[lastSegment] || 'Dashboard';
};

// 简化的组件缓存
const componentCache = new Map<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
>();

const clearComponentCache = () => {
  componentCache.clear();
};

// 动态导入映射 - 根据实际暴露的组件配置
const dynamicImportMap: Record<string, Record<string, () => Promise<any>>> = {
  template: {
    // @ts-expect-error - Module Federation 动态导入，运行时存在
    Dashboard: () => import('template/Dashboard'),
    // @ts-expect-error - Module Federation 动态导入，运行时存在
    StoreDemo: () => import('template/StoreDemo'),
    // @ts-expect-error - Module Federation 动态导入，运行时存在
    I18nDemo: () => import('template/I18nDemo'),
  },
  // 可以在这里添加更多应用的导入配置
};

// 修复的动态组件加载器
const createDynamicComponent = async (
  appName: string,
  componentName: string
) => {
  const timerName = `load-${appName}-${componentName}`;
  performanceMonitor.startTimer(timerName);

  try {
    const importFn = dynamicImportMap[appName]?.[componentName];
    if (!importFn) {
      throw new Error(`Unknown component: ${appName}/${componentName}`);
    }

    const module = await importFn();
    let Component = module.default || module;

    // 确保组件是有效的 React 组件
    if (typeof Component === 'object' && Component !== null) {
      Component = Component.default || Component;
    }

    if (typeof Component !== 'function') {
      throw new Error(
        `Invalid component type: expected function, got ${typeof Component}`
      );
    }

    performanceMonitor.endTimer(timerName);
    return { default: Component };
  } catch (error) {
    performanceMonitor.endTimer(timerName);
    console.error(`Failed to load ${appName}/${componentName}:`, error);

    // 返回错误组件
    return {
      default: memo(() => (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ff4d4f' }}>
          <h3>⚠️ 组件加载失败</h3>
          <p>
            无法加载 {appName}/{componentName} 组件
          </p>
          <p>{error instanceof Error ? error.message : '未知错误'}</p>
        </div>
      )),
    };
  }
};

// 简化的动态微前端组件容器
const DynamicMicroFrontendContainer: React.FC<{
  appName: string;
  pathname: string;
}> = memo(({ appName, pathname }) => {
  const componentName = useMemo(
    () => getComponentNameFromPath(pathname),
    [pathname]
  );

  // 创建动态组件 - 使用简化缓存
  const DynamicComponent = useMemo(() => {
    const cacheKey = `${appName}-${componentName}`;

    // 先尝试从缓存获取
    const cachedComponent = componentCache.get(cacheKey);
    if (cachedComponent) {
      return cachedComponent;
    }

    // 创建新的懒加载组件
    const LazyComponent = lazy(() =>
      createDynamicComponent(appName, componentName)
    );

    // 存入缓存
    componentCache.set(cacheKey, LazyComponent);

    return LazyComponent;
  }, [appName, componentName]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <DynamicComponent />
    </Suspense>
  );
});

DynamicMicroFrontendContainer.displayName = 'DynamicMicroFrontendContainer';

// 简化的懒加载微前端组件创建器
const createLazyMicroFrontend = (appName: string, pathname: string) => {
  const cacheKey = `wrapper-${appName}-${pathname}`;

  // 使用简化缓存
  const cachedComponent = componentCache.get(cacheKey);
  if (cachedComponent) {
    return cachedComponent;
  }

  const LazyComponent = lazy(async () => {
    return {
      default: memo(() => (
        <DynamicMicroFrontendContainer appName={appName} pathname={pathname} />
      )),
    };
  });

  componentCache.set(cacheKey, LazyComponent);
  return LazyComponent;
};

interface LazyMicroFrontendProps {
  appName: string;
  pathname: string;
  displayName?: string;
}

// 主要的 LazyMicroFrontend 组件 - 使用 memo 优化
export const LazyMicroFrontend: React.FC<LazyMicroFrontendProps> = memo(
  ({ appName, pathname }) => {
    // 使用稳定的 key
    const componentKey = useMemo(
      () => `${appName}-${pathname}`,
      [appName, pathname]
    );

    // 重试回调
    const handleRetry = useCallback(() => {
      // 清除相关缓存，强制重新加载
      clearComponentCache();
      // 强制重新渲染
      window.location.reload();
    }, []);

    const LazyComponent = useMemo(() => {
      return createLazyMicroFrontend(appName, pathname);
    }, [appName, pathname]);

    return (
      <ErrorBoundary onRetry={handleRetry}>
        <Suspense fallback={<LoadingFallback />}>
          <LazyComponent key={componentKey} />
        </Suspense>
      </ErrorBoundary>
    );
  }
);

LazyMicroFrontend.displayName = 'LazyMicroFrontend';

// 导出缓存工具用于调试
export { clearComponentCache };

// 开发环境下的简化调试工具
if (Environment.isDevelopment() && Environment.isBrowser()) {
  (window as any).__MF_CLEAR_CACHE__ = clearComponentCache;
}
