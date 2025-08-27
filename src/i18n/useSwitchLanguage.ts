import { useCallback } from 'react';
import shellI18nInstance, { saveLanguage } from '.';

/**
 * mf-shell 主应用的语言切换协调器
 * 负责协调所有微前端应用的语言切换
 */
const useSwitchLanguage = () => {
  // 切换主应用语言
  const switchShellLanguage = useCallback((languageCode: string) => {
    console.log(`🌐 Shell app: Switching language to ${languageCode}`);
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
      console.log(`🌐 Switching all applications to language: ${languageCode}`);

      // 切换主应用语言
      switchShellLanguage(languageCode);

      // 切换模板应用语言
      await switchTemplateLanguage(languageCode);

      // 同步到全局存储，供其他应用使用
      try {
        const { setStoreValue } = await import('mf-shared/store');
        setStoreValue('app', {
          theme: 'light', // 保持现有主题
          language: languageCode,
        });
        console.log(`🌐 Language ${languageCode} synced to global store`);
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
