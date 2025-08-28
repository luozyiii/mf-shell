// 统一错误处理工具
export class ErrorHandler {
  /**
   * 安全执行函数，捕获错误并返回默认值
   */
  static safeExecute<T>(fn: () => T, defaultValue: T, errorMessage?: string): T {
    try {
      return fn();
    } catch (error) {
      if (errorMessage) {
        console.warn(errorMessage, error);
      }
      return defaultValue;
    }
  }

  /**
   * 安全执行异步函数
   */
  static async safeExecuteAsync<T>(
    fn: () => Promise<T>,
    defaultValue: T,
    errorMessage?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (errorMessage) {
        console.warn(errorMessage, error);
      }
      return defaultValue;
    }
  }

  /**
   * 安全获取存储值
   */
  static safeGetStorage(
    key: string,
    defaultValue: any = null,
    storage: Storage = localStorage
  ): any {
    return ErrorHandler.safeExecute(
      () => {
        const value = storage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      },
      defaultValue,
      `Failed to get storage value for key: ${key}`
    );
  }

  /**
   * 安全设置存储值
   */
  static safeSetStorage(key: string, value: any, storage: Storage = localStorage): boolean {
    return ErrorHandler.safeExecute(
      () => {
        storage.setItem(key, JSON.stringify(value));
        return true;
      },
      false,
      `Failed to set storage value for key: ${key}`
    );
  }

  /**
   * 安全移除存储值
   */
  static safeRemoveStorage(key: string, storage: Storage = localStorage): boolean {
    return ErrorHandler.safeExecute(
      () => {
        storage.removeItem(key);
        return true;
      },
      false,
      `Failed to remove storage value for key: ${key}`
    );
  }

  /**
   * 安全调用函数（忽略错误）
   */
  static safeCall(fn: () => void, errorMessage?: string): void {
    ErrorHandler.safeExecute(fn, undefined, errorMessage);
  }

  /**
   * 安全调用异步函数（忽略错误）
   */
  static async safeCallAsync(fn: () => Promise<void>, errorMessage?: string): Promise<void> {
    await ErrorHandler.safeExecuteAsync(fn, undefined, errorMessage);
  }
}
