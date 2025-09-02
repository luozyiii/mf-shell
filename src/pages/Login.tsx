import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import type { LoginForm } from '../types/auth';
import { getValidatedReturnUrl } from '../utils/pathUtils';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, loginAndGetToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // 获取回调地址：优先使用URL参数，其次使用state，最后默认到dashboard
  // 注意：从404页面跳转过来的用户应该回到首页而不是原404路径
  const returnUrl = getValidatedReturnUrl(
    new URLSearchParams(location.search),
    location.state as { from?: { pathname: string } }
  );

  // 如果已经登录且是内部路由，直接重定向
  useEffect(() => {
    if (isAuthenticated && !returnUrl.startsWith('http')) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, returnUrl, navigate]);

  const handleSubmit = async (values: LoginForm): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (returnUrl.startsWith('http')) {
        // 外部URL（子应用）：直接验证凭据并获取token，不在主应用存储
        console.log('Login: Generating token for external URL:', returnUrl);
        const token = await loginAndGetToken(values);
        console.log('Login: Token generated:', token);

        // 清理目标URL，移除可能存在的旧token参数
        const targetUrl = new URL(returnUrl);
        targetUrl.searchParams.delete('token');

        // 添加新token
        targetUrl.searchParams.set('token', token);

        const finalUrl = targetUrl.toString();
        console.log('Login: Redirecting to:', finalUrl);
        window.location.href = finalUrl;
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            {APP_CONFIG.APP_NAME}
          </Title>
          <Text type="secondary">{t('login.subtitle')}</Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        {returnUrl.startsWith('http') && (
          <Alert
            message={`${t('login.redirectNotice')}${returnUrl}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form name="login" onFinish={handleSubmit} autoComplete="off" size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('login.validation.usernameRequired') }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t('login.username')} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('login.validation.passwordRequired') }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('login.password')} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              {t('login.loginButton')}
            </Button>
          </Form.Item>
        </Form>

        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 6,
          }}
        >
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            {t('login.testAccounts')}
          </Text>
          <Space direction="vertical" size="small">
            <Text>{t('login.adminAccount')}</Text>
            <Text>{t('login.developerAccount')}</Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};
