import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';

// 简单的加载组件
const LoadingFallback: React.FC = () => (
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
);

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('微前端加载错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>应用加载失败</h3>
          <p>请检查网络连接或稍后重试</p>
          <button onClick={() => window.location.reload()}>刷新页面</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 根据路径获取组件名称
const getComponentNameFromPath = (pathname: string): string => {
  // 从路径中提取组件名，例如：
  // /template/dashboard -> Dashboard
  // /template/feature1 -> Feature1
  // /template/settings -> Settings

  const segments = pathname.split('/');
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) return 'Dashboard'; // 默认组件

  // 转换为组件名格式
  switch (lastSegment.toLowerCase()) {
    case 'dashboard':
      return 'Dashboard';
    case 'feature1':
      return 'Feature1';
    case 'feature2':
      return 'Feature2';
    case 'settings':
      return 'Settings';
    default:
      return 'Dashboard'; // 默认组件
  }
};

// 组件缓存，避免重复创建
const componentCache = new Map<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
>();

// 动态微前端组件容器
const DynamicMicroFrontendContainer: React.FC<{
  appName: string;
  pathname: string;
}> = ({ appName, pathname }) => {
  const componentName = getComponentNameFromPath(pathname);
  const [componentKey, setComponentKey] = React.useState(
    `${appName}-${componentName}-${Date.now()}`
  );

  // 每次路径变化时，强制重新创建组件
  React.useEffect(() => {
    setComponentKey(`${appName}-${componentName}-${Date.now()}`);
  }, [appName, pathname, componentName]);

  // 创建动态组件
  const DynamicComponent = React.useMemo(() => {
    return lazy(async () => {
      try {
        let module: any;
        if (appName === 'template') {
          switch (componentName) {
            case 'Dashboard':
              // @ts-ignore
              module = await import('template/Dashboard');
              break;
            case 'Feature1':
              // @ts-ignore
              module = await import('template/Feature1');
              break;
            case 'Feature2':
              // @ts-ignore
              module = await import('template/Feature2');
              break;
            case 'Settings':
              // @ts-ignore
              module = await import('template/Settings');
              break;
            default:
              throw new Error(`Unknown component: ${componentName}`);
          }

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

          return { default: Component };
        } else {
          throw new Error(`Unknown app: ${appName}`);
        }
      } catch (error) {
        // 返回错误组件
        return {
          default: () => (
            <div
              style={{ padding: '20px', textAlign: 'center', color: '#ff4d4f' }}
            >
              <h3>⚠️ 组件加载失败</h3>
              <p>
                无法加载 {appName}/{componentName} 组件
              </p>
              <p>{error instanceof Error ? error.message : '未知错误'}</p>
            </div>
          ),
        };
      }
    });
  }, [appName, componentName]); // 依赖 appName 和 componentName，确保路径变化时重新创建

  return (
    <div key={componentKey}>
      <Suspense fallback={<LoadingFallback />}>
        <DynamicComponent />
      </Suspense>
    </div>
  );
};

// 创建懒加载的微前端页面组件
const createLazyMicroFrontend = (appName: string, pathname: string) => {
  const cacheKey = `${appName}-${pathname}`;

  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }

  const LazyComponent = lazy(async () => {
    // 返回动态容器
    return {
      default: () => (
        <DynamicMicroFrontendContainer appName={appName} pathname={pathname} />
      ),
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

export const LazyMicroFrontend: React.FC<LazyMicroFrontendProps> = ({
  appName,
  pathname,
}) => {
  const componentKey = `${appName}-${pathname}`;

  const LazyComponent = React.useMemo(() => {
    return createLazyMicroFrontend(appName, pathname);
  }, [appName, pathname]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent key={componentKey} />
      </Suspense>
    </ErrorBoundary>
  );
};
