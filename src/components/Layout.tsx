import {
  AppstoreOutlined,
  ControlOutlined,
  DashboardOutlined,
  DollarOutlined,
  InboxOutlined,
  LeftOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RocketOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout as AntLayout, Avatar, Button, Dropdown, Menu } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { microsystemManager } from '../config/microsystems';
import { APP_CONFIG } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { UserRole } from '../types/auth';
import { DateUtil } from '../utils';
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

// 路由配置完全由子应用提供，不再使用默认配置

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

  const { user, logout, isLoading: authLoading } = useAuth();
  const { isAdmin, isDeveloper, getUserPermissionSummary } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  // 监听来自子应用的路由配置消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent<MicroFrontendMessage>) => {
      console.log('Received message:', event.data);
      if (event.data.type === 'MICRO_FRONTEND_ROUTES') {
        const { appKey, routes } = event.data;
        console.log('Received routes from', appKey, ':', routes);

        setMicroFrontendRoutes(prev => {
          const newRoutes = {
            ...prev,
            [appKey]: routes,
          };
          console.log('Updated microFrontendRoutes:', newRoutes);
          return newRoutes;
        });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // 预加载子应用路由配置 - 使用简单的模块联邦导入
  useEffect(() => {
    const loadMicroFrontendRoutes = async () => {
      if (authLoading) return;

      // 等待模块联邦运行时初始化
      await new Promise(resolve => window.setTimeout(resolve, 1000));

      // 获取用户权限
      const permissions: string[] = [];
      if (user?.roles.includes(UserRole.ADMIN)) permissions.push('admin:read');
      permissions.push('template:read'); // 所有登录用户都可以访问模板系统

      const accessibleMicrosystems =
        microsystemManager.getAccessibleMicrosystems(permissions);

      // 最简单的模块联邦导入
      for (const microsystem of accessibleMicrosystems) {
        // 避免重复加载
        if (microFrontendRoutes[microsystem.name]) {
          continue;
        }

        // 重试机制
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            // 使用静态导入路径 - 参考 ModuleFederationLoader 的成功实现
            let remoteModule: any;

            if (microsystem.name === 'template') {
              // @ts-ignore
              remoteModule = await import('template/routes');
            } else {
              throw new Error(`Unknown remote: ${microsystem.name}`);
            }

            const routeConfig =
              remoteModule.default || remoteModule.templateRoutes;

            if (routeConfig) {
              setMicroFrontendRoutes(prev => ({
                ...prev,
                [microsystem.name]: routeConfig,
              }));
              break; // 成功加载，跳出重试循环
            }
          } catch (error: any) {
            retryCount++;
            if (retryCount >= maxRetries) {
              console.error(
                `加载 ${microsystem.name} 路由失败 (重试${maxRetries}次):`,
                error.message
              );
              // 静默处理失败，等待子应用通过postMessage发送路由配置
            } else {
              // 等待一段时间后重试
              await new Promise(resolve => window.setTimeout(resolve, 1000));
            }
          }
        }
      }
    };

    loadMicroFrontendRoutes();
  }, [authLoading, user]); // 依赖权限、用户信息的变化

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

    // 使用优化后的权限系统动态生成菜单
    const permissionSummary = getUserPermissionSummary;

    // 构建用户权限列表
    const userPermissions: string[] = [];

    // 管理员权限
    if (isAdmin) {
      userPermissions.push('admin:read', 'admin:write');
    }

    // 开发者权限
    if (isDeveloper) {
      userPermissions.push('developer:read');
    }

    // 所有已认证用户都可以访问模板系统（用于演示）
    if (permissionSummary.isAuthenticated) {
      userPermissions.push('template:read');
    }

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
        const menuItem = {
          key: microsystem.name,
          icon: getIconComponent(microsystem.icon),
          label: microsystem.displayName,
          children: routeConfig.routes.map(
            (route: { path: string; name: string }) => ({
              key: route.path,
              label: route.name,
            })
          ),
        };
        items.push(menuItem);
      } else {
        // 没有详细路由配置，显示单一菜单项
        const menuItem = {
          key: microsystem.route,
          icon: getIconComponent(microsystem.icon),
          label: microsystem.displayName,
        };
        items.push(menuItem);
      }
    });

    return items;
  }, [
    authLoading,
    microFrontendRoutes,
    isAdmin,
    isDeveloper,
    getUserPermissionSummary,
  ]);

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

    // 如果没有找到具体路由配置，尝试根据路径推断页面信息
    const enabledMicrosystems = microsystemManager.getEnabledMicrosystems();
    for (const microsystem of enabledMicrosystems) {
      if (pathname.startsWith(microsystem.route)) {
        return {
          title: microsystem.displayName,
          showBack: true,
          backPath: '/dashboard',
        };
      }
    }

    // 默认配置
    return {
      title: '页面',
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
    <>
      <Helmet>
        <title>
          {currentPageInfo.title} - {APP_CONFIG.APP_NAME}
        </title>
      </Helmet>
      <AntLayout style={{ minHeight: '100vh' }}>
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
    </>
  );
};

export default Layout;
