import {
  BellOutlined,
  DatabaseOutlined,
  SendOutlined,
  SettingOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  message,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

export const StoreDemo: React.FC = () => {
  const [storeModule, setStoreModule] = useState<any>(null);
  const [currentData, setCurrentData] = useState<any>({});
  const [isConnected, setIsConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const refreshData = useCallback(
    (module = storeModule) => {
      if (!module) return;

      try {
        const userinfo = module.getStoreValue('userinfo');
        const appConfig = module.getStoreValue('appConfig');

        setCurrentData({
          userinfo: userinfo || {},
          appConfig: appConfig || {},
        });
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    },
    [storeModule]
  );

  const loadStoreModule = useCallback(async (): Promise<
    (() => void) | undefined
  > => {
    try {
      // @ts-ignore - Module Federation 动态导入，运行时存在
      const module = await import('mf-shared/store');
      setStoreModule(module);
      setIsConnected(true);

      // 获取当前数据
      refreshData(module);

      // 订阅数据变化 - 使用唯一标识避免重复订阅
      const unsubscribeUserInfo = module.subscribeStore(
        'userinfo',
        (key: string, newVal: any) => {
          setMessageCount((prev) => prev + 1);
          setLastUpdate(new Date().toLocaleTimeString());
          refreshData(module);
          // 只在主应用的StoreDemo中显示通知，避免重复
          console.log(`StoreDemo收到数据更新: ${key}`, newVal);
        }
      );

      const unsubscribeAppConfig = module.subscribeStore(
        'appConfig',
        (key: string, newVal: any) => {
          setMessageCount((prev) => prev + 1);
          setLastUpdate(new Date().toLocaleTimeString());
          refreshData(module);
          console.log(`StoreDemo收到配置更新: ${key}`, newVal);
        }
      );

      // 保存取消订阅函数，组件卸载时清理
      return () => {
        unsubscribeUserInfo();
        unsubscribeAppConfig();
      };
    } catch (error) {
      console.error('Failed to load store module:', error);
      setIsConnected(false);
    }
  }, [refreshData]);

  // 加载存储模块
  useEffect(() => {
    const cleanup = loadStoreModule();
    return () => {
      // 如果loadStoreModule返回了清理函数，则执行
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then((cleanupFn: any) => {
          if (typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, [loadStoreModule]);

  const updateUserInfo = () => {
    if (!storeModule) return;

    const newName = `用户${Math.floor(Math.random() * 1000)}`;
    storeModule.setStoreValue('userinfo.name', newName);
    message.success(`用户名已更新为: ${newName}`);
  };

  const updateUserAge = () => {
    if (!storeModule) return;

    const newAge = Math.floor(Math.random() * 50) + 18;
    storeModule.setStoreValue('userinfo.age', newAge);
    message.success(`年龄已更新为: ${newAge}`);
  };

  const toggleTheme = () => {
    if (!storeModule) return;

    const currentTheme = storeModule.getStoreValue('appConfig.theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    storeModule.setStoreValue('appConfig.theme', newTheme);
    message.success(`主题已切换为: ${newTheme}`);
  };

  const sendNotification = () => {
    if (!storeModule) return;

    const notification = {
      id: Date.now(),
      message: '来自主应用的通知',
      timestamp: new Date().toISOString(),
      type: 'info',
    };

    storeModule.setStoreValue('notifications', notification);
    message.success('通知已发送到所有应用');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* 连接状态 */}
        <Col span={24}>
          <Alert
            message="全局存储演示"
            description={
              isConnected
                ? '✅ 已连接到全局存储，可以与其他微前端应用实时通信'
                : '❌ 未连接到全局存储'
            }
            type={isConnected ? 'success' : 'error'}
            showIcon
            icon={<DatabaseOutlined />}
          />
        </Col>

        {/* 统计信息 */}
        <Col span={24}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="连接状态"
                value={isConnected ? '已连接' : '未连接'}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: isConnected ? '#3f8600' : '#cf1322' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="消息数量"
                value={messageCount}
                prefix={<BellOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="最后更新"
                value={lastUpdate || '暂无'}
                prefix={<SyncOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Col>

        {/* 用户信息操作 */}
        <Col span={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                用户信息管理
              </Space>
            }
            size="small"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>当前用户: </Text>
                <Tag color="blue">{currentData.userinfo?.name || '未设置'}</Tag>
              </div>
              <div>
                <Text strong>年龄: </Text>
                <Tag color="green">{currentData.userinfo?.age || '未设置'}</Tag>
              </div>
              <div>
                <Text strong>角色: </Text>
                <Tag color="purple">
                  {currentData.userinfo?.role || '未设置'}
                </Tag>
              </div>

              <Divider />

              <Space wrap>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={updateUserInfo}
                  size="small"
                >
                  更新用户名
                </Button>
                <Button
                  icon={<SendOutlined />}
                  onClick={updateUserAge}
                  size="small"
                >
                  更新年龄
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* 应用配置操作 */}
        <Col span={12}>
          <Card
            title={
              <Space>
                <SettingOutlined />
                应用配置管理
              </Space>
            }
            size="small"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>主题: </Text>
                <Tag
                  color={
                    currentData.appConfig?.theme === 'dark' ? 'default' : 'gold'
                  }
                >
                  {currentData.appConfig?.theme || '未设置'}
                </Tag>
              </div>
              <div>
                <Text strong>语言: </Text>
                <Tag color="cyan">
                  {currentData.appConfig?.language || '未设置'}
                </Tag>
              </div>
              <div>
                <Text strong>版本: </Text>
                <Tag color="orange">
                  {currentData.appConfig?.version || '未设置'}
                </Tag>
              </div>

              <Divider />

              <Space wrap>
                <Button
                  type="primary"
                  icon={<SettingOutlined />}
                  onClick={toggleTheme}
                  size="small"
                >
                  切换主题
                </Button>
                <Button
                  icon={<BellOutlined />}
                  onClick={sendNotification}
                  size="small"
                >
                  发送通知
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* 实时数据展示 */}
        <Col span={24}>
          <Card
            title="实时数据监控"
            size="small"
            extra={
              <Button
                icon={<SyncOutlined />}
                onClick={() => refreshData()}
                size="small"
              >
                刷新
              </Button>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>用户信息:</Text>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginTop: '8px',
                  }}
                >
                  {JSON.stringify(currentData.userinfo, null, 2)}
                </pre>
              </Col>
              <Col span={12}>
                <Text strong>应用配置:</Text>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginTop: '8px',
                  }}
                >
                  {JSON.stringify(currentData.appConfig, null, 2)}
                </pre>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 使用说明 */}
        <Col span={24}>
          <Card title="使用说明" size="small">
            <Space direction="vertical">
              <Text>
                • <strong>实时同步:</strong>{' '}
                在这里修改的数据会立即同步到所有微前端应用
              </Text>
              <Text>
                • <strong>跨应用通信:</strong>{' '}
                打开Template应用的Store演示页面，观察数据同步
              </Text>
              <Text>
                • <strong>持久化存储:</strong>{' '}
                数据会自动保存到localStorage并加密
              </Text>
              <Text>
                • <strong>事件通知:</strong> 数据变化时会收到实时通知
              </Text>
              <Text>
                • <strong>共享模块:</strong>
                <a
                  href={process.env.MF_SHARED_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: '8px' }}
                >
                  查看 MF-Shared 演示 🚀
                </a>
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
