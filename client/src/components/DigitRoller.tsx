/**
 * DigitRoller - 单个数字的垂直滚动动画组件
 * 
 * 设计哲学：暗黑机械美学
 * - 使用扩展数字条 [0-9, 0] 处理 9->0 的自然过渡
 * - 弹性缓动动画 (expo out) 配合微妙的 3D 透视
 * - 顶部和底部渐变遮罩营造滚轮深度感
 * - 自动测量字体宽度以适配不同字体
 * - 数字变化时有轻微的模糊过渡效果
 */
import { useEffect, useRef, useState } from 'react';

interface DigitRollerProps {
  digit: string; // '0'-'9'
  fontSize: number;
  fontFamily: string;
  color: string;
  animate?: boolean;
  letterSpacing?: number; // 左右间距，像素值
  lineHeight?: number; // 整体高度百分比
}

// Extended strip: 0,1,2,3,4,5,6,7,8,9,0 (extra 0 at end for 9->0 wrap)
const DIGITS_EXTENDED = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export default function DigitRoller({ digit, fontSize, fontFamily, color, animate = true, letterSpacing = 0, lineHeight = 100 }: DigitRollerProps) {
  const targetIndex = parseInt(digit, 10) || 0;
  const cellHeight = fontSize * 1.15 * (lineHeight / 100);

  const [displayIndex, setDisplayIndex] = useState(targetIndex);
  const [useTransition, setUseTransition] = useState(false);
  const [charWidth, setCharWidth] = useState(fontSize * 0.65);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTargetRef = useRef(targetIndex);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure character width for current font
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `500 ${fontSize}px ${fontFamily}`;
      let maxWidth = 0;
      for (let i = 0; i <= 9; i++) {
        const w = ctx.measureText(i.toString()).width;
        if (w > maxWidth) maxWidth = w;
      }
      setCharWidth(Math.ceil(maxWidth * 1.08));
    }
  }, [fontSize, fontFamily]);

  useEffect(() => {
    const prevTarget = prevTargetRef.current;
    prevTargetRef.current = targetIndex;

    if (targetIndex === prevTarget) return;

    if (!animate) {
      setUseTransition(false);
      setDisplayIndex(targetIndex);
      return;
    }

    // Clear any pending timers
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    if (animEndRef.current) {
      clearTimeout(animEndRef.current);
      animEndRef.current = null;
    }

    setIsAnimating(true);
    animEndRef.current = setTimeout(() => setIsAnimating(false), 600);

    // Check if wrapping 9 -> 0
    if (prevTarget === 9 && targetIndex === 0) {
      setUseTransition(true);
      setDisplayIndex(10);

      resetTimeoutRef.current = setTimeout(() => {
        setUseTransition(false);
        setDisplayIndex(0);
      }, 650);
    } else {
      setUseTransition(true);
      setDisplayIndex(targetIndex);
    }

    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      if (animEndRef.current) clearTimeout(animEndRef.current);
    };
  }, [digit, animate]);

  const translateY = -displayIndex * cellHeight;

  return (
    <div
      style={{
        height: `${cellHeight}px`,
        width: `${charWidth}px`,
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-block',
        perspective: `${fontSize * 3}px`,
        marginLeft: `${letterSpacing / 2}px`,
        marginRight: `${letterSpacing / 2}px`,
      }}
    >
      {/* Top gradient mask - deeper for 3D drum effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '25%',
          background: `linear-gradient(to bottom, var(--clock-bg, #0a0a0a) 0%, var(--clock-bg, #0a0a0a) 10%, transparent 100%)`,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom gradient mask */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '25%',
          background: `linear-gradient(to top, var(--clock-bg, #0a0a0a) 0%, var(--clock-bg, #0a0a0a) 10%, transparent 100%)`,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle highlight line at center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)`,
          zIndex: 4,
          pointerEvents: 'none',
          transform: 'translateY(-50%)',
        }}
      />

      {/* Digit strip */}
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          transition: useTransition
            ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
            : 'none',
          willChange: 'transform',
          filter: isAnimating ? 'blur(0.3px)' : 'none',
        }}
      >
        {DIGITS_EXTENDED.map((d, i) => (
          <div
            key={`${d}-${i}`}
            style={{
              height: `${cellHeight}px`,
              width: `${charWidth}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily,
              fontSize: `${fontSize}px`,
              color,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 500,
              userSelect: 'none',
              textRendering: 'geometricPrecision',
              letterSpacing: `${letterSpacing}px`,
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
