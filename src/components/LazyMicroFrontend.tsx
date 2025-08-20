import { Spin } from 'antd';
import React, { lazy, memo, Suspense, useCallback, useMemo } from 'react';

// 性能监控工具
const performanceMonitor = {
  startTimer: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-start`);
    }
  },
  endTimer: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-end`);
      window.performance.measure(name, `${name}-start`, `${name}-end`);
    }
  },
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

// 错误边界组件 - 添加重试机制
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry?: () => void },
  { hasError: boolean; error?: Error; retryCount: number }
> {
  constructor(props: { children: React.ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('微前端加载错误:', error, errorInfo);
    // 可以在这里添加错误上报逻辑
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1,
    }));
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>应用加载失败</h3>
          <p>请检查网络连接或稍后重试</p>
          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={this.handleRetry}
              style={{ marginRight: '8px' }}
            >
              重试 ({this.state.retryCount}/3)
            </button>
            <button type="button" onClick={() => window.location.reload()}>
              刷新页面
            </button>
          </div>
          {this.state.error && (
            <details style={{ marginTop: '16px', textAlign: 'left' }}>
              <summary>错误详情</summary>
              <pre style={{ fontSize: '12px', color: '#666' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// 根据路径获取组件名称 - 使用缓存优化
const pathToComponentCache = new Map<string, string>();

const getComponentNameFromPath = (pathname: string): string => {
  // 使用缓存避免重复计算
  if (pathToComponentCache.has(pathname)) {
    const cachedName = pathToComponentCache.get(pathname);
    if (cachedName) {
      return cachedName;
    }
  }

  // 从路径中提取组件名，例如：
  // /template/dashboard -> Dashboard
  // /template/feature1 -> Feature1
  // /template/settings -> Settings
  const segments = pathname.split('/');
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) {
    pathToComponentCache.set(pathname, 'Dashboard');
    return 'Dashboard'; // 默认组件
  }

  // 转换为组件名格式
  let componentName: string;
  switch (lastSegment.toLowerCase()) {
    case 'dashboard':
      componentName = 'Dashboard';
      break;
    case 'feature1':
      componentName = 'Feature1';
      break;
    case 'feature2':
      componentName = 'Feature2';
      break;
    case 'settings':
      componentName = 'Settings';
      break;
    case 'store-demo':
      componentName = 'StoreDemo';
      break;
    default:
      componentName = 'Dashboard'; // 默认组件
  }

  pathToComponentCache.set(pathname, componentName);
  return componentName;
};

// 多层缓存系统
interface CacheEntry {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  timestamp: number;
  accessCount: number;
}

class ComponentCacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly maxCacheSize = 50; // 最大缓存数量
  private readonly cacheExpiry = 30 * 60 * 1000; // 30分钟过期

  get(key: string): React.LazyExoticComponent<React.ComponentType<any>> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问计数
    entry.accessCount++;
    return entry.component;
  }

  set(
    key: string,
    component: React.LazyExoticComponent<React.ComponentType<any>>
  ): void {
    // 如果缓存已满，清理最少使用的条目
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      component,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let minAccessCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        age: Date.now() - entry.timestamp,
      })),
    };
  }
}

// 全局缓存管理器
const componentCacheManager = new ComponentCacheManager();

// 动态导入函数 - 支持更多应用类型
const dynamicImportMap: Record<string, Record<string, () => Promise<any>>> = {
  template: {
    // @ts-expect-error - Module Federation 动态导入，运行时存在
    Dashboard: () => import('template/Dashboard'),
    // @ts-expect-error - Module Federation 动态导入，运行时存在
    Feature1: () => import('template/Feature1'),
    // @ts-expect-error - Module Federation 动态导入，运行时存在
    Feature2: () => import('template/Feature2'),
    // @ts-expect-error - Module Federation 动态导入，运行时存在
    Settings: () => import('template/Settings'),
    // @ts-expect-error - Module Federation 动态导入，运行时存在
    StoreDemo: () => import('template/StoreDemo'),
  },
  // 可以在这里添加更多应用的导入配置
};

// 优化的动态组件加载器
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

// 优化的动态微前端组件容器 - 使用 memo 减少重新渲染
const DynamicMicroFrontendContainer: React.FC<{
  appName: string;
  pathname: string;
}> = memo(({ appName, pathname }) => {
  const componentName = useMemo(
    () => getComponentNameFromPath(pathname),
    [pathname]
  );

  // 使用稳定的 key，避免不必要的重新挂载
  const componentKey = useMemo(
    () => `${appName}-${componentName}`,
    [appName, componentName]
  );

  // 创建动态组件 - 使用缓存
  const DynamicComponent = useMemo(() => {
    const cacheKey = `${appName}-${componentName}`;

    // 先尝试从缓存获取
    const cachedComponent = componentCacheManager.get(cacheKey);
    if (cachedComponent) {
      return cachedComponent;
    }

    // 创建新的懒加载组件
    const LazyComponent = lazy(() =>
      createDynamicComponent(appName, componentName)
    );

    // 存入缓存
    componentCacheManager.set(cacheKey, LazyComponent);

    return LazyComponent;
  }, [appName, componentName]);

  return (
    <div key={componentKey}>
      <Suspense fallback={<LoadingFallback />}>
        <DynamicComponent />
      </Suspense>
    </div>
  );
});

DynamicMicroFrontendContainer.displayName = 'DynamicMicroFrontendContainer';

// 优化的懒加载微前端组件创建器
const createLazyMicroFrontend = (appName: string, pathname: string) => {
  const cacheKey = `wrapper-${appName}-${pathname}`;

  // 使用新的缓存管理器
  const cachedComponent = componentCacheManager.get(cacheKey);
  if (cachedComponent) {
    return cachedComponent;
  }

  const LazyComponent = lazy(async () => {
    // 返回优化的动态容器
    return {
      default: memo(() => (
        <DynamicMicroFrontendContainer appName={appName} pathname={pathname} />
      )),
    };
  });

  componentCacheManager.set(cacheKey, LazyComponent);
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
      componentCacheManager.clear();
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

// 导出缓存管理器用于调试
export { componentCacheManager };

// 开发环境下添加全局调试工具
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 添加到全局对象，方便调试
  (window as any).__MF_CACHE_STATS__ = () => componentCacheManager.getStats();
  (window as any).__MF_CLEAR_CACHE__ = () => componentCacheManager.clear();
  (window as any).__MF_PATH_CACHE__ = pathToComponentCache;

  console.log('🚀 微前端调试工具已加载:');
  console.log('  - window.__MF_CACHE_STATS__() - 查看缓存统计');
  console.log('  - window.__MF_CLEAR_CACHE__() - 清除所有缓存');
  console.log('  - window.__MF_PATH_CACHE__ - 查看路径缓存');
}
