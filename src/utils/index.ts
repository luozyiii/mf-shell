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
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
    }
  }

  /**
   * 获取本地存储
   */
  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return null;
    }
  }

  /**
   * 移除本地存储
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
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
      weekday: 'long'
    });
  }
}
