// 动画状态管理模块

// 动画状态对象
const animationState = {
  isAnimating: false,
  pendingCount: 0,
  lastAnimationTime: 0
};

/**
 * 检查是否可以开始新动画
 * @returns 是否可以开始新动画
 */
export function canStartAnimation(): boolean {
  const now = Date.now();
  
  // 如果已经有动画在运行，增加计数
  if (animationState.isAnimating) {
    animationState.pendingCount = Math.min(animationState.pendingCount + 1, 3);
    return false;
  }
  
  // 限制动画触发频率
  if (now - animationState.lastAnimationTime < 500) {
    return false;
  }
  
  return true;
}

/**
 * 标记动画开始
 */
export function startAnimation(): void {
  animationState.isAnimating = true;
  animationState.lastAnimationTime = Date.now();
}

/**
 * 标记动画结束
 * @returns 是否有待处理的动画
 */
export function endAnimation(): boolean {
  if (animationState.pendingCount > 0) {
    animationState.pendingCount--;
    return true;
  }
  
  animationState.isAnimating = false;
  return false;
}

/**
 * 重置动画状态
 */
export function resetAnimation(): void {
  animationState.isAnimating = false;
  animationState.pendingCount = 0;
}

/**
 * 获取当前动画状态
 */
export function getAnimationState() {
  return { ...animationState };
} 