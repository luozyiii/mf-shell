// 路由配置加载器 - 通过模块联邦动态加载子应用路由配置

export interface AppRouteConfig {
  appKey: string;
  appName: string;
  routePrefix: string;
  routes: RouteItem[];
  permissions: string[];
  enabled: boolean;
}

export interface RouteItem {
  path: string;
  name: string;
  icon?: string;
  component?: string;
  showBack?: boolean;
  backPath?: string;
  permissions?: string[];
  showInMenu?: boolean;
  menuOrder?: number;
}

/**
 * 路由配置加载器类
 */
export class RouteLoader {
  private static routeCache = new Map<string, AppRouteConfig>();
  private static loadingPromises = new Map<string, Promise<AppRouteConfig | null>>();

  /**
   * 动态加载子应用的路由配置
   */
  static async loadRouteConfig(appName: string): Promise<AppRouteConfig | null> {
    // 检查缓存
    if (RouteLoader.routeCache.has(appName)) {
      const cachedConfig = RouteLoader.routeCache.get(appName);
      if (cachedConfig) {
        return cachedConfig;
      }
    }

    // 检查是否正在加载
    if (RouteLoader.loadingPromises.has(appName)) {
      const loadingPromise = RouteLoader.loadingPromises.get(appName);
      if (loadingPromise) {
        return loadingPromise;
      }
    }

    // 创建加载 Promise
    const loadingPromise = RouteLoader.doLoadRouteConfig(appName);
    RouteLoader.loadingPromises.set(appName, loadingPromise);

    try {
      const config = await loadingPromise;
      if (config) {
        RouteLoader.routeCache.set(appName, config);
      }
      return config;
    } finally {
      RouteLoader.loadingPromises.delete(appName);
    }
  }

  /**
   * 实际执行路由配置加载
   */
  private static async doLoadRouteConfig(appName: string): Promise<AppRouteConfig | null> {
    try {
      console.log(`🔄 Loading route config for ${appName}...`);

      let routeModule: any;

      switch (appName) {
        case 'template':
          routeModule = await import('template/routes');
          break;
        default:
          console.warn(`❌ Unknown app: ${appName}`);
          return null;
      }

      // 获取路由配置
      const config =
        routeModule.templateRouteConfig ||
        routeModule.marketingRouteConfig ||
        routeModule.financeRouteConfig ||
        routeModule.default;

      if (!config) {
        console.warn(`❌ No route config found for ${appName}`);
        return null;
      }

      console.log(`✅ Successfully loaded route config for ${appName}:`, config);
      return config;
    } catch (error) {
      console.warn(`❌ Failed to load route config for ${appName}:`, error);
      return null;
    }
  }

  /**
   * 批量加载多个应用的路由配置
   */
  static async loadMultipleRouteConfigs(
    appNames: string[]
  ): Promise<Record<string, AppRouteConfig | null>> {
    const results: Record<string, AppRouteConfig | null> = {};

    const loadPromises = appNames.map(async (appName) => {
      const config = await RouteLoader.loadRouteConfig(appName);
      results[appName] = config;
    });

    await Promise.all(loadPromises);
    return results;
  }

  /**
   * 清除缓存
   */
  static clearCache(appName?: string): void {
    if (appName) {
      RouteLoader.routeCache.delete(appName);
      RouteLoader.loadingPromises.delete(appName);
    } else {
      RouteLoader.routeCache.clear();
      RouteLoader.loadingPromises.clear();
    }
  }

  /**
   * 获取缓存的路由配置
   */
  static getCachedRouteConfig(appName: string): AppRouteConfig | null {
    return RouteLoader.routeCache.get(appName) || null;
  }

  /**
   * 检查路由配置是否已加载
   */
  static isRouteConfigLoaded(appName: string): boolean {
    return RouteLoader.routeCache.has(appName);
  }

  /**
   * 获取所有已加载的路由配置
   */
  static getAllLoadedConfigs(): Record<string, AppRouteConfig> {
    const result: Record<string, AppRouteConfig> = {};
    RouteLoader.routeCache.forEach((config, appName) => {
      result[appName] = config;
    });
    return result;
  }
}

// 类型已在文件开头导出
