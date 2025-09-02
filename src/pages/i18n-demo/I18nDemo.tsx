import { Alert, Card, Col, Row, Spin } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import I18nDemoComponent from './components/I18nDemoComponent';

/**
 * 国际化演示页面
 * 展示主应用和子应用的国际化功能
 */
const I18nDemo: React.FC = () => {
  const { t } = useTranslation();

  // 动态加载模板应用的国际化演示组件
  const TemplateI18nDemo = React.lazy(async () => {
    try {
      const module = await import('template/I18nDemo');
      return { default: module.default };
    } catch (error) {
      console.error('Failed to load template i18n demo:', error);
      throw error;
    }
  });

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Alert
            message={t('i18nDemoPage.title')}
            description={t('i18nDemoPage.description')}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        </Col>

        <Col xs={24} lg={12}>
          <Card title={t('i18nDemoPage.mainAppDemo')} style={{ height: '100%' }}>
            <I18nDemoComponent />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={t('i18nDemoPage.templateAppDemo')} style={{ height: '100%' }}>
            <Suspense
              fallback={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                  }}
                >
                  <Spin size="large" />
                </div>
              }
            >
              <TemplateI18nDemo />
            </Suspense>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default I18nDemo;
