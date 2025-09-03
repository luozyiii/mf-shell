import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './resources/en-US/common.json';
import jaJP from './resources/ja-JP/common.json';
// 导入翻译资源
import zhCN from './resources/zh-CN/common.json';

// 翻译资源配置
const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
  'ja-JP': { translation: jaJP },
};

// 支持的语言列表（只包含实际有翻译文件的语言）
export const supportedLanguages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' },
  { code: 'ja-JP', name: '日本語' },
];

// 语言持久化的 localStorage 键
const LANGUAGE_STORAGE_KEY = 'mf-shell-language';

// 获取保存的语言设置
const getSavedLanguage = (): string => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && supportedLanguages.some((lang) => lang.code === saved)) {
      return saved;
    }
  } catch (error) {
    console.warn('Failed to read saved language from localStorage:', error);
  }
  return 'zh-CN'; // 默认语言
};

// 保存语言设置
export const saveLanguage = (languageCode: string): void => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.warn('Failed to save language to localStorage:', error);
  }
};

// 创建 mf-shell 专用的 i18next 实例
const shellI18nInstance = i18n.createInstance();

shellI18nInstance.use(initReactI18next).init({
  resources,
  lng: getSavedLanguage(), // 使用保存的语言或默认语言
  fallbackLng: 'zh-CN', // 回退语言

  interpolation: {
    escapeValue: false, // React 已经处理了 XSS
  },

  react: {
    useSuspense: true, // 启用 Suspense 支持
  },

  // 调试配置
  debug: process.env.NODE_ENV === 'development',

  // 命名空间配置
  defaultNS: 'translation',
  ns: ['translation'],
});

export default shellI18nInstance;
