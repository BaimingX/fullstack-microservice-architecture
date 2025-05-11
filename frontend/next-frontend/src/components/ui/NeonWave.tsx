import React, { useEffect, useState, useRef } from 'react';
import { getStaticUrl } from '@/utils/cdn';

// 霓虹线折射效果组件
const NeonWave: React.FC = () => {
  // 控制线条可见性的状态
  const [isVisible, setIsVisible] = useState(false);
  // 控制是否应该运行动画
  const [isRunning, setIsRunning] = useState(false);
  
  // 存储线条路径的状态
  const [cyanPath, setCyanPath] = useState<string>('');
  const [magentaPath, setMagentaPath] = useState<string>('');
  const [goldPath, setGoldPath] = useState<string>(''); // 新增金色线路径
  
  // 动画参考
  const animationRef = useRef<number>(0);
  
  // 固定的初始视口尺寸（避免水合不匹配）
  const INITIAL_WIDTH = 1920;
  const INITIAL_HEIGHT = 1080;
  
  // 线条属性
  const lineProperties = useRef({
    cyan: {
      x: INITIAL_WIDTH / 4, // 使用固定初始位置
      y: INITIAL_HEIGHT / 2,
      angle: Math.PI * 0.3, // 固定初始角度
      speed: 4.5,
      pathPoints: [] as {x: number, y: number}[],
      reflections: 0,
      width: 3,
      color: '#0df'
    },
    magenta: {
      x: INITIAL_WIDTH / 2,
      y: INITIAL_HEIGHT / 3,
      angle: Math.PI * 1.7,
      speed: 4,
      pathPoints: [] as {x: number, y: number}[],
      reflections: 0,
      width: 2.5,
      color: '#f0f'
    },
    gold: { // 新增金色线条
      x: INITIAL_WIDTH * 3/4,
      y: INITIAL_HEIGHT * 2/3,
      angle: Math.PI * 0.8,
      speed: 5,
      pathPoints: [] as {x: number, y: number}[],
      reflections: 0,
      width: 2.8,
      color: '#ff0'
    }
  });

  // 边界检测和折射计算
  const checkBoundaryAndReflect = (line: any, screenWidth: number, screenHeight: number) => {
    const width = screenWidth;
    const height = screenHeight;
    
    // 计算下一个位置
    let nextX = line.x + Math.cos(line.angle) * line.speed;
    let nextY = line.y + Math.sin(line.angle) * line.speed;
    
    // 检测是否碰到边界
    let reflected = false;
    
    // 左右边界
    if (nextX <= 0 || nextX >= width) {
      // 保存碰撞点
      line.pathPoints.push({x: nextX <= 0 ? 0 : width, y: line.y});
      
      // 随机折射角度 (减少随机性)
      const normalAngle = nextX <= 0 ? 0 : Math.PI;
      const randomDeviation = (Math.random() - 0.5) * Math.PI * 0.6; // 减少偏差
      line.angle = normalAngle + Math.PI + randomDeviation;
      
      reflected = true;
      line.reflections++;
    }
    
    // 上下边界
    if (nextY <= 0 || nextY >= height) {
      // 保存碰撞点
      line.pathPoints.push({x: line.x, y: nextY <= 0 ? 0 : height});
      
      // 随机折射角度
      const normalAngle = nextY <= 0 ? Math.PI * 1.5 : Math.PI * 0.5;
      const randomDeviation = (Math.random() - 0.5) * Math.PI * 0.6; // 减少偏差
      line.angle = normalAngle + Math.PI + randomDeviation;
      
      reflected = true;
      line.reflections++;
    }
    
    // 如果发生了折射
    if (reflected) {
      // 限制折射次数
      if (line.reflections > 7) { // 增加允许的折射次数
        // 重置线条
        line.x = Math.random() * width;
        line.y = Math.random() * height;
        line.angle = Math.random() * Math.PI * 2;
        line.pathPoints = [{x: line.x, y: line.y}];
        line.reflections = 0;
      }
    }
    
    // 更新位置
    line.x += Math.cos(line.angle) * line.speed;
    line.y += Math.sin(line.angle) * line.speed;
    
    // 保持历史路径的长度 (增加最大点数)
    if (line.pathPoints.length > 120) { // 增加路径长度
      line.pathPoints.shift();
    }
    
    // 添加当前点到路径
    line.pathPoints.push({x: line.x, y: line.y});
    
    return line;
  };

  // 更新路径字符串
  const updatePathString = (points: {x: number, y: number}[]): string => {
    if (points.length < 2) return '';
    
    // 创建SVG路径字符串
    let pathString = `M${points[0].x},${points[0].y}`;
    
    // 添加所有点
    for (let i = 1; i < points.length; i++) {
      pathString += ` L${points[i].x},${points[i].y}`;
    }
    
    return pathString;
  };

  // 获取屏幕尺寸 - 客户端专用
  const [dimensions, setDimensions] = useState({
    width: INITIAL_WIDTH,
    height: INITIAL_HEIGHT
  });

  // 仅在客户端更新尺寸 - 避免水合不匹配
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // 初始设置尺寸
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 动画循环 - 客户端专用
  const animate = () => {
    // 如果组件不应该运行，则退出动画循环
    if (!isRunning) return;
    
    const { width, height } = dimensions;
    
    // 更新青色线
    lineProperties.current.cyan = checkBoundaryAndReflect(lineProperties.current.cyan, width, height);
    setCyanPath(updatePathString(lineProperties.current.cyan.pathPoints));
    
    // 更新品红色线
    lineProperties.current.magenta = checkBoundaryAndReflect(lineProperties.current.magenta, width, height);
    setMagentaPath(updatePathString(lineProperties.current.magenta.pathPoints));
    
    // 更新金色线
    lineProperties.current.gold = checkBoundaryAndReflect(lineProperties.current.gold, width, height);
    setGoldPath(updatePathString(lineProperties.current.gold.pathPoints));
    
    // 继续动画循环
    animationRef.current = requestAnimationFrame(animate);
  };

  // 初始化和清理动画
  useEffect(() => {
    // 设置初始点
    lineProperties.current.cyan.pathPoints = [{
      x: lineProperties.current.cyan.x,
      y: lineProperties.current.cyan.y
    }];
    
    lineProperties.current.magenta.pathPoints = [{
      x: lineProperties.current.magenta.x,
      y: lineProperties.current.magenta.y
    }];
    
    lineProperties.current.gold.pathPoints = [{
      x: lineProperties.current.gold.x,
      y: lineProperties.current.gold.y
    }];
    
    // 短暂延迟后开始动画，确保组件已完全加载
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsRunning(true);
    }, 100);
    
    // 清理函数
    return () => {
      // 清除定时器
      clearTimeout(timer);
      // 停止动画
      setIsRunning(false);
      // 取消任何待处理的动画帧
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
    };
  }, []);

  // 监听 isRunning 状态变化，控制动画
  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
    };
  }, [isRunning]);

  return (
    <div className="fixed w-full h-full left-0 top-0 z-0 pointer-events-none">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${INITIAL_WIDTH} ${INITIAL_HEIGHT}`} 
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        {/* 青色霓虹线 */}
        <path
          d={cyanPath}
          fill="none"
          stroke="#0df"
          strokeWidth={lineProperties.current.cyan.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ 
            opacity: isVisible ? 0.8 : 0,
            filter: 'drop-shadow(0 0 8px #0df) drop-shadow(0 0 16px #0df)',
            transition: 'opacity 1s ease-in'
          }}
        />
        
        {/* 品红霓虹线 */}
        <path
          d={magentaPath}
          fill="none"
          stroke="#f0f"
          strokeWidth={lineProperties.current.magenta.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ 
            opacity: isVisible ? 0.6 : 0,
            filter: 'drop-shadow(0 0 8px #f0f) drop-shadow(0 0 16px #f0f)',
            transition: 'opacity 1s ease-in'
          }}
        />
        
        {/* 金色霓虹线 */}
        <path
          d={goldPath}
          fill="none"
          stroke="#ff0"
          strokeWidth={lineProperties.current.gold.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ 
            opacity: isVisible ? 0.7 : 0,
            filter: 'drop-shadow(0 0 8px #ff0) drop-shadow(0 0 16px #ff0)',
            transition: 'opacity 1s ease-in'
          }}
        />
      </svg>
    </div>
  );
};

export default NeonWave; 