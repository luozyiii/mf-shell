import { useCallback, useEffect } from 'react';
import shellI18nInstance, { saveLanguage } from '.';

/**
 * mf-shell 主应用的语言切换协调器
 * 负责协调所有微前端应用的语言切换
 */
const useSwitchLanguage = () => {
  // 初始化全局语言设置
  const initializeGlobalLanguage = useCallback(async () => {
    try {
      const { getStoreValue, setStoreValue } = await import('mf-shared/store');
      const currentAppConfig = getStoreValue('app') || {};
      const currentLanguage = shellI18nInstance.language;

      // 总是设置全局 store 的语言，确保与主应用一致
      const updatedConfig = {
        ...currentAppConfig,
        language: currentLanguage,
      };
      setStoreValue('app', updatedConfig);
    } catch (error) {
      console.warn('Failed to initialize global language:', error);
    }
  }, []);

  // 在组件挂载时初始化全局语言
  useEffect(() => {
    initializeGlobalLanguage();
  }, [initializeGlobalLanguage]);
  // 切换主应用语言
  const switchShellLanguage = useCallback((languageCode: string) => {
    shellI18nInstance.changeLanguage(languageCode);
    // 保存语言设置到 localStorage
    saveLanguage(languageCode);
  }, []);

  // 切换模板应用语言
  const switchTemplateLanguage = useCallback(async (languageCode: string) => {
    try {
      // 动态导入模板应用的语言切换函数（不是 Hook）
      // @ts-expect-error - Module Federation 动态导入，运行时存在
      const { switchLanguage } = await import(
        'template/i18n/useSwitchLanguage'
      );
      await switchLanguage(languageCode); // 直接调用函数而不是 Hook
    } catch (error) {
      console.warn(
        'Template app language switch function not available:',
        error
      );
    }
  }, []);

  // 切换所有应用的语言
  const switchAllLanguages = useCallback(
    async (languageCode: string) => {
      // 切换主应用语言
      switchShellLanguage(languageCode);

      // 切换模板应用语言
      await switchTemplateLanguage(languageCode);

      // 同步到全局存储，供其他应用使用
      try {
        const { getStoreValue, setStoreValue } = await import(
          'mf-shared/store'
        );

        // 获取现有的应用配置，保持其他设置不变
        const currentAppConfig = getStoreValue('app') || {};
        const updatedConfig = {
          ...currentAppConfig,
          language: languageCode,
        };

        setStoreValue('app', updatedConfig);
      } catch (error) {
        console.warn('Failed to sync language to global store:', error);
      }
    },
    [switchShellLanguage, switchTemplateLanguage]
  );

  // 获取当前语言
  const getCurrentLanguage = useCallback(() => {
    return shellI18nInstance.language;
  }, []);

  return {
    switchShellLanguage,
    switchTemplateLanguage,
    switchAllLanguages,
    getCurrentLanguage,
  };
};

export default useSwitchLanguage;
