/**
 * Home - 主页面
 * 
 * 设计哲学：暗黑机械美学
 * - 全屏居中显示时钟
 * - 底部控制面板
 * - 全屏模式下隐藏所有非时钟元素
 */
import { ClockProvider, useClock } from '@/contexts/ClockContext';
import ClockDisplay from '@/components/ClockDisplay';
import ControlBar from '@/components/ControlBar';
import CalibrationPanel from '@/components/CalibrationPanel';

function ClockPage() {
  const { settings, isFullscreen, showCalibration } = useClock();

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        backgroundColor: settings.bgColor,
        transition: 'background-color 0.3s ease',
      }}
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

      {/* Fullscreen hint */}
      {isFullscreen && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs transition-opacity duration-1000 opacity-0 hover:opacity-100"
          style={{ fontFamily: 'system-ui' }}
        >
          按 ESC 退出全屏
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
