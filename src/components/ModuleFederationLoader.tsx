import React, { Suspense, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { AppstoreOutlined, CloudServerOutlined, RocketOutlined, DollarOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons';
import { microsystemManager } from '../config/microsystems';
import styles from './MicroFrontendLoader.module.css';

// 声明 webpack 模块联邦相关的全局变量
declare const __webpack_share_scopes__: any;
declare const __webpack_init_sharing__: any;

interface ModuleFederationLoaderProps {
  name: string;
  componentName: string;
}

// 动态导入远程组件的工厂函数
const loadRemoteComponent = (name: string, componentName: string) => {
  return React.lazy(async () => {
    try {
      console.log(`Loading remote component: ${name}/${componentName}`);
      
      // 使用标准的动态导入，webpack 会自动处理模块联邦
      let module;
      
      // 根据不同的组件名称进行导入
      if (name === 'template') {
        switch (componentName) {
          case 'Dashboard':
            module = await import('template/Dashboard');
            break;
          case 'Feature1':
            module = await import('template/Feature1');
            break;
          case 'Feature2':
            module = await import('template/Feature2');
            break;
          case 'Settings':
            module = await import('template/Settings');
            break;
          default:
            throw new Error(`Unknown component: ${componentName}`);
        }
      } else {
        throw new Error(`Unknown remote: ${name}`);
      }
      
      console.log('Module loaded successfully:', module);
      
      return { default: module.default || module };
    } catch (error) {
      console.error(`Failed to load remote component ${name}/${componentName}:`, error);
      // 返回错误组件
      return {
        default: () => (
          <Alert
            message="组件加载失败"
            description={`无法加载 ${name} 应用的 ${componentName} 组件。错误: ${error instanceof Error ? error.message : '未知错误'}`}
            type="error"
            showIcon
          />
        )
      };
    }
  });
};

export const ModuleFederationLoader: React.FC<ModuleFederationLoaderProps> = ({
  name,
  componentName
}) => {
  const [RemoteComponent, setRemoteComponent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        const Component = loadRemoteComponent(name, componentName);
        setRemoteComponent(() => Component);
      } catch (err) {
        console.error('Error loading remote component:', err);
        setError(`加载组件失败: ${err instanceof Error ? err.message : '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [name, componentName]);

  const getAppInfo = () => {
    const microsystem = microsystemManager.getMicrosystem(name);

    if (microsystem) {
      // 图标映射
      const getIconComponent = (iconName: string) => {
        const iconMap: Record<string, React.ReactNode> = {
          'RocketOutlined': <RocketOutlined />,
          'DollarOutlined': <DollarOutlined />,
          'AppstoreOutlined': <AppstoreOutlined />,
          'InboxOutlined': <InboxOutlined />,
          'UserOutlined': <UserOutlined />,
          'CloudServerOutlined': <CloudServerOutlined />
        };

        return iconMap[iconName] || <AppstoreOutlined />;
      };

      return {
        displayName: microsystem.displayName,
        description: microsystem.description,
        icon: getIconComponent(microsystem.icon)
      };
    }

    // 兜底配置
    return {
      displayName: name,
      description: '正在加载应用...',
      icon: <CloudServerOutlined />
    };
  };

  const appInfo = getAppInfo();

  if (error) {
    return (
      <div className={styles.container}>
        <Alert
          message="模块加载失败"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (loading || !RemoteComponent) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingCard}>
            <div className={styles.loadingIcon}>
              {appInfo.icon}
            </div>
            <div className={styles.loadingTitle}>
              正在启动{appInfo.displayName}
            </div>
            <div className={styles.loadingText}>
              {appInfo.description}
            </div>
            <div className={styles.loadingProgress}>
              <div className={styles.loadingProgressBar}></div>
            </div>
            <div className={styles.loadingTips}>
              正在加载模块组件，请稍候...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Suspense
        fallback={
          <div className={styles.loading}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>正在加载组件...</div>
          </div>
        }
      >
        <RemoteComponent />
      </Suspense>
    </div>
  );
};