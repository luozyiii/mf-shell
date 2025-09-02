import { SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Divider, message, Row, Space, Typography } from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getVal, setVal, subscribeVal } from '../../../store/keys';

const { Text } = Typography;

const StoreDemo: React.FC = () => {
  const { t } = useTranslation();
  const [currentData, setCurrentData] = useState<any>({});
  const [isConnected, setIsConnected] = useState(false);

  const refreshData = useCallback(() => {
    try {
      const userinfo = getVal('user');
      const appConfig = getVal('app');
      setCurrentData({
        userinfo: userinfo || { name: t('store.notSet'), age: 0, role: t('store.defaultRole') },
        appConfig: appConfig || {
          theme: 'light',
          language: 'zh-CN',
          version: '1.0.0',
        },
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setCurrentData({
        userinfo: { name: t('store.notSet'), age: 0, role: t('store.defaultRole') },
        appConfig: { theme: 'light', language: 'zh-CN', version: '1.0.0' },
      });
    }
  }, [t]);

  const loadStoreModule = useCallback(async () => {
    try {
      await import('mf-shared/store');
      setIsConnected(true);
      refreshData();

      const unsubUser = subscribeVal('user', () => {
        refreshData();
      });
      const unsubApp = subscribeVal('app', () => {
        refreshData();
      });

      return () => {
        try {
          unsubUser?.();
        } catch {}
        try {
          unsubApp?.();
        } catch {}
      };
    } catch (error) {
      console.error('Failed to load store module:', error);
      setIsConnected(false);
    }
  }, [refreshData]);

  useEffect(() => {
    const cleanup = loadStoreModule();
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then((cleanupFn: any) => {
          if (typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, [loadStoreModule]);

  const updateUsername = () => {
    const curUser = (getVal('user') as any) || {};
    const number = Math.floor(Math.random() * 900) + 100;
    const newName = `${t('store.username')}${number}`;
    setVal('user', { ...curUser, name: newName });
    refreshData();
    message.success(`${t('store.usernameUpdated')}: ${newName}`);
  };

  const toggleTheme = () => {
    const curApp = (getVal('app') as any) || {};
    const newTheme = curApp?.theme === 'dark' ? 'light' : 'dark';
    setVal('app', { ...curApp, theme: newTheme });
    refreshData();
    message.success(`${t('store.themeChanged')}: ${newTheme}`);
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card size="small">
          <Space>
            <Text strong>{t('store.connectionStatus')}：</Text>
            <Text type={isConnected ? 'success' : 'danger'}>
              {isConnected ? t('store.connected') : t('store.disconnected')}
            </Text>
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <UserOutlined />
              {t('store.userInfo')}
            </Space>
          }
          size="small"
        >
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('store.username')}>
              {currentData.userinfo?.name ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('store.age')}>
              {currentData.userinfo?.age ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('store.role')}>
              {currentData.userinfo?.role ?? '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Space>
            <Button type="primary" onClick={updateUsername}>
              {t('store.updateUsername')}
            </Button>
            <Button onClick={refreshData}>{t('common.refresh')}</Button>
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <SettingOutlined />
              {t('store.appConfig')}
            </Space>
          }
          size="small"
        >
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('store.theme')}>
              {currentData.appConfig?.theme ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('store.language')}>
              {currentData.appConfig?.language ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('store.version')}>
              {currentData.appConfig?.version ?? '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Space>
            <Button onClick={toggleTheme}>{t('store.toggleTheme')}</Button>
            <Button onClick={refreshData}>{t('common.refresh')}</Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default StoreDemo;
