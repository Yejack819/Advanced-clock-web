/**
 * ClockDisplay - 主时钟显示组件
 * 
 * 设计哲学：暗黑机械美学
 * - 每个数字独立使用 DigitRoller 组件
 * - 冒号使用两个圆点代替文字冒号，带呼吸闪烁
 * - 日期显示为时钟字号的 1/3
 * - 支持隐藏秒（秒固定00但时分仍刷新动画）
 */
import { useEffect, useState, useRef } from 'react';
import { useClock } from '@/contexts/ClockContext';
import DigitRoller from './DigitRoller';

function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function ClockDisplay() {
  const { settings } = useClock();
  const { fontSize, fontFamily, fontColor, bgColor, hideSeconds, showDate, calibrationOffset, lineHeight, letterSpacing, animationSpeed, timezone } = settings;

  const getTimeNow = () => {
    const now = new Date(Date.now() + calibrationOffset);
    const localTime = timezone && timezone !== 'local' 
      ? new Date(now.toLocaleString('en-US', { timeZone: timezone }))
      : now;
    return {
      hours: padTwo(localTime.getHours()),
      minutes: padTwo(localTime.getMinutes()),
      seconds: hideSeconds ? '00' : padTwo(localTime.getSeconds()),
      year: localTime.getFullYear(),
      month: padTwo(localTime.getMonth() + 1),
      day: padTwo(localTime.getDate()),
      weekday: localTime.getDay(),
    };
  };

  const [time, setTime] = useState(getTimeNow);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      setTime(getTimeNow());
    };
    tick();
    intervalRef.current = setInterval(tick, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [calibrationOffset, hideSeconds, showDate, timezone]);

  const dateFontSize = fontSize / 3;
  const digitHeight = fontSize * 1.15;
  const dateHeight = digitHeight * (lineHeight / 100);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div
      className="flex flex-col items-center justify-center select-none"
      style={{
        '--clock-bg': bgColor,
      } as React.CSSProperties}
    >
      {/* Date display */}
      {showDate && (
        <div
          className="transition-all duration-300 flex items-center"
          style={{
            fontFamily: "'Noto Sans SC', system-ui, sans-serif",
            fontSize: `${dateFontSize}px`,
            color: fontColor,
            height: `${dateFontSize}px`,
            marginBottom: `${fontSize * 0.12}px`,
            letterSpacing: '0.1em',
            opacity: 0.75,
            fontWeight: 300,
          }}
        >
          {time.year}年{time.month}月{time.day}日 星期{weekdays[time.weekday]}
        </div>
      )}

      {/* Time display */}
      <div className="flex items-center" style={{ height: `${digitHeight * (lineHeight / 100)}px`, lineHeight: `${lineHeight}%` }}>
        {/* Hours */}
        <DigitRoller digit={time.hours[0]} fontSize={fontSize} fontFamily={fontFamily} color={fontColor} letterSpacing={letterSpacing} lineHeight={lineHeight} animationSpeed={animationSpeed} />
        <DigitRoller digit={time.hours[1]} fontSize={fontSize} fontFamily={fontFamily} color={fontColor} letterSpacing={letterSpacing} lineHeight={lineHeight} animationSpeed={animationSpeed} />

        {/* Colon 1 */}
        <ColonDots fontSize={fontSize} color={fontColor} height={digitHeight * (lineHeight / 100)} />

        {/* Minutes */}
        <DigitRoller digit={time.minutes[0]} fontSize={fontSize} fontFamily={fontFamily} color={fontColor} letterSpacing={letterSpacing} lineHeight={lineHeight} animationSpeed={animationSpeed} />
        <DigitRoller digit={time.minutes[1]} fontSize={fontSize} fontFamily={fontFamily} color={fontColor} letterSpacing={letterSpacing} lineHeight={lineHeight} animationSpeed={animationSpeed} />

        {/* Colon 2 */}
        <ColonDots fontSize={fontSize} color={fontColor} height={digitHeight * (lineHeight / 100)} />

        {/* Seconds */}
        <DigitRoller
          digit={time.seconds[0]}
          fontSize={fontSize}
          fontFamily={fontFamily}
          color={fontColor}
          animate={!hideSeconds}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          animationSpeed={animationSpeed}
        />
        <DigitRoller
          digit={time.seconds[1]}
          fontSize={fontSize}
          fontFamily={fontFamily}
          color={fontColor}
          animate={!hideSeconds}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          animationSpeed={animationSpeed}
        />
      </div>
    </div>
  );
}

/**
 * ColonDots - 使用两个圆点代替文字冒号
 * 更加精致的视觉效果，带呼吸动画
 */
function ColonDots({ fontSize, color, height }: {
  fontSize: number;
  color: string;
  height: number;
}) {
  const dotSize = Math.max(fontSize * 0.08, 6);
  const gap = fontSize * 0.22;
  const horizontalPad = fontSize * 0.08;

  return (
    <div
      className="colon-breathe"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${gap}px`,
        height: `${height}px`,
        padding: `0 ${horizontalPad}px`,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      <div
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
    </div>
  );
}
