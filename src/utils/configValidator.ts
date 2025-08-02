// 配置验证工具
import { microsystemManager } from '../config/microsystems';
import { MicrosystemConfig } from '../types/microsystem';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigValidator {
  /**
   * 验证微前端配置的完整性
   */
  static validateMicrosystemConfig(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const allMicrosystems = microsystemManager.getAllMicrosystems();
      const enabledMicrosystems = microsystemManager.getEnabledMicrosystems();

      // 检查是否有配置
      if (allMicrosystems.length === 0) {
        result.errors.push('没有找到任何微前端系统配置');
        result.isValid = false;
        return result;
      }

      // 检查每个微前端配置
      allMicrosystems.forEach((microsystem, index) => {
        this.validateSingleMicrosystem(microsystem, index, result);
      });

      // 检查启用的微前端
      if (enabledMicrosystems.length === 0) {
        result.warnings.push('没有启用的微前端系统');
      }

      // 检查路由冲突
      this.checkRouteConflicts(enabledMicrosystems, result);

      // 检查端口冲突
      this.checkPortConflicts(enabledMicrosystems, result);

      // 检查菜单顺序
      this.checkMenuOrder(enabledMicrosystems, result);

    } catch (error) {
      result.errors.push(`配置验证过程中发生错误: ${error}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * 验证单个微前端配置
   */
  private static validateSingleMicrosystem(
    microsystem: MicrosystemConfig, 
    index: number, 
    result: ValidationResult
  ): void {
    const prefix = `微前端 ${microsystem.name || `[${index}]`}`;

    // 必填字段检查
    const requiredFields = ['name', 'displayName', 'host', 'remoteEntry', 'route'];
    requiredFields.forEach(field => {
      if (!microsystem[field as keyof MicrosystemConfig]) {
        result.errors.push(`${prefix}: 缺少必填字段 '${field}'`);
        result.isValid = false;
      }
    });

    // URL 格式检查
    if (microsystem.host && !this.isValidUrl(microsystem.host)) {
      result.errors.push(`${prefix}: host URL 格式无效: ${microsystem.host}`);
      result.isValid = false;
    }

    if (microsystem.remoteEntry && !this.isValidUrl(microsystem.remoteEntry)) {
      result.errors.push(`${prefix}: remoteEntry URL 格式无效: ${microsystem.remoteEntry}`);
      result.isValid = false;
    }

    // 路由格式检查
    if (microsystem.route && !microsystem.route.startsWith('/')) {
      result.errors.push(`${prefix}: route 必须以 '/' 开头: ${microsystem.route}`);
      result.isValid = false;
    }

    // 权限配置检查
    if (!microsystem.permissions || microsystem.permissions.length === 0) {
      result.warnings.push(`${prefix}: 没有配置权限要求`);
    }

    // 图标配置检查
    if (!microsystem.icon) {
      result.warnings.push(`${prefix}: 没有配置图标`);
    }

    // 菜单顺序检查
    if (typeof microsystem.menuOrder !== 'number' || microsystem.menuOrder < 0) {
      result.warnings.push(`${prefix}: menuOrder 应该是非负数`);
    }
  }

  /**
   * 检查路由冲突
   */
  private static checkRouteConflicts(microsystems: MicrosystemConfig[], result: ValidationResult): void {
    const routes = new Set<string>();
    const duplicates = new Set<string>();

    microsystems.forEach(microsystem => {
      if (routes.has(microsystem.route)) {
        duplicates.add(microsystem.route);
      }
      routes.add(microsystem.route);
    });

    duplicates.forEach(route => {
      result.errors.push(`路由冲突: 多个微前端使用相同的路由 '${route}'`);
      result.isValid = false;
    });
  }

  /**
   * 检查端口冲突（仅开发环境）
   */
  private static checkPortConflicts(microsystems: MicrosystemConfig[], result: ValidationResult): void {
    if (process.env.NODE_ENV === 'production') return;

    const ports = new Set<string>();
    const duplicates = new Set<string>();

    microsystems.forEach(microsystem => {
      const match = microsystem.host.match(/:(\d+)/);
      if (match) {
        const port = match[1];
        if (ports.has(port)) {
          duplicates.add(port);
        }
        ports.add(port);
      }
    });

    duplicates.forEach(port => {
      result.warnings.push(`端口冲突: 多个微前端使用相同的端口 ${port}`);
    });
  }

  /**
   * 检查菜单顺序
   */
  private static checkMenuOrder(microsystems: MicrosystemConfig[], result: ValidationResult): void {
    const orders = microsystems.map(m => m.menuOrder).filter(o => typeof o === 'number');
    const uniqueOrders = new Set(orders);

    if (orders.length !== uniqueOrders.size) {
      result.warnings.push('存在重复的菜单顺序，可能影响菜单显示顺序');
    }
  }

  /**
   * 验证 URL 格式
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 打印验证结果
   */
  static printValidationResult(result: ValidationResult): void {
    console.group('🔍 微前端配置验证结果');
    
    if (result.isValid) {
      console.log('✅ 配置验证通过');
    } else {
      console.log('❌ 配置验证失败');
    }

    if (result.errors.length > 0) {
      console.group('❌ 错误:');
      result.errors.forEach(error => console.error(`  • ${error}`));
      console.groupEnd();
    }

    if (result.warnings.length > 0) {
      console.group('⚠️ 警告:');
      result.warnings.forEach(warning => console.warn(`  • ${warning}`));
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * 开发环境自动验证
   */
  static autoValidateInDev(): void {
    if (process.env.NODE_ENV === 'development') {
      const result = this.validateMicrosystemConfig();
      this.printValidationResult(result);
    }
  }
}

// 开发环境自动执行验证
ConfigValidator.autoValidateInDev();
