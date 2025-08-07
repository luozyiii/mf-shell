import { useEffect, useState } from 'react';
import { microsystemManager } from '../config/microsystems';
import {
  routeConfigManager,
  type RouteConfig,
} from '../utils/routeConfigManager';

/**
 * 动态路由配置Hook
 * 返回路由配置数据，供App.tsx中直接渲染Route元素使用
 */
export const useDynamicRoutes = () => {
  const [routeConfigs, setRouteConfigs] = useState<
    Record<string, RouteConfig[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // 异步加载路由配置
  useEffect(() => {
    const loadRouteConfigs = async () => {
      try {
        setIsLoading(true);
        const configs = await routeConfigManager.getAllRouteConfigs();
        setRouteConfigs(configs);
        console.log('Loaded dynamic route configs:', configs);
      } catch (error) {
        console.error('Failed to load route configs:', error);
        setRouteConfigs({});
      } finally {
        setIsLoading(false);
      }
    };

    loadRouteConfigs();
  }, []); // 移除依赖项，只在组件挂载时加载一次

  // 获取所有动态路由配置
  const getAllDynamicRoutes = () => {
    const allRoutes: Array<{ microsystem: any; routeConfig: RouteConfig }> = [];
    const enabledMicrosystems = microsystemManager.getEnabledMicrosystems();

    enabledMicrosystems.forEach(microsystem => {
      const appRouteConfigs = routeConfigs[microsystem.name] || [];

      appRouteConfigs.forEach(routeConfig => {
        allRoutes.push({ microsystem, routeConfig });
      });
    });

    return allRoutes;
  };

  return {
    isLoading,
    getAllDynamicRoutes,
  };
};

/**
 * 动态路由配置接口
 * 定义了路由配置的标准格式
 */
export interface DynamicRouteConfig {
  path: string;
  component: string;
  name: string;
  icon?: string;
  permissions?: string[];
  showInMenu?: boolean;
  menuOrder?: number;
}

/**
 * 从远程应用获取路由配置的工具函数
 * 这个函数可以通过 Module Federation 动态加载远程应用的路由配置
 */
export async function loadRemoteRouteConfig(
  appName: string
): Promise<DynamicRouteConfig[]> {
  try {
    // 尝试从远程应用加载路由配置
    if (appName === 'template') {
      // @ts-ignore - 模块联邦运行时导入
      const routeModule = await import('template/routes');
      const routeConfig = routeModule.default || routeModule.templateRoutes;
      return routeConfig.routes || [];
    }

    // 如果无法从远程加载，返回空数组
    return [];
  } catch (error) {
    console.warn(`Failed to load remote route config for ${appName}:`, error);
    return [];
  }
}
