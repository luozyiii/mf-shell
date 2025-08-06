import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../types/auth';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, loginAndGetToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 获取回调地址：优先使用URL参数，其次使用state，最后默认到dashboard
  const getReturnUrl = () => {
    const urlParams = new URLSearchParams(location.search);
    const returnUrl = urlParams.get('returnUrl');
    if (returnUrl) {
      return decodeURIComponent(returnUrl);
    }
    return (location.state as any)?.from?.pathname || '/dashboard';
  };

  const returnUrl = getReturnUrl();

  // 如果已经登录且是内部路由，直接重定向
  useEffect(() => {
    if (isAuthenticated && !returnUrl.startsWith('http')) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, returnUrl, navigate]);

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      if (returnUrl.startsWith('http')) {
        // 外部URL（子应用）：直接验证凭据并获取token，不在主应用存储
        const token = await loginAndGetToken(values);
        const separator = returnUrl.includes('?') ? '&' : '?';
        const urlWithToken = `${returnUrl}${separator}token=${encodeURIComponent(token)}`;
        window.location.href = urlWithToken;
      } else {
        // 内部路由：正常登录并存储到主应用
        await login(values);
        navigate(returnUrl, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            云平台微前端系统
          </Title>
          <Text type="secondary">请登录您的账户</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {returnUrl.startsWith('http') && (
          <Alert
            message={`登录成功后将跳转到：${returnUrl}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>测试账户：</Text>
          <Space direction="vertical" size="small">
            <Text>管理员: admin / admin123</Text>
            <Text>开发人员: developer / dev123</Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};
