/**
 * AlarmCountdownPanel - 闹钟和倒计时面板
 * 
 * 设计哲学：暗黑机械美学
 * - 液态玻璃效果的浮动面板
 * - 闹钟和倒计时分两个标签页
 * - 支持多个闹钟
 * - 倒计时状态持久化到 Context，关闭面板后继续运行
 * - 完整的国际化支持
 * - 倒计时结束声音和屏幕闪烁设置
 */
import React, { useState, useEffect, useRef } from 'react';
import { useClock } from '@/contexts/ClockContext';
import { t } from '@/lib/i18n';
import { X, Bell, Timer, Play, Pause, RotateCcw, Volume2, Clock, Trash2, BellRing, BellOff, Plus, Check, Pencil } from 'lucide-react';
import { SOUND_OPTIONS, playSound } from '@/lib/soundManager';
import { getCountdownHistory, addCountdownHistory, removeCountdownHistory, formatCountdownDuration, getMostFrequentCountdown } from '@/lib/countdownHistory';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendCountdownNotification,
  sendAlarmNotification,
  getPermissionStatusText,
} from '@/lib/notificationManager';

export default function AlarmCountdownPanel() {
  const { settings, updateSettings, setShowAlarmCountdown, countdownRemaining, countdownRunning, startCountdown, pauseCountdown, resetCountdown } = useClock();
  const [activeTab, setActiveTab] = useState<'alarm' | 'countdown'>('alarm');
  const [countdownHours, setCountdownHours] = useState(0);
  const [countdownMinutes, setCountdownMinutes] = useState(settings.countdownMinutes || 5);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [countdownHistory, setCountdownHistory] = useState(getCountdownHistory());
  const prevCountdownRunningRef = useRef(countdownRunning);
  const hasAlertedRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(getNotificationPermission());
  const alarmTriggeredRef = useRef<Set<string>>(new Set()); // 记录已触发的闹钟ID，防止重复触发
  
  // 闹钟编辑状态
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
  const [editAlarmTime, setEditAlarmTime] = useState('08:00');
  const [editAlarmLabel, setEditAlarmLabel] = useState('');

  // Mount animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setShowAlarmCountdown(false), 280);
  };

  // 请求通知权限
  const handleRequestNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      updateSettings({ notificationEnabled: true });
    }
  };

  // Update history and auto-set most frequent countdown when panel opens
  useEffect(() => {
    setCountdownHistory(getCountdownHistory());
    
    // Auto-set to most frequent countdown when opening countdown tab
    if (activeTab === 'countdown') {
      const mostFrequent = getMostFrequentCountdown();
      if (mostFrequent && !countdownRunning) {
        setCountdownHours(mostFrequent.hours);
        setCountdownMinutes(mostFrequent.minutes);
        setCountdownSeconds(mostFrequent.seconds);
      }
    }
  }, [activeTab, countdownRunning]);

  // 检测背景颜色亮度
  const isLightBackground = (() => {
    const bgColor = settings.bgColor;
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  })();

  // Alarm check - 支持多个闹钟
  useEffect(() => {
    const enabledAlarms = settings.alarms.filter(a => a.enabled);
    if (enabledAlarms.length === 0) return;
    
    const checkAlarm = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      enabledAlarms.forEach(alarm => {
        if (currentTime === alarm.time && !alarmTriggeredRef.current.has(alarm.id)) {
          // 标记此闹钟已触发
          alarmTriggeredRef.current.add(alarm.id);
          
          // 发送桌面通知
          if (settings.notificationEnabled && settings.alarmNotification) {
            sendAlarmNotification(alarm.time, settings.language, alarm.label);
          }
          
          // 播放声音并弹窗
          playAlarmSound();
          const label = alarm.label || (settings.language === 'zh' ? '闹钟' : 'Alarm');
          alert(`${label}: ${alarm.time}`);
        }
      });
      
      // 清除已过时间的触发标记
      alarmTriggeredRef.current = new Set(
        enabledAlarms
          .filter(a => a.time === currentTime)
          .map(a => a.id)
      );
    };

    const interval = setInterval(checkAlarm, 1000);
    return () => clearInterval(interval);
  }, [settings.alarms, settings.language, settings.notificationEnabled, settings.alarmNotification]);

  // Countdown timer alert when finished
  useEffect(() => {
    // Only alert when countdown finishes (reaches 0 from running state)
    if (countdownRemaining === 0 && prevCountdownRunningRef.current && !countdownRunning && !hasAlertedRef.current) {
      // 发送桌面通知
      if (settings.notificationEnabled && settings.countdownNotification) {
        sendCountdownNotification(settings.language);
      }
      
      // 播放声音
      playCountdownFinishSound();
      hasAlertedRef.current = true;
    }
    
    // Reset alert flag when countdown starts again
    if (countdownRunning && countdownRemaining > 0) {
      hasAlertedRef.current = false;
    }
    
    prevCountdownRunningRef.current = countdownRunning;
  }, [countdownRemaining, countdownRunning, settings.language, settings.countdownSound, settings.notificationEnabled, settings.countdownNotification]);

  const playAlarmSound = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const playCountdownFinishSound = () => {
    // Play the selected countdown sound
    playSound(settings.countdownSound, 1.5);
  };

  const handleStartCountdown = () => {
    hasAlertedRef.current = false;
    const totalSeconds = countdownHours * 3600 + countdownMinutes * 60 + countdownSeconds;
    const totalMinutes = totalSeconds / 60;
    startCountdown(totalMinutes);
    addCountdownHistory(countdownHours, countdownMinutes, countdownSeconds);
    setCountdownHistory(getCountdownHistory());
  };

  const handleQuickCountdown = (hours: number, minutes: number, seconds: number) => {
    setCountdownHours(hours);
    setCountdownMinutes(minutes);
    setCountdownSeconds(seconds);
    hasAlertedRef.current = false;
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    startCountdown(totalMinutes);
    addCountdownHistory(hours, minutes, seconds);
    setCountdownHistory(getCountdownHistory());
  };

  const handleRemoveHistory = (id: string) => {
    removeCountdownHistory(id);
    setCountdownHistory(getCountdownHistory());
  };

  const handlePauseCountdown = () => {
    pauseCountdown();
  };

  const handleResetCountdown = () => {
    resetCountdown();
    hasAlertedRef.current = false;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 根据背景亮度生成样式
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
          textColor: 'rgba(0,0,0,0.8)',
          labelColor: 'rgba(0,0,0,0.6)',
          inputBg: 'rgba(0,0,0,0.05)',
          inputBorder: 'rgba(0,0,0,0.1)',
        },
      };
    } else {
      return {
        backdrop: {
          background: 'rgba(0, 0, 0, 0.7)',
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        ...styles.backdrop,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
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
        <div className="flex items-center justify-between px-6 py-4 sticky top-0" style={{ borderBottom: `1px solid ${styles.panel.borderBottom}`, background: styles.panel.background }}>
          <h2 className="text-lg font-medium" style={{ color: styles.panel.textColor }}>
            {t(settings.language, 'alarmCountdownTitle')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md transition-colors active:scale-95"
            style={{
              color: styles.panel.labelColor,
              background: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: `1px solid ${styles.panel.borderBottom}` }}>
          <button
            onClick={() => setActiveTab('alarm')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'alarm'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'hover:opacity-70'
            }`}
            style={{
              color: activeTab === 'alarm' ? '#60a5fa' : styles.panel.labelColor,
            }}
          >
            <Bell size={16} className="inline mr-2" />
            {t(settings.language, 'alarmTab')}
          </button>
          <button
            onClick={() => setActiveTab('countdown')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'countdown'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'hover:opacity-70'
            }`}
            style={{
              color: activeTab === 'countdown' ? '#60a5fa' : styles.panel.labelColor,
            }}
          >
            <Timer size={16} className="inline mr-2" />
            {t(settings.language, 'countdownTab')}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'alarm' ? (
            <div className="space-y-4">
              {/* 闹钟列表 */}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {settings.alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="rounded-lg p-3 space-y-2"
                    style={{
                      background: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${editingAlarmId === alarm.id ? 'rgba(59,130,246,0.4)' : styles.panel.inputBorder}`,
                    }}
                  >
                    {editingAlarmId === alarm.id ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editAlarmLabel}
                            onChange={e => setEditAlarmLabel(e.target.value)}
                            className="flex-1 rounded px-2 py-1.5 text-xs outline-none transition-colors"
                            style={{
                              background: styles.panel.inputBg,
                              border: `1px solid ${styles.panel.inputBorder}`,
                              color: styles.panel.textColor,
                            }}
                            placeholder={settings.language === 'zh' ? '标签（可选）' : 'Label (optional)'}
                          />
                          <input
                            type="time"
                            value={editAlarmTime}
                            onChange={e => setEditAlarmTime(e.target.value)}
                            className="rounded px-2 py-1.5 text-xs outline-none transition-colors"
                            style={{
                              background: styles.panel.inputBg,
                              border: `1px solid ${styles.panel.inputBorder}`,
                              color: styles.panel.textColor,
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newAlarms = settings.alarms.map(a =>
                                a.id === alarm.id ? { ...a, time: editAlarmTime, label: editAlarmLabel } : a
                              );
                              updateSettings({ alarms: newAlarms });
                              setEditingAlarmId(null);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium"
                            style={{ background: '#3b82f6', color: 'white' }}
                          >
                            <Check size={12} />
                            {settings.language === 'zh' ? '保存' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingAlarmId(null)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium"
                            style={{ background: isLightBackground ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', color: styles.panel.textColor }}
                          >
                            <X size={12} />
                            {settings.language === 'zh' ? '取消' : 'Cancel'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const newAlarms = settings.alarms.map(a =>
                                a.id === alarm.id ? { ...a, enabled: !a.enabled } : a
                              );
                              updateSettings({ alarms: newAlarms });
                            }}
                            className="relative w-10 h-5 rounded-full transition-colors"
                            style={{
                              background: alarm.enabled ? '#3b82f6' : (isLightBackground ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'),
                            }}
                          >
                            <div
                              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                              style={{
                                transform: alarm.enabled ? 'translateX(22px)' : 'translateX(2px)',
                              }}
                            />
                          </button>
                          <div>
                            <div className="text-lg font-mono font-medium" style={{ color: alarm.enabled ? styles.panel.textColor : styles.panel.labelColor }}>
                              {alarm.time}
                            </div>
                            {alarm.label && (
                              <div className="text-xs" style={{ color: styles.panel.labelColor }}>
                                {alarm.label}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingAlarmId(alarm.id);
                              setEditAlarmTime(alarm.time);
                              setEditAlarmLabel(alarm.label);
                            }}
                            className="p-1.5 rounded transition-all hover:opacity-70"
                            style={{ color: styles.panel.labelColor }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              const newAlarms = settings.alarms.filter(a => a.id !== alarm.id);
                              updateSettings({ alarms: newAlarms });
                            }}
                            className="p-1.5 rounded transition-all hover:opacity-70"
                            style={{ color: '#f87171' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 添加闹钟按钮 */}
              <button
                onClick={() => {
                  const newId = Date.now().toString();
                  const newAlarms = [...settings.alarms, { id: newId, time: '08:00', enabled: true, label: '' }];
                  updateSettings({ alarms: newAlarms });
                  setEditingAlarmId(newId);
                  setEditAlarmTime('08:00');
                  setEditAlarmLabel('');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all active:scale-95"
                style={{
                  background: 'rgba(59,130,246,0.2)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: '#60a5fa',
                }}
              >
                <Plus size={16} />
                {settings.language === 'zh' ? '添加闹钟' : 'Add Alarm'}
              </button>

              {/* 提示信息 */}
              {settings.alarms.filter(a => a.enabled).length > 0 && (
                <div className="mt-2 p-3 rounded-md" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <p className="text-sm" style={{ color: '#60a5fa' }}>
                    {settings.language === 'zh' 
                      ? `已启用 ${settings.alarms.filter(a => a.enabled).length} 个闹钟` 
                      : `${settings.alarms.filter(a => a.enabled).length} alarm(s) enabled`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Countdown time inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: styles.panel.labelColor }}>
                    {t(settings.language, 'countdownHours')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={countdownHours}
                    onChange={e => setCountdownHours(Math.max(0, Math.min(23, Number(e.target.value))))}
                    className="w-full rounded-md px-3 py-2 text-lg font-mono outline-none focus:border-blue-500/40 transition-colors text-center"
                    style={{
                      background: styles.panel.inputBg,
                      border: `1px solid ${styles.panel.inputBorder}`,
                      color: styles.panel.textColor,
                    }}
                    disabled={countdownRunning}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: styles.panel.labelColor }}>
                    {t(settings.language, 'countdownMinutes')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={countdownMinutes}
                    onChange={e => setCountdownMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                    className="w-full rounded-md px-3 py-2 text-lg font-mono outline-none focus:border-blue-500/40 transition-colors text-center"
                    style={{
                      background: styles.panel.inputBg,
                      border: `1px solid ${styles.panel.inputBorder}`,
                      color: styles.panel.textColor,
                    }}
                    disabled={countdownRunning}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: styles.panel.labelColor }}>
                    {t(settings.language, 'countdownSeconds')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={countdownSeconds}
                    onChange={e => setCountdownSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                    className="w-full rounded-md px-3 py-2 text-lg font-mono outline-none focus:border-blue-500/40 transition-colors text-center"
                    style={{
                      background: styles.panel.inputBg,
                      border: `1px solid ${styles.panel.inputBorder}`,
                      color: styles.panel.textColor,
                    }}
                    disabled={countdownRunning}
                  />
                </div>
              </div>

              {/* Countdown display */}
              {countdownRemaining > 0 && (
                <div className="text-center py-6">
                  <div className="text-5xl font-mono tabular-nums" style={{ color: styles.panel.textColor }}>
                    {formatCountdown(countdownRemaining)}
                  </div>
                  {!countdownRunning && countdownRemaining > 0 && (
                    <div className="text-sm mt-2" style={{ color: '#fbbf24' }}>
                      {t(settings.language, 'countdownPaused')}
                    </div>
                  )}
                </div>
              )}

              {/* Countdown controls */}
              <div className="flex gap-2">
                {!countdownRunning ? (
                  <button
                    onClick={handleStartCountdown}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      background: 'rgba(59,130,246,0.2)',
                      border: '1px solid rgba(59,130,246,0.3)',
                      color: '#60a5fa',
                    }}
                    disabled={countdownRemaining > 0 && (countdownHours === 0 && countdownMinutes === 0 && countdownSeconds === 0)}
                  >
                    <Play size={16} />
                    {countdownRemaining > 0 ? t(settings.language, 'countdownContinue') : t(settings.language, 'countdownStart')}
                  </button>
                ) : (
                  <button
                    onClick={handlePauseCountdown}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all active:scale-95"
                    style={{
                      background: 'rgba(251,191,36,0.2)',
                      border: '1px solid rgba(251,191,36,0.3)',
                      color: '#fbbf24',
                    }}
                  >
                    <Pause size={16} />
                    {t(settings.language, 'countdownPause')}
                  </button>
                )}
                <button
                  onClick={handleResetCountdown}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all active:scale-95"
                  style={{
                    background: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                    border: isLightBackground ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                    color: styles.panel.labelColor,
                  }}
                >
                  <RotateCcw size={16} />
                  {t(settings.language, 'countdownReset')}
                </button>
              </div>

              {/* Sound and Flash Settings */}
              <div className="space-y-3 pt-4" style={{ borderTop: `1px solid ${styles.panel.borderBottom}` }}>
                {/* Sound Selection */}
                <div className="space-y-2">
                  <label className="text-sm flex items-center gap-2" style={{ color: styles.panel.labelColor }}>
                    <Volume2 size={14} />
                    {settings.language === 'zh' ? '倒计时结束声音' : 'Countdown Sound'}
                  </label>
                  <select
                    value={settings.countdownSound}
                    onChange={e => updateSettings({ countdownSound: e.target.value as any })}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors"
                    style={{
                      background: styles.panel.inputBg,
                      border: `1px solid ${styles.panel.inputBorder}`,
                      color: styles.panel.textColor,
                    }}
                  >
                    {SOUND_OPTIONS.map(option => (
                      <option key={option.id} value={option.id}>
                        {settings.language === 'zh' ? option.label : option.labelEn}
                      </option>
                    ))}
                  </select>
                  {settings.countdownSound !== 'mute' && (
                    <button
                      onClick={() => playSound(settings.countdownSound, 1.5)}
                      className="w-full py-2 rounded-md text-sm transition-all active:scale-95"
                      style={{
                        background: isLightBackground ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                        border: isLightBackground ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.12)',
                        color: styles.panel.labelColor,
                      }}
                    >
                      {settings.language === 'zh' ? '试听' : 'Preview'}
                    </button>
                  )}
                </div>

                {/* Countdown History */}
                {countdownHistory.length > 0 && (
                  <div className="space-y-2 pt-4" style={{ borderTop: `1px solid ${styles.panel.borderBottom}` }}>
                    <label className="text-sm flex items-center gap-2" style={{ color: styles.panel.labelColor }}>
                      <Clock size={14} />
                      {settings.language === 'zh' ? '最近使用' : 'Recent'}
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {countdownHistory.slice(0, 6).map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-md transition-all hover:opacity-80"
                          style={{
                            background: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                            border: isLightBackground ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <button
                            onClick={() => handleQuickCountdown(item.hours, item.minutes, item.seconds)}
                            className="flex-1 text-left text-sm transition-all active:scale-95"
                            style={{ color: styles.panel.textColor }}
                          >
                            {formatCountdownDuration(item.hours, item.minutes, item.seconds)}
                            <span className="text-xs ml-2" style={{ color: styles.panel.labelColor }}>
                              (x{item.usageCount})
                            </span>
                          </button>
                          <button
                            onClick={() => handleRemoveHistory(item.id)}
                            className="p-1 rounded transition-all hover:opacity-70"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notification Settings - 底部通知设置区域 */}
          {isNotificationSupported() && (
            <div className="mt-4 pt-4 space-y-3" style={{ borderTop: `1px solid ${styles.panel.borderBottom}` }}>
              <div className="flex items-center gap-2 mb-3">
                <BellRing size={16} style={{ color: styles.panel.labelColor }} />
                <span className="text-sm font-medium" style={{ color: styles.panel.textColor }}>
                  {settings.language === 'zh' ? '桌面通知' : 'Desktop Notifications'}
                </span>
              </div>

              {/* Permission Status / Request Button */}
              {notificationPermission !== 'granted' ? (
                <button
                  onClick={handleRequestNotificationPermission}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all active:scale-95"
                  style={{
                    background: notificationPermission === 'denied' 
                      ? 'rgba(239,68,68,0.15)' 
                      : 'rgba(59,130,246,0.15)',
                    border: notificationPermission === 'denied'
                      ? '1px solid rgba(239,68,68,0.3)'
                      : '1px solid rgba(59,130,246,0.3)',
                    color: notificationPermission === 'denied' ? '#ef4444' : '#60a5fa',
                  }}
                  disabled={notificationPermission === 'denied'}
                >
                  {notificationPermission === 'denied' ? (
                    <>
                      <BellOff size={16} />
                      {settings.language === 'zh' ? '通知已被浏览器拒绝' : 'Notifications blocked by browser'}
                    </>
                  ) : (
                    <>
                      <BellRing size={16} />
                      {settings.language === 'zh' ? '启用桌面通知' : 'Enable Notifications'}
                    </>
                  )}
                </button>
              ) : (
                <>
                  {/* Notification enabled toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: styles.panel.labelColor }}>
                      {settings.language === 'zh' ? '启用通知' : 'Enable notifications'}
                    </span>
                    <button
                      onClick={() => updateSettings({ notificationEnabled: !settings.notificationEnabled })}
                      className="relative w-12 h-6 rounded-full transition-colors"
                      style={{
                        background: settings.notificationEnabled ? '#3b82f6' : (isLightBackground ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'),
                      }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                        style={{
                          transform: settings.notificationEnabled ? 'translateX(26px)' : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Individual notification toggles */}
                  {settings.notificationEnabled && (
                    <div className="space-y-2 pl-2">
                      {/* Alarm notification toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: styles.panel.labelColor }}>
                          {settings.language === 'zh' ? '闹钟通知' : 'Alarm notification'}
                        </span>
                        <button
                          onClick={() => updateSettings({ alarmNotification: !settings.alarmNotification })}
                          className="relative w-10 h-5 rounded-full transition-colors"
                          style={{
                            background: settings.alarmNotification ? '#10b981' : (isLightBackground ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'),
                          }}
                        >
                          <div
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                            style={{
                              transform: settings.alarmNotification ? 'translateX(22px)' : 'translateX(2px)',
                            }}
                          />
                        </button>
                      </div>

                      {/* Countdown notification toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: styles.panel.labelColor }}>
                          {settings.language === 'zh' ? '倒计时通知' : 'Countdown notification'}
                        </span>
                        <button
                          onClick={() => updateSettings({ countdownNotification: !settings.countdownNotification })}
                          className="relative w-10 h-5 rounded-full transition-colors"
                          style={{
                            background: settings.countdownNotification ? '#10b981' : (isLightBackground ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'),
                          }}
                        >
                          <div
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                            style={{
                              transform: settings.countdownNotification ? 'translateX(22px)' : 'translateX(2px)',
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
