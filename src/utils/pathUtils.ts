/**
 * 路径验证和处理工具函数
 */

// 有效的内部路径列表
const VALID_INTERNAL_PATHS = ['/dashboard', '/template'];

// 默认重定向路径
const DEFAULT_REDIRECT_PATH = '/dashboard';

/**
 * 检查路径是否为有效的内部路径
 * @param path - 要检查的路径
 * @returns 是否为有效路径
 */
export const isValidInternalPath = (path: string): boolean => {
  return VALID_INTERNAL_PATHS.some((validPath) => path.startsWith(validPath));
};

/**
 * 检查URL是否为外部URL
 * @param url - 要检查的URL
 * @returns 是否为外部URL
 */
export const isExternalUrl = (url: string): boolean => {
  return url.startsWith('http');
};

/**
 * 验证并规范化返回URL
 * 如果是外部URL，保持原样
 * 如果是有效的内部路径，保持原样
 * 如果是无效的内部路径，返回默认路径
 * @param url - 要验证的URL
 * @returns 规范化后的URL
 */
export const validateAndNormalizeUrl = (url: string): string => {
  // 外部URL直接返回
  if (isExternalUrl(url)) {
    return url;
  }

  // 内部路径验证
  if (isValidInternalPath(url)) {
    return url;
  }

  // 无效路径返回默认路径
  return DEFAULT_REDIRECT_PATH;
};

/**
 * 从URL参数或location state中获取返回URL
 * @param searchParams - URL搜索参数
 * @param locationState - location.state对象
 * @returns 验证后的返回URL
 */
export const getValidatedReturnUrl = (
  searchParams: URLSearchParams,
  locationState?: { from?: { pathname: string } }
): string => {
  // 优先检查URL参数
  const returnUrlParam = searchParams.get('returnUrl');
  if (returnUrlParam) {
    const decodedUrl = decodeURIComponent(returnUrlParam);
    return validateAndNormalizeUrl(decodedUrl);
  }

  // 其次检查location state
  const fromPath = locationState?.from?.pathname;
  if (fromPath) {
    return validateAndNormalizeUrl(fromPath);
  }

  // 默认返回首页
  return DEFAULT_REDIRECT_PATH;
};

/**
 * 添加新的有效路径（用于动态配置）
 * @param path - 要添加的路径
 */
export const addValidPath = (path: string): void => {
  if (!VALID_INTERNAL_PATHS.includes(path)) {
    VALID_INTERNAL_PATHS.push(path);
  }
};

/**
 * 获取所有有效路径（用于调试）
 * @returns 有效路径列表的副本
 */
export const getValidPaths = (): string[] => {
  return [...VALID_INTERNAL_PATHS];
};
