import React, { useState, useEffect, useMemo } from 'react';
import { Layout as AntLayout, Menu, Button, Dropdown, Avatar } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RocketOutlined,
  AppstoreOutlined,
  InboxOutlined,
  LeftOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { APP_CONFIG } from '../constants';
import { DateUtil } from '../utils';
import { microsystemManager } from '../config/microsystems';
import styles from './Layout.module.css';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

interface RouteConfig {
  path: string;
  name: string;
  icon: string;
  showBack: boolean;
  backPath?: string;
}

interface AppRouteConfig {
  appName: string;
  appKey: string;
  routes: RouteConfig[];
}

interface MicroFrontendMessage {
  type: string;
  appKey: string;
  routes: AppRouteConfig;
}

// 图标映射函数
const getIconComponent = (iconName: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    DashboardOutlined: <DashboardOutlined />,
    ShoppingOutlined: <ShoppingOutlined />,
    RocketOutlined: <RocketOutlined />,
    DollarOutlined: <DollarOutlined />,
    AppstoreOutlined: <AppstoreOutlined />,
    InboxOutlined: <InboxOutlined />,
    UserOutlined: <UserOutlined />,
    SettingOutlined: <SettingOutlined />,
    ControlOutlined: <ControlOutlined />,
  };

  return iconMap[iconName] || <AppstoreOutlined />;
};

// 默认路由配置作为fallback - 从配置系统动态生成
const getDefaultRoutes = (appName: string): AppRouteConfig | null => {
  const microsystem = microsystemManager.getMicrosystem(appName);
  if (!microsystem) return null;

  // 从配置中获取默认路由结构
  const defaultRouteConfigs: Record<string, { routes: RouteConfig[] }> = {
    template: {
      routes: [
        {
          path: '/template/dashboard',
          name: '模板概览',
          icon: 'DashboardOutlined',
          showBack: false,
        },
        {
          path: '/template/feature1',
          name: '功能模块1',
          icon: 'AppstoreOutlined',
          showBack: true,
          backPath: '/template/dashboard',
        },
        {
          path: '/template/feature2',
          name: '功能模块2',
          icon: 'SettingOutlined',
          showBack: true,
          backPath: '/template/dashboard',
        },
        {
          path: '/template/settings',
          name: '系统设置',
          icon: 'ControlOutlined',
          showBack: true,
        },
      ],
    },
  };

  const config = defaultRouteConfigs[appName];
  return config
    ? {
        appName: microsystem.displayName,
        appKey: microsystem.name,
        ...config,
      }
    : null;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  // 动态生成微前端路由状态类型
  const [microFrontendRoutes, setMicroFrontendRoutes] = useState<
    Record<string, AppRouteConfig | null>
  >(() => {
    const enabledMicrosystems = microsystemManager.getEnabledMicrosystems();
    const initialState: Record<string, AppRouteConfig | null> = {};
    enabledMicrosystems.forEach(microsystem => {
      initialState[microsystem.name] = null;
    });
    return initialState;
  });

  const { user, permissions, logout, isLoading: authLoading } = useAuth();
  // const { hasAppAccess } = usePermissions(); // Removed unused variable
  const navigate = useNavigate();
  const location = useLocation();

  // 监听来自子应用的路由配置消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent<MicroFrontendMessage>) => {
      if (event.data.type === 'MICRO_FRONTEND_ROUTES') {
        const { appKey, routes } = event.data;

        setMicroFrontendRoutes(prev => ({
          ...prev,
          [appKey]: routes,
        }));
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // 预加载子应用路由配置
  useEffect(() => {
    const preloadRoutes = () => {
      // 从配置系统获取用户可访问的微前端应用
      const permissions: string[] = [];
      if (user?.roles.includes(UserRole.ADMIN)) permissions.push('admin:read');
      // 所有登录用户都可以访问模板系统（用于演示）
      permissions.push('template:read');

      const accessibleMicrosystems =
        microsystemManager.getAccessibleMicrosystems(permissions);

      const appsToPreload = accessibleMicrosystems.map(microsystem => ({
        name: microsystem.name,
        host: microsystem.host,
      }));

      // 动态导入路由配置
      const loadRoutes = async () => {
        for (const app of appsToPreload) {
          // 检查是否已经有路由配置
          if (
            !microFrontendRoutes[app.name as keyof typeof microFrontendRoutes]
          ) {
            try {
              // 尝试动态导入路由配置
              if (app.name === 'template') {
                try {
                  // 使用动态导入加载路由配置
                  interface WebpackWindow extends Window {
                    __webpack_require__?: {
                      cache?: Record<string, unknown>;
                    };
                    template?: {
                      // eslint-disable-next-line no-unused-vars
                      get: (_module: string) => () => Promise<unknown>;
                    };
                  }
                  const routeModule =
                    (await (window as WebpackWindow).__webpack_require__
                      ?.cache?.['template/routes']) ||
                    (await import(
                      /* webpackIgnore: true */ `${app.host}/remoteEntry.js`
                    ).then(() => {
                      const templateModule = (window as WebpackWindow).template;
                      if (templateModule?.get) {
                        return templateModule
                          .get('./routes')()
                          .then((m: unknown) => m);
                      }
                      return null;
                    }));
                  const routes =
                    (
                      routeModule as {
                        templateRoutes?: AppRouteConfig;
                        default?: AppRouteConfig;
                      }
                    )?.templateRoutes ||
                    (routeModule as { default?: AppRouteConfig })?.default;
                  if (routes) {
                    setMicroFrontendRoutes(prev => ({
                      ...prev,
                      [app.name]: routes,
                    }));
                  } else {
                    throw new Error('No routes found');
                  }
                } catch {
                  // 静默处理路由加载失败，使用默认配置
                  // 使用默认路由配置作为fallback
                  const defaultRoutes = getDefaultRoutes(app.name);
                  if (defaultRoutes) {
                    setMicroFrontendRoutes(prev => ({
                      ...prev,
                      [app.name]: defaultRoutes,
                    }));
                  }
                }
              } else {
                // 对于其他应用，使用iframe方式作为fallback
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = app.host;
                iframe.onload = () => {
                  // iframe加载完成后，尝试获取路由配置
                  window.setTimeout(() => {
                    try {
                      const iframeWindow = iframe.contentWindow;
                      interface IframeWindow extends Window {
                        getRoutes?: () => AppRouteConfig;
                      }
                      if (
                        iframeWindow &&
                        (iframeWindow as IframeWindow).getRoutes
                      ) {
                        const routes = (
                          iframeWindow as IframeWindow
                        ).getRoutes?.();
                        // 获取到路由配置
                        if (routes) {
                          setMicroFrontendRoutes(prev => ({
                            ...prev,
                            [app.name]: routes,
                          }));
                        }
                      }
                    } catch {
                      // 获取路由配置失败
                      // 使用默认路由配置作为fallback
                      const defaultRoutes = getDefaultRoutes(app.name);
                      if (defaultRoutes) {
                        // 使用默认路由配置
                        setMicroFrontendRoutes(prev => ({
                          ...prev,
                          [app.name]: defaultRoutes,
                        }));
                      }
                    }

                    // 移除iframe
                    window.setTimeout(() => {
                      if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                      }
                    }, 1000);
                  }, 2000); // 等待2秒确保子应用完全加载
                };
                document.body.appendChild(iframe);
                // 预加载路由
              }
            } catch {
              // 动态导入路由失败
              // 使用默认路由配置作为fallback
              const defaultRoutes = getDefaultRoutes(app.name);
              if (defaultRoutes) {
                setMicroFrontendRoutes(prev => ({
                  ...prev,
                  [app.name]: defaultRoutes,
                }));
              }
            }
          }
        }
      };

      // 调用异步函数
      loadRoutes();
    };

    // 延迟一点执行，确保权限检查完成
    if (!authLoading) {
      window.setTimeout(preloadRoutes, 1000);
    }
  }, [authLoading, permissions, user, microFrontendRoutes]); // 依赖权限和用户信息的变化

  // 根据当前路由自动设置展开的菜单
  useEffect(() => {
    // 如果菜单折叠，不展开子菜单
    if (collapsed) {
      setOpenKeys([]);
      return;
    }

    const pathname = location.pathname;
    const openKeysToSet: string[] = [];

    // 动态检查是否在微前端应用路由下
    const enabledMicrosystems = microsystemManager.getEnabledMicrosystems();
    enabledMicrosystems.forEach(microsystem => {
      if (pathname.startsWith(microsystem.route)) {
        openKeysToSet.push(microsystem.name);
      }
    });

    setOpenKeys(openKeysToSet);
  }, [location.pathname, collapsed]);

  // 路由变化时的内容过渡效果
  useEffect(() => {
    setContentLoading(true);
    setContentKey(prev => prev + 1);

    // 短暂延迟后移除加载状态，让内容平滑进入
    const timer = window.setTimeout(() => {
      setContentLoading(false);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 构建菜单项 - 使用useMemo避免不必要的重新计算
  const menuItems = useMemo(() => {
    // 如果还在加载权限，返回基础菜单
    if (authLoading) {
      return [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: '仪表板',
        },
      ];
    }

    const items: Array<{
      key: string;
      icon?: React.ReactNode;
      label: string;
      children?: Array<{
        key: string;
        label: string;
      }>;
    }> = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: '仪表板',
      },
    ];

    // 使用配置化管理动态生成菜单
    // 将现有的权限系统映射到新的配置系统
    const userPermissions: string[] = [];
    if (user?.roles.includes(UserRole.ADMIN))
      userPermissions.push('admin:read');
    // 所有登录用户都可以访问模板系统（用于演示）
    userPermissions.push('template:read');

    const accessibleMicrosystems =
      microsystemManager.getAccessibleMicrosystems(userPermissions);

    accessibleMicrosystems.forEach(microsystem => {
      // 检查是否有路由配置
      const routeConfig =
        microFrontendRoutes[
          microsystem.name as keyof typeof microFrontendRoutes
        ];

      if (routeConfig) {
        // 有详细路由配置，显示子菜单
        items.push({
          key: microsystem.name,
          icon: getIconComponent(microsystem.icon),
          label: microsystem.displayName,
          children: routeConfig.routes.map(
            (route: { path: string; name: string }) => ({
              key: route.path,
              label: route.name,
            })
          ),
        });
      } else {
        // 没有详细路由配置，显示单一菜单项
        items.push({
          key: microsystem.route,
          icon: getIconComponent(microsystem.icon),
          label: microsystem.displayName,
        });
      }
    });

    return items;
  }, [authLoading, microFrontendRoutes, user]);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    // 如果点击的是子菜单项（以/开头的路径），则导航
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  // 获取当前页面信息
  const getCurrentPageInfo = () => {
    const pathname = location.pathname;

    // 主仪表板
    if (pathname === '/dashboard') {
      return {
        title: '仪表板',
        showBack: false,
        backPath: null,
      };
    }

    // 尝试从子应用路由配置中获取
    try {
      // 动态检查所有微前端系统的路由
      const enabledMicrosystems = microsystemManager.getEnabledMicrosystems();
      for (const microsystem of enabledMicrosystems) {
        if (
          pathname.startsWith(microsystem.route) &&
          microFrontendRoutes[microsystem.name]
        ) {
          const routes = microFrontendRoutes[microsystem.name]?.routes || [];
          const route = routes.find(
            (r: { path: string; name?: string }) => r.path === pathname
          );
          if (route) {
            return {
              title: route.name,
              showBack: route.showBack || false,
              backPath: route.backPath || null,
            };
          }
        }
      }
    } catch {
      // 获取微前端路由配置失败
    }

    // 默认配置
    return {
      title: '未知页面',
      showBack: false,
      backPath: null,
    };
  };

  const currentPageInfo = getCurrentPageInfo();

  const handleBack = () => {
    if (currentPageInfo.backPath) {
      // 如果配置了自定义返回路径，使用自定义路径
      navigate(currentPageInfo.backPath);
    } else {
      // 如果没有配置backPath，默认返回上一页
      navigate(-1);
    }
  };

  // 菜单骨架屏组件
  const MenuSkeleton = () => (
    <div className={styles['menuSkeleton']}>
      <div className={styles['menuSkeletonItem']}>
        <div className={styles['menuSkeletonIcon']}></div>
        <div className={styles['menuSkeletonText']}></div>
      </div>
      <div className={styles['menuSkeletonItem']}>
        <div className={styles['menuSkeletonIcon']}></div>
        <div className={styles['menuSkeletonText']}></div>
      </div>
      <div className={styles['menuSkeletonItem']}>
        <div className={styles['menuSkeletonIcon']}></div>
        <div className={styles['menuSkeletonText']}></div>
      </div>
    </div>
  );

  return (
    <AntLayout className={styles['layout']}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={`${styles['sider']} ${authLoading ? styles['siderLoading'] : ''}`}
      >
        <div
          className={`${styles['logo']} ${collapsed ? styles['logoCollapsed'] : styles['logoExpanded']}`}
        >
          {collapsed ? APP_CONFIG.APP_SHORT_NAME : APP_CONFIG.APP_NAME}
        </div>
        <div className={styles['menuContainer']}>
          {authLoading ? (
            <MenuSkeleton />
          ) : (
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              items={menuItems}
              onClick={handleMenuClick}
              className={`${styles['menu']} ${authLoading ? styles['menuLoading'] : ''}`}
            />
          )}
        </div>

        {/* 折叠按钮 */}
        <div className={styles['collapseButtonContainer']}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={styles['collapseButton'] || ''}
            title={collapsed ? '展开菜单' : '折叠菜单'}
          />
        </div>
      </Sider>
      <AntLayout
        className={`${styles['rightLayout']} ${collapsed ? styles['rightLayoutCollapsed'] : styles['rightLayoutExpanded']}`}
      >
        <Header
          className={`${styles['header']} ${collapsed ? styles['headerCollapsed'] : styles['headerExpanded']}`}
        >
          <div className={styles['headerLeft']}>
            {/* 页面标题区域 */}
            <div className={styles['pageTitle']}>
              {currentPageInfo.showBack && (
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={handleBack}
                  className={styles['backButton'] || ''}
                />
              )}
              <span className={styles['pageTitleText']}>
                {currentPageInfo.title}
              </span>
            </div>
          </div>

          <div className={styles['headerRight']}>
            {/* 欢迎信息 */}
            <div className={styles['welcomeText']}>
              {authLoading
                ? '加载中...'
                : `欢迎回来！今天是 ${DateUtil.formatToChineseDate()}`}
            </div>

            {/* 用户信息区域 */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className={styles['userInfo']}>
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  className={styles['userAvatar'] || ''}
                />
                <div className={styles['userDetails']}>
                  <div className={styles['userName']}>{user?.name}</div>
                </div>
                <div className={styles['dropdownArrow']}>▼</div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className={`${styles['content']} ${contentLoading ? styles['contentLoading'] : ''}`}
          key={contentKey}
        >
          <div className={styles['contentEntering']}>{children}</div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
