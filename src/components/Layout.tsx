import {
  LeftOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout as AntLayout, App, Avatar, Button, Dropdown, Menu } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { configManager } from '../config';
import { APP_CONFIG } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useMenuItems } from '../hooks/useMenuItems';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import { getVal, subscribeVal } from '../store/keys';
import { type AppRouteConfig, RouteLoader } from '../utils/routeLoader';

import styles from './Layout.module.css';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

// 简化的布局组件

// 菜单骨架屏组件
const MenuSkeleton = ({ styles }: { styles: any }) => (
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

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const { t, i18n } = useTranslation();

  // 本地化日期格式化函数
  const formatLocalizedDate = () => {
    const date = new Date();
    const locale =
      i18n.language === 'zh-CN' ? 'zh-CN' : i18n.language === 'ja-JP' ? 'ja-JP' : 'en-US';

    return date.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  // 获取微前端路由名称的国际化翻译
  const getMicroFrontendRouteLabel = (appName: string, routeName: string): string => {
    const translationKey = `microFrontend.${appName}.${routeName}`;
    const translated = t(translationKey);

    // 如果翻译键不存在，t() 会返回键本身，这时使用原始名称
    if (translated === translationKey) {
      return routeName;
    }

    return translated;
  };
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
  // 顶栏用户名来自 globalStore，跨 Tab 同步
  const [userName, setUserName] = useState<string>('');
  useEffect(() => {
    try {
      const user = getVal('user') as any;
      if (user?.name) setUserName(user.name);
      const unsub = subscribeVal('user', (_k: string, newVal: any) => {
        if (newVal?.name) setUserName(newVal.name);
      });
      return () => {
        try {
          unsub?.();
        } catch {}
      };
    } catch {}
  }, []);

  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

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
          const routeConfig = await RouteLoader.loadRouteConfig(microFrontend.name);
          if (routeConfig) {
            setMicroFrontendRoutes((prev) => ({
              ...prev,
              [microFrontend.name]: routeConfig,
            }));
            console.log(`✅ Loaded route config for ${microFrontend.name}:`, routeConfig);
          }
        } catch (error) {
          console.warn(`❌ Failed to load route config for ${microFrontend.name}:`, error);
        }
      }
    };

    loadRouteConfigs();
  }, []);

  // 监听语言变化，触发菜单重新渲染
  // 注意：我们不需要重新加载路由配置，只需要让 useMenuItems 重新计算即可
  // 因为 useMenuItems 已经依赖 t() 函数，语言变化时会自动重新计算

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
  // biome-ignore lint/correctness/useExhaustiveDependencies: 需要在路由变化时触发内容过渡动画
  useEffect(() => {
    setContentLoading(true);
    setContentKey((prev) => prev + 1);

    // 短暂延迟后移除加载状态，让内容平滑进入
    const timer = window.setTimeout(() => {
      setContentLoading(false);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  // 监听微前端发送的滚动消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MICRO_FRONTEND_SCROLL_TO_TOP') {
        console.log('Layout: 收到微前端滚动消息', event.data);

        // 使用更完善的滚动逻辑，参考 mf-template 的实现
        const scrollTargets = [
          // 主应用的内容区域
          document.querySelector('.ant-layout-content'),
          // 标识的滚动容器
          document.querySelector('[data-scroll-container="main"]'),
          document.querySelector('[data-scroll-container]'),
          // 备选滚动目标
          document.querySelector('main'),
          document.body,
          document.documentElement,
        ].filter(Boolean) as HTMLElement[];

        console.log('Layout: 找到滚动目标', scrollTargets.length, '个');

        const smooth = event.data.smooth !== false; // 默认为 true

        scrollTargets.forEach((target, index) => {
          if (target) {
            try {
              const targetName =
                target === document.body
                  ? 'body'
                  : target === document.documentElement
                    ? 'documentElement'
                    : target.className || target.tagName;

              console.log(`Layout: 滚动目标 ${index + 1}:`, targetName);

              if (smooth && 'scrollTo' in target && typeof target.scrollTo === 'function') {
                // 平滑滚动
                target.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: 'smooth',
                });
              } else {
                // 即时滚动
                target.scrollTop = 0;
                if ('scrollLeft' in target) {
                  target.scrollLeft = 0;
                }
              }
            } catch (error) {
              // 降级处理
              console.warn('主应用滚动失败，使用降级方案:', error);
              target.scrollTop = 0;
            }
          }
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        message.info(t('messages.developing'));
        break;
      case 'settings':
        message.info(t('messages.developing'));
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  // 使用简化的菜单构建 hook
  const menuItems = useMenuItems({
    authLoading,
    microFrontendRoutes,
  });

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('layout.userMenu.profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('layout.userMenu.settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('layout.userMenu.logout'),
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
        title: t('pages.dashboard'),
        showBack: false,
        backPath: null,
      };
    }

    // 国际化演示
    if (pathname === '/i18n-demo') {
      return {
        title: t('navigation.i18nDemo'),
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
        if (pathname.startsWith(route) && microFrontendRoutes[microFrontend.name]) {
          const routes = microFrontendRoutes[microFrontend.name]?.routes || [];
          const routeConfig = routes.find(
            (r: { path: string; name?: string }) => r.path === pathname
          );
          if (routeConfig) {
            return {
              title: getMicroFrontendRouteLabel(microFrontend.name, routeConfig.name),
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
      title: t('pages.page'),
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

  return (
    <>
      <Helmet>
        <title>
          {currentPageInfo.title} - {APP_CONFIG.APP_NAME}
        </title>
      </Helmet>
      <AntLayout style={{ minHeight: '100vh' }} data-shell-app="true">
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
              <MenuSkeleton styles={styles} />
            ) : (
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                openKeys={openKeys}
                onOpenChange={setOpenKeys}
                items={menuItems as any}
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
              title={collapsed ? t('layout.menu.expand') : t('layout.menu.collapse')}
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
                <span className={styles.pageTitleText}>{currentPageInfo.title}</span>
              </div>
            </div>

            <div className={styles.headerRight}>
              {/* 语言切换器 */}
              <LanguageSwitcher size="middle" />

              {/* 欢迎信息 */}
              <div className={styles.welcomeText}>
                {authLoading
                  ? t('layout.header.loading')
                  : `${t('layout.header.welcome')} ${formatLocalizedDate()}`}
              </div>

              {/* 用户信息区域 */}
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div className={styles.userInfo}>
                  <Avatar size={32} icon={<UserOutlined />} className={styles.userAvatar || ''} />
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>{userName || user?.name}</div>
                  </div>
                  <div className={styles.dropdownArrow}>▼</div>
                </div>
              </Dropdown>
            </div>
          </Header>
          <Content
            className={`${styles.content} ${contentLoading ? styles.contentLoading : ''}`}
            key={contentKey}
            data-scroll-container="main" // 标识主滚动容器
          >
            <div className={styles.contentEntering}>{children}</div>
          </Content>
        </AntLayout>
      </AntLayout>
    </>
  );
};

export default Layout;
