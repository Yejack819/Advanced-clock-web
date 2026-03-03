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
  Globe,
} from 'lucide-react';

export default function ControlBar() {
  const { settings, updateSettings, isFullscreen, toggleFullscreen, setShowCalibration, showCalibration, setShowAlarmCountdown, showAlarmCountdown, exportConfig, importConfig, applyTheme } = useClock();
  const [expanded, setExpanded] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // 检测背景颜色亮度
  const isLightBackground = React.useMemo(() => {
    const bgColor = settings.bgColor;
    // 将十六进制颜色转换为RGB
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    // 计算亮度（使用标准公式）
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128; // 亮度大于128认为是浅色背景
  }, [settings.bgColor]);
  
  // 根据背景亮度动态生成样式
  const getControlBarStyle = () => {
    if (isLightBackground) {
      // 浅色背景：使用深色半透明
      return {
        toggleButton: {
          background: 'rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(0,0,0,0.15)',
          borderBottom: 'none',
          color: 'rgba(0,0,0,0.6)',
        },
        panel: {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          borderTop: 'rgba(0,0,0,0.2)',
          textColor: 'rgba(0,0,0,0.7)',
          labelColor: 'rgba(0,0,0,0.6)',
          iconColor: 'rgba(0,0,0,0.4)',
        },
      };
    } else {
      // 深色背景：使用浅色半透明
      return {
        toggleButton: {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderBottom: 'none',
          color: 'rgba(255,255,255,0.6)',
        },
        panel: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          borderTop: 'rgba(255,255,255,0.2)',
          textColor: 'rgba(255,255,255,0.7)',
          labelColor: 'rgba(255,255,255,0.6)',
          iconColor: 'rgba(255,255,255,0.4)',
        },
      };
    }
  };
  
  const styles = getControlBarStyle();
  const buttonStyle = styles.toggleButton;
  const panelStyle = styles.panel;

  return (
    <div className="control-bar fixed bottom-0 left-0 right-0 z-50">
      {/* Toggle button - always visible */}
      <div className="flex justify-center relative z-10">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-5 py-1.5 rounded-t-lg transition-all duration-200 hover:bg-white/10 active:scale-95"
          style={{
            background: buttonStyle.background,
            backdropFilter: buttonStyle.backdropFilter,
            WebkitBackdropFilter: buttonStyle.WebkitBackdropFilter,
            border: buttonStyle.border,
            borderBottom: 'none',
            color: buttonStyle.color,
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
          background: panelStyle.background,
          backdropFilter: panelStyle.backdropFilter,
          WebkitBackdropFilter: panelStyle.WebkitBackdropFilter,
          borderTop: expanded ? `1px solid ${panelStyle.borderTop}` : 'none',
        }}
      >
        <div className="px-3 pt-3 pb-4 md:px-5 md:pt-3 md:pb-5 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">

            {/* Font Size */}
            <ControlGroup icon={<Type size={14} />} label="数字大小" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
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
                <span className="text-xs w-14 text-right font-mono tabular-nums" style={{ color: panelStyle.textColor }}>
                  {settings.fontSize}px
                </span>
              </div>
            </ControlGroup>

            {/* Animation Speed (动画速度) */}
            <ControlGroup icon={<Clock size={14} />} label="动画速度" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
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
                    background: isLightBackground ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)',
                  }}
                />
                <span className="text-xs w-14 text-right font-mono tabular-nums" style={{ color: panelStyle.textColor }}>
                  {settings.animationSpeed.toFixed(1)}s
                </span>
              </div>
            </ControlGroup>

            {/* Letter Spacing (数字间距) */}
            <ControlGroup icon={<Maximize2 size={14} />} label="数字间距" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
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
                    background: isLightBackground ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)',
                  }}
                />
                <span className="text-xs w-14 text-right font-mono tabular-nums" style={{ color: panelStyle.textColor }}>
                  {settings.letterSpacing}px
                </span>
              </div>
            </ControlGroup>

            {/* Timezone */}
            <ControlGroup icon={<Clock size={14} />} label="时区" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <select
                value={settings.timezone}
                onChange={e => updateSettings({ timezone: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500/40 transition-colors appearance-none active:scale-95"
                style={{
                  background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                  border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                  color: panelStyle.textColor,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${isLightBackground ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
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
            <ControlGroup icon={<Type size={14} />} label="字体" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <select
                value={settings.fontFamily}
                onChange={e => updateSettings({ fontFamily: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500/40 transition-colors appearance-none active:scale-95"
                style={{
                  background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                  border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                  color: panelStyle.textColor,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${isLightBackground ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value} style={{ background: '#141414', color: '#ccc' }}>
                    {f.label}
                  </option>
                ))}
              </select>
            </ControlGroup>

            {/* Font Color */}
            <ControlGroup icon={<Palette size={14} />} label="字体颜色" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
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
                  className="flex-1 border rounded-md px-3 py-1.5 text-sm font-mono outline-none focus:border-blue-500/40 transition-colors"
                  style={{
                    background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                    border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                    color: panelStyle.textColor,
                  }}
                />
              </div>
            </ControlGroup>

            {/* Background Color */}
            <ControlGroup icon={<Palette size={14} />} label="背景颜色" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
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
                  className="flex-1 border rounded-md px-3 py-1.5 text-sm font-mono outline-none focus:border-blue-500/40 transition-colors"
                  style={{
                    background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                    border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                    color: panelStyle.textColor,
                  }}
                />
              </div>
            </ControlGroup>

            {/* Toggle Options */}
            <ControlGroup icon={<Eye size={14} />} label="显示选项" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex flex-col gap-3">
                <ToggleOption
                  icon={settings.hideSeconds ? <EyeOff size={13} /> : <Eye size={13} />}
                  label="隐藏秒"
                  checked={settings.hideSeconds}
                  onChange={v => updateSettings({ hideSeconds: v })}
                  isLightBackground={isLightBackground}
                />
                <ToggleOption
                  icon={<Calendar size={13} />}
                  label="显示日期"
                  checked={settings.showDate}
                  onChange={v => updateSettings({ showDate: v })}
                  isLightBackground={isLightBackground}
                />
                <ToggleOption
                  icon={<Calendar size={13} />}
                  label="显示日期倒计时"
                  checked={settings.showDateCountdown}
                  onChange={v => updateSettings({ showDateCountdown: v })}
                  isLightBackground={isLightBackground}
                />
              </div>
            </ControlGroup>

            {/* Date Countdown Settings */}
            {settings.showDateCountdown && (
              <ControlGroup icon={<Calendar size={14} />} label="日期倒计时" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs block mb-1" style={{ color: panelStyle.labelColor }}>标签（最多4个汉字）</label>
                    <input
                      type="text"
                      value={settings.dateCountdownLabel}
                      onChange={e => updateSettings({ dateCountdownLabel: e.target.value.slice(0, 4) })}
                      maxLength={4}
                      className="w-full border rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500/40 transition-colors"
                      style={{
                        background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                        border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                        color: panelStyle.textColor,
                      }}
                      placeholder="例：新年"
                    />
                  </div>
                  <div>
                    <label className="text-xs block mb-1" style={{ color: panelStyle.labelColor }}>目标日期</label>
                    <input
                      type="date"
                      value={settings.dateCountdownTarget}
                      onChange={e => updateSettings({ dateCountdownTarget: e.target.value })}
                      className="w-full border rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500/40 transition-colors"
                      style={{
                        background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                        border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                        color: panelStyle.textColor,
                      }}
                    />
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Actions */}
            <ControlGroup icon={<Maximize size={14} />} label="操作" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex flex-col gap-2">
                <ActionButton
                  icon={isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                  label={isFullscreen ? '退出全屏' : '全屏显示'}
                  onClick={toggleFullscreen}
                  isLightBackground={isLightBackground}
                />
                <ActionButton
                  icon={<Crosshair size={14} />}
                  label="时间校准"
                  onClick={() => setShowCalibration(!showCalibration)}
                  active={showCalibration}
                  isLightBackground={isLightBackground}
                />
                <ActionButton
                  icon={<Bell size={14} />}
                  label="闹钟/倒计时"
                  onClick={() => setShowAlarmCountdown(!showAlarmCountdown)}
                  active={showAlarmCountdown}
                  isLightBackground={isLightBackground}
                />
              </div>
            </ControlGroup>

            {/* Themes */}
            <ControlGroup icon={<PaletteIcon size={14} />} label="主题预设" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex flex-col gap-2">
                <ActionButton
                  icon={<span>🤖</span>}
                  label="赛博朋克"
                  onClick={() => applyTheme('cyberpunk')}
                  isLightBackground={isLightBackground}
                />
                <ActionButton
                  icon={<span>⚪</span>}
                  label="极简白"
                  onClick={() => applyTheme('minimal')}
                  isLightBackground={isLightBackground}
                />
                <ActionButton
                  icon={<span>💚</span>}
                  label="复古绿屏"
                  onClick={() => applyTheme('retro')}
                  isLightBackground={isLightBackground}
                />
              </div>
            </ControlGroup>

            {/* Language */}
            <ControlGroup icon={<Globe size={14} />} label="语言" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings({ language: 'zh' })}
                  className="flex-1 px-3 py-1.5 rounded-md text-sm transition-all duration-200 active:scale-95"
                  style={{
                    background: settings.language === 'zh' ? 'rgba(59, 130, 246, 0.15)' : (isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'),
                    border: settings.language === 'zh' ? '1px solid rgba(59, 130, 246, 0.3)' : (isLightBackground ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)'),
                    color: settings.language === 'zh' ? 'rgba(59, 130, 246, 0.8)' : (isLightBackground ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)'),
                  }}
                >
                  中文
                </button>
                <button
                  onClick={() => updateSettings({ language: 'en' })}
                  className="flex-1 px-3 py-1.5 rounded-md text-sm transition-all duration-200 active:scale-95"
                  style={{
                    background: settings.language === 'en' ? 'rgba(59, 130, 246, 0.15)' : (isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'),
                    border: settings.language === 'en' ? '1px solid rgba(59, 130, 246, 0.3)' : (isLightBackground ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)'),
                    color: settings.language === 'en' ? 'rgba(59, 130, 246, 0.8)' : (isLightBackground ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)'),
                  }}
                >
                  English
                </button>
              </div>
            </ControlGroup>

            {/* Config Management */}
            <ControlGroup icon={<Download size={14} />} label="配置" textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex flex-col gap-2">
                <ActionButton
                  icon={<Download size={14} />}
                  label="导出配置"
                  onClick={exportConfig}
                  isLightBackground={isLightBackground}
                />
                <ActionButton
                  icon={<Upload size={14} />}
                  label="导入配置"
                  onClick={() => fileInputRef.current?.click()}
                  isLightBackground={isLightBackground}
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
function ControlGroup({ icon, label, children, textColor, labelColor, iconColor }: { icon: React.ReactNode; label: string; children: React.ReactNode; textColor?: string; labelColor?: string; iconColor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="flex-shrink-0" style={{ color: iconColor }}>{icon}</span>
        <label className="text-xs font-medium uppercase tracking-wider leading-tight" style={{ color: labelColor }}>{label}</label>
      </div>
      <div className="pl-5" style={{ color: textColor }}>{children}</div>
    </div>
  );
}

function ToggleOption({ icon, label, checked, onChange, isLightBackground }: { icon: React.ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void; isLightBackground?: boolean }) {
  
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-all duration-200 active:scale-95"
      style={{
        background: checked ? 'rgba(59, 130, 246, 0.15)' : (isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'),
        border: checked ? '1px solid rgba(59, 130, 246, 0.3)' : (isLightBackground ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)'),
        color: checked ? 'rgba(59, 130, 246, 0.8)' : (isLightBackground ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)'),
      }}
    >
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function ActionButton({ icon, label, onClick, active, isLightBackground }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; isLightBackground?: boolean }) {
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-all duration-200 active:scale-95"
      style={{
        background: active ? 'rgba(59, 130, 246, 0.15)' : (isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'),
        border: active ? '1px solid rgba(59, 130, 246, 0.3)' : (isLightBackground ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)'),
        color: active ? 'rgba(59, 130, 246, 0.8)' : (isLightBackground ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)'),
      }}
    >
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
