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
  const { settings, countdownRemaining, countdownRunning, isFullscreen } = useClock();
  const { fontSize, fontFamily, fontColor, bgColor, hideSeconds, showDate, calibrationOffset, lineHeight, letterSpacing, animationSpeed, utcOffset, dateFontRatio, showDateCountdown, dateCountdownTargets, dateCountdownInterval, language } = settings;
  const [carouselIndex, setCarouselIndex] = useState(0);
  // 'idle' = visible centered | 'exit' = sliding out left/right | 'enter-pre' = instant offset (no transition) | 'enter' = sliding in to center
  const [carouselSlide, setCarouselSlide] = useState<'idle' | 'exit' | 'enter-pre' | 'enter'>('idle');
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left'); // track swipe direction
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
    // Phase 1: slide current item out in the direction opposite to slide direction
    setCarouselSlide('exit');
    const t1 = setTimeout(() => {
      // Phase 2: instantly position new item in the opposite direction (no transition)
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
  }, [carouselIndex, carouselTransitionDuration]);

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
    
    // 获取 UTC 时间戳，加上时区偏移（小时 -> 毫秒）
    const targetMs = now.getTime() + utcOffset * 60 * 60 * 1000;
    const targetDate = new Date(targetMs);
    
    // 使用 UTC 方法获取结果，避免本地时区干扰
    return {
      hours: padTwo(targetDate.getUTCHours()),
      minutes: padTwo(targetDate.getUTCMinutes()),
      seconds: hideSeconds ? '00' : padTwo(targetDate.getUTCSeconds()),
      year: targetDate.getUTCFullYear(),
      month: targetDate.getUTCMonth() + 1,
      day: targetDate.getUTCDate(),
      weekday: targetDate.getUTCDay(),
    };
  };

  const [time, setTime] = useState(getTimeNow);
  const [showSyncHint, setShowSyncHint] = useState(false); // 显示同步提示
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 30秒自动同步功能
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      // 与标准时间同步
      setTime(getTimeNow());
      // 显示同步提示
      setShowSyncHint(true);
      // 2秒后隐藏提示
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = setTimeout(() => {
        setShowSyncHint(false);
      }, 2000);
    }, 30000); // 每30秒同步一次

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      setTime(getTimeNow());
    };
    tick();
    intervalRef.current = setInterval(tick, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [calibrationOffset, hideSeconds, showDate, utcOffset]);

  const dateFontSize = fontSize / dateFontRatio;
  const digitHeight = fontSize * 1.15;
  const dateHeight = digitHeight * (lineHeight / 100);
  
  // 当日期和日期倒计时都显示时，使用更紧凑的间距
  const isCompactMode = showDate && showDateCountdown && currentTarget && daysUntil >= 0;

  // Get date display text based on language and format
  const getDateDisplayText = () => {
    return formatDate(language, time.year, time.month, time.day, time.weekday);
  };

  // Get countdown text based on language
  const getCountdownText = () => {
    if (!currentTarget) return '';
    return formatCountdown(language, daysUntil, currentTarget.label);
  };

  // Get date font family based on language and selected font
  const getDateFontFamily = () => {
    // 检查是否选中了中文字体
    const isChineseFont = fontFamily.includes('Noto Sans SC') || 
                          fontFamily.includes('Noto Serif SC') || 
                          fontFamily.includes('LXGW WenKai');
    
    // 如果选中了中文字体，日期和倒计时都使用设置的字体
    if (isChineseFont) {
      return fontFamily;
    }
    
    // 如果语言是中文但未选中中文字体，使用 Noto Sans SC
    if (language === 'zh') {
      return "'Noto Sans SC', system-ui, sans-serif";
    }
    
    // 英文使用设置的字体
    return fontFamily;
  };

  return (
    <div
      className="flex flex-col items-center justify-center select-none relative clock-load-animation"
      style={{
        '--clock-bg': bgColor,
      } as React.CSSProperties}
    >
      {/* 加载动画的 CSS */}
      <style>{`
        @keyframes clockFadeIn {
          0% {
            filter: blur(20px);
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            filter: blur(0px);
            opacity: 1;
            transform: scale(1);
          }
        }
        .clock-load-animation {
          animation: clockFadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeInOut {
          0% { opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { opacity: 0.2; }
        }
      `}</style>
      {/* 右下角同步提示 - 全屏时不显示 */}
      {showSyncHint && !isFullscreen && (
        <div
          className="fixed bottom-4 right-4 pointer-events-none z-50"
          style={{
            animation: 'fadeInOut 2s ease-in-out',
            fontSize: '12px',
            color: fontColor,
            opacity: 0.6,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <style>{`
            @keyframes fadeInOut {
              0% { opacity: 0.2; }
              50% { opacity: 0.8; }
              100% { opacity: 0.2; }
            }
          `}</style>
          <div>⟲ {language === 'zh' ? '时间已同步' : 'Time Synced'}</div>
        </div>
      )}
      {/* Date countdown display with carousel slide animation and side fade masks */}
      {showDateCountdown && currentTarget && daysUntil >= 0 && (
        <div
          style={{
            position: 'relative',
            marginBottom: isCompactMode ? `${fontSize * 0.05}px` : `${fontSize * 0.08}px`,
            cursor: dateCountdownTargets.length > 1 ? 'grab' : 'default',
            userSelect: 'none',
          }}
          onClick={() => {
            // Allow clicking to cycle through targets
            if (dateCountdownTargets.length > 1) {
              setSlideDirection('left'); // default to left for click
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
                // Swiped right: show previous, animate from left to right
                setSlideDirection('right');
                setCarouselIndex(prev => (prev - 1 + dateCountdownTargets.length) % dateCountdownTargets.length);
              } else {
                // Swiped left: show next, animate from right to left
                setSlideDirection('left');
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
                    ? slideDirection === 'left' ? 'translateX(-80px)' : 'translateX(80px)'
                    : carouselSlide === 'enter-pre'
                    ? slideDirection === 'left' ? 'translateX(80px)' : 'translateX(-80px)'
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
            marginBottom: isCompactMode ? `${fontSize * 0.03}px` : `${fontSize * 0.05}px`,
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
            marginBottom: isCompactMode ? `${fontSize * 0.08}px` : `${fontSize * 0.12}px`,
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
