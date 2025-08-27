import type React from 'react';
import { I18nextProvider } from 'react-i18next';
import shellI18nInstance from './index';

interface ShellI18nProviderProps {
  children: React.ReactNode;
}

/**
 * mf-shell 应用的国际化提供者组件
 * 使用独立的 i18next 实例，避免与其他微前端应用冲突
 */
const ShellI18nProvider: React.FC<ShellI18nProviderProps> = ({ children }) => {
  return <I18nextProvider i18n={shellI18nInstance}>{children}</I18nextProvider>;
};

export default ShellI18nProvider;
