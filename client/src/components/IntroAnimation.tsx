/**
 * IntroAnimation - 启动动画组件
 * 
 * 动画流程：
 * 1. 全黑背景
 * 2. 文字描边绘制动画（笔画效果）
 * 3. 文字填充渐变
 * 4. 整体淡出
 * 5. 显示主页面
 */
import { useEffect, useState, useMemo, useCallback } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
  language: 'zh' | 'en';
  utcOffset: number;
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

export default function IntroAnimation({ onComplete, language, utcOffset }: IntroAnimationProps) {
  const [phase, setPhase] = useState<'black' | 'drawing' | 'filling' | 'fading'>('black');
  
  // 计算当前时间的问候语
  const greeting = useMemo(() => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const currentHour = (utcHour + utcOffset + 24) % 24;
    return getGreeting(currentHour, language);
  }, [language, utcOffset]);

  // 动画完成回调
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // 动画阶段控制
  useEffect(() => {
    // 阶段1: 全黑 (0.3s)
    const t1 = setTimeout(() => setPhase('drawing'), 300);
    // 阶段2: 绘制动画 (2.2s)
    const t2 = setTimeout(() => setPhase('filling'), 2500);
    // 阶段3: 填充 (0.6s)
    const t3 = setTimeout(() => setPhase('fading'), 3100);
    // 阶段4: 淡出 (0.6s) 后完成
    const t4 = setTimeout(() => handleComplete(), 3700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [handleComplete]);

  // 计算文字大小
  const mainFontSize = language === 'zh' ? 100 : 80;
  const subFontSize = 50;
  const isEnglish = language === 'en';
  
  // SVG 尺寸
  const svgWidth = isEnglish ? 520 : 420;
  const svgHeight = isEnglish ? 200 : 160;

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
        
        .greeting-text {
          font-family: ${language === 'zh' 
            ? "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
            : "'JetBrains Mono', 'Roboto Mono', monospace"};
        }
        
        .stroke-animate {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: strokeDraw 2.2s ease-out forwards;
        }
        
        .stroke-animate-sub {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: strokeDrawSub 1.5s ease-out 0.3s forwards;
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
          maxHeight: '30vh',
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

        {/* 主文字 - 描边层 */}
        <text
          x="50%"
          y={isEnglish ? 90 : 95}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`greeting-text ${phase === 'drawing' ? 'stroke-animate' : ''}`}
          style={{
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

        {/* 主文字 - 填充层 */}
        <text
          x="50%"
          y={isEnglish ? 90 : 95}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`greeting-text ${phase === 'filling' ? 'fill-animate' : ''}`}
          style={{
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

        {/* 英文副文字 */}
        {isEnglish && greeting.sub && (
          <>
            {/* 副文字 - 描边层 */}
            <text
              x="50%"
              y="155"
              textAnchor="middle"
              dominantBaseline="middle"
              className={phase === 'drawing' ? 'stroke-animate-sub' : ''}
              style={{
                fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
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
              y="155"
              textAnchor="middle"
              dominantBaseline="middle"
              className={phase === 'filling' ? 'fill-animate' : ''}
              style={{
                fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
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
            x1="120"
            y1="135"
            x2="300"
            y2="135"
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
