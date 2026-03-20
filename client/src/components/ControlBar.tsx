/**
 * ControlBar - 底部控制面板
 * 
 * 设计哲学：暗黑机械美学
 * - 毛玻璃效果背景
 * - 全屏模式下隐藏
 * - 包含：字号调节、字体选择、颜色选择、隐藏秒、显示日期、全屏、校准、间距
 * - 默认展开，可折叠
 * - 按钮点击动画反馈
 * - 完整的国际化支持
 */
import React, { useState, useRef } from 'react';
import { useClock, FONT_OPTIONS, ClockSettings } from '@/contexts/ClockContext';
import { t, getThemeName } from '@/lib/i18n';
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
  Palette as PaletteIcon,
  Bell,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';

export default function ControlBar() {
  const { settings, updateSettings, isFullscreen, toggleFullscreen, setShowCalibration, showCalibration, setShowAlarmCountdown, showAlarmCountdown, showDateCountdownPanel, setShowDateCountdownPanel, applyTheme } = useClock();
  const [expanded, setExpanded] = useState(false);
  
  // 退出全屏时自动收起
  React.useEffect(() => {
    if (!isFullscreen) {
      setExpanded(false);
    }
  }, [isFullscreen]);
  
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
              <span>{t(settings.language, 'collapse')}</span>
            </>
          ) : (
            <>
              <ChevronUp size={14} />
              <span>{t(settings.language, 'settings')}</span>
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
            <ControlGroup icon={<Type size={14} />} label={t(settings.language, 'fontSize')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
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
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="100"
                    max="500"
                    step="10"
                    value={settings.fontSize}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val >= 100 && val <= 500) {
                        updateSettings({ fontSize: val });
                      }
                    }}
                    onBlur={e => {
                      const val = Number(e.target.value);
                      if (val < 100) updateSettings({ fontSize: 100 });
                      if (val > 500) updateSettings({ fontSize: 500 });
                    }}
                    className="w-14 px-1.5 py-0.5 text-xs font-mono tabular-nums text-right rounded border outline-none focus:border-blue-500/40 transition-colors"
                    style={{
                      background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                      border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                      color: panelStyle.textColor,
                    }}
                  />
                  <span className="text-xs" style={{ color: panelStyle.textColor }}>px</span>
                </div>
              </div>
            </ControlGroup>

            {/* Animation Speed */}
            <ControlGroup icon={<Clock size={14} />} label={t(settings.language, 'animationSpeed')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
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
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0.3"
                    max="1.0"
                    step="0.1"
                    value={settings.animationSpeed.toFixed(1)}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val >= 0.3 && val <= 1.0) {
                        updateSettings({ animationSpeed: val });
                      }
                    }}
                    onBlur={e => {
                      const val = Number(e.target.value);
                      if (val < 0.3) updateSettings({ animationSpeed: 0.3 });
                      if (val > 1.0) updateSettings({ animationSpeed: 1.0 });
                    }}
                    className="w-14 px-1.5 py-0.5 text-xs font-mono tabular-nums text-right rounded border outline-none focus:border-blue-500/40 transition-colors"
                    style={{
                      background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                      border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                      color: panelStyle.textColor,
                    }}
                  />
                  <span className="text-xs" style={{ color: panelStyle.textColor }}>s</span>
                </div>
              </div>
            </ControlGroup>

            {/* Letter Spacing */}
            <ControlGroup icon={<Maximize2 size={14} />} label={t(settings.language, 'letterSpacing')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
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
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="-20"
                    max="50"
                    step="1"
                    value={settings.letterSpacing}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val >= -20 && val <= 50) {
                        updateSettings({ letterSpacing: val });
                      }
                    }}
                    onBlur={e => {
                      const val = Number(e.target.value);
                      if (val < -20) updateSettings({ letterSpacing: -20 });
                      if (val > 50) updateSettings({ letterSpacing: 50 });
                    }}
                    className="w-14 px-1.5 py-0.5 text-xs font-mono tabular-nums text-right rounded border outline-none focus:border-blue-500/40 transition-colors"
                    style={{
                      background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                      border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                      color: panelStyle.textColor,
                    }}
                  />
                  <span className="text-xs" style={{ color: panelStyle.textColor }}>px</span>
                </div>
              </div>
            </ControlGroup>

            {/* UTC Offset */}
            <ControlGroup icon={<Globe size={14} />} label={t(settings.language, 'timezone')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: panelStyle.textColor }}>UTC</span>
                <input
                  type="number"
                  min="-14"
                  max="14"
                  value={settings.utcOffset}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (val >= -14 && val <= 14) {
                      updateSettings({ utcOffset: val });
                    }
                  }}
                  onBlur={e => {
                    const val = Number(e.target.value);
                    if (val < -14) updateSettings({ utcOffset: -14 });
                    if (val > 14) updateSettings({ utcOffset: 14 });
                  }}
                  className="w-16 px-2 py-1.5 text-xs font-mono tabular-nums text-center rounded border outline-none focus:border-blue-500/40 transition-colors"
                  style={{
                    background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)',
                    border: isLightBackground ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.08)',
                    color: panelStyle.textColor,
                  }}
                />
              </div>
            </ControlGroup>

            {/* Font Settings (字体设置) - 合并字体和字体颜色 */}
            <ControlGroup icon={<Type size={14} />} label={settings.language === 'zh' ? '字体设置' : 'Font Settings'} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex flex-col gap-2">
                {/* Font Family Select */}
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
                      {settings.language === 'zh' ? f.labelZh : f.label}
                    </option>
                  ))}
                </select>
                {/* Font Color */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={settings.fontColor}
                      onChange={e => updateSettings({ fontColor: e.target.value })}
                      className="w-8 h-8 rounded-md border border-white/10 cursor-pointer bg-transparent p-0"
                      disabled={settings.autoColorMode}
                      style={{ opacity: settings.autoColorMode ? 0.5 : 1 }}
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
                      opacity: settings.autoColorMode ? 0.5 : 1,
                    }}
                    disabled={settings.autoColorMode}
                  />
                </div>
              </div>
            </ControlGroup>

            {/* Background Color */}
            <ControlGroup icon={<Palette size={14} />} label={t(settings.language, 'bgColor')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={settings.bgColor}
                      onChange={e => updateSettings({ bgColor: e.target.value })}
                      className="w-8 h-8 rounded-md border border-white/10 cursor-pointer bg-transparent p-0"
                      disabled={settings.autoColorMode}
                      style={{ opacity: settings.autoColorMode ? 0.5 : 1 }}
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
                      opacity: settings.autoColorMode ? 0.5 : 1,
                    }}
                    disabled={settings.autoColorMode}
                  />
                </div>
                <ToggleOption
                  icon={settings.autoColorMode ? (isLightBackground ? <Sun size={13} /> : <Moon size={13} />) : <Clock size={13} />}
                  label={settings.language === 'zh' ? '颜色自适应' : 'Auto Color'}
                  checked={settings.autoColorMode}
                  onChange={v => updateSettings({ autoColorMode: v })}
                  isLightBackground={isLightBackground}
                />
              </div>
            </ControlGroup>

            {/* Toggle Options */}
            <ControlGroup icon={<Eye size={14} />} label={t(settings.language, 'displayOptions')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex flex-col gap-3">
                <ToggleOption
                  icon={settings.hideSeconds ? <EyeOff size={13} /> : <Eye size={13} />}
                  label={t(settings.language, 'hideSeconds')}
                  checked={settings.hideSeconds}
                  onChange={v => updateSettings({ hideSeconds: v })}
                  isLightBackground={isLightBackground}
                />
                <ToggleOption
                  icon={<Calendar size={13} />}
                  label={t(settings.language, 'showDate')}
                  checked={settings.showDate}
                  onChange={v => updateSettings({ showDate: v })}
                  isLightBackground={isLightBackground}
                />
                <ActionButton
                  icon={<Calendar size={13} />}
                  label={t(settings.language, 'showDateCountdown')}
                  onClick={() => setShowDateCountdownPanel(!showDateCountdownPanel)}
                  active={showDateCountdownPanel || settings.showDateCountdown}
                  isLightBackground={isLightBackground}
                />
              </div>
            </ControlGroup>

            {/* Date Font Ratio */}
            <ControlGroup icon={<Type size={14} />} label={t(settings.language, 'dateFontRatio')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={settings.dateFontRatio}
                  onChange={e => updateSettings({ dateFontRatio: Number(e.target.value) })}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    accentColor: '#3b82f6',
                    background: isLightBackground ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)',
                  }}
                />
                <span className="text-xs w-10 text-right font-mono tabular-nums" style={{ color: panelStyle.textColor }}>
                  1/{settings.dateFontRatio}
                </span>
              </div>
            </ControlGroup>

            {/* Actions */}
            <ControlGroup icon={<Maximize size={14} />} label={t(settings.language, 'actions')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex flex-col gap-2">
                <FullscreenButton
                  settings={settings}
                  updateSettings={updateSettings}
                  toggleFullscreen={toggleFullscreen}
                  isFullscreen={isFullscreen}
                  isLightBackground={isLightBackground}
                  language={settings.language}
                />
                <ActionButton
                  icon={<Crosshair size={14} />}
                  label={t(settings.language, 'calibration')}
                  onClick={() => setShowCalibration(!showCalibration)}
                  active={showCalibration}
                  isLightBackground={isLightBackground}
                />
                <ActionButton
                  icon={<Bell size={14} />}
                  label={t(settings.language, 'alarmCountdown')}
                  onClick={() => setShowAlarmCountdown(!showAlarmCountdown)}
                  active={showAlarmCountdown}
                  isLightBackground={isLightBackground}
                />
              </div>
            </ControlGroup>

            {/* Themes */}
            <ControlGroup icon={<PaletteIcon size={14} />} label={t(settings.language, 'themes')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
              <div className="flex flex-col gap-2">
                <ActionButton
                  icon={<span>🤖</span>}
                  label={getThemeName(settings.language, 'cyberpunk')}
                  onClick={() => applyTheme('cyberpunk')}
                  isLightBackground={isLightBackground}
                  disabled={settings.autoColorMode}
                />
                <ActionButton
                  icon={<span>⚪</span>}
                  label={getThemeName(settings.language, 'minimal')}
                  onClick={() => applyTheme('minimal')}
                  isLightBackground={isLightBackground}
                  disabled={settings.autoColorMode}
                />
                <ActionButton
                  icon={<span>💚</span>}
                  label={getThemeName(settings.language, 'retro')}
                  onClick={() => applyTheme('retro')}
                  isLightBackground={isLightBackground}
                  disabled={settings.autoColorMode}
                />
              </div>
            </ControlGroup>

            {/* Language */}
            <ControlGroup icon={<Globe size={14} />} label={t(settings.language, 'language')} textColor={panelStyle.textColor} labelColor={panelStyle.labelColor} iconColor={panelStyle.iconColor}>
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

function ActionButton({ icon, label, onClick, active, isLightBackground, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; isLightBackground?: boolean; disabled?: boolean }) {
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-all duration-200 active:scale-95"
      disabled={disabled}
      style={{
        background: active ? 'rgba(59, 130, 246, 0.15)' : (isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'),
        border: active ? '1px solid rgba(59, 130, 246, 0.3)' : (isLightBackground ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)'),
        color: active ? 'rgba(59, 130, 246, 0.8)' : (isLightBackground ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)'),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

// 全屏按钮 - 单击切换双击全屏开关，长按进入全屏
function FullscreenButton({ settings, updateSettings, toggleFullscreen, isFullscreen, isLightBackground, language }: { 
  settings: ClockSettings; 
  updateSettings: (partial: Partial<ClockSettings>) => void; 
  toggleFullscreen: () => void; 
  isFullscreen: boolean;
  isLightBackground: boolean;
  language: 'zh' | 'en';
}) {
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPressing, setIsPressing] = useState(false);

  const handleMouseDown = () => {
    setIsPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      // 长按：进入全屏
      toggleFullscreen();
      setIsPressing(false);
    }, 500); // 500ms 长按
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isPressing) {
      // 短按：切换双击全屏开关
      updateSettings({ doubleClickFullscreen: !settings.doubleClickFullscreen });
    }
    setIsPressing(false);
  };

  const handleMouseLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsPressing(false);
  };

  const label = settings.doubleClickFullscreen 
    ? (language === 'zh' ? '双击全屏 ✓' : 'Double-click ✓')
    : (language === 'zh' ? '双击全屏 ✗' : 'Double-click ✗');

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-all duration-200 active:scale-95"
      style={{
        background: settings.doubleClickFullscreen 
          ? 'rgba(59, 130, 246, 0.15)' 
          : (isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'),
        border: settings.doubleClickFullscreen 
          ? '1px solid rgba(59, 130, 246, 0.3)' 
          : (isLightBackground ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)'),
        color: settings.doubleClickFullscreen 
          ? 'rgba(59, 130, 246, 0.8)' 
          : (isLightBackground ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)'),
      }}
    >
      <span>{isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
