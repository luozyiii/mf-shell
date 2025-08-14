import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  RocketOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Timeline,
  Typography,
} from 'antd';
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

  const quickStats = [
    {
      title: '今日访问',
      value: '1,234',
      icon: <BarChartOutlined />,
      color: '#722ed1',
    },
    {
      title: '活跃用户',
      value: '567',
      icon: <TeamOutlined />,
      color: '#13c2c2',
    },
    {
      title: '系统状态',
      value: '正常',
      icon: <UserOutlined />,
      color: '#52c41a',
    },
  ];

  return (
    <div className={styles.container}>
      {/* 快速统计 */}
      <Row gutter={[16, 16]} className={styles.statsSection}>
        {quickStats.map((stat, index) => (
          <Col xs={24} sm={8} key={`stat-${stat.title}-${index}`}>
            <Card
              className={styles.statCard || ''}
              hoverable
              styles={{ body: { padding: '20px' } }}
            >
              <Row align="middle" gutter={0}>
                <Col>
                  <div
                    className={styles.statCardIcon}
                    style={{
                      color: stat.color,
                      background: `${stat.color}15`,
                    }}
                  >
                    {stat.icon}
                  </div>
                </Col>
                <Col flex={1}>
                  <div className={styles.statCardTextContainer}>
                    <div className={styles.statCardTitle}>{stat.title}</div>
                    <div className={styles.statCardValue}>{stat.value}</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

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

      {/* 第二行内容 */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {/* 系统状态 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span className={styles.cardTitle}>
                <SafetyOutlined
                  style={{ marginRight: '8px', color: '#52c41a' }}
                />
                系统状态
              </span>
            }
            className={styles.statusCard || ''}
          >
            <div className={styles.systemStatus}>
              <div className={styles.statusItem}>
                <div className={styles.statusIcon}>
                  <RocketOutlined style={{ color: '#1890ff' }} />
                </div>
                <div className={styles.statusInfo}>
                  <div className={styles.statusName}>营销系统</div>
                  <div className={styles.statusValue}>
                    <Badge status="success" text="运行正常" />
                  </div>
                </div>
                <div className={styles.statusProgress}>
                  <Progress percent={95} size="small" status="active" />
                </div>
              </div>

              <div className={styles.statusItem}>
                <div className={styles.statusIcon}>
                  <DollarOutlined style={{ color: '#722ed1' }} />
                </div>
                <div className={styles.statusInfo}>
                  <div className={styles.statusName}>财务系统</div>
                  <div className={styles.statusValue}>
                    <Badge status="success" text="运行正常" />
                  </div>
                </div>
                <div className={styles.statusProgress}>
                  <Progress percent={88} size="small" status="active" />
                </div>
              </div>

              <div className={styles.statusItem}>
                <div className={styles.statusIcon}>
                  <CloudServerOutlined style={{ color: '#13c2c2' }} />
                </div>
                <div className={styles.statusInfo}>
                  <div className={styles.statusName}>核心服务</div>
                  <div className={styles.statusValue}>
                    <Badge status="success" text="运行正常" />
                  </div>
                </div>
                <div className={styles.statusProgress}>
                  <Progress percent={92} size="small" status="active" />
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span className={styles.cardTitle}>
                <ClockCircleOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                最近活动
              </span>
            }
            className={styles.activityCard || ''}
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className={styles.activityTitle}>
                        营销活动创建成功
                      </div>
                      <div className={styles.activityTime}>2分钟前</div>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <div className={styles.activityTitle}>财务报表已生成</div>
                      <div className={styles.activityTime}>15分钟前</div>
                    </div>
                  ),
                },
                {
                  color: 'gray',
                  children: (
                    <div>
                      <div className={styles.activityTitle}>用户权限更新</div>
                      <div className={styles.activityTime}>1小时前</div>
                    </div>
                  ),
                },
                {
                  color: 'gray',
                  children: (
                    <div>
                      <div className={styles.activityTitle}>系统备份完成</div>
                      <div className={styles.activityTime}>3小时前</div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 待办事项 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span className={styles.cardTitle}>
                <BellOutlined
                  style={{ marginRight: '8px', color: '#fa8c16' }}
                />
                待办事项
                <Badge count={3} style={{ marginLeft: '8px' }} />
              </span>
            }
            className={styles.todoCard || ''}
          >
            <List
              size="small"
              dataSource={[
                {
                  id: 1,
                  title: '审核营销活动方案',
                  priority: 'high',
                  deadline: '今天 18:00',
                },
                {
                  id: 2,
                  title: '查看月度财务报告',
                  priority: 'medium',
                  deadline: '明天 10:00',
                },
                {
                  id: 3,
                  title: '更新用户权限配置',
                  priority: 'low',
                  deadline: '本周五',
                },
              ]}
              renderItem={(item) => (
                <List.Item className={styles.todoItem || ''}>
                  <div className={styles.todoContent}>
                    <div className={styles.todoTitle}>
                      {item.priority === 'high' && (
                        <ExclamationCircleOutlined
                          style={{ color: '#ff4d4f', marginRight: '4px' }}
                        />
                      )}
                      {item.priority === 'medium' && (
                        <ClockCircleOutlined
                          style={{ color: '#fa8c16', marginRight: '4px' }}
                        />
                      )}
                      {item.priority === 'low' && (
                        <CheckCircleOutlined
                          style={{ color: '#52c41a', marginRight: '4px' }}
                        />
                      )}
                      {item.title}
                    </div>
                    <div className={styles.todoDeadline}>{item.deadline}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 相关链接 */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card
            title="🔗 相关链接"
            size="small"
            style={{ textAlign: 'center' }}
          >
            <Space size="large">
              <a
                href={process.env.MF_SHARED_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1890ff',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                🚀 MF-Shared 共享模块演示
              </a>
              <a
                href="https://github.com/luozyiii/micro-frontend-app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1890ff',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                📚 查看源码
              </a>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
