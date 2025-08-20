import { BellOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Row,
  Space,
  Timeline,
  Typography,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getVal, setVal, subscribeVal } from '../store/keys';

const { Text } = Typography;

export const StoreDemo: React.FC = () => {
  const [_storeModule, setStoreModule] = useState<any>(null);
  const [currentData, setCurrentData] = useState<any>({});
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = useCallback(
    (notif: { type: string; message: string; time: string }) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 10));
    },
    []
  );

  const refreshData = useCallback(() => {
    try {
      const userinfo = getVal('user');
      const appConfig = getVal('app');
      const token = getVal('token');
      const permissions = getVal('permissions');
      setCurrentData({
        userinfo: userinfo || { name: '未设置', age: 0, role: 'guest' },
        appConfig: appConfig || {
          theme: 'light',
          language: 'zh-CN',
          version: '1.0.0',
        },
        token: token || '',
        permissions: permissions || {},
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      // 设置默认数据以防止错误
      setCurrentData({
        userinfo: { name: '未设置', age: 0, role: 'guest' },
        appConfig: { theme: 'light', language: 'zh-CN', version: '1.0.0' },
        token: '',
        permissions: {},
      });
    }
  }, []);

  const loadStoreModule = useCallback(async (): Promise<
    (() => void) | undefined
  > => {
    try {
      // @ts-expect-error - Module Federation 动态导入，运行时存在
      const module = await import('mf-shared/store');
      setStoreModule(module);
      setIsConnected(true);

      // 获取当前数据
      refreshData();

      // 订阅数据变化（短键 + 旧键兼容）
      const unsubUser = subscribeVal('user', (_k, _v) => {
        addNotification({
          type: 'userinfo',
          message: '用户信息已更新',
          time: new Date().toLocaleTimeString(),
        });
        refreshData();
      });
      const unsubApp = subscribeVal('app', (_k, _v) => {
        addNotification({
          type: 'config',
          message: '应用配置已更新',
          time: new Date().toLocaleTimeString(),
        });
        refreshData();
      });

      // 保存取消订阅函数，组件卸载时清理
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
  }, [refreshData, addNotification]);

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

  // 用户信息操作
  const updateUsername = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const curUser = (getVal('user') as any) || {};
    const number = Math.floor(Math.random() * 900) + 100;
    const newName = `用户${number}`;
    setVal('user', { ...curUser, name: newName });
    addNotification({
      type: 'userinfo',
      message: `用户名更新为: ${newName}`,
      time: new Date().toLocaleTimeString(),
    });
    refreshData();
    message.success(`用户名已更新: ${newName}`);
  };

  const updateAge = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const curUser = (getVal('user') as any) || {};
    const newAge = (Number(curUser?.age) || 0) + 1;
    setVal('user', { ...curUser, age: newAge });
    addNotification({
      type: 'userinfo',
      message: `年龄更新为: ${newAge}`,
      time: new Date().toLocaleTimeString(),
    });
    refreshData();
    message.success(`年龄已更新为: ${newAge}`);
  };

  const updateUserRole = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const curUser = (getVal('user') as any) || {
      name: '未设置',
      age: 0,
      role: 'guest',
    };
    let role = curUser.role || 'guest';
    if (role === 'admin') {
      role = 'developer';
    } else if (role === 'developer') {
      role = 'guest';
    } else {
      role = 'admin';
    }
    const nextUser = { ...curUser, role };
    setVal('user', nextUser);
    addNotification({
      type: 'userinfo',
      message: `角色更新: ${role}`,
      time: new Date().toLocaleTimeString(),
    });
    refreshData();
    message.success('用户角色已更新');
  };

  // 应用配置操作
  const toggleTheme = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const curApp = (getVal('app') as any) || {};
    const newTheme = curApp?.theme === 'dark' ? 'light' : 'dark';
    setVal('app', { ...curApp, theme: newTheme });
    addNotification({
      type: 'config',
      message: `主题切换为: ${newTheme}`,
      time: new Date().toLocaleTimeString(),
    });
    refreshData();
    message.success(`主题已切换为: ${newTheme}`);
  };

  const toggleLanguage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const curApp = (getVal('app') as any) || {};
    const newLang = curApp?.language === 'zh-CN' ? 'en-US' : 'zh-CN';
    setVal('app', { ...curApp, language: newLang });
    addNotification({
      type: 'config',
      message: `语言切换为: ${newLang}`,
      time: new Date().toLocaleTimeString(),
    });
    refreshData();
    message.success(`语言已切换为: ${newLang}`);
  };

  const bumpVersion = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const curApp = (getVal('app') as any) || {};
    const cur = String(curApp?.version || '1.0.0');
    const parts = cur.split('.').map((p: string) => Number(p) || 0);
    const next = [parts[0], parts[1], (parts[2] || 0) + 1].join('.');
    setVal('app', { ...curApp, version: next });
    addNotification({
      type: 'config',
      message: `版本更新为: ${next}`,
      time: new Date().toLocaleTimeString(),
    });
    refreshData();
    message.success(`版本已更新为: ${next}`);
  };

  return (
    <Row gutter={[24, 24]}>
      {/* 运行信息简要 */}
      <Col span={24}>
        <Card size="small">
          <Space wrap>
            <span>连接状态：{isConnected ? '已连接' : '未连接'}</span>
            <span>通知数量：{notifications.length}</span>
          </Space>
        </Card>
      </Col>

      {/* 左侧：管理模块 */}
      <Col xs={24}>
        {/* 用户信息管理 */}
        <Card
          title={
            <Space>
              <UserOutlined /> 用户信息管理
            </Space>
          }
          size="small"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="用户名">
                  {currentData.userinfo?.name ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="年龄">
                  {currentData.userinfo?.age ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="角色">
                  {currentData.userinfo?.role ?? '-'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <div
                style={{
                  background: '#f7f8fa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  padding: 8,
                  height: 180,
                  overflow: 'auto',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(currentData.userinfo || {}, null, 2)}
                </pre>
              </div>
            </Col>
          </Row>

          <Divider />
          <Space wrap>
            <Button type="primary" onClick={updateUsername}>
              更新用户名
            </Button>
            <Button onClick={updateAge}>更新年龄</Button>
            <Button onClick={updateUserRole}>更新角色</Button>
          </Space>
        </Card>

        {/* 应用配置管理 */}
        <Card
          style={{ marginTop: 16 }}
          title={
            <Space>
              <SettingOutlined /> 应用配置管理
            </Space>
          }
          size="small"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="主题">
                  {currentData.appConfig?.theme ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="语言">
                  {currentData.appConfig?.language ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="版本">
                  {currentData.appConfig?.version ?? '-'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <div
                style={{
                  background: '#f7f8fa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  padding: 8,
                  height: 180,
                  overflow: 'auto',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(currentData.appConfig || {}, null, 2)}
                </pre>
              </div>
            </Col>
          </Row>

          <Divider />
          <Space wrap>
            <Button onClick={toggleTheme}>切换主题</Button>
            <Button onClick={toggleLanguage}>切换语言</Button>
            <Button onClick={bumpVersion}>版本 +1</Button>
          </Space>
        </Card>
      </Col>

      {/* 右侧：实时通知 */}
      <Col xs={24}>
        <Card
          title={
            <Space>
              <BellOutlined /> 实时通知
            </Space>
          }
          size="small"
        >
          <div
            style={{
              height: 400,
              overflow: 'auto',
              padding: 8,
            }}
          >
            {notifications.length > 0 ? (
              <Timeline style={{ paddingRight: '8px' }}>
                {notifications.map((notif, index) => (
                  <Timeline.Item
                    key={index}
                    dot={
                      notif.type === 'userinfo' ? (
                        <UserOutlined />
                      ) : notif.type === 'config' ? (
                        <SettingOutlined />
                      ) : (
                        <BellOutlined />
                      )
                    }
                    color={
                      notif.type === 'userinfo'
                        ? 'blue'
                        : notif.type === 'config'
                          ? 'green'
                          : 'orange'
                    }
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        paddingBottom: '8px',
                        lineHeight: '1.4',
                        minHeight: '32px',
                      }}
                    >
                      <div
                        style={{
                          marginBottom: '4px',
                          fontWeight: '500',
                          color: '#262626',
                        }}
                      >
                        {notif.message}
                      </div>
                      <Text
                        type="secondary"
                        style={{ fontSize: '11px', display: 'block' }}
                      >
                        {notif.time}
                      </Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Text type="secondary">暂无通知</Text>
              </div>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
};
