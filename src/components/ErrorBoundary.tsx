import { BugOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Result, Typography } from 'antd';
import { Component, type ReactNode } from 'react';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  override componentDidCatch(error: Error, errorInfo: any): void {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('ErrorBoundary caught an error:', errorDetails);

    // 更新状态以包含错误信息
    this.setState({
      errorInfo: JSON.stringify(errorDetails, null, 2),
    });

    // 这里可以添加错误上报逻辑
    // reportError(errorDetails);
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
    this.props.onRetry?.();
  };

  private handleReload = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
    window.location.reload();
  };

  private handleGoHome = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
    window.location.href = '/';
  };

  private toggleErrorDetails = (): void => {
    const details = document.getElementById('error-details');
    if (details) {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId } = this.state;

      return (
        <div
          style={{
            padding: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f5f5f5',
          }}
        >
          <Result
            status="error"
            icon={<BugOutlined />}
            title="页面出现错误"
            subTitle={
              <div>
                <Paragraph>抱歉，页面遇到了一些问题。您可以尝试刷新页面或返回首页。</Paragraph>
                {errorId && (
                  <Paragraph>
                    <Text type="secondary">错误ID: {errorId}</Text>
                  </Paragraph>
                )}
                {error && (
                  <Paragraph>
                    <Text type="danger">{error.message}</Text>
                  </Paragraph>
                )}
              </div>
            }
            extra={[
              this.props.onRetry && (
                <Button
                  key="retry"
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleRetry}
                >
                  重试
                </Button>
              ),
              <Button
                key="reload"
                type={this.props.onRetry ? 'default' : 'primary'}
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                刷新页面
              </Button>,
              <Button key="home" icon={<HomeOutlined />} onClick={this.handleGoHome}>
                返回首页
              </Button>,
              process.env.NODE_ENV === 'development' && errorInfo && (
                <Button
                  key="details"
                  type="dashed"
                  icon={<BugOutlined />}
                  onClick={this.toggleErrorDetails}
                >
                  查看详情
                </Button>
              ),
            ].filter(Boolean)}
          >
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <div
                id={`error-details-${Date.now()}`}
                style={{
                  display: 'none',
                  marginTop: 16,
                  padding: 16,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4,
                  textAlign: 'left',
                }}
              >
                <Text strong>错误详情 (仅开发环境显示):</Text>
                <pre
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    maxHeight: 300,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {errorInfo}
                </pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}
