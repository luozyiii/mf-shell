import { BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Col,
  Collapse,
  Drawer,
  Row,
  Statistic,
  Table,
} from 'antd';
import type React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Environment } from '../utils/environment';
import { clearComponentCache } from './LazyMicroFrontend';

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
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef<number>();

  // 防抖更新函数
  const updateMetrics = useCallback(() => {
    setIsUpdating(true);
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

    // 简化的缓存统计
    const cacheStats = {
      size: 0, // 简化后不再提供详细统计
      maxSize: 0,
      entries: [],
    };

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

    setIsUpdating(false);
  }, []);

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 3000); // 每3秒更新一次，减少频率

    return () => {
      clearInterval(interval);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateMetrics]);

  const clearCache = useCallback(() => {
    clearComponentCache();
    performance.clearMeasures();
    performance.clearMarks();
    setMetrics((prev) => ({
      ...prev,
      loadTimes: [],
      cacheStats: { size: 0, maxSize: 0, entries: [] },
    }));
    // 立即更新一次
    updateTimeoutRef.current = setTimeout(updateMetrics, 100);
  }, [updateMetrics]);

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

      {/* 右侧抽屉 */}
      <Drawer
        title="微前端性能监控"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              icon={<ReloadOutlined spin={isUpdating} />}
              onClick={updateMetrics}
              title="手动刷新"
            >
              刷新
            </Button>
            <Button size="small" onClick={clearCache} danger>
              清除缓存
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
      </Drawer>
    </>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';
