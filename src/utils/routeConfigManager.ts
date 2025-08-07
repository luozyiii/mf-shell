import { microsystemManager } from '../config/microsystems';

/**
 * 路由配置接口
 */
export interface RouteConfig {
  path: string;
  component: string;
  name: string;
  icon?: string;
  permissions?: string[];
  showInMenu?: boolean;
  menuOrder?: number;
}

/**
 * 应用路由配置接口
 */
export interface AppRouteConfig {
  appKey: string;
  appName: string;
  routePrefix: string;
  routes: RouteConfig[];
  permissions: string[];
  enabled: boolean;
}

/**
 * 动态路由配置管理器
 * 负责从微前端配置和远程应用获取路由配置
 */
class RouteConfigManager {
  private routeCache = new Map<string, RouteConfig[]>();
  private loadingPromises = new Map<string, Promise<RouteConfig[]>>();

  /**
   * 获取所有启用应用的路由配置
   */
  async getAllRouteConfigs(): Promise<Record<string, RouteConfig[]>> {
    const enabledApps = microsystemManager.getEnabledMicrosystems();
    const routeConfigs: Record<string, RouteConfig[]> = {};

    await Promise.all(
      enabledApps.map(async app => {
        if (app.useModuleFederation) {
          routeConfigs[app.name] = await this.getRouteConfigForApp(app.name);
        }
      })
    );

    return routeConfigs;
  }

  /**
   * 获取指定应用的路由配置
   */
  async getRouteConfigForApp(appName: string): Promise<RouteConfig[]> {
    // 检查缓存
    if (this.routeCache.has(appName)) {
      return this.routeCache.get(appName)!;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(appName)) {
      return this.loadingPromises.get(appName)!;
    }

    // 开始加载路由配置
    const loadingPromise = this.loadRouteConfigForApp(appName);
    this.loadingPromises.set(appName, loadingPromise);

    try {
      const routes = await loadingPromise;
      this.routeCache.set(appName, routes);
      return routes;
    } finally {
      this.loadingPromises.delete(appName);
    }
  }

  /**
   * 从远程应用加载路由配置
   */
  private async loadRouteConfigForApp(appName: string): Promise<RouteConfig[]> {
    const microsystem = microsystemManager.getMicrosystem(appName);
    if (!microsystem) {
      console.warn(`Microsystem ${appName} not found`);
      return [];
    }

    try {
      // 尝试从远程应用加载路由配置
      const remoteRoutes = await this.loadRemoteRouteConfig(appName);
      if (remoteRoutes.length > 0) {
        console.log(`Loaded remote route config for ${appName}:`, remoteRoutes);
        return remoteRoutes;
      }
    } catch (error) {
      console.warn(`Failed to load remote route config for ${appName}:`, error);
    }

    // 不再使用默认路由配置，完全依赖远程应用
    console.warn(`No remote route config available for ${appName}`);
    return [];
  }

  /**
   * 从远程应用加载路由配置
   */
  private async loadRemoteRouteConfig(appName: string): Promise<RouteConfig[]> {
    if (appName === 'template') {
      try {
        // 尝试加载 template
        const routeModule = await import('template/routes');
        const routeConfig = routeModule.default || routeModule.templateRoutes;

        if (routeConfig && routeConfig.routes) {
          return routeConfig.routes.map((route: any) => ({
            path: route.path,
            component:
              route.component || this.getComponentNameFromPath(route.path),
            name: route.name,
            icon: route.icon,
            showInMenu: route.showInMenu !== false, // 默认显示在菜单中
            menuOrder: route.menuOrder || 0,
            permissions: route.permissions || [],
          }));
        }
      } catch (error) {
        console.warn(`Failed to load remote routes for ${appName}:`, error);
      }
    }

    // 其他应用的远程路由加载可以在这里添加
    // if (appName === 'marketing') { ... }
    // if (appName === 'finance') { ... }

    return [];
  }

  /**
   * 从路径推断组件名称
   */
  private getComponentNameFromPath(path: string): string {
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];

    // 将路径转换为组件名称（首字母大写）
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }

  /**
   * 清除缓存
   */
  clearCache(appName?: string): void {
    if (appName) {
      this.routeCache.delete(appName);
    } else {
      this.routeCache.clear();
    }
  }

  /**
   * 预加载所有应用的路由配置
   */
  async preloadAllRouteConfigs(): Promise<void> {
    const enabledApps = microsystemManager.getEnabledMicrosystems();

    await Promise.all(
      enabledApps.map(async app => {
        if (app.useModuleFederation) {
          try {
            await this.getRouteConfigForApp(app.name);
          } catch (error) {
            console.warn(
              `Failed to preload route config for ${app.name}:`,
              error
            );
          }
        }
      })
    );
  }

  /**
   * 获取应用的菜单项配置
   */
  async getMenuItemsForApp(appName: string): Promise<
    Array<{
      key: string;
      path: string;
      name: string;
      icon?: string;
      menuOrder?: number;
    }>
  > {
    const routes = await this.getRouteConfigForApp(appName);

    return routes
      .filter(route => route.showInMenu !== false)
      .sort((a, b) => (a.menuOrder || 999) - (b.menuOrder || 999))
      .map(route => ({
        key: route.path,
        path: route.path,
        name: route.name,
        icon: route.icon,
        menuOrder: route.menuOrder,
      }));
  }
}

// 导出单例实例
export const routeConfigManager = new RouteConfigManager();

// 导出类型
export type { RouteConfigManager };

// 默认导出
export default routeConfigManager;
