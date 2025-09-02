import { ControlOutlined, DashboardOutlined } from '@ant-design/icons';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { configManager } from '../config';
import type { AppRouteConfig } from '../utils/routeLoader';
import { usePermissions } from './usePermissions';

// 图标映射函数
const getIconComponent = (iconName?: string): React.ReactNode => {
  if (!iconName) return <DashboardOutlined />;

  const iconMap: Record<string, React.ReactNode> = {
    DashboardOutlined: <DashboardOutlined />,
    ControlOutlined: <ControlOutlined />,
    // 可以根据需要添加更多图标
  };

  return iconMap[iconName] || <DashboardOutlined />;
};

interface MenuItemType {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: MenuItemType[];
}

interface UseMenuItemsProps {
  authLoading: boolean;
  microFrontendRoutes: Record<string, AppRouteConfig | null>;
}

export const useMenuItems = ({
  authLoading,
  microFrontendRoutes,
}: UseMenuItemsProps): MenuItemType[] => {
  const { isAdmin, isDeveloper, getUserPermissionSummary } = usePermissions();
  const { t } = useTranslation();

  // 获取微前端路由名称的国际化翻译
  const getMicroFrontendRouteLabel = useCallback(
    (appName: string, routeName: string): string => {
      const translationKey = `microFrontend.${appName}.${routeName}`;
      const translated = t(translationKey);

      // 如果翻译键不存在，t() 会返回键本身，这时使用原始名称
      if (translated === translationKey) {
        return routeName;
      }

      return translated;
    },
    [t]
  );

  return useMemo(() => {
    // 如果还在加载权限，返回基础菜单
    if (authLoading) {
      return [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: t('pages.dashboard'),
        },
      ];
    }

    const items: MenuItemType[] = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: t('pages.dashboard'),
      },
      {
        key: '/i18n-demo',
        icon: <ControlOutlined />,
        label: t('navigation.i18nDemo'),
      },
    ];

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
    if (getUserPermissionSummary.isAuthenticated) {
      userPermissions.push('template:read');
    }

    const accessibleMicroFrontends = configManager.getAccessibleMicroFrontends(userPermissions);

    accessibleMicroFrontends.forEach((microFrontend) => {
      // 检查是否有路由配置
      const routeConfig = microFrontendRoutes[microFrontend.name];

      if (routeConfig) {
        // 有详细路由配置，显示子菜单
        const menuItem: MenuItemType = {
          key: microFrontend.name,
          icon: getIconComponent(microFrontend.icon),
          label: microFrontend.displayName,
          children: routeConfig.routes.map((route: { path: string; name: string }) => ({
            key: route.path,
            label: getMicroFrontendRouteLabel(microFrontend.name, route.name),
          })),
        };
        items.push(menuItem);
      } else {
        // 没有详细路由配置，显示单一菜单项
        const menuItem: MenuItemType = {
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
    t,
    getMicroFrontendRouteLabel,
  ]);
};
