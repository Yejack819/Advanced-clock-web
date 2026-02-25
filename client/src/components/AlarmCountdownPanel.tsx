/**
 * AlarmCountdownPanel - 闹钟和倒计时面板
 * 
 * 设计哲学：暗黑机械美学
 * - 毛玻璃效果的浮动面板
 * - 闹钟和倒计时分两个标签页
 * - 倒计时状态持久化到 Context，关闭面板后继续运行
 */
import React, { useState, useEffect, useRef } from 'react';
import { useClock } from '@/contexts/ClockContext';
import { X, Bell, Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function AlarmCountdownPanel() {
  const { settings, updateSettings, setShowAlarmCountdown, countdownRemaining, countdownRunning, startCountdown, pauseCountdown, resetCountdown } = useClock();
  const [activeTab, setActiveTab] = useState<'alarm' | 'countdown'>('alarm');
  const [countdownMinutes, setCountdownMinutes] = useState(settings.countdownMinutes || 5);
  const prevCountdownRunningRef = useRef(countdownRunning);
  const hasAlertedRef = useRef(false);

  // Alarm check
  useEffect(() => {
    if (!settings.alarmEnabled) return;
    
    const checkAlarm = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentTime === settings.alarmTime) {
        // Trigger alarm
        playAlarmSound();
        alert(`闹钟提醒: ${settings.alarmTime}`);
      }
    };

    const interval = setInterval(checkAlarm, 1000);
    return () => clearInterval(interval);
  }, [settings.alarmEnabled, settings.alarmTime]);

  // Countdown timer alert when finished
  useEffect(() => {
    // Only alert when countdown finishes (reaches 0 from running state)
    if (countdownRemaining === 0 && prevCountdownRunningRef.current && !countdownRunning && !hasAlertedRef.current) {
      playAlarmSound();
      alert('倒计时结束！');
      hasAlertedRef.current = true;
    }
    
    // Reset alert flag when countdown starts again
    if (countdownRunning && countdownRemaining > 0) {
      hasAlertedRef.current = false;
    }
    
    prevCountdownRunningRef.current = countdownRunning;
  }, [countdownRemaining, countdownRunning]);

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

  const handleStartCountdown = () => {
    hasAlertedRef.current = false;
    startCountdown(countdownMinutes);
  };



  const handlePauseCountdown = () => {
    pauseCountdown();
    // Ensure we don't trigger the finish alert when just pausing
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={() => setShowAlarmCountdown(false)}
    >
      <div
        className="relative w-full max-w-md rounded-xl overflow-hidden"
        style={{
          background: 'rgba(20,20,20,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white/90">闹钟 & 倒计时</h2>
          <button
            onClick={() => setShowAlarmCountdown(false)}
            className="p-1.5 rounded-md hover:bg-white/5 transition-colors active:scale-95"
          >
            <X size={20} className="text-white/50" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('alarm')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'alarm'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Bell size={16} className="inline mr-2" />
            闹钟
          </button>
          <button
            onClick={() => setActiveTab('countdown')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'countdown'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Timer size={16} className="inline mr-2" />
            倒计时
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'alarm' ? (
            <div className="space-y-4">
              {/* Alarm enabled toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">启用闹钟</span>
                <button
                  onClick={() => updateSettings({ alarmEnabled: !settings.alarmEnabled })}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{
                    background: settings.alarmEnabled ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                    style={{
                      transform: settings.alarmEnabled ? 'translateX(26px)' : 'translateX(2px)',
                    }}
                  />
                </button>
              </div>

              {/* Alarm time */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">闹钟时间</label>
                <input
                  type="time"
                  value={settings.alarmTime}
                  onChange={e => updateSettings({ alarmTime: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white/90 text-lg font-mono outline-none focus:border-blue-500/40 transition-colors"
                />
              </div>

              {settings.alarmEnabled && (
                <div className="mt-4 p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-400">
                    闹钟将在 {settings.alarmTime} 响起
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Countdown minutes */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">倒计时分钟数</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={countdownMinutes}
                  onChange={e => setCountdownMinutes(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white/90 text-lg font-mono outline-none focus:border-blue-500/40 transition-colors"
                  disabled={countdownRunning}
                />
              </div>

              {/* Countdown display */}
              {countdownRemaining > 0 && (
                <div className="text-center py-6">
                  <div className="text-5xl font-mono text-white/90 tabular-nums">
                    {formatCountdown(countdownRemaining)}
                  </div>
                  {!countdownRunning && countdownRemaining > 0 && (
                    <div className="text-sm text-yellow-400 mt-2">已暂停</div>
                  )}
                </div>
              )}

              {/* Countdown controls */}
              <div className="flex gap-2">
                {!countdownRunning ? (
                  <button
                    onClick={countdownRemaining > 0 ? handleStartCountdown : undefined}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                    disabled={countdownRemaining === 0}
                  >
                    <Play size={16} />
                    {countdownRemaining > 0 ? '继续' : '开始'}
                  </button>
                ) : (
                  <button
                    onClick={handlePauseCountdown}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-all active:scale-95"
                  >
                    <Pause size={16} />
                    暂停
                  </button>
                )}
                <button
                  onClick={handleResetCountdown}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all active:scale-95"
                >
                  <RotateCcw size={16} />
                  重置
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
