// 异步导入bootstrap以创建异步边界
import('./bootstrap').catch(() => {
  // 启动失败
});
