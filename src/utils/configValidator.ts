// 配置验证工具
import { microsystemManager } from '../config/microsystems';
import { MicrosystemConfig } from '../types/microsystem';

// 验证结果接口
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface DetailedValidationResult extends ValidationResult {
  validConfigs: MicrosystemConfig[];
  invalidConfigs: Array<{
    index: number;
    config: MicrosystemConfig;
    errors: string[];
  }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    enabled: number;
  };
}

export class ConfigValidator {
  // 验证规则常量
  private static readonly VALIDATION_RULES = {
    NAME_PATTERN: /^[a-zA-Z][a-zA-Z0-9-_]*$/,
    ROUTE_PATTERN: /^\/[a-zA-Z0-9-_/]*$/,
    MAX_NAME_LENGTH: 50,
    MAX_DISPLAY_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    REQUIRED_FIELDS: [
      'name',
      'displayName',
      'host',
      'remoteEntry',
      'route',
    ] as const,
    RESERVED_ROUTES: ['/login', '/logout', '/admin', '/api', '/assets'],
    MIN_PORT: 1024,
    MAX_PORT: 65535,
  };

  /**
   * 验证微前端配置的完整性（增强版）
   */
  static validateMicrosystemConfig(): DetailedValidationResult {
    const result: DetailedValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      validConfigs: [],
      invalidConfigs: [],
      summary: {
        total: 0,
        valid: 0,
        invalid: 0,
        enabled: 0,
      },
    };

    try {
      const allMicrosystems = microsystemManager.getAllMicrosystems();
      const enabledMicrosystems = microsystemManager.getEnabledMicrosystems();

      result.summary.total = allMicrosystems.length;
      result.summary.enabled = enabledMicrosystems.length;

      // 检查是否有配置
      if (allMicrosystems.length === 0) {
        result.errors.push('没有找到任何微前端系统配置');
        result.isValid = false;
        return result;
      }

      // 检查每个微前端配置
      allMicrosystems.forEach((microsystem, index) => {
        const configErrors = this.validateSingleMicrosystem(microsystem);
        if (configErrors.length === 0) {
          result.validConfigs.push(microsystem);
          result.summary.valid++;
        } else {
          result.invalidConfigs.push({
            index,
            config: microsystem,
            errors: configErrors,
          });
          result.errors.push(
            ...configErrors.map(
              error => `微前端 ${microsystem.name || `[${index}]`}: ${error}`
            )
          );
          result.summary.invalid++;
          result.isValid = false;
        }
      });

      // 检查启用的微前端
      if (enabledMicrosystems.length === 0) {
        result.warnings.push('没有启用的微前端系统');
      }

      // 全局冲突检查（仅对有效配置进行）
      this.checkGlobalConflicts(result.validConfigs, result);

      // 环境特定检查
      this.checkEnvironmentSpecific(result.validConfigs, result);

      // 性能和安全检查
      this.checkPerformanceAndSecurity(result.validConfigs, result);
    } catch (error) {
      result.errors.push(`配置验证过程中发生错误: ${error}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * 验证单个微前端配置（增强版）
   */
  private static validateSingleMicrosystem(
    microsystem: MicrosystemConfig
  ): string[] {
    const errors: string[] = [];

    // 基本类型检查
    if (!microsystem || typeof microsystem !== 'object') {
      errors.push('配置对象无效');
      return errors;
    }

    // 必填字段检查
    for (const field of this.VALIDATION_RULES.REQUIRED_FIELDS) {
      const value = microsystem[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`缺少必填字段 '${field}'`);
      }
    }

    // 如果必填字段验证失败，直接返回
    if (errors.length > 0) {
      return errors;
    }

    // 名称格式验证
    if (!this.VALIDATION_RULES.NAME_PATTERN.test(microsystem.name)) {
      errors.push('name 只能包含字母、数字、连字符和下划线，且必须以字母开头');
    }

    // 字符串长度验证
    if (microsystem.name.length > this.VALIDATION_RULES.MAX_NAME_LENGTH) {
      errors.push(
        `name 长度不能超过 ${this.VALIDATION_RULES.MAX_NAME_LENGTH} 个字符`
      );
    }

    if (
      microsystem.displayName.length >
      this.VALIDATION_RULES.MAX_DISPLAY_NAME_LENGTH
    ) {
      errors.push(
        `displayName 长度不能超过 ${this.VALIDATION_RULES.MAX_DISPLAY_NAME_LENGTH} 个字符`
      );
    }

    // URL 格式检查
    if (!this.isValidUrl(microsystem.host)) {
      errors.push(`host URL 格式无效: ${microsystem.host}`);
    }

    if (!this.isValidUrl(microsystem.remoteEntry)) {
      errors.push(`remoteEntry URL 格式无效: ${microsystem.remoteEntry}`);
    }

    // 路由格式检查
    if (!microsystem.route.startsWith('/')) {
      errors.push(`route 必须以 '/' 开头: ${microsystem.route}`);
    } else if (!this.VALIDATION_RULES.ROUTE_PATTERN.test(microsystem.route)) {
      errors.push('route 格式不正确，只能包含字母、数字、连字符、下划线和斜杠');
    }

    // 检查保留路由
    if (this.VALIDATION_RULES.RESERVED_ROUTES.includes(microsystem.route)) {
      errors.push(`route '${microsystem.route}' 是保留路由，不能使用`);
    }

    // 权限配置检查
    if (microsystem.permissions && !Array.isArray(microsystem.permissions)) {
      errors.push('permissions 必须是数组格式');
    }

    // 菜单顺序检查
    if (
      typeof microsystem.menuOrder === 'number' &&
      microsystem.menuOrder < 0
    ) {
      errors.push('menuOrder 应该是非负数');
    }

    // 端口检查（如果URL包含端口）
    const hostPort = this.extractPortFromUrl(microsystem.host);
    if (
      hostPort &&
      (hostPort < this.VALIDATION_RULES.MIN_PORT ||
        hostPort > this.VALIDATION_RULES.MAX_PORT)
    ) {
      errors.push(
        `host 端口 ${hostPort} 超出有效范围 (${this.VALIDATION_RULES.MIN_PORT}-${this.VALIDATION_RULES.MAX_PORT})`
      );
    }

    return errors;
  }

  /**
   * 检查全局冲突
   */
  private static checkGlobalConflicts(
    microsystems: MicrosystemConfig[],
    result: DetailedValidationResult
  ): void {
    this.checkRouteConflicts(microsystems, result);
    this.checkPortConflicts(microsystems, result);
    this.checkMenuOrder(microsystems, result);
    this.checkNameConflicts(microsystems, result);
  }

  /**
   * 检查路由冲突（增强版）
   */
  private static checkRouteConflicts(
    microsystems: MicrosystemConfig[],
    result: DetailedValidationResult
  ): void {
    const routeMap = new Map<string, MicrosystemConfig[]>();

    microsystems.forEach(microsystem => {
      const route = microsystem.route;
      if (!routeMap.has(route)) {
        routeMap.set(route, []);
      }
      routeMap.get(route)!.push(microsystem);
    });

    routeMap.forEach((configs, route) => {
      if (configs.length > 1) {
        const names = configs.map(c => c.name).join(', ');
        result.errors.push(
          `路由冲突: 路由 '${route}' 被多个微前端使用 (${names})`
        );
        result.isValid = false;
      }
    });

    // 检查路由嵌套冲突
    const routes = Array.from(routeMap.keys()).sort();
    for (let i = 0; i < routes.length; i++) {
      for (let j = i + 1; j < routes.length; j++) {
        if (
          routes[j].startsWith(routes[i] + '/') ||
          routes[i].startsWith(routes[j] + '/')
        ) {
          result.warnings.push(
            `路由嵌套警告: '${routes[i]}' 和 '${routes[j]}' 可能存在嵌套冲突`
          );
        }
      }
    }
  }

  /**
   * 检查端口冲突（增强版）
   */
  private static checkPortConflicts(
    microsystems: MicrosystemConfig[],
    result: DetailedValidationResult
  ): void {
    const portMap = new Map<number, MicrosystemConfig[]>();

    microsystems.forEach(microsystem => {
      const port = this.extractPortFromUrl(microsystem.host);
      if (port) {
        if (!portMap.has(port)) {
          portMap.set(port, []);
        }
        portMap.get(port)!.push(microsystem);
      }
    });

    portMap.forEach((configs, port) => {
      if (configs.length > 1) {
        const names = configs.map(c => c.name).join(', ');
        if (process.env['NODE_ENV'] === 'production') {
          result.errors.push(
            `端口冲突: 端口 ${port} 被多个微前端使用 (${names})`
          );
          result.isValid = false;
        } else {
          result.warnings.push(
            `端口冲突: 端口 ${port} 被多个微前端使用 (${names})`
          );
        }
      }
    });
  }

  /**
   * 检查名称冲突
   */
  private static checkNameConflicts(
    microsystems: MicrosystemConfig[],
    result: DetailedValidationResult
  ): void {
    const nameMap = new Map<string, MicrosystemConfig[]>();
    const displayNameMap = new Map<string, MicrosystemConfig[]>();

    microsystems.forEach(microsystem => {
      // 检查 name 冲突
      if (!nameMap.has(microsystem.name)) {
        nameMap.set(microsystem.name, []);
      }
      nameMap.get(microsystem.name)!.push(microsystem);

      // 检查 displayName 冲突
      if (!displayNameMap.has(microsystem.displayName)) {
        displayNameMap.set(microsystem.displayName, []);
      }
      displayNameMap.get(microsystem.displayName)!.push(microsystem);
    });

    nameMap.forEach((configs, name) => {
      if (configs.length > 1) {
        result.errors.push(`名称冲突: 名称 '${name}' 被多个微前端使用`);
        result.isValid = false;
      }
    });

    displayNameMap.forEach((configs, displayName) => {
      if (configs.length > 1) {
        const names = configs.map(c => c.name).join(', ');
        result.warnings.push(
          `显示名称重复: '${displayName}' 被多个微前端使用 (${names})`
        );
      }
    });
  }

  /**
   * 检查菜单顺序（增强版）
   */
  private static checkMenuOrder(
    microsystems: MicrosystemConfig[],
    result: DetailedValidationResult
  ): void {
    const orderMap = new Map<number, MicrosystemConfig[]>();
    const withoutOrder: MicrosystemConfig[] = [];

    microsystems.forEach(microsystem => {
      if (typeof microsystem.menuOrder === 'number') {
        if (!orderMap.has(microsystem.menuOrder)) {
          orderMap.set(microsystem.menuOrder, []);
        }
        orderMap.get(microsystem.menuOrder)!.push(microsystem);
      } else {
        withoutOrder.push(microsystem);
      }
    });

    // 检查重复的菜单顺序
    orderMap.forEach((configs, order) => {
      if (configs.length > 1) {
        const names = configs.map(c => c.name).join(', ');
        result.warnings.push(
          `菜单顺序重复: 顺序 ${order} 被多个微前端使用 (${names})`
        );
      }
    });

    // 检查未设置菜单顺序的微前端
    if (withoutOrder.length > 0) {
      const names = withoutOrder.map(c => c.name).join(', ');
      result.warnings.push(`未设置菜单顺序: ${names}`);
    }
  }

  /**
   * 验证 URL 格式（增强版）
   */
  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * 从URL中提取端口号
   */
  private static extractPortFromUrl(url: string): number | null {
    try {
      const urlObj = new URL(url);
      return urlObj.port ? parseInt(urlObj.port, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * 环境特定检查
   */
  private static checkEnvironmentSpecific(
    microsystems: MicrosystemConfig[],
    result: DetailedValidationResult
  ): void {
    const env = process.env['NODE_ENV'];

    if (env === 'production') {
      // 生产环境检查
      microsystems.forEach(microsystem => {
        // 检查是否使用localhost
        if (
          microsystem.host.includes('localhost') ||
          microsystem.host.includes('127.0.0.1')
        ) {
          result.errors.push(`生产环境不应使用localhost: ${microsystem.name}`);
          result.isValid = false;
        }

        // 检查是否使用HTTP（应该使用HTTPS）
        if (microsystem.host.startsWith('http://')) {
          result.warnings.push(`生产环境建议使用HTTPS: ${microsystem.name}`);
        }
      });
    } else if (env === 'development') {
      // 开发环境检查
      microsystems.forEach(microsystem => {
        // 检查开发环境端口范围
        const port = this.extractPortFromUrl(microsystem.host);
        if (port && port < 3000) {
          result.warnings.push(
            `开发环境端口建议使用3000以上: ${microsystem.name} (当前: ${port})`
          );
        }
      });
    }
  }

  /**
   * 性能和安全检查
   */
  private static checkPerformanceAndSecurity(
    microsystems: MicrosystemConfig[],
    result: DetailedValidationResult
  ): void {
    microsystems.forEach(microsystem => {
      // 检查权限配置
      if (!microsystem.permissions || microsystem.permissions.length === 0) {
        result.warnings.push(
          `${microsystem.name}: 建议配置权限要求以提高安全性`
        );
      }

      // 检查图标配置
      if (!microsystem.icon) {
        result.warnings.push(`${microsystem.name}: 建议配置图标以提升用户体验`);
      }

      // 检查描述信息
      if (!microsystem.description) {
        result.warnings.push(
          `${microsystem.name}: 建议添加描述信息以提高可维护性`
        );
      }

      // 检查版本信息
      if (!microsystem.version) {
        result.warnings.push(`${microsystem.name}: 建议配置版本信息`);
      }
    });
  }

  /**
   * 获取验证结果摘要（增强版）
   */
  static getValidationSummary(result: DetailedValidationResult): string {
    const status = result.isValid ? '✅ 配置验证通过' : '❌ 配置验证失败';
    const summary = `\n📊 统计: 总计${result.summary.total}个，有效${result.summary.valid}个，无效${result.summary.invalid}个，已启用${result.summary.enabled}个`;
    const errors =
      result.errors.length > 0
        ? `\n❌ 错误 (${result.errors.length}): ${result.errors.slice(0, 3).join('; ')}${result.errors.length > 3 ? '...' : ''}`
        : '';
    const warnings =
      result.warnings.length > 0
        ? `\n⚠️ 警告 (${result.warnings.length}): ${result.warnings.slice(0, 3).join('; ')}${result.warnings.length > 3 ? '...' : ''}`
        : '';
    return `${status}${summary}${errors}${warnings}`;
  }

  /**
   * 生成详细验证报告
   */
  static generateDetailedReport(result: DetailedValidationResult): string {
    const lines: string[] = [];

    lines.push('=== 微前端配置验证报告 ===');
    lines.push(`验证时间: ${new Date().toLocaleString()}`);
    lines.push(`环境: ${process.env['NODE_ENV'] || 'unknown'}`);
    lines.push('');

    // 统计信息
    lines.push('📊 统计信息:');
    lines.push(`  总配置数: ${result.summary.total}`);
    lines.push(`  有效配置: ${result.summary.valid}`);
    lines.push(`  无效配置: ${result.summary.invalid}`);
    lines.push(`  已启用配置: ${result.summary.enabled}`);
    lines.push('');

    // 错误信息
    if (result.errors.length > 0) {
      lines.push('❌ 错误信息:');
      result.errors.forEach((error, index) => {
        lines.push(`  ${index + 1}. ${error}`);
      });
      lines.push('');
    }

    // 警告信息
    if (result.warnings.length > 0) {
      lines.push('⚠️ 警告信息:');
      result.warnings.forEach((warning, index) => {
        lines.push(`  ${index + 1}. ${warning}`);
      });
      lines.push('');
    }

    // 有效配置列表
    if (result.validConfigs.length > 0) {
      lines.push('✅ 有效配置:');
      result.validConfigs.forEach((config, index) => {
        lines.push(
          `  ${index + 1}. ${config.displayName} (${config.name}) - ${config.route}`
        );
      });
      lines.push('');
    }

    // 无效配置详情
    if (result.invalidConfigs.length > 0) {
      lines.push('❌ 无效配置详情:');
      result.invalidConfigs.forEach(({ index, config, errors }) => {
        lines.push(`  ${index + 1}. ${config.name || '[未命名]'}:`);
        errors.forEach(error => {
          lines.push(`     - ${error}`);
        });
      });
    }

    return lines.join('\n');
  }

  /**
   * 开发环境自动验证（增强版）
   */
  static autoValidateInDev(): void {
    if (process.env['NODE_ENV'] === 'development') {
      const result = this.validateMicrosystemConfig();

      if (!result.isValid) {
        console.warn('🔧 微前端配置验证失败:');
        console.warn(this.getValidationSummary(result));

        // 可以选择输出详细报告
        if (process.env['VERBOSE_VALIDATION'] === 'true') {
          console.log(this.generateDetailedReport(result));
        }
      } else if (result.warnings.length > 0) {
        console.info('✅ 微前端配置验证通过，但有警告:');
        console.info(this.getValidationSummary(result));
      }
    }
  }

  /**
   * 验证单个微前端配置（公共方法）
   */
  static validateSingleConfig(
    config: Partial<MicrosystemConfig>
  ): ValidationResult {
    const errors = this.validateSingleMicrosystem(config as MicrosystemConfig);
    const warnings: string[] = [];

    // 添加警告检查
    if (config.permissions && config.permissions.length === 0) {
      warnings.push('建议配置权限要求');
    }

    if (!config.icon) {
      warnings.push('建议配置图标');
    }

    if (!config.description) {
      warnings.push('建议添加描述信息');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// 开发环境自动执行验证
ConfigValidator.autoValidateInDev();

// 导出验证结果类型
export type { ValidationResult, DetailedValidationResult };
