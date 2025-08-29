import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollUtil } from '../utils';

interface ScrollToTopProps {
  smooth?: boolean;
  delay?: number;
  excludePatterns?: string[];
}

// 简化的路由滚动组件
export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  smooth = true,
  delay = 0,
  excludePatterns = [],
}) => {
  const location = useLocation();

  useEffect(() => {
    // 检查是否需要排除当前路径
    const shouldExclude = excludePatterns.some((pattern) => location.pathname.includes(pattern));

    if (shouldExclude) {
      console.log('ScrollToTop: 路径被排除', location.pathname);
      return;
    }

    console.log('ScrollToTop: 路由变化，开始滚动', location.pathname);

    if (delay > 0) {
      return ScrollUtil.delayedScrollToTop(delay, smooth);
    } else {
      ScrollUtil.scrollToTop(smooth);
    }
  }, [location.pathname, smooth, delay, excludePatterns]);

  return null;
};

// 简化的工具函数
export const scrollToTop = (smooth = true) => {
  ScrollUtil.scrollToTop(smooth);
};

export default ScrollToTop;
