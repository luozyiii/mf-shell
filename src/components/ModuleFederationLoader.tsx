import React, { Suspense, useState, useEffect } from 'react';
import { Spin, Alert } from 'antd';
import {
  AppstoreOutlined,
  CloudServerOutlined,
  RocketOutlined,
  DollarOutlined,
  InboxOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { microsystemManager } from '../config/microsystems';
import styles from './MicroFrontendLoader.module.css';

// 声明 webpack 模块联邦相关的全局变量
// declare const __webpack_share_scopes__: any; // Unused
// declare const __webpack_init_sharing__: any; // Unused

interface ModuleFederationLoaderProps {
  name: string;
  componentName: string;
}

const loadRemoteComponent = (
  name: string,
  componentName: string
): React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>> => {
  return React.lazy(async () => {
    try {
      // 使用最简单的动态导入方法
      let module: { default: React.ComponentType<Record<string, unknown>> };

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

      // 返回组件
      return { default: module.default || module };
    } catch (error) {
      // 加载组件失败，返回错误组件
      return {
        default: (): React.ReactElement => (
          <Alert
            message="组件加载失败"
            description={`无法加载 ${name} 应用的 ${componentName} 组件。错误: ${error instanceof Error ? error.message : '未知错误'}`}
            type="error"
            showIcon
          />
        ),
      };
    }
  });
};

export const ModuleFederationLoader: React.FC<ModuleFederationLoaderProps> = ({
  name,
  componentName,
}) => {
  const [RemoteComponent, setRemoteComponent] =
    useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const Component = loadRemoteComponent(name, componentName);
        setRemoteComponent(() => Component);
      } catch (err) {
        // 加载远程组件时发生错误
        setError(
          `加载组件失败: ${err instanceof Error ? err.message : '未知错误'}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [name, componentName]);

  const getAppInfo = (): {
    name: string;
    icon: React.ReactNode;
    description: string;
  } | null => {
    const microsystem = microsystemManager.getMicrosystem(name);

    if (microsystem) {
      // 图标映射
      const getIconComponent = (iconName: string): React.ReactNode => {
        const iconMap: Record<string, React.ReactNode> = {
          RocketOutlined: <RocketOutlined />,
          DollarOutlined: <DollarOutlined />,
          AppstoreOutlined: <AppstoreOutlined />,
          InboxOutlined: <InboxOutlined />,
          UserOutlined: <UserOutlined />,
          CloudServerOutlined: <CloudServerOutlined />,
        };

        return iconMap[iconName] || <AppstoreOutlined />;
      };

      return {
        name: microsystem.name,
        description: microsystem.description,
        icon: getIconComponent(microsystem.icon),
      };
    }

    // 兜底配置
    return {
      name: name as string,
      description: '正在加载应用...',
      icon: <CloudServerOutlined />,
    };
  };

  const appInfo = getAppInfo();

  if (error) {
    return (
      <div className={styles['container']}>
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
      <div className={styles['container']}>
        <div className={styles['loading']}>
          <div className={styles['loadingCard']}>
            <div className={styles['loadingIcon']}>{appInfo?.icon}</div>
            <div className={styles['loadingTitle']}>
              正在启动{appInfo?.name}
            </div>
            <div className={styles['loadingText']}>{appInfo?.description}</div>
            <div className={styles['loadingProgress']}>
              <div className={styles['loadingProgressBar']}></div>
            </div>
            <div className={styles['loadingTips']}>
              正在加载模块组件，请稍候...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['container']}>
      <Suspense
        fallback={
          <div className={styles['loading']}>
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
