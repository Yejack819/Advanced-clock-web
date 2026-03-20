/**
 * DateCountdownPanel - 日期纪念日设置面板
 *
 * 设计哲学：暗黑机械美学
 * - 液态玻璃效果的浮动面板
 * - 支持多个日期纪念日目标（包括过去和未来的日期）
 * - 完整的国际化支持
 * - 流畅的进入/退出动画
 * - 按钮点击反馈动画（ripple + scale）
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useClock } from '@/contexts/ClockContext';
import { X, Calendar, Plus, Trash2, Check } from 'lucide-react';

interface DateCountdownPanelProps {
  onClose: () => void;
}

// Ripple button with press feedback
function RippleButton({
  onClick,
  className,
  style,
  children,
  disabled,
}: {
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    setPressed(true);
    const rect = btnRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  const handlePointerUp = () => setPressed(false);

  return (
    <button
      ref={btnRef}
      className={className}
      style={{
        ...style,
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={disabled ? undefined : onClick}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: 0,
            height: 0,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            transform: 'translate(-50%, -50%)',
            animation: 'ripple-expand 0.6s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      ))}
      {children}
    </button>
  );
}

export default function DateCountdownPanel({ onClose }: DateCountdownPanelProps) {
  const { settings, updateSettings } = useClock();
  const { language } = settings;
  const panelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDate, setEditDate] = useState('');
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);

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
  const getDaysRemaining = (dateStr: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleAddTarget = () => {
    const newId = Date.now().toString();
    const newTargets = [...settings.dateCountdownTargets, { id: newId, label: '', date: '' }];
    updateSettings({ dateCountdownTargets: newTargets });
    setEditingId(newId);
    setEditLabel('');
    setEditDate('');
  };

  const handleUpdateTarget = (id: string, label: string, date: string) => {
    const newTargets = settings.dateCountdownTargets.map(t =>
      t.id === id ? { ...t, label, date } : t
    );
    updateSettings({ dateCountdownTargets: newTargets });
  };

  const handleDeleteTarget = (id: string) => {
    const newTargets = settings.dateCountdownTargets.filter(t => t.id !== id);
    updateSettings({ dateCountdownTargets: newTargets });
  };

  const startEditing = (id: string, label: string, date: string) => {
    // Trigger click feedback animation
    setClickedItemId(id);
    setTimeout(() => setClickedItemId(null), 300);
    setEditingId(id);
    setEditLabel(label);
    setEditDate(date);
  };

  const saveEditing = () => {
    if (editingId) {
      handleUpdateTarget(editingId, editLabel, editDate);
      setEditingId(null);
    }
  };

  const cancelEditing = () => {
    // If the item was newly added and has no data, remove it
    if (editingId) {
      const target = settings.dateCountdownTargets.find(t => t.id === editingId);
      if (target && !target.label && !target.date) {
        handleDeleteTarget(editingId);
      }
    }
    setEditingId(null);
  };

  const lang = settings.language;

  return (
    <>
      {/* Ripple keyframe */}
      <style>{`
        @keyframes ripple-expand {
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
        @keyframes item-click-flash {
          0% { background: rgba(59,130,246,0.15); }
          100% { background: transparent; }
        }
      `}</style>
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
          className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
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
            className="flex items-center justify-between px-6 py-4 sticky top-0"
            style={{
              borderBottom: `1px solid ${styles.panel.borderBottom}`,
              background: styles.panel.background,
            }}
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} style={{ color: '#60a5fa' }} />
              <h2 className="text-base font-medium" style={{ color: styles.panel.textColor }}>
                {lang === 'zh' ? '日期纪念日' : 'Date Anniversary'}
              </h2>
            </div>
            <RippleButton
              onClick={handleClose}
              className="p-1.5 rounded-lg"
              style={{
                color: styles.panel.labelColor,
                background: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
              }}
            >
              <X size={18} />
            </RippleButton>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: styles.panel.labelColor }}>
                {lang === 'zh' ? '启用日期纪念日' : 'Enable Date Anniversary'}
              </span>
              <RippleButton
                onClick={() => updateSettings({ showDateCountdown: !settings.showDateCountdown })}
                className="relative w-12 h-6 rounded-full"
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
              </RippleButton>
            </div>

            {/* Carousel interval slider — only shown when multiple targets exist */}
            {settings.dateCountdownTargets.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: styles.panel.labelColor }}>
                    {lang === 'zh' ? '切换间隔' : 'Switch Interval'}
                  </span>
                  <span
                    className="text-sm font-mono font-medium"
                    style={{ color: styles.panel.textColor }}
                  >
                    {settings.dateCountdownInterval ?? 5}s
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={30}
                  step={1}
                  value={settings.dateCountdownInterval ?? 5}
                  onChange={e =>
                    updateSettings({ dateCountdownInterval: Number(e.target.value) })
                  }
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    accentColor: '#3b82f6',
                    background: `linear-gradient(to right, #3b82f6 ${
                      (((settings.dateCountdownInterval ?? 5) - 3) / (30 - 3)) * 100
                    }%, ${
                      isLightBackground ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'
                    } ${
                      (((settings.dateCountdownInterval ?? 5) - 3) / (30 - 3)) * 100
                    }%)`,
                  }}
                />
                <div className="flex justify-between text-xs" style={{ color: styles.panel.labelColor, opacity: 0.6 }}>
                  <span>3s</span>
                  <span>30s</span>
                </div>
                <div className="text-xs mt-1" style={{ color: styles.panel.labelColor, opacity: 0.5 }}>
                  {language === 'en' ? '(Refresh required to apply)' : '(需要刷新才能应用)'}
                </div>
              </div>
            )}

            {/* Targets list */}
            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {settings.dateCountdownTargets.map((target) => (
                <div
                  key={target.id}
                  className="rounded-lg p-3 space-y-2"
                  style={{
                    background: clickedItemId === target.id
                      ? 'rgba(59,130,246,0.12)'
                      : isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${editingId === target.id ? 'rgba(59,130,246,0.4)' : styles.panel.inputBorder}`,
                    transition: 'background 0.3s ease, border-color 0.2s ease',
                  }}
                >
                  {editingId === target.id ? (
                    <>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        className="w-full rounded px-2 py-1.5 text-xs outline-none transition-colors"
                        style={{
                          background: styles.panel.inputBg,
                          border: `1px solid ${styles.panel.inputBorder}`,
                          color: styles.panel.textColor,
                        }}
                        placeholder={lang === 'zh' ? '标签（如：生日、节假日）' : 'Label (e.g. Birthday)'}
                        autoFocus
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        className="w-full rounded px-2 py-1.5 text-xs outline-none transition-colors"
                        style={{
                          background: styles.panel.inputBg,
                          border: `1px solid ${styles.panel.inputBorder}`,
                          color: styles.panel.textColor,
                          colorScheme: isLightBackground ? 'light' : 'dark',
                        }}
                      />
                      <div className="flex gap-2">
                        <RippleButton
                          onClick={saveEditing}
                          className="flex-1 rounded px-2 py-1.5 text-xs font-medium flex items-center justify-center gap-1"
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                          }}
                        >
                          <Check size={12} />
                          {lang === 'zh' ? '保存' : 'Save'}
                        </RippleButton>
                        <RippleButton
                          onClick={cancelEditing}
                          className="flex-1 rounded px-2 py-1.5 text-xs font-medium flex items-center justify-center gap-1"
                          style={{
                            background: isLightBackground ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                            color: styles.panel.textColor,
                          }}
                        >
                          <X size={12} />
                          {lang === 'zh' ? '取消' : 'Cancel'}
                        </RippleButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div
                          className="flex-1 cursor-pointer rounded px-1 py-0.5 -mx-1 transition-all active:scale-[0.98]"
                          style={{
                            userSelect: 'none',
                          }}
                          onClick={() => startEditing(target.id, target.label, target.date)}
                        >
                          <div className="text-sm font-medium" style={{ color: styles.panel.textColor }}>
                            {target.label || (lang === 'zh' ? '未命名' : 'Untitled')}
                          </div>
                          <div className="text-xs" style={{ color: styles.panel.labelColor }}>
                            {target.date || (lang === 'zh' ? '点击编辑' : 'Click to edit')}
                          </div>
                        </div>
                        <RippleButton
                          onClick={() => handleDeleteTarget(target.id)}
                          className="p-1.5 rounded ml-2"
                          style={{
                            color: '#f87171',
                            background: isLightBackground ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.08)',
                          }}
                        >
                          <Trash2 size={14} />
                        </RippleButton>
                      </div>
                      {target.date && getDaysRemaining(target.date) !== null && (
                        <div
                          className="rounded px-2 py-1.5 text-center"
                          style={{
                            background: getDaysRemaining(target.date)! >= 0
                              ? 'rgba(59,130,246,0.1)'
                              : 'rgba(239,68,68,0.1)',
                          }}
                        >
                          <div className="text-sm font-mono font-bold"
                            style={{ color: getDaysRemaining(target.date)! >= 0 ? '#60a5fa' : '#f87171' }}>
                            {Math.abs(getDaysRemaining(target.date)!)}
                          </div>
                          <div className="text-xs" style={{ color: styles.panel.labelColor }}>
                            {getDaysRemaining(target.date)! >= 0
                              ? (lang === 'zh' ? '天' : 'days')
                              : (lang === 'zh' ? '天前' : 'days ago')
                            }
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add button */}
            <RippleButton
              onClick={handleAddTarget}
              className="w-full rounded-lg px-4 py-2.5 font-medium flex items-center justify-center gap-2"
              style={{
                background: '#3b82f6',
                color: 'white',
              }}
            >
              <Plus size={16} />
              {lang === 'zh' ? '添加目标' : 'Add Target'}
            </RippleButton>
          </div>
        </div>
      </div>
    </>
  );
}
