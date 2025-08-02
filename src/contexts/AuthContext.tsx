import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, Permissions, LoginForm, UserRole, AppPermission } from '../types/auth';
import { AuthUtils } from '../utils/authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // 模拟用户数据
  const mockUsers = [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      name: '管理员',
      roles: [UserRole.ADMIN],
      permissions: { [AppPermission.MARKETING]: true, [AppPermission.FINANCE]: true }
    },
    {
      id: '2',
      username: 'marketing',
      password: 'marketing123',
      name: '营销人员',
      roles: [UserRole.MARKETING],
      permissions: { [AppPermission.MARKETING]: true, [AppPermission.FINANCE]: false }
    },
    {
      id: '3',
      username: 'finance',
      password: 'finance123',
      name: '财务人员',
      roles: [UserRole.FINANCE],
      permissions: { [AppPermission.MARKETING]: false, [AppPermission.FINANCE]: true }
    }
  ];

  // 检查本地存储中的认证状态
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 使用AuthUtils统一获取数据
        const token = AuthUtils.getToken();
        const userData = AuthUtils.getUserData();
        const permissionsData = AuthUtils.getPermissions();

        if (token && userData && permissionsData) {
          // 用户已登录，静默验证身份
          setUser(userData);
          setPermissions(permissionsData);

          // 已登录用户显示较短的骨架屏时间
          await new Promise(resolve => setTimeout(resolve, 800));
        } else {
          // 未登录用户，显示较长的骨架屏时间
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        // 清除无效的存储数据
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('permissions_data');

        // 验证失败，显示较短时间
        await new Promise(resolve => setTimeout(resolve, 600));
      } finally {
        // 先结束初始化状态，再结束加载状态，确保平滑过渡
        setIsInitializing(false);
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginForm): Promise<void> => {
    // 模拟API调用
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(
          u => u.username === credentials.username && u.password === credentials.password
        );

        if (foundUser) {
          const userData: User = {
            id: foundUser.id,
            username: foundUser.username,
            name: foundUser.name,
            roles: foundUser.roles
          };

          const userPermissions: Permissions = foundUser.permissions;

          // 生成模拟JWT token
          const token = `mock_jwt_token_${foundUser.id}_${Date.now()}`;

          // 使用AuthUtils统一存储，确保所有应用都能访问
          AuthUtils.setToken(token);
          AuthUtils.setUserData(userData);
          AuthUtils.setPermissions(userPermissions);

          setUser(userData);
          setPermissions(userPermissions);
          resolve();
        } else {
          reject(new Error('用户名或密码错误'));
        }
      }, 1000); // 模拟网络延迟
    });
  };

  // 只验证凭据并返回token，不存储到主应用
  const loginAndGetToken = async (credentials: LoginForm): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(
          u => u.username === credentials.username && u.password === credentials.password
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
  };

  const logout = (): void => {
    // 使用AuthUtils统一清理
    AuthUtils.removeToken();
    setUser(null);
    setPermissions(null);
    setIsLoading(false);
  };

  const isAuthenticated = !!user;

  // 检查用户是否有特定应用权限
  const hasPermission = (app: AppPermission): boolean => {
    return permissions?.[app] ?? false;
  };

  // 检查用户是否有特定角色
  const hasRole = (role: UserRole): boolean => {
    return user?.roles.includes(role) ?? false;
  };

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
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
