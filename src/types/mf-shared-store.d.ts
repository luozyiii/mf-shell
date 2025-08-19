declare module 'mf-shared/store' {
  export type StorageStrategy = {
    medium: 'memory' | 'local' | 'session';
    encrypted?: boolean;
  };
  export function initGlobalStore(options?: any): void;
  export function setStoreValue(key: string, value: any, callback?: any): void;
  export function getStoreValue<T = any>(key: string): T | undefined;
  export function subscribeStore(
    key: string,
    callback: (key: string, newVal: any, oldVal?: any) => void
  ): () => void;
  export function unsubscribeStore(key: string, callback: any): void;
  export function clearStore(): void;
  export function configureStoreStrategy(
    keyOrPrefix: string,
    strategy: StorageStrategy
  ): void;
  export function clearStoreByPrefix(prefix: string): void;
  const _default: any;
  export default _default;
}
