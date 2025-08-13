import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';
import type React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // 如果用户未登录，跳转到登录页面
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoHome = (): void => {
    navigate('/dashboard');
  };

  const handleGoBack = (): void => {
    navigate(-1);
  };

  // 如果正在加载或未登录，不显示404页面
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        padding: '20px',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在。"
        extra={[
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={handleGoHome}
            key="home"
          >
            返回首页
          </Button>,
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            key="back"
          >
            返回上页
          </Button>,
        ]}
      />
    </div>
  );
};

export default NotFound;
