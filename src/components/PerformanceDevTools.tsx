import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Table,
  Tabs,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
  FloatButton,
  Typography,
} from 'antd';
import {
  BarChartOutlined,
  DownloadOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { PerformanceReport, MetricType } from '../utils/performanceMonitor';

const { Text } = Typography;
const { TabPane } = Tabs;

/**
 * 性能监控开发者工具
 * 仅在开发环境中显示
 */
const PerformanceDevTools: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const { getPerformanceReport, exportPerformanceData, clearMetrics } =
    usePerformanceMonitor();

  // 刷新性能数据
  const refreshData = useCallback(() => {
    const newReport = getPerformanceReport();
    setReport(newReport);
  }, [getPerformanceReport]);

  // 导出数据
  const handleExport = useCallback(() => {
    const data = exportPerformanceData();
    const blob = new (globalThis as any).Blob([data], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportPerformanceData]);

  // 清空数据
  const handleClear = useCallback(() => {
    clearMetrics();
    refreshData();
  }, [clearMetrics, refreshData]);

  // 自动刷新数据
  useEffect(() => {
    if (visible) {
      refreshData();
      const interval = setInterval(refreshData, 2000);
      return () => clearInterval(interval);
    }
  }, [visible, refreshData]);

  // 格式化时间
  const formatTime = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // 获取性能等级颜色
  const getPerformanceColor = (
    value: number,
    thresholds: { good: number; fair: number }
  ) => {
    if (value <= thresholds.good) return 'green';
    if (value <= thresholds.fair) return 'orange';
    return 'red';
  };

  // 渲染指标表格
  const renderMetricsTable = (metrics: any[]) => {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: '值',
        dataIndex: 'value',
        key: 'value',
        render: (value: number, record: any) => (
          <Tag color={getPerformanceColor(value, { good: 100, fair: 500 })}>
            {record.type === MetricType.TIMING ? formatTime(value) : value}
          </Tag>
        ),
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        render: (type: MetricType) => (
          <Tag color="blue">{type.toUpperCase()}</Tag>
        ),
      },
      {
        title: '时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (timestamp: number) => new Date(timestamp).toLocaleTimeString(),
      },
    ];

    return (
      <Table
        dataSource={metrics.map((metric, index) => ({
          ...metric,
          key: index,
        }))}
        columns={columns}
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ y: 300 }}
      />
    );
  };

  // 仅在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <FloatButton
        icon={<BarChartOutlined />}
        tooltip="性能监控"
        onClick={() => setVisible(true)}
        style={{ right: 24, bottom: 80 }}
      />

      <Modal
        title="性能监控面板"
        open={visible}
        onCancel={() => setVisible(false)}
        width={1000}
        footer={[
          <Button key="refresh" onClick={refreshData}>
            刷新数据
          </Button>,
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            导出数据
          </Button>,
          <Button
            key="clear"
            icon={<ClearOutlined />}
            danger
            onClick={handleClear}
          >
            清空数据
          </Button>,
          <Button key="close" type="primary" onClick={() => setVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {report && (
          <div>
            {/* 性能概览 */}
            <Card title="性能概览" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="总指标数"
                    value={report.summary.totalMetrics}
                    suffix="个"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="平均响应时间"
                    value={report.summary.averageResponseTime}
                    suffix="ms"
                    precision={2}
                    valueStyle={{
                      color: getPerformanceColor(
                        report.summary.averageResponseTime,
                        { good: 100, fair: 500 }
                      ),
                    }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="错误数量"
                    value={report.summary.errorCount}
                    suffix="个"
                    valueStyle={{
                      color:
                        report.summary.errorCount > 0 ? '#cf1322' : '#3f8600',
                    }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="监控时长"
                    value={report.duration}
                    suffix="ms"
                    precision={0}
                  />
                </Col>
              </Row>

              {report.summary.slowestOperation && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>最慢操作: </Text>
                  <Tag color="red">{report.summary.slowestOperation}</Tag>
                  {report.summary.fastestOperation && (
                    <>
                      <Text strong style={{ marginLeft: 16 }}>
                        最快操作:{' '}
                      </Text>
                      <Tag color="green">{report.summary.fastestOperation}</Tag>
                    </>
                  )}
                </div>
              )}
            </Card>

            {/* 详细指标 */}
            <Card title="详细指标">
              <Tabs defaultActiveKey="all">
                <TabPane tab="全部指标" key="all">
                  {renderMetricsTable([...report.metrics])}
                </TabPane>
                <TabPane tab="计时指标" key="timing">
                  {renderMetricsTable([
                    ...report.metrics.filter(m => m.type === MetricType.TIMING),
                  ])}
                </TabPane>
                <TabPane tab="计数指标" key="counter">
                  {renderMetricsTable(
                    report.metrics.filter(m => m.type === MetricType.COUNTER)
                  )}
                </TabPane>
                <TabPane tab="仪表指标" key="gauge">
                  {renderMetricsTable(
                    report.metrics.filter(m => m.type === MetricType.GAUGE)
                  )}
                </TabPane>
              </Tabs>
            </Card>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PerformanceDevTools;
