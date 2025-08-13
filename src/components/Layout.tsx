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
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { configManager } from '../config';
import { APP_CONFIG } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { DateUtil } from '../utils';
import { type AppRouteConfig, RouteLoader } from '../utils/routeLoader';
import styles from './Layout.module.css';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

// 清理：移除未使用的接口

// 图标映射函数
const getIconComponent = (iconName?: string): React.ReactNode => {
  if (!iconName) return <AppstoreOutlined />;
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
    const enabledMicrosystems = configManager.getEnabledMicroFrontends();
    const initialState: Record<string, AppRouteConfig | null> = {};
    enabledMicrosystems.forEach((microFrontend) => {
      initialState[microFrontend.name] = null;
    });
    return initialState;
  });

  const { user, logout, isLoading: authLoading } = useAuth();
  const { isAdmin, isDeveloper, getUserPermissionSummary } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  // 动态加载微前端路由配置
  useEffect(() => {
    const loadRouteConfigs = async () => {
      const enabledMicroFrontends = configManager.getEnabledMicroFrontends();
      console.log(
        '🔄 Loading route configs for:',
        enabledMicroFrontends.map((mf) => mf.name)
      );

      for (const microFrontend of enabledMicroFrontends) {
        try {
          const routeConfig = await RouteLoader.loadRouteConfig(
            microFrontend.name
          );
          if (routeConfig) {
            setMicroFrontendRoutes((prev) => ({
              ...prev,
              [microFrontend.name]: routeConfig,
            }));
            console.log(
              `✅ Loaded route config for ${microFrontend.name}:`,
              routeConfig
            );
          }
        } catch (error) {
          console.warn(
            `❌ Failed to load route config for ${microFrontend.name}:`,
            error
          );
        }
      }
    };

    loadRouteConfigs();
  }, []);

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
    const enabledMicroFrontends = configManager.getEnabledMicroFrontends();
    enabledMicroFrontends.forEach((microFrontend) => {
      const route = `/${microFrontend.name}`;
      if (pathname.startsWith(route)) {
        openKeysToSet.push(microFrontend.name);
      }
    });

    setOpenKeys(openKeysToSet);
  }, [location.pathname, collapsed]);

  // 路由变化时的内容过渡效果
  useEffect(() => {
    setContentLoading(true);
    setContentKey((prev) => prev + 1);

    // 短暂延迟后移除加载状态，让内容平滑进入
    const timer = window.setTimeout(() => {
      setContentLoading(false);
    }, 150);

    return () => window.clearTimeout(timer);
  }, []);

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

    const accessibleMicroFrontends =
      configManager.getAccessibleMicroFrontends(userPermissions);

    accessibleMicroFrontends.forEach((microFrontend) => {
      // 检查是否有路由配置
      const routeConfig =
        microFrontendRoutes[
          microFrontend.name as keyof typeof microFrontendRoutes
        ];

      if (routeConfig) {
        // 有详细路由配置，显示子菜单
        const menuItem = {
          key: microFrontend.name,
          icon: getIconComponent(microFrontend.icon),
          label: microFrontend.displayName,
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
          key: `/${microFrontend.name}`,
          icon: getIconComponent(microFrontend.icon),
          label: microFrontend.displayName,
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
      const enabledMicroFrontends = configManager.getEnabledMicroFrontends();
      for (const microFrontend of enabledMicroFrontends) {
        const route = `/${microFrontend.name}`;
        if (
          pathname.startsWith(route) &&
          microFrontendRoutes[microFrontend.name]
        ) {
          const routes = microFrontendRoutes[microFrontend.name]?.routes || [];
          const routeConfig = routes.find(
            (r: { path: string; name?: string }) => r.path === pathname
          );
          if (routeConfig) {
            return {
              title: routeConfig.name,
              showBack: routeConfig.showBack || false,
              backPath: routeConfig.backPath || null,
            };
          }
        }
      }
    } catch {
      // 获取微前端路由配置失败
    }

    // 如果没有找到具体路由配置，尝试根据路径推断页面信息
    const enabledMicroFrontends = configManager.getEnabledMicroFrontends();
    for (const microFrontend of enabledMicroFrontends) {
      const route = `/${microFrontend.name}`;
      if (pathname.startsWith(route)) {
        return {
          title: microFrontend.displayName,
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
    <div className={styles.menuSkeleton}>
      <div className={styles.menuSkeletonItem}>
        <div className={styles.menuSkeletonIcon}></div>
        <div className={styles.menuSkeletonText}></div>
      </div>
      <div className={styles.menuSkeletonItem}>
        <div className={styles.menuSkeletonIcon}></div>
        <div className={styles.menuSkeletonText}></div>
      </div>
      <div className={styles.menuSkeletonItem}>
        <div className={styles.menuSkeletonIcon}></div>
        <div className={styles.menuSkeletonText}></div>
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
          className={`${styles.sider} ${authLoading ? styles.siderLoading : ''}`}
        >
          <div
            className={`${styles.logo} ${collapsed ? styles.logoCollapsed : styles.logoExpanded}`}
          >
            {collapsed ? APP_CONFIG.APP_SHORT_NAME : APP_CONFIG.APP_NAME}
          </div>
          <div className={styles.menuContainer}>
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
                className={`${styles.menu} ${authLoading ? styles.menuLoading : ''}`}
              />
            )}
          </div>

          {/* 折叠按钮 */}
          <div className={styles.collapseButtonContainer}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.collapseButton || ''}
              title={collapsed ? '展开菜单' : '折叠菜单'}
            />
          </div>
        </Sider>
        <AntLayout
          className={`${styles.rightLayout} ${collapsed ? styles.rightLayoutCollapsed : styles.rightLayoutExpanded}`}
        >
          <Header
            className={`${styles.header} ${collapsed ? styles.headerCollapsed : styles.headerExpanded}`}
          >
            <div className={styles.headerLeft}>
              {/* 页面标题区域 */}
              <div className={styles.pageTitle}>
                {currentPageInfo.showBack && (
                  <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={handleBack}
                    className={styles.backButton || ''}
                  />
                )}
                <span className={styles.pageTitleText}>
                  {currentPageInfo.title}
                </span>
              </div>
            </div>

            <div className={styles.headerRight}>
              {/* 欢迎信息 */}
              <div className={styles.welcomeText}>
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
                <div className={styles.userInfo}>
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    className={styles.userAvatar || ''}
                  />
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>{user?.name}</div>
                  </div>
                  <div className={styles.dropdownArrow}>▼</div>
                </div>
              </Dropdown>
            </div>
          </Header>
          <Content
            className={`${styles.content} ${contentLoading ? styles.contentLoading : ''}`}
            key={contentKey}
          >
            <div className={styles.contentEntering}>{children}</div>
          </Content>
        </AntLayout>
      </AntLayout>
    </>
  );
};

export default Layout;
