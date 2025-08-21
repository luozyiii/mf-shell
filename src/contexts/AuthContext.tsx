// @ts-expect-error - MF runtime
import { configureStoreStrategy, setStoreValue } from 'mf-shared/store';
import type React from 'react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// @ts-expect-error - JSON modules
import users from '../mock/userinfo.json';
import {
  AppPermission,
  type AuthContextType,
  type LoginForm,
  type Permissions,
  type User,
  UserRole,
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
    permissions: [AppPermission.TEMPLATE],
  },
  {
    id: '2',
    username: 'developer',
    password: 'dev123',
    name: '开发者',
    role: UserRole.DEVELOPER,
    permissions: [AppPermission.TEMPLATE],
  },
  {
    id: '3',
    username: 'user',
    password: 'user123',
    name: '普通用户',
    role: UserRole.USER,
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
            permissions: defaultUser.permissions,
          };

          const permissionsData: Permissions = {
            [AppPermission.TEMPLATE]: defaultUser.permissions.includes(
              AppPermission.TEMPLATE
            ),
          };

          setUser(userData);
          setPermissions(permissionsData);

          // 保存到本地存储
          AuthUtils.setToken('dev-token');
          AuthUtils.setUserData(userData as any);
          AuthUtils.setPermissions(permissionsData as any);

          // 跳过认证时显示较短的加载时间
          await new Promise((resolve) =>
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
          await new Promise((resolve) =>
            window.setTimeout(resolve as () => void, 800)
          );
        } else {
          // 未登录用户，显示较长的骨架屏时间
          await new Promise((resolve) =>
            window.setTimeout(resolve as () => void, 1200)
          );
        }
      } catch {
        // 解析存储的认证数据失败，使用默认值
        // 清除无效的存储数据
        localStorage.removeItem('user_data');
        localStorage.removeItem('permissions_data');

        // 验证失败，显示较短时间
        await new Promise((resolve) => window.setTimeout(resolve, 600));
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
    // 模拟API调用（读取本地 mock 文件）
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const list: any[] = (users as any[])?.length
          ? (users as any[])
          : mockUsers;
        const foundUser = list.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (foundUser) {
          const userData: User = {
            id: foundUser.id,
            username: foundUser.username,
            name: foundUser.name,
            role: foundUser.role,
            permissions: foundUser.permissions,
          };

          const permissionsData: Permissions = {
            [AppPermission.TEMPLATE]: !!foundUser.permissions?.includes(
              AppPermission.TEMPLATE
            ),
          };

          // 生成模拟JWT token
          const token = `mock_jwt_token_${foundUser.id}_${Date.now()}`;

          // 使用AuthUtils写入 token / user / permissions（同时写 globalStore）
          AuthUtils.setToken(token);
          AuthUtils.setUserData(userData as any);
          AuthUtils.setPermissions(permissionsData as Record<string, unknown>);

          // 同步写入 globalStore（简化键）
          try {
            configureStoreStrategy?.('user', {
              medium: 'local',
              encrypted: true,
            });
            configureStoreStrategy?.('permissions', {
              medium: 'local',
              encrypted: false,
            });
            setStoreValue?.('user', userData as any);
            setStoreValue?.('permissions', permissionsData as any);
          } catch {}

          setUser(userData);
          setPermissions(permissionsData);
          resolve();
        } else {
          reject(new Error('用户名或密码错误'));
        }
      }, 600);
    });
  }, []);

  // 只验证凭据并返回token，不存储到主应用
  const loginAndGetToken = useCallback(
    async (credentials: LoginForm): Promise<string> => {
      console.log(
        'AuthContext.loginAndGetToken: Starting authentication for:',
        credentials.username
      );

      return new Promise((resolve, reject) => {
        window.setTimeout(() => {
          try {
            const list: any[] = (users as any[])?.length
              ? (users as any[])
              : mockUsers;
            const foundUser = list.find(
              (u) =>
                u.username === credentials.username &&
                u.password === credentials.password
            );

            if (foundUser) {
              // 生成模拟JWT token
              const token = `mock_jwt_token_${foundUser.id}_${Date.now()}`;
              console.log(
                'AuthContext.loginAndGetToken: Token generated successfully:',
                token
              );
              resolve(token);
            } else {
              console.warn(
                'AuthContext.loginAndGetToken: Authentication failed for user:',
                credentials.username
              );
              reject(new Error('用户名或密码错误'));
            }
          } catch (error) {
            console.error(
              'AuthContext.loginAndGetToken: Unexpected error:',
              error
            );
            reject(new Error('登录过程中发生错误'));
          }
        }, 1000); // 模拟网络延迟
      });
    },
    []
  );

  const logout = useCallback((): void => {
    // 使用AuthUtils统一清理（包括clearAppData），传入 navigate 函数
    AuthUtils.logout();
    setUser(null);
    setPermissions(null);
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!user;

  // 检查用户是否有特定应用权限
  const hasPermission = useCallback(
    (permission: AppPermission): boolean => {
      return permissions?.[permission] || false;
    },
    [permissions]
  );

  // 检查用户是否有特定角色
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return user?.permissions?.includes(role) || false;
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
