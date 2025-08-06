// 工具函数集合

/**
 * 本地存储工具类
 */
export class StorageUtil {
  /**
   * 设置本地存储
   */
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch {
      // 设置 localStorage 失败，静默处理
    }
  }

  /**
   * 获取本地存储
   */
  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      // 获取 localStorage 失败，静默处理
      return null;
    }
  }

  /**
   * 移除本地存储
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // 删除 localStorage 失败，静默处理
    }
  }
}

/**
 * 日期格式化工具
 */
export class DateUtil {
  /**
   * 格式化日期为中文格式
   */
  static formatToChineseDate(date: Date = new Date()): string {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }
}
