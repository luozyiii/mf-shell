import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  /**
   * 是否启用平滑滚动
   * @default true
   */
  smooth?: boolean;
  /**
   * 滚动延迟时间（毫秒）
   * @default 0
   */
  delay?: number;
  /**
   * 是否在路由变化时自动滚动到顶部
   * @default true
   */
  autoScroll?: boolean;
  /**
   * 排除的路径模式，这些路径不会触发自动滚动
   * @default []
   */
  excludePatterns?: string[];
}

/**
 * 路由切换时自动滚动到顶部的组件
 *
 * 功能特性：
 * 1. 监听路由变化，自动滚动到页面顶部
 * 2. 支持平滑滚动和即时滚动
 * 3. 支持延迟滚动，避免与页面加载动画冲突
 * 4. 支持排除特定路径，避免不必要的滚动
 * 5. 兼容微前端环境，处理嵌套路由
 */
export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  smooth = true,
  delay = 0,
  autoScroll = true,
  excludePatterns = [],
}) => {
  const location = useLocation();
  const prevPathnameRef = useRef<string>(location.pathname);

  // 监听来自微前端的滚动消息
  useEffect(() => {
    const handleMicroFrontendMessage = (event: MessageEvent) => {
      if (event.data.type === 'MICRO_FRONTEND_SCROLL_TO_TOP') {
        // 只有在真正的路由变化时才滚动，忽略来自 Store Demo 等组件内部操作的滚动请求
        const isFromRouteChange = event.data.source === 'route-change';
        if (isFromRouteChange) {
          console.log('收到微前端路由变化滚动请求:', event.data);
          scrollToTop({
            smooth: event.data.smooth ?? smooth,
            delay: 0, // 微前端请求时立即滚动
          });
        } else {
          console.log('忽略微前端内部操作滚动请求:', event.data);
        }
      }
    };

    window.addEventListener('message', handleMicroFrontendMessage);
    return () =>
      window.removeEventListener('message', handleMicroFrontendMessage);
  }, [smooth]);

  useEffect(() => {
    if (!autoScroll) return;

    // 检查路径是否真的发生了变化
    const currentPathname = location.pathname;
    const prevPathname = prevPathnameRef.current;

    if (currentPathname === prevPathname) {
      // 路径没有变化，不滚动（这解决了同一页面内状态变化导致的滚动问题）
      return;
    }

    // 更新上一次的路径
    prevPathnameRef.current = currentPathname;

    // 检查是否需要排除当前路径
    const shouldExclude = excludePatterns.some((pattern) => {
      if (pattern.includes('*')) {
        // 支持通配符匹配
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(currentPathname);
      }
      return currentPathname.includes(pattern);
    });

    if (shouldExclude) {
      return;
    }

    const performScroll = () => {
      // 优先滚动主内容区域
      const contentElement = document.querySelector(
        '.ant-layout-content'
      ) as HTMLElement;
      const mainElement = document.querySelector('main') as HTMLElement;
      const bodyElement = document.body;
      const htmlElement = document.documentElement;

      // 滚动目标优先级：内容区域 > main > body > html
      const scrollTargets = [
        contentElement,
        mainElement,
        bodyElement,
        htmlElement,
      ].filter(Boolean);

      scrollTargets.forEach((target) => {
        if (target) {
          try {
            if (
              smooth &&
              'scrollTo' in target &&
              typeof target.scrollTo === 'function'
            ) {
              // 平滑滚动
              target.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth',
              });
            } else {
              // 即时滚动
              target.scrollTop = 0;
              if ('scrollLeft' in target) {
                target.scrollLeft = 0;
              }
            }
          } catch (error) {
            // 降级处理
            console.warn('ScrollToTop: 滚动失败，使用降级方案', error);
            target.scrollTop = 0;
          }
        }
      });

      // 额外处理：确保窗口也滚动到顶部
      try {
        if (smooth && window.scrollTo) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        } else {
          window.scrollTo(0, 0);
        }
      } catch {
        // 降级处理
        window.scrollTo(0, 0);
      }
    };

    if (delay > 0) {
      // 延迟滚动，等待页面内容加载完成
      const timer = setTimeout(performScroll, delay);
      return () => clearTimeout(timer);
    } else {
      // 立即滚动
      performScroll();
    }
  }, [location.pathname, smooth, delay, autoScroll, excludePatterns]);

  // 这个组件不渲染任何内容
  return null;
};

/**
 * 手动滚动到顶部的工具函数
 */
export const scrollToTop = (
  options: { smooth?: boolean; delay?: number } = {}
) => {
  const { smooth = true, delay = 0 } = options;

  const doScroll = () => {
    const contentElement = document.querySelector(
      '.ant-layout-content'
    ) as HTMLElement;
    const targets = [
      contentElement,
      document.body,
      document.documentElement,
    ].filter(Boolean);

    targets.forEach((target) => {
      if (target) {
        try {
          if (smooth && 'scrollTo' in target) {
            target.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth',
            });
          } else {
            target.scrollTop = 0;
          }
        } catch {
          target.scrollTop = 0;
        }
      }
    });

    // 窗口滚动
    try {
      if (smooth) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    } catch {
      window.scrollTo(0, 0);
    }
  };

  if (delay > 0) {
    setTimeout(doScroll, delay);
  } else {
    doScroll();
  }
};

/**
 * 滚动到指定元素的工具函数
 */
export const scrollToElement = (
  selector: string,
  options: {
    smooth?: boolean;
    offset?: number;
    delay?: number;
  } = {}
) => {
  const { smooth = true, offset = 0, delay = 0 } = options;

  const doScroll = () => {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      console.warn(`ScrollToElement: 未找到元素 ${selector}`);
      return;
    }

    const elementTop = element.offsetTop - offset;

    try {
      if (smooth) {
        window.scrollTo({
          top: elementTop,
          behavior: 'smooth',
        });
      } else {
        window.scrollTo(0, elementTop);
      }
    } catch {
      window.scrollTo(0, elementTop);
    }
  };

  if (delay > 0) {
    setTimeout(doScroll, delay);
  } else {
    doScroll();
  }
};

export default ScrollToTop;
