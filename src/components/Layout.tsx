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
  LeftOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { APP_CONFIG } from '../constants';
import { DateUtil } from '../utils';
import { microsystemManager } from '../config/microsystems';
import styles from './Layout.module.css';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

// 图标映射函数
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'DashboardOutlined': <DashboardOutlined />,
    'ShoppingOutlined': <ShoppingOutlined />,
    'RocketOutlined': <RocketOutlined />,
    'DollarOutlined': <DollarOutlined />,
    'AppstoreOutlined': <AppstoreOutlined />,
    'InboxOutlined': <InboxOutlined />,
    'UserOutlined': <UserOutlined />,
    'SettingOutlined': <SettingOutlined />
  };

  return iconMap[iconName] || <AppstoreOutlined />;
};

// 默认路由配置作为fallback
const getDefaultRoutes = (appName: string) => {
  const defaultConfigs = {
    marketing: {
      appName: '营销系统',
      routes: [
        { path: '/marketing', name: '营销概览', showBack: false },
        { path: '/marketing/campaigns', name: '活动管理', showBack: false },
        { path: '/marketing/analytics', name: '数据分析', showBack: false },
        { path: '/marketing/customers', name: '客户管理', showBack: false }
      ]
    },
    finance: {
      appName: '财务系统',
      routes: [
        { path: '/finance', name: '财务概览', showBack: false },
        { path: '/finance/accounts', name: '账户管理', showBack: false },
        { path: '/finance/reports', name: '财务报表', showBack: false }
      ]
    }
  };
  return defaultConfigs[appName as keyof typeof defaultConfigs] || null;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const [microFrontendRoutes, setMicroFrontendRoutes] = useState<{
    marketing: any;
    finance: any;
  }>({
    marketing: null,
    finance: null
  });

  const { user, logout, isLoading: authLoading } = useAuth();
  const { hasAppAccess } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  // 监听来自子应用的路由配置消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'MICRO_FRONTEND_ROUTES') {
        const { appKey, routes } = event.data;
        console.log(`Received routes from ${appKey}:`, routes);

        setMicroFrontendRoutes(prev => ({
          ...prev,
          [appKey]: routes
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
      // 为有权限的应用创建隐藏iframe来预加载路由配置
      const appsToPreload = [];

      if (hasAppAccess('marketing')) {
        appsToPreload.push({
          name: 'marketing',
          host: process.env.NODE_ENV === 'production'
            ? 'https://luozyiii.github.io/mf-marketing'
            : 'http://localhost:3001'
        });
      }

      if (hasAppAccess('finance')) {
        appsToPreload.push({
          name: 'finance',
          host: process.env.NODE_ENV === 'production'
            ? 'https://luozyiii.github.io/mf-finance'
            : 'http://localhost:3002'
        });
      }

      // 首先设置默认路由，确保即使跨域失败也能正常工作
      appsToPreload.forEach(app => {
        const defaultRoutes = getDefaultRoutes(app.name);
        if (defaultRoutes && !microFrontendRoutes[app.name as keyof typeof microFrontendRoutes]) {
          setMicroFrontendRoutes(prev => ({
            ...prev,
            [app.name]: defaultRoutes
          }));
        }
      });

      appsToPreload.forEach(app => {
        // 检查是否已经有路由配置
        if (!microFrontendRoutes[app.name as keyof typeof microFrontendRoutes]) {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = app.host;
          iframe.onload = () => {
            // iframe加载完成后，尝试获取路由配置
            setTimeout(() => {
              try {
                const iframeWindow = iframe.contentWindow;
                if (iframeWindow && (iframeWindow as any).getRoutes) {
                  const routes = (iframeWindow as any).getRoutes();
                  console.log(`Got routes from ${app.name}:`, routes);
                  setMicroFrontendRoutes(prev => ({
                    ...prev,
                    [app.name]: routes
                  }));
                }
              } catch (error) {
                console.warn(`Failed to get routes from ${app.name}:`, error);
                // 使用默认路由配置作为fallback
                const defaultRoutes = getDefaultRoutes(app.name);
                if (defaultRoutes) {
                  console.log(`Using default routes for ${app.name}:`, defaultRoutes);
                  setMicroFrontendRoutes(prev => ({
                    ...prev,
                    [app.name]: defaultRoutes
                  }));
                }
              }

              // 移除iframe
              setTimeout(() => {
                if (iframe.parentNode) {
                  iframe.parentNode.removeChild(iframe);
                }
              }, 1000);
            }, 2000); // 等待2秒确保子应用完全加载
          };
          document.body.appendChild(iframe);
          console.log(`Preloading routes for ${app.name}`);
        }
      });
    };

    // 延迟一点执行，确保权限检查完成
    if (!authLoading) {
      setTimeout(preloadRoutes, 1000);
    }
  }, [authLoading, hasAppAccess, microFrontendRoutes]);



  // 根据当前路由自动设置展开的菜单
  useEffect(() => {
    // 如果菜单折叠，不展开子菜单
    if (collapsed) {
      setOpenKeys([]);
      return;
    }

    const pathname = location.pathname;
    const openKeysToSet: string[] = [];

    // 检查是否在微前端应用路由下
    if (pathname.startsWith('/marketing')) {
      openKeysToSet.push('marketing');
    } else if (pathname.startsWith('/finance')) {
      openKeysToSet.push('finance');
    }

    setOpenKeys(openKeysToSet);
  }, [location.pathname, collapsed]);

  // 路由变化时的内容过渡效果
  useEffect(() => {
    setContentLoading(true);
    setContentKey(prev => prev + 1);

    // 短暂延迟后移除加载状态，让内容平滑进入
    const timer = setTimeout(() => {
      setContentLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 构建菜单项 - 使用useMemo避免不必要的重新计算
  const menuItems = useMemo(() => {
    console.log('Building menu items...');
    console.log('authLoading:', authLoading);
    console.log('hasAppAccess marketing:', hasAppAccess('marketing'));
    console.log('hasAppAccess finance:', hasAppAccess('finance'));
    console.log('microFrontendRoutes:', microFrontendRoutes);

    // 如果还在加载权限，返回基础菜单
    if (authLoading) {
      return [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: '仪表板'
        }
      ];
    }

    const items: any[] = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: '仪表板'
      }
    ];

    // 使用配置化管理动态生成菜单
    // 将现有的权限系统映射到新的配置系统
    const userPermissions: string[] = [];
    if (permissions?.marketing) userPermissions.push('marketing:read', 'marketing:write');
    if (permissions?.finance) userPermissions.push('finance:read', 'finance:write');
    if (user?.roles.includes('admin' as any)) userPermissions.push('admin:read');

    const accessibleMicrosystems = microsystemManager.getAccessibleMicrosystems(userPermissions);

    accessibleMicrosystems.forEach(microsystem => {
      // 检查是否有路由配置
      const routeConfig = microFrontendRoutes[microsystem.name as keyof typeof microFrontendRoutes];

      if (routeConfig) {
        // 有详细路由配置，显示子菜单
        items.push({
          key: microsystem.name,
          icon: getIconComponent(microsystem.icon),
          label: microsystem.displayName,
          children: routeConfig.routes.map((route: any) => ({
            key: route.path,
            label: route.name
          }))
        });
      } else {
        // 没有详细路由配置，显示单一菜单项
        items.push({
          key: microsystem.route,
          icon: getIconComponent(microsystem.icon),
          label: microsystem.displayName
        });
      }
    });

    return items;
  }, [authLoading, user?.permissions, microFrontendRoutes]);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
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
        backPath: null
      };
    }

    // 尝试从子应用路由配置中获取
    try {
      // 营销系统路由
      if (pathname.startsWith('/marketing') && microFrontendRoutes.marketing) {
        const routes = microFrontendRoutes.marketing.routes;
        const route = routes.find((r: any) => r.path === pathname);
        if (route) {
          return {
            title: route.name,
            showBack: route.showBack || false,
            backPath: route.backPath || null
          };
        }
      }

      // 财务系统路由
      if (pathname.startsWith('/finance') && microFrontendRoutes.finance) {
        const routes = microFrontendRoutes.finance.routes;
        const route = routes.find((r: any) => r.path === pathname);
        if (route) {
          return {
            title: route.name,
            showBack: route.showBack || false,
            backPath: route.backPath || null
          };
        }
      }
    } catch (error) {
      console.warn('Failed to get route config from micro frontend:', error);
    }

    // 默认配置
    return {
      title: '未知页面',
      showBack: false,
      backPath: null
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
    <AntLayout className={styles.layout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={`${styles.sider} ${authLoading ? styles.siderLoading : ''}`}
      >
        <div className={`${styles.logo} ${collapsed ? styles.logoCollapsed : styles.logoExpanded}`}>
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
            className={styles.collapseButton}
            title={collapsed ? '展开菜单' : '折叠菜单'}
          />
        </div>
      </Sider>
      <AntLayout className={`${styles.rightLayout} ${collapsed ? styles.rightLayoutCollapsed : styles.rightLayoutExpanded}`}>
        <Header className={`${styles.header} ${collapsed ? styles.headerCollapsed : styles.headerExpanded}`}>
          <div className={styles.headerLeft}>
            {/* 页面标题区域 */}
            <div className={styles.pageTitle}>
              {currentPageInfo.showBack && (
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={handleBack}
                  className={styles.backButton}
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
              {authLoading ? (
                '加载中...'
              ) : (
                `欢迎回来！今天是 ${DateUtil.formatToChineseDate()}`
              )}
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
                  className={styles.userAvatar}
                />
                <div className={styles.userDetails}>
                  <div className={styles.userName}>
                    {user?.name}
                  </div>
                </div>
                <div className={styles.dropdownArrow}>
                  ▼
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className={`${styles.content} ${contentLoading ? styles.contentLoading : ''}`}
          key={contentKey}
        >
          <div className={styles.contentEntering}>
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
