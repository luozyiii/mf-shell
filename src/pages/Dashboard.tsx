import {
  AppstoreOutlined,
  DatabaseOutlined,
  DollarOutlined,
  InboxOutlined,
  RocketOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Card, Col, Row, Typography } from 'antd';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreDemo } from '../components/StoreDemo';
import { configManager } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import styles from './Dashboard.module.css';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 获取图标组件
  const getIconComponent = (iconName?: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      RocketOutlined: <RocketOutlined />,
      DollarOutlined: <DollarOutlined />,
      AppstoreOutlined: <AppstoreOutlined />,
      InboxOutlined: <InboxOutlined />,
      UserOutlined: <UserOutlined />,
      SettingOutlined: <UserOutlined />,
    };

    return iconMap[iconName || 'AppstoreOutlined'] || <AppstoreOutlined />;
  };

  // 获取用户可访问的微前端系统
  // 将现有的权限系统映射到新的配置系统
  const userPermissions: string[] = [];
  if (user?.roles.includes(UserRole.ADMIN)) userPermissions.push('admin:read');
  // 所有登录用户都可以访问模板系统（用于演示）
  userPermissions.push('template:read');

  const accessibleMicroFrontends =
    configManager.getAccessibleMicroFrontends(userPermissions);

  return (
    <div className={styles.container}>
      {/* 微前端系统入口 */}
      <Card
        title={
          <span className={styles.cardTitle}>
            <AppstoreOutlined
              style={{ marginRight: '8px', color: '#1890ff' }}
            />
            系统应用
          </span>
        }
        className={styles.appsCard || ''}
        styles={{ body: { padding: '24px' } }}
      >
        <Row gutter={[16, 16]}>
          {accessibleMicroFrontends.map((microFrontend) => (
            <Col xs={24} sm={12} md={8} lg={6} key={microFrontend.name}>
              <Card
                hoverable
                className={styles.appCard || ''}
                onClick={() => navigate(`/${microFrontend.name}`)}
                styles={{ body: { padding: '20px', textAlign: 'center' } }}
              >
                <div className={styles.appIcon}>
                  {getIconComponent(microFrontend.icon)}
                </div>
                <Title level={5} style={{ margin: '12px 0 8px 0' }}>
                  {microFrontend.displayName}
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {microFrontend.description}
                </Text>
                <div style={{ marginTop: '12px' }}>
                  <Badge
                    status={microFrontend.enabled ? 'success' : 'default'}
                    text={microFrontend.enabled ? '运行中' : '已停用'}
                  />
                </div>
              </Card>
            </Col>
          ))}

          {/* 如果没有可访问的系统，显示提示 */}
          {accessibleMicroFrontends.length === 0 && (
            <Col span={24}>
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: '#999',
                }}
              >
                <AppstoreOutlined
                  style={{ fontSize: '48px', marginBottom: '16px' }}
                />
                <div>暂无可访问的系统应用</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  请联系管理员分配相应权限
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* Store 演示区域 */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card
            title={
              <span className={styles.cardTitle}>
                <DatabaseOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                🗄️ 全局存储演示
              </span>
            }
            className={styles.statusCard || ''}
          >
            <StoreDemo />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
