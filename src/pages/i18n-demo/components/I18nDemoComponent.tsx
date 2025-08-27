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
    <Card title="国际化功能演示" style={{ margin: '16px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>当前语言: </Text>
          <Text code>{getCurrentLanguage()}</Text>
        </div>

        <Divider />

        <Title level={4}>翻译演示</Title>
        <Space direction="vertical">
          <Text>应用标题: {t('app.title')}</Text>
          <Text>欢迎信息: {t('app.welcome')}</Text>
          <Text>加载状态: {t('app.loading')}</Text>
          <Text>成功消息: {t('messages.saveSuccess')}</Text>
          <Text>网络错误: {t('messages.networkError')}</Text>
        </Space>

        <Divider />

        <Title level={4}>导航翻译</Title>
        <Space wrap>
          <Text>仪表板: {t('navigation.dashboard')}</Text>
          <Text>模板应用: {t('navigation.template')}</Text>
          <Text>设置: {t('navigation.settings')}</Text>
          <Text>退出: {t('navigation.logout')}</Text>
        </Space>

        <Divider />

        <Title level={4}>快速语言切换演示</Title>
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
          这个组件展示了国际化功能。切换语言后，所有文本会立即更新。
          在微前端环境中，语言切换会同步到所有子应用。
        </Paragraph>
      </Space>
    </Card>
  );
};

export default I18nDemoComponent;
