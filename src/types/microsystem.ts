// 微前端系统类型定义

// 微前端系统名称枚举
export enum MicrosystemName {
  // TEMPLATE = 'template', // Currently unused but kept for future use
}

// 微前端系统分类
export enum MicrosystemCategory {
  // BUSINESS = 'BUSINESS', // Currently unused but kept for future use
}

// 微前端系统配置接口
export interface MicrosystemConfig {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  host: string;
  remoteEntry: string;
  route: string;
  enabled: boolean;
  permissions: string[];
  menuOrder: number;
  category: MicrosystemCategory;
  // 模块联邦相关配置
  useMicroFrontend?: boolean; // 是否使用 iframe 方式
  useModuleFederation?: boolean; // 是否使用模块联邦
}

// 微前端系统集合类型
export type MicrosystemsConfig = Record<string, MicrosystemConfig>;

// 路由配置接口
export interface RouteConfig {
  path: string;
  name: string;
  icon?: string;
  showBack?: boolean;
  backPath?: string;
  component?: string;
}

// 应用路由配置接口
export interface AppRouteConfig {
  appName: string;
  appKey: string;
  routes: RouteConfig[];
}

// Module Federation 远程配置类型
export type ModuleFederationRemotes = Record<string, string>;

// 权限检查函数类型
export type PermissionChecker = () => boolean;

// 微前端加载器属性接口
export interface MicroFrontendLoaderProps {
  name: string;
  host: string;
  path?: string;
}

// 应用权限类型（扩展版本，支持字符串）
export type AppPermissionType = 'template' | string;

// 用户角色类型（扩展版本，支持字符串）
export type UserRoleType = 'admin' | 'developer' | string;
