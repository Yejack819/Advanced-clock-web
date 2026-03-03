/**
 * DateCountdownPanel - 日期倒计时设置面板
 *
 * 设计哲学：暗黑机械美学
 * - 液态玻璃效果的浮动面板
 * - 设置目标日期和标签
 * - 完整的国际化支持
 * - 流畅的进入/退出动画
 */
import React, { useEffect, useRef, useState } from 'react';
import { useClock } from '@/contexts/ClockContext';
import { t } from '@/lib/i18n';
import { X, Calendar } from 'lucide-react';

interface DateCountdownPanelProps {
  onClose: () => void;
}

export default function DateCountdownPanel({ onClose }: DateCountdownPanelProps) {
  const { settings, updateSettings } = useClock();
  const panelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Mount animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  // 检测背景颜色亮度
  const isLightBackground = (() => {
    const bgColor = settings.bgColor;
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  })();

  const getPanelStyle = () => {
    if (isLightBackground) {
      return {
        backdrop: {
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        },
        panel: {
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3) inset',
          borderBottom: 'rgba(0,0,0,0.1)',
          textColor: 'rgba(0,0,0,0.85)',
          labelColor: 'rgba(0,0,0,0.6)',
          inputBg: 'rgba(0,0,0,0.05)',
          inputBorder: 'rgba(0,0,0,0.1)',
        },
      };
    } else {
      return {
        backdrop: {
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        },
        panel: {
          background: 'rgba(20,20,20,0.75)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
          borderBottom: 'rgba(255,255,255,0.08)',
          textColor: 'rgba(255,255,255,0.9)',
          labelColor: 'rgba(255,255,255,0.6)',
          inputBg: 'rgba(255,255,255,0.05)',
          inputBorder: 'rgba(255,255,255,0.1)',
        },
      };
    }
  };

  const styles = getPanelStyle();

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!settings.dateCountdownTarget) return null;
    const target = new Date(settings.dateCountdownTarget);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{
        ...styles.backdrop,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
        style={{
          background: styles.panel.background,
          backdropFilter: styles.panel.backdropFilter,
          WebkitBackdropFilter: styles.panel.WebkitBackdropFilter,
          border: styles.panel.border,
          boxShadow: styles.panel.boxShadow,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(12px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${styles.panel.borderBottom}` }}
        >
          <div className="flex items-center gap-2">
            <Calendar size={18} style={{ color: '#60a5fa' }} />
            <h2 className="text-base font-medium" style={{ color: styles.panel.textColor }}>
              {settings.language === 'zh' ? '日期倒计时设置' : 'Date Countdown Settings'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg transition-all active:scale-95"
            style={{
              color: styles.panel.labelColor,
              background: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: styles.panel.labelColor }}>
              {settings.language === 'zh' ? '启用日期倒计时' : 'Enable Date Countdown'}
            </span>
            <button
              onClick={() => updateSettings({ showDateCountdown: !settings.showDateCountdown })}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{
                background: settings.showDateCountdown
                  ? '#3b82f6'
                  : isLightBackground ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: settings.showDateCountdown ? 'translateX(26px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: styles.panel.labelColor }}>
              {t(settings.language, 'countdownLabel')}
            </label>
            <input
              type="text"
              value={settings.dateCountdownLabel}
              onChange={e => updateSettings({ dateCountdownLabel: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              style={{
                background: styles.panel.inputBg,
                border: `1px solid ${styles.panel.inputBorder}`,
                color: styles.panel.textColor,
              }}
              placeholder={t(settings.language, 'countdownLabelPlaceholder')}
            />
          </div>

          {/* Target date */}
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: styles.panel.labelColor }}>
              {t(settings.language, 'countdownDate')}
            </label>
            <input
              type="date"
              value={settings.dateCountdownTarget}
              onChange={e => updateSettings({ dateCountdownTarget: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              style={{
                background: styles.panel.inputBg,
                border: `1px solid ${styles.panel.inputBorder}`,
                color: styles.panel.textColor,
                colorScheme: isLightBackground ? 'light' : 'dark',
              }}
            />
          </div>

          {/* Preview */}
          {settings.dateCountdownTarget && daysRemaining !== null && (
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: daysRemaining >= 0
                  ? 'rgba(59,130,246,0.1)'
                  : 'rgba(239,68,68,0.1)',
                border: daysRemaining >= 0
                  ? '1px solid rgba(59,130,246,0.2)'
                  : '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <div className="text-3xl font-mono font-bold mb-1"
                style={{ color: daysRemaining >= 0 ? '#60a5fa' : '#f87171' }}>
                {daysRemaining >= 0 ? daysRemaining : Math.abs(daysRemaining)}
              </div>
              <div className="text-xs" style={{ color: styles.panel.labelColor }}>
                {daysRemaining >= 0
                  ? (settings.language === 'zh' ? `距 ${settings.dateCountdownLabel} 还有天` : `days until ${settings.dateCountdownLabel}`)
                  : (settings.language === 'zh' ? `${settings.dateCountdownLabel} 已过去天` : `days since ${settings.dateCountdownLabel}`)
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
