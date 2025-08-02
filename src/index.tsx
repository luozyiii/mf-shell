// 异步导入bootstrap以创建异步边界
import('./bootstrap').catch(err => {
  console.error('Failed to load bootstrap:', err);
});
