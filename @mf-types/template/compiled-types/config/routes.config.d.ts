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
 * 模板应用路由配置
 * 这个配置可以被主应用通过 Module Federation 获取
 */
export declare const templateRouteConfig: AppRouteConfig;
/**
 * 获取路由配置的函数
 * 主应用可以通过 Module Federation 调用这个函数获取路由配置
 */
export declare const getRouteConfig: () => AppRouteConfig;
/**
 * 获取特定环境的路由配置
 */
export declare const getRouteConfigForEnvironment: (
  env: 'development' | 'production'
) => AppRouteConfig;
export default templateRouteConfig;
