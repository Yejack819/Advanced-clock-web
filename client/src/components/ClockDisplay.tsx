/**
 * ClockDisplay - 主时钟显示组件
 * 
 * 设计哲学：暗黑机械美学
 * - 每个数字独立使用 DigitRoller 组件
 * - 冒号使用两个圆点代替文字冒号，带呼吸闪烁
 * - 日期显示为时钟字号的 1/3
 * - 支持隐藏秒（秒固定00但时分仍刷新动画）
 * - 支持中文和英文显示，日期格式国际化
 * - 日期禁止转行
 * - 支持多个日期倒计时目标轮播显示
 */
import { useEffect, useState, useRef } from 'react';
import { useClock } from '@/contexts/ClockContext';
import { formatDate, formatCountdown } from '@/lib/i18n';
import DigitRoller from './DigitRoller';

function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function ClockDisplay() {
  const { settings, countdownRemaining, countdownRunning } = useClock();
  const { fontSize, fontFamily, fontColor, bgColor, hideSeconds, showDate, calibrationOffset, lineHeight, letterSpacing, animationSpeed, timezone, showDateCountdown, dateCountdownTargets, dateCountdownInterval, language } = settings;
  const [carouselIndex, setCarouselIndex] = useState(0);
  // 'idle' = visible centered | 'exit' = sliding out left | 'enter-pre' = instant right offset (no transition) | 'enter' = sliding in to center
  const [carouselSlide, setCarouselSlide] = useState<'idle' | 'exit' | 'enter-pre' | 'enter'>('idle');
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const carouselTransitionDuration = Math.max(animationSpeed * 0.6, 0.25); // sync with clock animation speed

  // Carousel rotation for multiple date countdowns
  useEffect(() => {
    if (!showDateCountdown || dateCountdownTargets.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % dateCountdownTargets.length);
    }, (dateCountdownInterval ?? 5) * 1000);
    return () => clearInterval(interval);
  }, [showDateCountdown, dateCountdownTargets.length]);

  // Animate slide transition when carouselIndex changes
  useEffect(() => {
    if (carouselIndex === displayedIndex) return;
    const durationMs = carouselTransitionDuration * 1000;
    // Phase 1: slide current item out to the left
    setCarouselSlide('exit');
    const t1 = setTimeout(() => {
      // Phase 2: instantly position new item to the right (no transition)
      setDisplayedIndex(carouselIndex);
      setCarouselSlide('enter-pre');
      // Phase 3: one rAF to ensure the browser paints the offset position first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Now enable transition and slide to center
          setCarouselSlide('enter');
          const t2 = setTimeout(() => setCarouselSlide('idle'), durationMs);
          // store t2 cleanup in outer scope via closure — acceptable here
          return () => clearTimeout(t2);
        });
      });
    }, durationMs);
    return () => clearTimeout(t1);
  }, [carouselIndex]);

  // Get current carousel target (use displayedIndex for smooth animation)
  const currentTarget = showDateCountdown && dateCountdownTargets.length > 0
    ? dateCountdownTargets[displayedIndex]
    : null;

  // Calculate days until target date
  const calculateDaysUntil = () => {
    if (!currentTarget) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(currentTarget.date);
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysUntil = calculateDaysUntil();

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
      month: localTime.getMonth() + 1,
      day: localTime.getDate(),
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

  // Get date display text based on language and format
  const getDateDisplayText = () => {
    return formatDate(language, time.year, time.month, time.day, time.weekday);
  };

  // Get countdown text based on language
  const getCountdownText = () => {
    if (!currentTarget) return '';
    return formatCountdown(language, daysUntil, currentTarget.label);
  };

  // Get date font family based on language
  const getDateFontFamily = () => {
    if (language === 'en') {
      return fontFamily; // Use the selected font for English
    } else {
      return "'Noto Sans SC', system-ui, sans-serif"; // Use Noto Sans SC for Chinese
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center select-none"
      style={{
        '--clock-bg': bgColor,
      } as React.CSSProperties}
    >
      {/* Date countdown display with carousel slide animation and side fade masks */}
      {showDateCountdown && currentTarget && daysUntil >= 0 && (
        <div
          style={{
            position: 'relative',
            marginBottom: `${fontSize * 0.08}px`,
            cursor: dateCountdownTargets.length > 1 ? 'grab' : 'default',
            userSelect: 'none',
          }}
          onClick={() => {
            // Allow clicking to cycle through targets
            if (dateCountdownTargets.length > 1) {
              setCarouselIndex(prev => (prev + 1) % dateCountdownTargets.length);
            }
          }}
          onTouchStart={(e) => {
            if (dateCountdownTargets.length <= 1) return;
            const touch = e.touches[0];
            (window as any).touchStartX = touch.clientX;
          }}
          onTouchEnd={(e) => {
            if (dateCountdownTargets.length <= 1) return;
            const touch = e.changedTouches[0];
            const startX = (window as any).touchStartX;
            const diff = touch.clientX - startX;
            
            if (Math.abs(diff) > 50) {
              if (diff > 0) {
                // Swiped right: show previous
                setCarouselIndex(prev => (prev - 1 + dateCountdownTargets.length) % dateCountdownTargets.length);
              } else {
                // Swiped left: show next
                setCarouselIndex(prev => (prev + 1) % dateCountdownTargets.length);
              }
            }
          }}
        >
          {/* Left gradient mask */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${dateFontSize * 1.5}px`,
              background: `linear-gradient(to right, ${bgColor} 0%, transparent 100%)`,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />

          {/* Countdown text with slide animation */}
          <div
            style={{
              overflow: 'hidden',
              height: `${dateFontSize * 1.5}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontFamily: getDateFontFamily(),
                fontSize: `${dateFontSize}px`,
                color: fontColor,
                letterSpacing: '0.05em',
                opacity: carouselSlide === 'exit' ? 0 : carouselSlide === 'enter-pre' ? 0 : 0.6,
                fontWeight: 300,
                whiteSpace: 'nowrap',
                lineHeight: 1.5,
                transform:
                  carouselSlide === 'exit'
                    ? 'translateX(-80px)'
                    : carouselSlide === 'enter-pre'
                    ? 'translateX(80px)'
                    : 'translateX(0)',
                transition:
                  carouselSlide === 'idle' || carouselSlide === 'enter-pre'
                    ? 'none'
                    : `transform ${carouselTransitionDuration}s cubic-bezier(0.4, 0, 0.2, 1), opacity ${carouselTransitionDuration}s ease`,
              }}
            >
              {getCountdownText()}
            </div>
          </div>

          {/* Right gradient mask */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: `${dateFontSize * 1.5}px`,
              background: `linear-gradient(to left, ${bgColor} 0%, transparent 100%)`,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* Carousel indicators */}
      {showDateCountdown && dateCountdownTargets.length > 1 && (
        <div
          className="flex gap-1 items-center justify-center"
          style={{
            marginBottom: `${fontSize * 0.05}px`,
          }}
        >
          {dateCountdownTargets.map((_, idx) => (
            <div
              key={idx}
              className="rounded-full transition-all cursor-pointer"
              onClick={() => setCarouselIndex(idx)}
              style={{
                width: idx === carouselIndex ? '8px' : '4px',
                height: '4px',
                backgroundColor: fontColor,
                opacity: idx === carouselIndex ? 0.8 : 0.3,
              }}
            />
          ))}
        </div>
      )}

      {/* Date display */}
      {showDate && (
        <div
          className="transition-all duration-300 flex items-center"
          style={{
            fontFamily: getDateFontFamily(),
            fontSize: `${dateFontSize}px`,
            color: fontColor,
            height: `${dateFontSize}px`,
            marginBottom: `${fontSize * 0.12}px`,
            letterSpacing: '0.1em',
            opacity: 0.75,
            fontWeight: 300,
            whiteSpace: 'nowrap',
          }}
        >
          {getDateDisplayText()}
        </div>
      )}

      {/* Countdown display (small) with animation */}
      {countdownRemaining > 0 && (
        <div className="flex items-center" style={{ marginBottom: `${fontSize * 0.1}px` }}>
          {/* Countdown minutes */}
          <DigitRoller
            digit={Math.floor(countdownRemaining / 60).toString().padStart(2, '0')[0]}
            fontSize={fontSize * 0.25}
            fontFamily={fontFamily}
            color={fontColor}
            letterSpacing={letterSpacing * 0.25}
            lineHeight={lineHeight}
            animationSpeed={animationSpeed}
          />
          <DigitRoller
            digit={Math.floor(countdownRemaining / 60).toString().padStart(2, '0')[1]}
            fontSize={fontSize * 0.25}
            fontFamily={fontFamily}
            color={fontColor}
            letterSpacing={letterSpacing * 0.25}
            lineHeight={lineHeight}
            animationSpeed={animationSpeed}
          />
          {/* Colon */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${fontSize * 0.25 * 0.22}px`,
              height: `${fontSize * 0.25 * 1.15 * (lineHeight / 100)}px`,
              padding: `0 ${fontSize * 0.25 * 0.08}px`,
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: `${Math.max(fontSize * 0.25 * 0.08, 4)}px`,
                height: `${Math.max(fontSize * 0.25 * 0.08, 4)}px`,
                borderRadius: '50%',
                backgroundColor: fontColor,
                opacity: 0.6,
              }}
            />
            <div
              style={{
                width: `${Math.max(fontSize * 0.25 * 0.08, 4)}px`,
                height: `${Math.max(fontSize * 0.25 * 0.08, 4)}px`,
                borderRadius: '50%',
                backgroundColor: fontColor,
                opacity: 0.6,
              }}
            />
          </div>
          {/* Countdown seconds */}
          <DigitRoller
            digit={(countdownRemaining % 60).toString().padStart(2, '0')[0]}
            fontSize={fontSize * 0.25}
            fontFamily={fontFamily}
            color={fontColor}
            letterSpacing={letterSpacing * 0.25}
            lineHeight={lineHeight}
            animationSpeed={animationSpeed}
          />
          <DigitRoller
            digit={(countdownRemaining % 60).toString().padStart(2, '0')[1]}
            fontSize={fontSize * 0.25}
            fontFamily={fontFamily}
            color={fontColor}
            letterSpacing={letterSpacing * 0.25}
            lineHeight={lineHeight}
            animationSpeed={animationSpeed}
          />
        </div>
      )}

      {/* Main clock display */}
      <div className="flex items-center justify-center">
        {/* Hours */}
        <DigitRoller
          digit={time.hours[0]}
          fontSize={fontSize}
          fontFamily={fontFamily}
          color={fontColor}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          animationSpeed={animationSpeed}
        />
        <DigitRoller
          digit={time.hours[1]}
          fontSize={fontSize}
          fontFamily={fontFamily}
          color={fontColor}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          animationSpeed={animationSpeed}
        />

        {/* Colon with breathing animation */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${fontSize * 0.22}px`,
            height: `${digitHeight}px`,
            padding: `0 ${fontSize * 0.08}px`,
            userSelect: 'none',
            animation: `breathe ${animationSpeed * 2}s ease-in-out infinite`,
          }}
        >
          <div
            style={{
              width: `${Math.max(fontSize * 0.08, 4)}px`,
              height: `${Math.max(fontSize * 0.08, 4)}px`,
              borderRadius: '50%',
              backgroundColor: fontColor,
            }}
          />
          <div
            style={{
              width: `${Math.max(fontSize * 0.08, 4)}px`,
              height: `${Math.max(fontSize * 0.08, 4)}px`,
              borderRadius: '50%',
              backgroundColor: fontColor,
            }}
          />
        </div>

        {/* Minutes */}
        <DigitRoller
          digit={time.minutes[0]}
          fontSize={fontSize}
          fontFamily={fontFamily}
          color={fontColor}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          animationSpeed={animationSpeed}
        />
        <DigitRoller
          digit={time.minutes[1]}
          fontSize={fontSize}
          fontFamily={fontFamily}
          color={fontColor}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          animationSpeed={animationSpeed}
        />

        {/* Colon with breathing animation */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${fontSize * 0.22}px`,
            height: `${digitHeight}px`,
            padding: `0 ${fontSize * 0.08}px`,
            userSelect: 'none',
            animation: `breathe ${animationSpeed * 2}s ease-in-out infinite`,
          }}
        >
          <div
            style={{
              width: `${Math.max(fontSize * 0.08, 4)}px`,
              height: `${Math.max(fontSize * 0.08, 4)}px`,
              borderRadius: '50%',
              backgroundColor: fontColor,
            }}
          />
          <div
            style={{
              width: `${Math.max(fontSize * 0.08, 4)}px`,
              height: `${Math.max(fontSize * 0.08, 4)}px`,
              borderRadius: '50%',
              backgroundColor: fontColor,
            }}
          />
        </div>

        {/* Seconds */}
        <DigitRoller
          digit={time.seconds[0]}
          fontSize={fontSize}
          fontFamily={fontFamily}
          color={fontColor}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          animationSpeed={animationSpeed}
        />
        <DigitRoller
          digit={time.seconds[1]}
          fontSize={fontSize}
          fontFamily={fontFamily}
          color={fontColor}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          animationSpeed={animationSpeed}
        />
      </div>

      {/* CSS animation for breathing effect */}
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
