import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = (): void => {
    navigate('/dashboard');
  };

  const handleGoBack = (): void => {
    navigate(-1);
  };

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
