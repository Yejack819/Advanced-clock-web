/**
 * CalibrationPanel - 时间校准控制面板
 * 
 * 设计哲学：暗黑机械美学
 * - 选择变快或变慢
 * - 精度 0.1s - 60s
 * - 显示校准前标准时间和校准后时间
 * - 校准值保存至本地
 * - 点击面板外部或关闭按钮关闭
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
            className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/70 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Direction */}
          <div>
            <label className="text-[11px] text-white/35 uppercase tracking-wider mb-2.5 block font-medium">校准方向</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('fast')}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: direction === 'fast' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                  color: direction === 'fast' ? '#60a5fa' : 'rgba(255,255,255,0.4)',
                  border: direction === 'fast' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Plus size={13} className="inline mr-1" style={{ verticalAlign: '-1.5px' }} />
                调快（超前）
              </button>
              <button
                onClick={() => setDirection('slow')}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: direction === 'slow' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                  color: direction === 'slow' ? '#f87171' : 'rgba(255,255,255,0.4)',
                  border: direction === 'slow' ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Minus size={13} className="inline mr-1" style={{ verticalAlign: '-1.5px' }} />
                调慢（滞后）
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[11px] text-white/35 uppercase tracking-wider mb-2.5 block font-medium">校准量（秒）</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustAmount(-1)}
                className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Minus size={15} />
              </button>
              <button
                onClick={() => adjustAmount(-0.1)}
                className="px-2.5 py-2 rounded-lg text-xs text-white/40 hover:text-white/80 hover:bg-white/8 transition-all font-mono"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                -0.1
              </button>
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
              <button
                onClick={() => adjustAmount(0.1)}
                className="px-2.5 py-2 rounded-lg text-xs text-white/40 hover:text-white/80 hover:bg-white/8 transition-all font-mono"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                +0.1
              </button>
              <button
                onClick={() => adjustAmount(1)}
                className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Plus size={15} />
              </button>
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
            <button
              onClick={resetCalibration}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/8 transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <RotateCcw size={14} />
              重置
            </button>
            <button
              onClick={applyCalibration}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: hasChanges
                  ? (direction === 'fast' ? 'rgba(59,130,246,0.9)' : 'rgba(239,68,68,0.85)')
                  : 'rgba(59,130,246,0.9)',
                color: '#fff',
              }}
            >
              <Check size={15} />
              应用校准
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
