// Short key scheme for mf-shell
// env:app:scope with scopes { user, app, permissions, token }
// env: g (integrated/global)
// app: sh (shell)

// @ts-ignore - MF runtime
import {
  clearStoreByPrefix,
  configureStoreStrategy,
  getStoreValue,
  setStoreValue,
  subscribeStore,
} from 'mf-shared/store';

type Scope = 'user' | 'app' | 'permissions' | 'token';

// 简化：直接使用 user/app/permissions/token，不再使用 g:sh: 前缀
export const shortPrefix = '';
export const keyOf = (scope: Scope) => scope;

const oldKeyOf = (scope: Scope) => {
  const prefix = 'mf-shell-';
  switch (scope) {
    case 'user':
      return `${prefix}userinfo`;
    case 'app':
      return `${prefix}appconfig`;
    case 'permissions':
      return `${prefix}permissions`;
    case 'token':
      return `${prefix}token`;
  }
};

let migrated = false;
export const ensureMigrated = () => {
  if (migrated) return;
  try {
    // 从旧键（mf-shell-*) 以及 g:sh:* 迁移到简单键
    (['user', 'app', 'permissions', 'token'] as Scope[]).forEach((s) => {
      const newK = keyOf(s);
      const oldK = oldKeyOf(s);
      const gshK = `g:sh:${s}`;
      const newVal = getStoreValue(newK);
      if (newVal === undefined || newVal === null) {
        const oldVal = getStoreValue(oldK);
        const gshVal = getStoreValue(gshK);
        const src = oldVal !== undefined && oldVal !== null ? oldVal : gshVal;
        if (src !== undefined && src !== null) {
          try {
            configureStoreStrategy?.(newK, {
              medium: 'local',
              encrypted: s === 'token',
            });
          } catch {}
          setStoreValue(newK, src);
        }
      }
    });
  } catch {}
  migrated = true;
};

export const getVal = (scope: Scope) => {
  ensureMigrated();
  const v = getStoreValue(keyOf(scope));
  if (v !== undefined && v !== null) return v;
  return getStoreValue(oldKeyOf(scope));
};

export const setVal = (scope: Scope, value: any) => {
  ensureMigrated();
  setStoreValue(keyOf(scope), value);
};

export const subscribeVal = (
  scope: Scope,
  cb: (key: string, val: any) => void
) => {
  ensureMigrated();
  const unsubNew = subscribeStore?.(keyOf(scope), cb);
  // also listen old during transition
  const unsubOld = subscribeStore?.(oldKeyOf(scope), cb);
  return () => {
    try {
      unsubNew?.();
    } catch {}
    try {
      unsubOld?.();
    } catch {}
  };
};

export const clearByPrefix = () => {
  try {
    // 清理当前容器下以 shortPrefix 开头的键（简化键下为空前缀，无需处理）
    if (shortPrefix) clearStoreByPrefix(shortPrefix);
  } catch {}
};
