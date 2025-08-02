import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppstoreOutlined, CloudServerOutlined, RocketOutlined, DollarOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons';
import { microsystemManager } from '../config/microsystems';
import styles from './MicroFrontendLoader.module.css';

interface MicroFrontendLoaderProps {
  name: string;
  host: string;
  path?: string;
}

export const MicroFrontendLoader: React.FC<MicroFrontendLoaderProps> = ({
  name,
  host,
  path = '/'
}) => {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
  };

  // 监听主应用路由变化，同步到子应用
  useEffect(() => {
    if (iframeRef.current && !loading) {
      const currentPath = location.pathname;

      // 检查路径是否属于当前子应用
      if (currentPath.startsWith(`/${name}`)) {
        // 提取子应用内部路径
        const subPath = currentPath.replace(`/${name}`, '') || '/dashboard';

        // 向iframe发送路由变化消息
        try {
          iframeRef.current.contentWindow?.postMessage({
            type: 'ROUTE_CHANGE',
            path: subPath
          }, host);
        } catch (error) {
          console.warn('Failed to send route change message:', error);
        }
      }
    }
  }, [location.pathname, name, host, loading]);

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

  return (
    <div className={styles.container}>
      {loading && (
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
              首次加载可能需要几秒钟，请耐心等待...
            </div>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={host}
        className={`${styles.iframe} ${loading ? styles.iframeLoading : styles.iframeLoaded}`}
        onLoad={handleLoad}
        onError={handleError}
        title={`${name} 微前端应用`}
      />
    </div>
  );
};
