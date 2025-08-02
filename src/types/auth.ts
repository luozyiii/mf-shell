// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  MARKETING = 'marketing',
  FINANCE = 'finance'
}

// 应用权限枚举
export enum AppPermission {
  MARKETING = 'marketing',
  FINANCE = 'finance',
  TEMPLATE = 'template'
}

// 登录表单接口
export interface LoginForm {
  username: string;
  password: string;
  remember?: boolean;
}

// 用户信息接口
export interface User {
  id: string;
  username: string;
  name: string;
  roles: UserRole[];
  avatar?: string;
  email?: string;
  lastLoginTime?: Date;
}

// 权限信息接口
export interface Permissions {
  [AppPermission.MARKETING]: boolean;
  [AppPermission.FINANCE]: boolean;
  [AppPermission.TEMPLATE]?: boolean; // 可选，因为模板系统对所有用户开放
}

// 认证上下文接口
export interface AuthContextType {
  user: User | null;
  permissions: Permissions | null;
  login: (credentials: LoginForm) => Promise<void>;
  loginAndGetToken: (credentials: LoginForm) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  hasPermission: (app: AppPermission) => boolean;
  hasRole: (role: UserRole) => boolean;
}
