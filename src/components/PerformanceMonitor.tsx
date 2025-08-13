import { Button, Card, Col, Collapse, Row, Statistic, Table } from 'antd';
import type React from 'react';
import { memo, useEffect, useState } from 'react';
import { componentCacheManager } from './LazyMicroFrontend';

const { Panel } = Collapse;

interface PerformanceMetrics {
  loadTimes: Array<{ name: string; duration: number; timestamp: number }>;
  cacheStats: {
    size: number;
    maxSize: number;
    entries: Array<{ key: string; accessCount: number; age: number }>;
  };
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

// 性能监控组件 - 仅在开发环境显示
export const PerformanceMonitor: React.FC = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTimes: [],
    cacheStats: { size: 0, maxSize: 0, entries: [] },
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      // 获取性能指标
      const performanceEntries = performance.getEntriesByType('measure');
      const loadTimes = performanceEntries
        .filter((entry) => entry.name.startsWith('load-'))
        .map((entry) => ({
          name: entry.name,
          duration: entry.duration,
          timestamp: entry.startTime,
        }))
        .slice(-10); // 只保留最近10条

      // 获取缓存统计
      const cacheStats = componentCacheManager.getStats();

      // 获取内存使用情况（如果支持）
      let memoryUsage:
        | {
            used: number;
            total: number;
            percentage: number;
          }
        | undefined;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        };
      }

      setMetrics({
        loadTimes,
        cacheStats,
        memoryUsage,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000); // 每2秒更新一次

    return () => clearInterval(interval);
  }, []);

  const clearCache = () => {
    componentCacheManager.clear();
    performance.clearMeasures();
    performance.clearMarks();
    setMetrics((prev) => ({
      ...prev,
      loadTimes: [],
      cacheStats: { size: 0, maxSize: 0, entries: [] },
    }));
  };

  const loadTimeColumns = [
    {
      title: '组件',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name.replace('load-', ''),
    },
    {
      title: '加载时间 (ms)',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => duration.toFixed(2),
      sorter: (a: any, b: any) => a.duration - b.duration,
    },
    {
      title: '时间戳',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) =>
        new Date(
          Date.now() - performance.now() + timestamp
        ).toLocaleTimeString(),
    },
  ];

  const cacheColumns = [
    {
      title: '缓存键',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: '访问次数',
      dataIndex: 'accessCount',
      key: 'accessCount',
      sorter: (a: any, b: any) => a.accessCount - b.accessCount,
    },
    {
      title: '存活时间 (ms)',
      dataIndex: 'age',
      key: 'age',
      render: (age: number) => age.toFixed(0),
      sorter: (a: any, b: any) => a.age - b.age,
    },
  ];

  if (!isVisible) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Button type="primary" size="small" onClick={() => setIsVisible(true)}>
          性能监控
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 1000,
        backgroundColor: 'white',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Card
        title="微前端性能监控"
        size="small"
        extra={
          <div>
            <Button
              size="small"
              onClick={clearCache}
              style={{ marginRight: 8 }}
            >
              清除缓存
            </Button>
            <Button size="small" onClick={() => setIsVisible(false)}>
              关闭
            </Button>
          </div>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Statistic
              title="缓存命中率"
              value={
                metrics.cacheStats.size > 0
                  ? (
                      metrics.cacheStats.entries.reduce(
                        (sum, entry) => sum + entry.accessCount,
                        0
                      ) / metrics.cacheStats.size
                    ).toFixed(1)
                  : 0
              }
              suffix="%"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="缓存使用"
              value={`${metrics.cacheStats.size}/${metrics.cacheStats.maxSize}`}
            />
          </Col>
          <Col span={8}>
            {metrics.memoryUsage && (
              <Statistic
                title="内存使用"
                value={metrics.memoryUsage.percentage.toFixed(1)}
                suffix="%"
              />
            )}
          </Col>
        </Row>

        <Collapse size="small">
          <Panel header="组件加载时间" key="loadTimes">
            <Table
              dataSource={metrics.loadTimes}
              columns={loadTimeColumns}
              size="small"
              pagination={false}
              rowKey="name"
            />
          </Panel>
          <Panel header="组件缓存详情" key="cache">
            <Table
              dataSource={metrics.cacheStats.entries}
              columns={cacheColumns}
              size="small"
              pagination={false}
              rowKey="key"
            />
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';
