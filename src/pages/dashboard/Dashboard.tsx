import {
  AppstoreOutlined,
  DatabaseOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Badge, Card, Col, Row, Space, Typography } from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { configManager } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import StoreDemo from './components/StoreDemo';
import styles from './Dashboard.module.css';

const { Text } = Typography;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [storeData, setStoreData] = useState<any>({});

  // 获取用户可访问的微前端系统
  // 将现有的权限系统映射到新的配置系统
  const userPermissions: string[] = [];
  if (user?.permissions.includes(UserRole.ADMIN))
    userPermissions.push('admin:read');
  // 所有登录用户都可以访问模板系统（用于演示）
  userPermissions.push('template:read');

  const accessibleMicroFrontends =
    configManager.getAccessibleMicroFrontends(userPermissions);

  // 获取全局 store 数据
  const refreshStoreData = useCallback(async () => {
    try {
      const { getStoreValue } = await import('mf-shared/store');

      const userData = getStoreValue('user');
      const appConfig = getStoreValue('app');
      const token = getStoreValue('token');
      const permissions = getStoreValue('permissions');

      setStoreData({
        user: userData || null,
        app: appConfig || null,
        token: token || null,
        permissions: permissions || null,
        timestamp: new Date().toISOString(),
        storeKeys: ['user', 'app', 'token', 'permissions'],
      });
    } catch (error) {
      console.error('Failed to load store data:', error);
      setStoreData({
        error: 'Failed to load store data',
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  // 初始化和定期刷新 store 数据
  useEffect(() => {
    refreshStoreData();

    // 每5秒刷新一次数据
    const interval = setInterval(refreshStoreData, 5000);

    return () => clearInterval(interval);
  }, [refreshStoreData]);

  return (
    <div className={styles.dashboard}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <span className={styles.cardTitle}>
                <AppstoreOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                {t('dashboard.microFrontends')}
              </span>
            }
            className={styles.systemCard}
          >
            <Row gutter={[16, 16]}>
              {accessibleMicroFrontends.map((microFrontend) => (
                <Col xs={24} sm={12} md={8} lg={6} key={microFrontend.name}>
                  <Card
                    hoverable
                    className={styles.microFrontendCard}
                    onClick={() => navigate(`/${microFrontend.name}`)}
                  >
                    <Card.Meta
                      title={microFrontend.displayName}
                      description={microFrontend.description}
                    />
                    <div style={{ marginTop: '12px' }}>
                      <Badge
                        status={microFrontend.enabled ? 'success' : 'default'}
                        text={
                          microFrontend.enabled
                            ? t('common.enabled')
                            : t('common.disabled')
                        }
                      />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title={
              <span className={styles.cardTitle}>
                <DatabaseOutlined
                  style={{ marginRight: '8px', color: '#52c41a' }}
                />
                {t('dashboard.globalStore')}
              </span>
            }
            className={styles.storeCard}
          >
            <StoreDemo />
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title={
              <Space>
                <EyeOutlined style={{ color: '#1890ff' }} />
                <span>{t('dashboard.storeData')}</span>
              </Space>
            }
            className={styles.dataCard}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t('dashboard.autoRefresh')}
              </Text>
            }
          >
            <div
              style={{
                background: '#f7f8fa',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 16,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 12,
                lineHeight: 1.6,
                overflow: 'auto',
                maxHeight: 500,
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(storeData, null, 2)}
              </pre>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
              <Text type="secondary">{t('dashboard.storeDescription')}</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
