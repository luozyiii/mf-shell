import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  AuthContextType,
  User,
  Permissions,
  LoginForm,
  UserRole,
  AppPermission,
} from '../types/auth';
import { AuthUtils } from '../utils/authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// 模拟用户数据（移到组件外部避免依赖问题）
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: '管理员',
    role: UserRole.ADMIN,
    roles: [UserRole.ADMIN],
    permissions: [AppPermission.TEMPLATE],
  },
  {
    id: '2',
    username: 'developer',
    password: 'dev123',
    name: '开发者',
    role: UserRole.DEVELOPER,
    roles: [UserRole.DEVELOPER],
    permissions: [AppPermission.TEMPLATE],
  },
  {
    id: '3',
    username: 'user',
    password: 'user123',
    name: '普通用户',
    role: UserRole.USER,
    roles: [UserRole.USER],
    permissions: [AppPermission.DASHBOARD],
  },
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        // 检查是否跳过认证
        const skipAuth = process.env.REACT_APP_SKIP_AUTH === 'true';

        if (skipAuth) {
          // 开发模式下跳过认证，自动登录为管理员
          const defaultUser = mockUsers[0]; // 使用管理员账户
          const userData: User = {
            id: defaultUser.id,
            username: defaultUser.username,
            name: defaultUser.name,
            role: defaultUser.role,
            roles: defaultUser.roles,
            permissions: defaultUser.permissions,
          };

          const permissionsData: Permissions = {
            apps: defaultUser.permissions,
            features: [],
          };

          setUser(userData);
          setPermissions(permissionsData);

          // 保存到本地存储
          AuthUtils.setToken('dev-token');
          AuthUtils.setUserData(userData);
          AuthUtils.setPermissions(permissionsData);

          // 跳过认证时显示较短的加载时间
          await new Promise(resolve =>
            window.setTimeout(resolve as () => void, 500)
          );
          return;
        }

        // 正常认证流程
        // 使用AuthUtils统一获取数据
        const token = AuthUtils.getToken();
        const userData = AuthUtils.getUserData();
        const permissionsData = AuthUtils.getPermissions();

        if (token && userData && permissionsData) {
          // 用户已登录，静默验证身份
          setUser(userData as unknown as User);
          setPermissions(permissionsData as Permissions);

          // 已登录用户显示较短的骨架屏时间
          await new Promise(resolve =>
            window.setTimeout(resolve as () => void, 800)
          );
        } else {
          // 未登录用户，显示较长的骨架屏时间
          await new Promise(resolve =>
            window.setTimeout(resolve as () => void, 1200)
          );
        }
      } catch {
        // 解析存储的认证数据失败，使用默认值
        // 清除无效的存储数据
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('permissions_data');

        // 验证失败，显示较短时间
        await new Promise(resolve => window.setTimeout(resolve, 600));
      } finally {
        // 先结束初始化状态，再结束加载状态，确保平滑过渡
        setIsInitializing(false);
        window.setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginForm): Promise<void> => {
    // 模拟API调用
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const foundUser = mockUsers.find(
          u =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (foundUser) {
          const userData: User = {
            id: foundUser.id,
            username: foundUser.username,
            name: foundUser.name,
            role: foundUser.role,
            roles: foundUser.roles,
          };

          const userPermissions: Permissions = {
            apps: foundUser.permissions,
          };

          // 生成模拟JWT token
          const token = `mock_jwt_token_${foundUser.id}_${Date.now()}`;

          // 使用AuthUtils统一存储，确保所有应用都能访问
          AuthUtils.setToken(token);
          AuthUtils.setUserData(userData);
          AuthUtils.setPermissions(userPermissions as Record<string, unknown>);

          setUser(userData);
          setPermissions(userPermissions);
          resolve();
        } else {
          reject(new Error('用户名或密码错误'));
        }
      }, 1000); // 模拟网络延迟
    });
  }, []);

  // 只验证凭据并返回token，不存储到主应用
  const loginAndGetToken = useCallback(
    async (credentials: LoginForm): Promise<string> => {
      return new Promise((resolve, reject) => {
        window.setTimeout(() => {
          const foundUser = mockUsers.find(
            u =>
              u.username === credentials.username &&
              u.password === credentials.password
          );

          if (foundUser) {
            // 生成模拟JWT token
            const token = `mock_jwt_token_${foundUser.id}_${Date.now()}`;
            resolve(token);
          } else {
            reject(new Error('用户名或密码错误'));
          }
        }, 1000); // 模拟网络延迟
      });
    },
    []
  );

  const logout = useCallback((): void => {
    // 使用AuthUtils统一清理
    AuthUtils.removeToken();
    setUser(null);
    setPermissions(null);
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!user;

  // 检查用户是否有特定应用权限
  const hasPermission = useCallback(
    (permission: AppPermission): boolean => {
      return permissions?.apps?.includes(permission) || false;
    },
    [permissions]
  );

  // 检查用户是否有特定角色
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return user?.roles?.includes(role) || false;
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    permissions,
    login,
    loginAndGetToken,
    logout,
    isAuthenticated,
    isLoading,
    isInitializing,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
