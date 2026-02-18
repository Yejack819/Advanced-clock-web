/**
 * ControlBar - 底部控制面板
 * 
 * 设计哲学：暗黑机械美学
 * - 毛玻璃效果背景
 * - 全屏模式下隐藏
 * - 包含：字号调节、字体选择、颜色选择、隐藏秒、显示日期、全屏、校准、高度、间距
 * - 默认展开，可折叠
 * - 按钮点击动画反馈
 */
import React, { useState } from 'react';
import { useClock, FONT_OPTIONS } from '@/contexts/ClockContext';
import {
  Maximize,
  Minimize,
  Type,
  Palette,
  Eye,
  EyeOff,
  Calendar,
  ChevronUp,
  ChevronDown,
  Crosshair,
  Clock,
  ArrowUpDown,
  Maximize2,
} from 'lucide-react';

export default function ControlBar() {
  const { settings, updateSettings, isFullscreen, toggleFullscreen, setShowCalibration, showCalibration } = useClock();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="control-bar fixed bottom-0 left-0 right-0 z-50">
      {/* Toggle button - always visible */}
      <div className="flex justify-center relative z-10">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-5 py-1.5 rounded-t-lg transition-all duration-200 hover:bg-white/10 active:scale-95"
          style={{
            background: 'rgba(18, 18, 18, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderBottom: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '12px',
          }}
        >
          {expanded ? (
            <>
              <ChevronDown size={14} />
              <span>收起</span>
            </>
          ) : (
            <>
              <ChevronUp size={14} />
              <span>设置</span>
            </>
          )}
        </button>
      </div>

      {/* Panel content */}
      <div
        className="transition-all duration-400 overflow-hidden"
        style={{
          maxHeight: expanded ? '600px' : '0px',
          background: 'rgba(14, 14, 14, 0.95)',
          backdropFilter: 'blur(30px)',
          borderTop: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="px-4 pt-5 pb-8 md:px-8 md:pt-6 md:pb-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">

            {/* Font Size */}
            <ControlGroup icon={<Type size={14} />} label="数字大小">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="10"
                  value={settings.fontSize}
                  onChange={e => updateSettings({ fontSize: Number(e.target.value) })}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    accentColor: '#3b82f6',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                />
                <span className="text-xs text-white/40 w-14 text-right font-mono tabular-nums">
                  {settings.fontSize}px
                </span>
              </div>
            </ControlGroup>

            {/* Line Height (整体高度) */}
            <ControlGroup icon={<ArrowUpDown size={14} />} label="整体高度">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={settings.lineHeight}
                  onChange={e => updateSettings({ lineHeight: Number(e.target.value) })}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    accentColor: '#3b82f6',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                />
                <span className="text-xs text-white/40 w-14 text-right font-mono tabular-nums">
                  {settings.lineHeight}%
                </span>
              </div>
            </ControlGroup>

            {/* Letter Spacing (数字间距) */}
            <ControlGroup icon={<Maximize2 size={14} />} label="数字间距">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="-20"
                  max="50"
                  step="1"
                  value={settings.letterSpacing}
                  onChange={e => updateSettings({ letterSpacing: Number(e.target.value) })}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    accentColor: '#3b82f6',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                />
                <span className="text-xs text-white/40 w-14 text-right font-mono tabular-nums">
                  {settings.letterSpacing}px
                </span>
              </div>
            </ControlGroup>

            {/* Font Family */}
            <ControlGroup icon={<Clock size={14} />} label="字体">
              <select
                value={settings.fontFamily}
                onChange={e => updateSettings({ fontFamily: e.target.value })}
                className="w-full bg-white/5 border border-white/8 rounded-md px-3 py-2 text-sm text-white/70 outline-none focus:border-blue-500/40 transition-colors appearance-none active:scale-95"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value} style={{ background: '#141414', color: '#ccc' }}>
                    {f.label}
                  </option>
                ))}
              </select>
            </ControlGroup>

            {/* Font Color */}
            <ControlGroup icon={<Palette size={14} />} label="字体颜色">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={settings.fontColor}
                    onChange={e => updateSettings({ fontColor: e.target.value })}
                    className="w-8 h-8 rounded-md border border-white/10 cursor-pointer bg-transparent p-0"
                  />
                </div>
                <input
                  type="text"
                  value={settings.fontColor}
                  onChange={e => updateSettings({ fontColor: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/8 rounded-md px-3 py-1.5 text-sm text-white/60 font-mono outline-none focus:border-blue-500/40 transition-colors"
                />
              </div>
            </ControlGroup>

            {/* Background Color */}
            <ControlGroup icon={<Palette size={14} />} label="背景颜色">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={settings.bgColor}
                    onChange={e => updateSettings({ bgColor: e.target.value })}
                    className="w-8 h-8 rounded-md border border-white/10 cursor-pointer bg-transparent p-0"
                  />
                </div>
                <input
                  type="text"
                  value={settings.bgColor}
                  onChange={e => updateSettings({ bgColor: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/8 rounded-md px-3 py-1.5 text-sm text-white/60 font-mono outline-none focus:border-blue-500/40 transition-colors"
                />
              </div>
            </ControlGroup>

            {/* Toggle Options */}
            <ControlGroup icon={<Eye size={14} />} label="显示选项">
              <div className="flex flex-col gap-3">
                <ToggleOption
                  icon={settings.hideSeconds ? <EyeOff size={13} /> : <Eye size={13} />}
                  label="隐藏秒"
                  checked={settings.hideSeconds}
                  onChange={v => updateSettings({ hideSeconds: v })}
                />
                <ToggleOption
                  icon={<Calendar size={13} />}
                  label="显示日期"
                  checked={settings.showDate}
                  onChange={v => updateSettings({ showDate: v })}
                />
              </div>
            </ControlGroup>

            {/* Actions */}
            <ControlGroup icon={<Maximize size={14} />} label="操作">
              <div className="flex flex-col gap-2">
                <ActionButton
                  icon={isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                  label={isFullscreen ? '退出全屏' : '全屏显示'}
                  onClick={toggleFullscreen}
                />
                <ActionButton
                  icon={<Crosshair size={14} />}
                  label="时间校准"
                  onClick={() => setShowCalibration(!showCalibration)}
                  active={showCalibration}
                />
              </div>
            </ControlGroup>

          </div>
        </div>
      </div>
    </div>
  );
}

function ControlGroup({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-white/30 uppercase tracking-widest font-medium">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function ToggleOption({ icon, label, checked, onChange }: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      className="flex items-center gap-2.5 group transition-transform duration-150 active:scale-95"
      onClick={() => onChange(!checked)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <div
        className="relative w-9 h-[20px] rounded-full transition-all duration-200 shrink-0"
        style={{
          background: isPressed
            ? (checked ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.12)')
            : (checked ? '#3b82f6' : 'rgba(255,255,255,0.08)'),
          boxShadow: isPressed ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <div
          className="absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{
            transform: checked ? 'translateX(18px)' : 'translateX(2px)',
          }}
        />
      </div>
      <span className="flex items-center gap-1.5 text-sm text-white/50 group-hover:text-white/70 transition-colors">
        {icon}
        {label}
      </span>
    </button>
  );
}

function ActionButton({ icon, label, onClick, active }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 active:scale-95"
      style={{
        background: isPressed
          ? (active ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)')
          : (active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)'),
        border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
        color: active ? 'rgba(59,130,246,0.9)' : 'rgba(255,255,255,0.5)',
        boxShadow: isPressed
          ? (active ? 'inset 0 2px 4px rgba(59,130,246,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.3)')
          : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
