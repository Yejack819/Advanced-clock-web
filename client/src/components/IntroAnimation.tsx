/**
 * IntroAnimation - 启动动画组件
 * 
 * 动画流程：
 * 1. 全黑背景
 * 2. 文字描边绘制动画（笔画效果）
 * 3. 1秒后时间描边动画开始
 * 4. 文字填充渐变（同时）
 * 5. 整体淡出
 * 6. 显示主页面
 */
import { useEffect, useState, useMemo, useCallback } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
  language: 'zh' | 'en';
  utcOffset: number;
  use24Hour: boolean;
  fontFamily: string;
}

// 根据时间获取问候语
function getGreeting(hour: number, language: 'zh' | 'en'): { main: string; sub?: string } {
  if (language === 'zh') {
    if (hour >= 5 && hour < 9) return { main: '早上好' };
    if (hour >= 9 && hour < 11) return { main: '上午好' };
    if (hour >= 11 && hour < 13) return { main: '中午好' };
    if (hour >= 13 && hour < 18) return { main: '下午好' };
    if (hour >= 18 && hour < 22) return { main: '晚上好' };
    return { main: '夜深了' };
  } else {
    if (hour >= 5 && hour < 12) return { main: 'Good', sub: 'Morning' };
    if (hour >= 12 && hour < 18) return { main: 'Good', sub: 'Afternoon' };
    if (hour >= 18 && hour < 22) return { main: 'Good', sub: 'Evening' };
    return { main: 'Good', sub: 'Night' };
  }
}

// 格式化时间
function formatTime(hour: number, minute: number, use24Hour: boolean, language: 'zh' | 'en'): string {
  if (use24Hour) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } else {
    const period = hour >= 12 ? (language === 'zh' ? '下午' : 'PM') : (language === 'zh' ? '上午' : 'AM');
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;
    const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')}`;
    return language === 'zh' ? `${period} ${timeStr}` : `${timeStr} ${period}`;
  }
}

export default function IntroAnimation({ onComplete, language, utcOffset, use24Hour, fontFamily }: IntroAnimationProps) {
  const [phase, setPhase] = useState<'black' | 'drawing' | 'filling' | 'fading'>('black');
  
  // 计算当前时间的问候语和时间
  const { greeting, currentTime } = useMemo(() => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const currentHour = (utcHour + utcOffset + 24) % 24;
    return {
      greeting: getGreeting(currentHour, language),
      currentTime: formatTime(currentHour, utcMinute, use24Hour, language),
    };
  }, [language, utcOffset, use24Hour]);

  // 动画完成回调
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // 动画阶段控制
  useEffect(() => {
    // 阶段1: 全黑 (0.3s)
    const t1 = setTimeout(() => setPhase('drawing'), 300);
    // 阶段2: 绘制动画 (3.5s，更慢的描边)
    // 阶段3: 填充 (描边快结束时开始，间隔更小)
    const t2 = setTimeout(() => setPhase('filling'), 3600);
    // 阶段4: 淡出 (0.6s)
    const t3 = setTimeout(() => setPhase('fading'), 4200);
    // 阶段5: 完成
    const t4 = setTimeout(() => handleComplete(), 4800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [handleComplete]);

  // 计算文字大小
  const mainFontSize = language === 'zh' ? 80 : 70;
  const timeFontSize = language === 'zh' ? 50 : 45;
  const subFontSize = 40;
  const isEnglish = language === 'en';
  
  // SVG 尺寸
  const svgWidth = isEnglish ? 480 : 420;
  const svgHeight = isEnglish ? 240 : 220;

  // 获取问候语字体 - 使用设置的字体
  const getGreetingFont = () => {
    // 检查是否选中了中文字体
    const isChineseFont = fontFamily.includes('Noto Sans SC') || 
                          fontFamily.includes('Noto Serif SC') || 
                          fontFamily.includes('LXGW WenKai');
    
    if (language === 'zh' && !isChineseFont) {
      // 中文但未选中中文字体，使用默认中文字体
      return "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
    }
    
    // 使用用户设置的字体
    return fontFamily;
  };

  // 时间字体 - 使用设置的字体
  const getTimeFont = () => fontFamily;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'fading' ? 0 : 1,
        transition: phase === 'fading' ? 'opacity 0.6s ease-out' : 'none',
      }}
    >
      <style>{`
        @keyframes strokeDraw {
          0% {
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes strokeDrawTime {
          0% {
            stroke-dashoffset: 500;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes strokeDrawSub {
          0% {
            stroke-dashoffset: 500;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fillIn {
          0% {
            fill-opacity: 0;
          }
          100% {
            fill-opacity: 1;
          }
        }
        
        @keyframes lineGrow {
          0% {
            stroke-dashoffset: 200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .stroke-animate {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: strokeDraw 3.5s ease-out forwards;
        }
        
        .stroke-animate-time {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: strokeDrawTime 2.5s ease-out forwards;
        }
        
        .stroke-animate-sub {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: strokeDrawSub 2.5s ease-out 0.3s forwards;
        }
        
        .fill-animate {
          animation: fillIn 0.6s ease-out forwards;
        }
        
        .line-animate {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: lineGrow 0.5s ease-out forwards;
        }
      `}</style>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{
          width: `${svgWidth}px`,
          height: `${svgHeight}px`,
          maxWidth: '90vw',
          maxHeight: '40vh',
        }}
      >
        <defs>
          {/* 主文字渐变 */}
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f8f8f8" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          
          {/* 发光效果 */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 问候语 - 描边层 */}
        <text
          x="50%"
          y={isEnglish ? 80 : 75}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`greeting-text ${phase === 'drawing' ? 'stroke-animate' : ''}`}
          style={{
            fontFamily: getGreetingFont(),
            fontSize: `${mainFontSize}px`,
            fontWeight: 400,
            letterSpacing: '0.08em',
            fill: 'transparent',
            stroke: '#ffffff',
            strokeWidth: phase === 'filling' ? 0 : 1.5,
            filter: 'url(#glow)',
            opacity: phase === 'black' ? 0 : 1,
            transition: 'stroke-width 0.4s ease-out',
          }}
        >
          {greeting.main}
        </text>

        {/* 问候语 - 填充层 */}
        <text
          x="50%"
          y={isEnglish ? 80 : 75}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`greeting-text ${phase === 'filling' ? 'fill-animate' : ''}`}
          style={{
            fontFamily: getGreetingFont(),
            fontSize: `${mainFontSize}px`,
            fontWeight: 400,
            letterSpacing: '0.08em',
            fill: 'url(#textGradient)',
            fillOpacity: phase === 'filling' || phase === 'fading' ? 1 : 0,
            opacity: phase === 'black' ? 0 : 1,
            transition: 'fill-opacity 0.6s ease-out',
          }}
        >
          {greeting.main}
        </text>

        {/* 时间显示 - 描边层 (延迟1秒开始) */}
        <text
          x="50%"
          y={isEnglish ? 135 : 130}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`time-text ${phase === 'drawing' ? 'stroke-animate-time' : ''}`}
          style={{
            fontFamily: getTimeFont(),
            fontSize: `${timeFontSize}px`,
            fontWeight: 300,
            letterSpacing: '0.15em',
            fill: 'transparent',
            stroke: '#ffffff',
            strokeWidth: phase === 'filling' ? 0 : 1,
            opacity: phase === 'black' ? 0 : 0.9,
            transition: 'stroke-width 0.4s ease-out',
            animationDelay: '1s',
          }}
        >
          {currentTime}
        </text>

        {/* 时间显示 - 填充层 */}
        <text
          x="50%"
          y={isEnglish ? 135 : 130}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`time-text ${phase === 'filling' ? 'fill-animate' : ''}`}
          style={{
            fontFamily: getTimeFont(),
            fontSize: `${timeFontSize}px`,
            fontWeight: 300,
            letterSpacing: '0.15em',
            fill: 'url(#textGradient)',
            fillOpacity: phase === 'filling' || phase === 'fading' ? 1 : 0,
            opacity: phase === 'black' ? 0 : 0.9,
            transition: 'fill-opacity 0.6s ease-out',
          }}
        >
          {currentTime}
        </text>

        {/* 英文副文字 */}
        {isEnglish && greeting.sub && (
          <>
            {/* 副文字 - 描边层 */}
            <text
              x="50%"
              y="190"
              textAnchor="middle"
              dominantBaseline="middle"
              className={phase === 'drawing' ? 'stroke-animate-sub' : ''}
              style={{
                fontFamily: getTimeFont(),
                fontSize: `${subFontSize}px`,
                fontWeight: 300,
                letterSpacing: '0.15em',
                fill: 'transparent',
                stroke: '#ffffff',
                strokeWidth: phase === 'filling' ? 0 : 1,
                opacity: phase === 'black' ? 0 : 0.85,
                transition: 'stroke-width 0.4s ease-out',
              }}
            >
              {greeting.sub}
            </text>

            {/* 副文字 - 填充层 */}
            <text
              x="50%"
              y="190"
              textAnchor="middle"
              dominantBaseline="middle"
              className={phase === 'filling' ? 'fill-animate' : ''}
              style={{
                fontFamily: getTimeFont(),
                fontSize: `${subFontSize}px`,
                fontWeight: 300,
                letterSpacing: '0.15em',
                fill: 'url(#textGradient)',
                fillOpacity: phase === 'filling' || phase === 'fading' ? 1 : 0,
                opacity: phase === 'black' ? 0 : 0.85,
                transition: 'fill-opacity 0.6s ease-out',
              }}
            >
              {greeting.sub}
            </text>
          </>
        )}

        {/* 中文装饰线 */}
        {!isEnglish && (
          <line
            x1="100"
            y1="175"
            x2="320"
            y2="175"
            className={phase === 'filling' ? 'line-animate' : ''}
            style={{
              stroke: '#ffffff',
              strokeWidth: 1,
              opacity: phase === 'filling' || phase === 'fading' ? 0.25 : 0,
              transition: 'opacity 0.5s ease-out',
            }}
          />
        )}
      </svg>
    </div>
  );
}
