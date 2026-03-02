/**
 * ControlBar - 底部控制面板
 * 
 * 设计哲学：暗黑机械美学
 * - 毛玻璃效果背景
 * - 全屏模式下隐藏
 * - 包含：字号调节、字体选择、颜色选择、隐藏秒、显示日期、全屏、校准、间距
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
  Maximize2,
  Download,
  Upload,
  Palette as PaletteIcon,
  Bell,
} from 'lucide-react';

export default function ControlBar() {
  const { settings, updateSettings, isFullscreen, toggleFullscreen, setShowCalibration, showCalibration, setShowAlarmCountdown, showAlarmCountdown, exportConfig, importConfig, applyTheme } = useClock();
  const [expanded, setExpanded] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
          maxHeight: expanded ? '700px' : '0px',
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

            {/* Animation Speed (动画速度) */}
            <ControlGroup icon={<Clock size={14} />} label="动画速度">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.1"
                  value={settings.animationSpeed}
                  onChange={e => updateSettings({ animationSpeed: Number(e.target.value) })}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    accentColor: '#3b82f6',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                />
                <span className="text-xs text-white/40 w-14 text-right font-mono tabular-nums">
                  {settings.animationSpeed.toFixed(1)}s
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

            {/* Timezone */}
            <ControlGroup icon={<Clock size={14} />} label="时区">
              <select
                value={settings.timezone}
                onChange={e => updateSettings({ timezone: e.target.value })}
                className="w-full bg-white/5 border border-white/8 rounded-md px-3 py-2 text-sm text-white/70 outline-none focus:border-blue-500/40 transition-colors appearance-none active:scale-95"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                <option value="Asia/Shanghai" style={{ background: '#141414', color: '#ccc' }}>上海 (UTC+8)</option>
                <option value="Asia/Tokyo" style={{ background: '#141414', color: '#ccc' }}>东京 (UTC+9)</option>
                <option value="America/New_York" style={{ background: '#141414', color: '#ccc' }}>纽约 (UTC-5)</option>
                <option value="America/Los_Angeles" style={{ background: '#141414', color: '#ccc' }}>洛杉矶 (UTC-8)</option>
                <option value="Europe/London" style={{ background: '#141414', color: '#ccc' }}>伦敦 (UTC+0)</option>
                <option value="Europe/Paris" style={{ background: '#141414', color: '#ccc' }}>巴黎 (UTC+1)</option>
                <option value="Australia/Sydney" style={{ background: '#141414', color: '#ccc' }}>悉尼 (UTC+11)</option>
              </select>
            </ControlGroup>

            {/* Font Family */}
            <ControlGroup icon={<Type size={14} />} label="字体">
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
                <ToggleOption
                  icon={<Calendar size={13} />}
                  label="显示日期倒计时"
                  checked={settings.showDateCountdown}
                  onChange={v => updateSettings({ showDateCountdown: v })}
                />
              </div>
            </ControlGroup>

            {/* Date Countdown Settings */}
            {settings.showDateCountdown && (
              <ControlGroup icon={<Calendar size={14} />} label="日期倒计时">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-white/50 block mb-1">标签（最多4个汉字）</label>
                    <input
                      type="text"
                      value={settings.dateCountdownLabel}
                      onChange={e => updateSettings({ dateCountdownLabel: e.target.value.slice(0, 4) })}
                      maxLength={4}
                      className="w-full bg-white/5 border border-white/8 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500/40 transition-colors"
                      placeholder="例：新年"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 block mb-1">目标日期</label>
                    <input
                      type="date"
                      value={settings.dateCountdownTarget}
                      onChange={e => updateSettings({ dateCountdownTarget: e.target.value })}
                      className="w-full bg-white/5 border border-white/8 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500/40 transition-colors"
                    />
                  </div>
                </div>
              </ControlGroup>
            )}

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
                <ActionButton
                  icon={<Bell size={14} />}
                  label="闹钟/倒计时"
                  onClick={() => setShowAlarmCountdown(!showAlarmCountdown)}
                  active={showAlarmCountdown}
                />
              </div>
            </ControlGroup>

            {/* Themes */}
            <ControlGroup icon={<PaletteIcon size={14} />} label="主题预设">
              <div className="flex flex-col gap-2">
                <ActionButton
                  icon={<span>🤖</span>}
                  label="赛博朋克"
                  onClick={() => applyTheme('cyberpunk')}
                />
                <ActionButton
                  icon={<span>⚪</span>}
                  label="极简白"
                  onClick={() => applyTheme('minimal')}
                />
                <ActionButton
                  icon={<span>💚</span>}
                  label="复古绿屏"
                  onClick={() => applyTheme('retro')}
                />
              </div>
            </ControlGroup>

            {/* Config Management */}
            <ControlGroup icon={<Download size={14} />} label="配置">
              <div className="flex flex-col gap-2">
                <ActionButton
                  icon={<Download size={14} />}
                  label="导出配置"
                  onClick={exportConfig}
                />
                <ActionButton
                  icon={<Upload size={14} />}
                  label="导入配置"
                  onClick={() => fileInputRef.current?.click()}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => { const file = e.currentTarget.files?.[0]; if (file) importConfig(file); }}
                  style={{ display: 'none' }}
                />
              </div>
            </ControlGroup>

          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ControlGroup({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-white/40">{icon}</span>
        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function ToggleOption({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:bg-white/5 active:scale-95"
      style={{
        background: checked ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
        border: checked ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.08)',
        color: checked ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255,255,255,0.5)',
      }}
    >
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function ActionButton({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:bg-white/5 active:scale-95"
      style={{
        background: active ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
        border: active ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.08)',
        color: active ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255,255,255,0.5)',
      }}
    >
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
