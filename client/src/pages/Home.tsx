/**
 * Home - 主页面
 * 
 * 设计哲学：暗黑机械美学
 * - 全屏居中显示时钟
 * - 底部控制面板
 * - 全屏模式下隐藏所有非时钟元素
 * - 快捷键支持: F(全屏) C(校准) S(隐藏秒)
 * - 完整的国际化支持
 * - 倒计时结束时的声音和屏幕闪烁效果
 */
import React, { useEffect, useRef } from 'react';
import { ClockProvider, useClock } from '@/contexts/ClockContext';
import { t } from '@/lib/i18n';
import { playSound, screenFlash } from '@/lib/soundManager';
import ClockDisplay from '@/components/ClockDisplay';
import ControlBar from '@/components/ControlBar';
import CalibrationPanel from '@/components/CalibrationPanel';
import AlarmCountdownPanel from '@/components/AlarmCountdownPanel';
import DateCountdownPanel from '@/components/DateCountdownPanel';

function ClockPage() {
  const { settings, isFullscreen, showCalibration, showAlarmCountdown, showDateCountdownPanel, setShowDateCountdownPanel, countdownFinished, toggleFullscreen, setShowCalibration, updateSettings } = useClock();
  const prevCountdownFinishedRef = useRef(false);

  // 颜色自适应逻辑
  useEffect(() => {
    if (!settings.autoColorMode) return;

    const updateColorsByTime = () => {
      const now = new Date();
      // 使用 UTC 时间加上用户设置的偏移量计算当前小时
      const utcHour = now.getUTCHours();
      const currentHour = (utcHour + settings.utcOffset + 24) % 24;
      
      // 白天 6:00-18:00：白底黑字
      // 晚上 18:00-6:00：黑底白字
      const isDaytime = currentHour >= 6 && currentHour < 18;
      
      if (isDaytime) {
        // 白天模式
        updateSettings({
          bgColor: '#ffffff',
          fontColor: '#1a1a1a',
        });
      } else {
        // 夜间模式
        updateSettings({
          bgColor: '#0a0a0a',
          fontColor: '#e0e0e0',
        });
      }
    };

    // 立即执行一次
    updateColorsByTime();

    // 每分钟检查一次
    const interval = setInterval(updateColorsByTime, 60000);

    return () => clearInterval(interval);
  }, [settings.autoColorMode, settings.utcOffset, updateSettings]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F key: toggle fullscreen
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleFullscreen();
      }
      // C key: toggle calibration
      else if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (!isFullscreen) {
          setShowCalibration(!showCalibration);
        }
      }
      // S key: toggle hide seconds
      else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        updateSettings({ hideSeconds: !settings.hideSeconds });
      }
      // Escape: exit fullscreen
      else if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, showCalibration, settings.hideSeconds, toggleFullscreen, setShowCalibration, updateSettings]);

  // Handle countdown finish effects - only trigger on state change from false to true
  useEffect(() => {
    if (countdownFinished && !prevCountdownFinishedRef.current) {
      console.log('Countdown finished! Playing sound...');
      
      // Play the selected countdown sound
      if (settings.countdownSound !== 'mute') {
        playSound(settings.countdownSound, 1.5);
      }
    }
    prevCountdownFinishedRef.current = countdownFinished;
  }, [countdownFinished, settings.countdownSound]);

  // Double-click to toggle fullscreen
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only toggle if clicking on empty space (not on interactive elements)
    if ((e.target as HTMLElement).tagName === 'DIV' || (e.target as HTMLElement).tagName === 'SPAN') {
      toggleFullscreen();
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        backgroundColor: settings.bgColor,
        transition: 'background-color 0.3s ease',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Subtle vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, ${settings.bgColor} 100%)`,
          opacity: 0.5,
        }}
      />

      {/* Clock */}
      <div className="relative z-10">
        <ClockDisplay />
      </div>

      {/* Control bar (hidden in fullscreen) */}
      {!isFullscreen && <ControlBar />}

      {/* Calibration panel */}
      {showCalibration && !isFullscreen && <CalibrationPanel />}

      {/* Alarm/Countdown panel */}
      {showAlarmCountdown && !isFullscreen && <AlarmCountdownPanel />}

      {/* Date Countdown panel */}
      {showDateCountdownPanel && !isFullscreen && (
        <DateCountdownPanel onClose={() => setShowDateCountdownPanel(false)} />
      )}

      {/* Fullscreen hint with keyboard shortcuts */}
      {isFullscreen && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs transition-opacity duration-1000 opacity-0 hover:opacity-100"
          style={{ fontFamily: 'system-ui' }}
        >
          {t(settings.language, 'shortcutsExit')}
        </div>
      )}

      {/* Keyboard shortcuts hint (not fullscreen) */}
      {!isFullscreen && (
        <div
          className="fixed top-4 right-4 text-white/10 text-xs transition-opacity duration-300 hover:text-white/30"
          style={{ fontFamily: 'system-ui' }}
        >
          {t(settings.language, 'shortcutsFullscreen')}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ClockProvider>
      <ClockPage />
    </ClockProvider>
  );
}
