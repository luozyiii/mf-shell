import { BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Row,
  Space,
  Statistic,
  Table,
} from 'antd';
import type React from 'react';
import { memo, useCallback, useEffect, useState } from 'react';
import { Environment } from '../utils/environment';
import { clearComponentCache } from './LazyMicroFrontend';

interface PerformanceMetrics {
  loadTimes: Array<{ name: string; duration: number; timestamp: number }>;
  cacheSize: number;
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

// 平衡的性能监控组件 - 仅在开发环境显示
export const PerformanceMonitor: React.FC = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTimes: [],
    cacheSize: 0,
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 更新性能指标
  const updateMetrics = useCallback(() => {
    setIsUpdating(true);

    // 获取组件加载时间
    const performanceEntries = performance.getEntriesByType('measure');
    const loadTimes = performanceEntries
      .filter((entry) => entry.name.startsWith('load-'))
      .map((entry) => ({
        name: entry.name.replace('load-', ''),
        duration: Number(entry.duration.toFixed(2)),
        timestamp: entry.startTime,
      }))
      .slice(-8); // 保留最近8条

    // 获取内存使用情况（如果支持）
    let memoryUsage: PerformanceMetrics['memoryUsage'];
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: Number(
          ((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100).toFixed(1)
        ),
      };
    }

    setMetrics({
      loadTimes,
      cacheSize: 0, // 简化后的缓存大小
      memoryUsage,
    });

    setIsUpdating(false);
  }, []);

  // 定期更新数据
  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // 每5秒更新一次
    return () => clearInterval(interval);
  }, [updateMetrics]);

  const clearCache = () => {
    clearComponentCache();
    performance.clearMeasures();
    performance.clearMarks();
    updateMetrics(); // 清理后立即更新
  };

  // 表格列配置
  const loadTimeColumns = [
    {
      title: '组件',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '加载时间 (ms)',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a: any, b: any) => a.duration - b.duration,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) =>
        new Date(
          Date.now() - performance.now() + timestamp
        ).toLocaleTimeString(),
    },
  ];

  // 只在开发环境显示
  if (!Environment.isDevelopment()) {
    return null;
  }

  return (
    <>
      {/* 固定悬浮的小图标 */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Badge dot={isUpdating} color="green" offset={[-8, 8]}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<BarChartOutlined />}
            onClick={() => setDrawerVisible(true)}
            title="性能监控 (开发模式)"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          />
        </Badge>
      </div>

      {/* 性能监控抽屉 */}
      <Drawer
        title="微前端性能监控"
        placement="right"
        width={700}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button
              size="small"
              icon={<ReloadOutlined spin={isUpdating} />}
              onClick={updateMetrics}
              title="刷新数据"
            >
              刷新
            </Button>
            <Button size="small" onClick={clearCache} danger>
              清除缓存
            </Button>
          </Space>
        }
      >
        {/* 统计卡片 */}
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Card size="small" title="📊 系统概览" style={{ borderRadius: 8 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="组件加载"
                  value={metrics.loadTimes.length}
                  suffix="次"
                  valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                />
              </Col>
              {metrics.memoryUsage && (
                <Col span={8}>
                  <Statistic
                    title="内存使用"
                    value={metrics.memoryUsage.percentage}
                    suffix="%"
                    precision={1}
                    valueStyle={{
                      color:
                        metrics.memoryUsage.percentage > 80
                          ? '#ff4d4f'
                          : metrics.memoryUsage.percentage > 60
                            ? '#faad14'
                            : '#52c41a',
                      fontSize: '20px',
                    }}
                  />
                </Col>
              )}
              {metrics.loadTimes.length > 0 && (
                <Col span={8}>
                  <Statistic
                    title="平均耗时"
                    value={
                      metrics.loadTimes.reduce(
                        (sum, item) => sum + item.duration,
                        0
                      ) / metrics.loadTimes.length
                    }
                    suffix="ms"
                    precision={2}
                    valueStyle={{
                      color: (() => {
                        const avgTime =
                          metrics.loadTimes.reduce(
                            (sum, item) => sum + item.duration,
                            0
                          ) / metrics.loadTimes.length;
                        return avgTime > 100
                          ? '#ff4d4f'
                          : avgTime > 50
                            ? '#faad14'
                            : '#52c41a';
                      })(),
                      fontSize: '20px',
                    }}
                  />
                </Col>
              )}
            </Row>

            {/* 内存详情行 */}
            {metrics.memoryUsage && (
              <Row
                style={{
                  marginTop: 16,
                  padding: '12px',
                  backgroundColor: '#fafafa',
                  borderRadius: 6,
                }}
              >
                <Col span={24}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      💾 内存详情
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      已使用{' '}
                      {(metrics.memoryUsage.used / 1024 / 1024).toFixed(1)}MB /
                      总计{' '}
                      {(metrics.memoryUsage.total / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div
                      style={{
                        width: '100%',
                        height: 6,
                        backgroundColor: '#e8e8e8',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${metrics.memoryUsage.percentage}%`,
                          height: '100%',
                          backgroundColor:
                            metrics.memoryUsage.percentage > 80
                              ? '#ff4d4f'
                              : metrics.memoryUsage.percentage > 60
                                ? '#faad14'
                                : '#52c41a',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            )}
          </Card>

          {/* 组件加载时间表格 */}
          <Card
            size="small"
            title="📋 组件加载记录"
            style={{ borderRadius: 8 }}
          >
            <Table
              dataSource={metrics.loadTimes}
              columns={loadTimeColumns}
              size="small"
              pagination={false}
              rowKey={(record) => `${record.name}-${record.timestamp}`}
              locale={{ emptyText: '暂无加载记录' }}
              style={{ maxHeight: 300, overflow: 'auto' }}
            />
          </Card>
        </Space>
      </Drawer>
    </>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';
