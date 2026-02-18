/**
 * CalibrationPanel - 时间校准控制面板
 * 
 * 设计哲学：暗黑机械美学
 * - 选择变快或变慢
 * - 精度 0.1s - 60s
 * - 显示校准前标准时间和校准后时间
 * - 校准值保存至本地
 * - 点击面板外部或关闭按钮关闭
 * - 所有按钮都有点击动画反馈
 */
import { useState, useEffect, useRef } from 'react';
import { useClock } from '@/contexts/ClockContext';
import { X, Plus, Minus, RotateCcw, Check } from 'lucide-react';

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

export default function CalibrationPanel() {
  const { settings, updateSettings, setShowCalibration } = useClock();
  const [standardTime, setStandardTime] = useState('');
  const [calibratedTime, setCalibratedTime] = useState('');
  const [direction, setDirection] = useState<'fast' | 'slow'>(
    settings.calibrationOffset >= 0 ? 'fast' : 'slow'
  );
  const [amount, setAmount] = useState(() => Math.abs(settings.calibrationOffset) / 1000);
  const rafRef = useRef<number>(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Update displayed times
  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      const now = new Date();
      const offset = direction === 'fast' ? amount * 1000 : -amount * 1000;
      const calibrated = new Date(now.getTime() + offset);
      setStandardTime(formatTime(now));
      setCalibratedTime(formatTime(calibrated));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [direction, amount]);

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setShowCalibration(false);
    }
  };

  const applyCalibration = () => {
    const offset = direction === 'fast' ? amount * 1000 : -amount * 1000;
    updateSettings({ calibrationOffset: offset });
    setShowCalibration(false);
  };

  const resetCalibration = () => {
    setAmount(0);
    setDirection('fast');
    updateSettings({ calibrationOffset: 0 });
  };

  const adjustAmount = (delta: number) => {
    setAmount(prev => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.max(0, Math.min(60, next));
    });
  };

  const offsetMs = direction === 'fast' ? amount * 1000 : -amount * 1000;
  const hasChanges = offsetMs !== settings.calibrationOffset;

  return (
    <div
      className="settings-panel fixed inset-0 z-[60] flex items-center justify-center animate-in fade-in duration-200"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        style={{
          background: 'rgba(18, 18, 18, 0.98)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-white/90 text-base font-medium tracking-wide">时间校准</h3>
          <button
            onClick={() => setShowCalibration(false)}
            className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/70 transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Direction */}
          <div>
            <label className="text-[11px] text-white/35 uppercase tracking-wider mb-2.5 block font-medium">校准方向</label>
            <div className="flex gap-2">
              <DirectionButton
                isSelected={direction === 'fast'}
                onClick={() => setDirection('fast')}
                icon={<Plus size={13} />}
                label="调快（超前）"
                color="blue"
              />
              <DirectionButton
                isSelected={direction === 'slow'}
                onClick={() => setDirection('slow')}
                icon={<Minus size={13} />}
                label="调慢（滞后）"
                color="red"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[11px] text-white/35 uppercase tracking-wider mb-2.5 block font-medium">校准量（秒）</label>
            <div className="flex items-center gap-2">
              <AdjustButton
                onClick={() => adjustAmount(-1)}
                icon={<Minus size={15} />}
              />
              <AdjustButton
                onClick={() => adjustAmount(-0.1)}
                label="-0.1"
              />
              <div className="flex-1">
                <input
                  type="number"
                  value={amount}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0 && v <= 60) {
                      setAmount(Math.round(v * 10) / 10);
                    }
                  }}
                  step="0.1"
                  min="0"
                  max="60"
                  className="w-full text-center text-xl font-mono py-2.5 rounded-lg text-white/90 outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
              </div>
              <AdjustButton
                onClick={() => adjustAmount(0.1)}
                label="+0.1"
              />
              <AdjustButton
                onClick={() => adjustAmount(1)}
                icon={<Plus size={15} />}
              />
            </div>
            {/* Slider */}
            <input
              type="range"
              min="0"
              max="60"
              step="0.1"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value))}
              className="w-full mt-3 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                accentColor: direction === 'fast' ? '#3b82f6' : '#ef4444',
                background: 'rgba(255,255,255,0.06)',
              }}
            />
            <div className="flex justify-between text-[10px] text-white/20 mt-1 px-0.5">
              <span>0s</span>
              <span>15s</span>
              <span>30s</span>
              <span>45s</span>
              <span>60s</span>
            </div>
          </div>

          {/* Time comparison */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="grid grid-cols-2">
              <div className="p-4" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">标准时间（系统）</div>
                <div className="font-mono text-base text-white/60 tabular-nums">{standardTime}</div>
              </div>
              <div className="p-4">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">校准后时间</div>
                <div className="font-mono text-base text-white/90 tabular-nums">{calibratedTime}</div>
              </div>
            </div>
            <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)' }}>
              <div className="text-[11px] text-white/25 font-mono tabular-nums">
                偏移量: {direction === 'fast' ? '+' : '-'}{amount.toFixed(1)}s ({direction === 'fast' ? '+' : '-'}{(amount * 1000).toFixed(0)}ms)
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <ActionButton
              onClick={resetCalibration}
              icon={<RotateCcw size={14} />}
              label="重置"
              variant="secondary"
            />
            <ActionButton
              onClick={applyCalibration}
              icon={<Check size={15} />}
              label="应用校准"
              variant="primary"
              color={direction === 'fast' ? 'blue' : 'red'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectionButton({ isSelected, onClick, icon, label, color }: {
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: 'blue' | 'red';
}) {
  const [isPressed, setIsPressed] = useState(false);

  const bgColor = color === 'blue'
    ? (isSelected ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)')
    : (isSelected ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)');

  const textColor = color === 'blue'
    ? (isSelected ? '#60a5fa' : 'rgba(255,255,255,0.4)')
    : (isSelected ? '#f87171' : 'rgba(255,255,255,0.4)');

  const borderColor = color === 'blue'
    ? (isSelected ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)')
    : (isSelected ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)');

  const pressedBgColor = color === 'blue'
    ? 'rgba(59,130,246,0.25)'
    : 'rgba(239,68,68,0.2)';

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95"
      style={{
        background: isPressed ? pressedBgColor : bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        boxShadow: isPressed ? `inset 0 2px 4px rgba(0,0,0,0.3)` : 'none',
      }}
    >
      {icon && <span className="inline mr-1" style={{ verticalAlign: '-1.5px' }}>{icon}</span>}
      {label}
    </button>
  );
}

function AdjustButton({ onClick, icon, label }: {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`rounded-lg transition-all duration-150 active:scale-95 ${label ? 'px-2.5 py-2 text-xs font-mono' : 'p-2'}`}
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        color: isPressed ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
        background: isPressed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        boxShadow: isPressed ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {icon || label}
    </button>
  );
}

function ActionButton({ onClick, icon, label, variant, color }: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: 'primary' | 'secondary';
  color?: 'blue' | 'red';
}) {
  const [isPressed, setIsPressed] = useState(false);

  const isPrimary = variant === 'primary';
  const isBlue = color === 'blue';

  let bgColor = 'rgba(255,255,255,0.04)';
  let textColor = 'rgba(255,255,255,0.4)';
  let borderColor = 'rgba(255,255,255,0.06)';
  let pressedBgColor = 'rgba(255,255,255,0.12)';

  if (isPrimary) {
    bgColor = isBlue ? 'rgba(59,130,246,0.9)' : 'rgba(239,68,68,0.85)';
    textColor = '#fff';
    borderColor = isBlue ? 'rgba(59,130,246,0.5)' : 'rgba(239,68,68,0.5)';
    pressedBgColor = isBlue ? 'rgba(59,130,246,0.7)' : 'rgba(239,68,68,0.7)';
  }

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 ${isPrimary ? 'flex-1' : ''}`}
      style={{
        background: isPressed ? pressedBgColor : bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        boxShadow: isPressed ? `inset 0 2px 4px rgba(0,0,0,0.3)` : 'none',
        padding: isPrimary ? '0.625rem 1rem' : '0.625rem 1rem',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
