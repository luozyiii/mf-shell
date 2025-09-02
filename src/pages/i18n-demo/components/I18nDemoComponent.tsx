import { Button, Card, Divider, Space, Typography } from 'antd';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../../i18n';
import useSwitchLanguage from '../../../i18n/useSwitchLanguage';

const { Title, Text, Paragraph } = Typography;

/**
 * 国际化演示组件
 * 展示翻译功能和语言切换
 */
const I18nDemoComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { switchAllLanguages, getCurrentLanguage } = useSwitchLanguage();

  const handleLanguageTest = (languageCode: string) => {
    switchAllLanguages(languageCode);
  };

  return (
    <Card title={t('i18nDemo.title')} style={{ margin: '16px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>{t('i18nDemo.currentLanguage')}: </Text>
          <Text code>{getCurrentLanguage()}</Text>
        </div>

        <Divider />

        <Title level={4}>{t('i18nDemo.translationDemo')}</Title>
        <Space direction="vertical">
          <Text>
            {t('i18nDemo.appTitle')}: {t('app.title')}
          </Text>
          <Text>
            {t('i18nDemo.welcomeMessage')}: {t('app.welcome')}
          </Text>
          <Text>
            {t('i18nDemo.loadingStatus')}: {t('app.loading')}
          </Text>
          <Text>
            {t('i18nDemo.successMessage')}: {t('messages.saveSuccess')}
          </Text>
          <Text>
            {t('i18nDemo.networkError')}: {t('messages.networkError')}
          </Text>
        </Space>

        <Divider />

        <Title level={4}>{t('i18nDemo.navigationDemo')}</Title>
        <Space wrap>
          <Text>
            {t('i18nDemo.dashboard')}: {t('navigation.dashboard')}
          </Text>
          <Text>
            {t('i18nDemo.templateApp')}: {t('navigation.template')}
          </Text>
          <Text>
            {t('i18nDemo.settings')}: {t('navigation.settings')}
          </Text>
          <Text>
            {t('i18nDemo.logout')}: {t('navigation.logout')}
          </Text>
        </Space>

        <Divider />

        <Title level={4}>{t('i18nDemo.quickSwitchDemo')}</Title>
        <Space wrap>
          {supportedLanguages.slice(0, 6).map((lang) => (
            <Button
              key={lang.code}
              size="small"
              type={i18n.language === lang.code ? 'primary' : 'default'}
              onClick={() => handleLanguageTest(lang.code)}
            >
              {lang.name}
            </Button>
          ))}
        </Space>

        <Divider />

        <Paragraph type="secondary" style={{ fontSize: '12px' }}>
          {t('i18nDemo.componentDescription')}
        </Paragraph>
      </Space>
    </Card>
  );
};

export default I18nDemoComponent;
