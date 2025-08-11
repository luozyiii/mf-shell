// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  USER = 'user',
}

// 应用权限枚举
export enum AppPermission {
  TEMPLATE = 'template',
  DASHBOARD = 'dashboard',
  SETTINGS = 'settings',
}

// 登录表单接口
export interface LoginForm {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  credentials: LoginCredentials;
}

export interface LoginResponse {
  success: boolean;
  data?: AuthResponse;
  message?: string;
}

export interface PermissionCheckRequest {
  app: string;
  role: UserRole;
}

// 用户信息接口
export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roles: UserRole[];
  avatar?: string;
  email?: string;
  lastLoginTime?: Date;
}

// 权限信息接口
export interface Permissions {
  [AppPermission.TEMPLATE]?: boolean; // 可选，因为模板系统对所有用户开放
}

// 认证上下文类型
export interface AuthContextType {
  user: User | null;
  permissions: Permissions | null;
  login: (credentials: LoginForm) => Promise<void>;
  loginAndGetToken: (credentials: LoginForm) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  hasPermission: (permission: AppPermission) => boolean;
  hasRole: (role: UserRole) => boolean;
}
