/**
 * Home - 主页面
 * 
 * 设计哲学：暗黑机械美学
 * - 全屏居中显示时钟
 * - 底部控制面板
 * - 全屏模式下隐藏所有非时钟元素
 * - 快捷键支持: F(全屏) C(校准) S(隐藏秒)
 */
import React from 'react';
import { ClockProvider, useClock } from '@/contexts/ClockContext';
import ClockDisplay from '@/components/ClockDisplay';
import ControlBar from '@/components/ControlBar';
import CalibrationPanel from '@/components/CalibrationPanel';
import AlarmCountdownPanel from '@/components/AlarmCountdownPanel';

function ClockPage() {
  const { settings, isFullscreen, showCalibration, showAlarmCountdown, toggleFullscreen, setShowCalibration, updateSettings } = useClock();

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

      {/* Fullscreen hint with keyboard shortcuts */}
      {isFullscreen && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs transition-opacity duration-1000 opacity-0 hover:opacity-100"
          style={{ fontFamily: 'system-ui' }}
        >
          {settings.language === 'en' ? 'Press ESC to exit fullscreen | F fullscreen | C calibrate | S hide seconds' : '按 ESC 退出全屏 | F 全屏 | C 校准 | S 隐藏秒'}
        </div>
      )}

      {/* Keyboard shortcuts hint (not fullscreen) */}
      {!isFullscreen && (
        <div
          className="fixed top-4 right-4 text-white/10 text-xs transition-opacity duration-300 hover:text-white/30"
          style={{ fontFamily: 'system-ui' }}
        >
          {settings.language === 'en' ? 'Shortcuts: F(fullscreen) C(calibrate) S(hide seconds)' : '快捷键: F(全屏) C(校准) S(隐藏秒)'}
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
