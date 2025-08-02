import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { permissions, user } = useAuth();

  const hasAppAccess = (app: 'marketing' | 'finance'): boolean => {
    return permissions?.[app] || false;
  };

  const isAdmin = (): boolean => {
    return user?.roles.includes('admin') || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  return {
    hasAppAccess,
    isAdmin,
    hasRole,
    permissions
  };
};
