import { devMicrosystems, devConfig } from './microsystems.dev';
import { prodMicrosystems, prodConfig } from './microsystems.prod';
import {
  MicrosystemConfig as BaseMicrosystemConfig
} from '../types/microsystem';

// 重新导出类型以保持向后兼容
export type MicrosystemConfig = BaseMicrosystemConfig;

export interface EnvironmentConfig {
  [key: string]: any;
}

// 配置管理器类
class MicrosystemManager {
  private currentEnv: 'development' | 'production';
  private microsystems: Record<string, MicrosystemConfig> = {};
  private envConfig: EnvironmentConfig = {};

  constructor() {
    this.currentEnv = (process.env.NODE_ENV as 'development' | 'production') || 'development';
    this.loadConfiguration();
  }

  private loadConfiguration() {
    if (this.currentEnv === 'production') {
      this.microsystems = prodMicrosystems as unknown as Record<string, MicrosystemConfig>;
      this.envConfig = prodConfig;
    } else {
      this.microsystems = devMicrosystems as unknown as Record<string, MicrosystemConfig>;
      this.envConfig = devConfig;
    }
  }

  /**
   * 获取所有启用的微前端系统
   */
  getEnabledMicrosystems(): MicrosystemConfig[] {
    return Object.values(this.microsystems)
      .filter(app => app.enabled)
      .sort((a, b) => a.menuOrder - b.menuOrder);
  }

  /**
   * 根据名称获取微前端系统配置
   */
  getMicrosystem(name: string): MicrosystemConfig | undefined {
    return this.microsystems[name];
  }

  /**
   * 获取所有微前端系统（包括禁用的）
   */
  getAllMicrosystems(): MicrosystemConfig[] {
    return Object.values(this.microsystems)
      .sort((a, b) => a.menuOrder - b.menuOrder);
  }

  /**
   * 根据分类获取微前端系统
   */
  getMicrosystemsByCategory(category: MicrosystemConfig['category']): MicrosystemConfig[] {
    return Object.values(this.microsystems)
      .filter(app => app.category === category && app.enabled)
      .sort((a, b) => a.menuOrder - b.menuOrder);
  }

  /**
   * 检查用户是否有访问指定微前端的权限
   */
  hasPermission(microsystemName: string, userPermissions: string[]): boolean {
    const microsystem = this.getMicrosystem(microsystemName);
    if (!microsystem) return false;

    return microsystem.permissions.some(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * 获取用户可访问的微前端系统
   */
  getAccessibleMicrosystems(userPermissions: string[]): MicrosystemConfig[] {
    return this.getEnabledMicrosystems()
      .filter(app => this.hasPermission(app.name, userPermissions));
  }

  /**
   * 生成 Module Federation 的 remotes 配置
   */
  generateModuleFederationRemotes(): Record<string, string> {
    const remotes: Record<string, string> = {};
    
    this.getEnabledMicrosystems().forEach(app => {
      remotes[app.name] = `${app.name}@${app.remoteEntry}`;
    });

    return remotes;
  }

  /**
   * 获取环境特定配置
   */
  getEnvironmentConfig(): EnvironmentConfig {
    return this.envConfig;
  }

  /**
   * 获取当前环境
   */
  getCurrentEnvironment(): string {
    return this.currentEnv;
  }

  /**
   * 检查微前端是否启用
   */
  isEnabled(name: string): boolean {
    const microsystem = this.getMicrosystem(name);
    return microsystem?.enabled || false;
  }

  /**
   * 获取菜单配置（用于导航菜单）
   */
  getMenuConfig(userPermissions: string[] = []): Array<{
    key: string;
    label: string;
    icon: string;
    path: string;
    category: string;
  }> {
    return this.getAccessibleMicrosystems(userPermissions)
      .map(app => ({
        key: app.name,
        label: app.displayName,
        icon: app.icon,
        path: app.route,
        category: app.category
      }));
  }
}

// 导出单例实例
export const microsystemManager = new MicrosystemManager();

// 导出类型和常用方法
export default microsystemManager;
