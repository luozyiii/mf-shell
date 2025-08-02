import React from 'react';
import { Row, Col, Card, Button, Space, List, Badge, Progress, Timeline } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  BarChartOutlined,
  TeamOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RocketOutlined,
  CloudServerOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import styles from './Dashboard.module.css';



export const Dashboard: React.FC = () => {



  const quickStats = [
    { title: '今日访问', value: '1,234', icon: <BarChartOutlined />, color: '#722ed1' },
    { title: '活跃用户', value: '567', icon: <TeamOutlined />, color: '#13c2c2' },
    { title: '系统状态', value: '正常', icon: <UserOutlined />, color: '#52c41a' }
  ];

  return (
    <div className={styles.container}>

      {/* 快速统计 */}
      <Row gutter={[16, 16]} className={styles.statsSection}>
        {quickStats.map((stat, index) => (
          <Col xs={24} sm={8} key={index}>
            <Card
              className={styles.statCard}
              hoverable
              styles={{ body: { padding: '20px' } }}
            >
              <Row align="middle" gutter={0}>
                <Col>
                  <div className={styles.statCardIcon} style={{
                    color: stat.color,
                    background: `${stat.color}15`
                  }}>
                    {stat.icon}
                  </div>
                </Col>
                <Col flex={1}>
                  <div className={styles.statCardTextContainer}>
                    <div className={styles.statCardTitle}>
                      {stat.title}
                    </div>
                    <div className={styles.statCardValue}>
                      {stat.value}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 应用入口 */}


      {/* 快捷操作 */}
      <Card
        title={
          <span className={styles.actionsTitle}>
            快捷操作
          </span>
        }
        className={styles.actionsCard}
        styles={{ body: { padding: '24px' } }}
      >
        <Space wrap size="middle" className={styles.actionsButtons}>
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            size="large"
            className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
          >
            查看报表
          </Button>
          <Button
            icon={<TeamOutlined />}
            size="large"
            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
          >
            用户管理
          </Button>
          <Button
            icon={<UserOutlined />}
            size="large"
            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
          >
            个人设置
          </Button>
        </Space>
      </Card>

      {/* 第二行内容 */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {/* 系统状态 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span className={styles.cardTitle}>
                <SafetyOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                系统状态
              </span>
            }
            className={styles.statusCard}
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
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                最近活动
              </span>
            }
            className={styles.activityCard}
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className={styles.activityTitle}>营销活动创建成功</div>
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
                <BellOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                待办事项
                <Badge count={3} style={{ marginLeft: '8px' }} />
              </span>
            }
            className={styles.todoCard}
          >
            <List
              size="small"
              dataSource={[
                {
                  id: 1,
                  title: '审核营销活动方案',
                  priority: 'high',
                  deadline: '今天 18:00'
                },
                {
                  id: 2,
                  title: '查看月度财务报告',
                  priority: 'medium',
                  deadline: '明天 10:00'
                },
                {
                  id: 3,
                  title: '更新用户权限配置',
                  priority: 'low',
                  deadline: '本周五'
                }
              ]}
              renderItem={(item) => (
                <List.Item className={styles.todoItem}>
                  <div className={styles.todoContent}>
                    <div className={styles.todoTitle}>
                      {item.priority === 'high' && <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />}
                      {item.priority === 'medium' && <ClockCircleOutlined style={{ color: '#fa8c16', marginRight: '4px' }} />}
                      {item.priority === 'low' && <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />}
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
    </div>
  );
};
