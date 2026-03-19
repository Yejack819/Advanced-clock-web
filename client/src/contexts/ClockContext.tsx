import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SoundType } from '@/lib/soundManager';

// Available font options with Chinese names
export const FONT_OPTIONS = [
  // 等宽字体 (保留5个)
  { label: 'JetBrains Mono', labelZh: '等宽JetBrains', value: "'JetBrains Mono', monospace", category: 'monospace' },
  { label: 'Roboto Mono', labelZh: '等宽Roboto', value: "'Roboto Mono', monospace", category: 'monospace' },
  { label: 'Fira Code', labelZh: '等宽Fira', value: "'Fira Code', monospace", category: 'monospace' },
  { label: 'Source Code Pro', labelZh: '等宽Source', value: "'Source Code Pro', monospace", category: 'monospace' },
  { label: 'Share Tech Mono', labelZh: '科技等宽', value: "'Share Tech Mono', monospace", category: 'monospace' },
  // 无衬线字体
  { label: 'Orbitron', labelZh: '未来科技', value: "'Orbitron', sans-serif", category: 'sans-serif' },
  { label: 'Oswald', labelZh: '粗体现代', value: "'Oswald', sans-serif", category: 'sans-serif' },
  { label: 'Anton', labelZh: '醒目粗体', value: "'Anton', sans-serif", category: 'sans-serif' },
  { label: 'Bebas Neue', labelZh: '时尚窄体', value: "'Bebas Neue', sans-serif", category: 'sans-serif' },
  // 衬线字体
  { label: 'Playfair Display', labelZh: '衬线Playfair', value: "'Playfair Display', serif", category: 'serif' },
  { label: 'Lora', labelZh: '衬线Lora', value: "'Lora', serif", category: 'serif' },
  // 中文字体
  { label: 'Noto Sans SC', labelZh: '思源黑体', value: "'Noto Sans SC', sans-serif", category: 'chinese' },
  { label: 'Noto Serif SC', labelZh: '思源宋体', value: "'Noto Serif SC', serif", category: 'chinese' },
  { label: 'LXGW WenKai', labelZh: '霞鹜文楷', value: "'LXGW WenKai', serif", category: 'chinese' },
];

export interface ClockSettings {
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  bgColor: string;
  hideSeconds: boolean;
  showDate: boolean;
  calibrationOffset: number; // in milliseconds
  lineHeight: number; // 整体高度调整，百分比 (50-150)
  letterSpacing: number; // 数字左右间距，像素值 (-20 to 50)
  animationSpeed: number; // 动画速度，秒 (0.3-1.0)
  utcOffset: number; // UTC偏移量，例如 +8 表示 UTC+8，-5 表示 UTC-5
  dateFontRatio: number; // 日期字体大小分母，日期字体 = 时钟字体 / dateFontRatio，范围 2-10
  alarmEnabled: boolean; // 闹钟是否启用
  alarmTime: string; // 闹钟时间，格式 HH:mm
  countdownEnabled: boolean; // 倒计时是否启用
  countdownMinutes: number; // 倒计时分钟数
  showDateCountdown: boolean; // 是否显示日期倒计时
  dateCountdownTargets: Array<{ id: string; label: string; date: string }>; // 多个日期倒计时目标
  dateCountdownInterval: number; // 轮播切换间隔（秒），区间 3-30
  language: 'zh' | 'en'; // 语言设置：中文或英文
  countdownSound: SoundType; // 倒计时结束声音类型
  notificationEnabled: boolean; // 是否启用桌面通知
  alarmNotification: boolean; // 闹钟是否发送桌面通知
  countdownNotification: boolean; // 倒计时结束是否发送桌面通知
  autoColorMode: boolean; // 是否启用颜色自适应（白天白底黑字，晚上黑底白字）
  doubleClickFullscreen: boolean; // 是否启用双击全屏
}

const DEFAULT_SETTINGS: ClockSettings = {
  fontSize: 220,
  fontFamily: "'JetBrains Mono', monospace",
  fontColor: '#e0e0e0',
  bgColor: '#0a0a0a',
  hideSeconds: false,
  showDate: false,
  calibrationOffset: 0,
  lineHeight: 100,
  letterSpacing: 0,
  animationSpeed: 0.5,
  utcOffset: 8,
  dateFontRatio: 3,
  alarmEnabled: false,
  alarmTime: '08:00',
  countdownEnabled: false,
  countdownMinutes: 5,
  showDateCountdown: false,
  dateCountdownInterval: 5,
  dateCountdownTargets: [
    { id: '1', label: '新年', date: '2027-01-01' },
  ],
  language: 'zh',
  countdownSound: 'beep',
  notificationEnabled: false,
  alarmNotification: true,
  countdownNotification: true,
  autoColorMode: false,
  doubleClickFullscreen: true,
};

const STORAGE_KEY = 'advanced-clock-settings';

interface ClockContextType {
  settings: ClockSettings;
  updateSettings: (partial: Partial<ClockSettings>) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  showCalibration: boolean;
  setShowCalibration: (v: boolean) => void;
  showAlarmCountdown: boolean;
  setShowAlarmCountdown: (v: boolean) => void;
  showDateCountdownPanel: boolean;
  setShowDateCountdownPanel: (v: boolean) => void;
  countdownRemaining: number; // 倒计时剩余秒数
  countdownRunning: boolean; // 倒计时是否运行中
  startCountdown: (minutes: number) => void;
  pauseCountdown: () => void;
  resetCountdown: () => void;
  applyTheme: (theme: 'cyberpunk' | 'minimal' | 'retro') => void;
  countdownFinished: boolean; // 倒计时是否刚刚结束
  setCountdownFinished: (v: boolean) => void;
}

const ClockContext = createContext<ClockContextType | null>(null);

export function ClockProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ClockSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showAlarmCountdown, setShowAlarmCountdown] = useState(false);
  const [showDateCountdownPanel, setShowDateCountdownPanel] = useState(false);
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const [countdownRunning, setCountdownRunning] = useState(false);
  const [countdownFinished, setCountdownFinished] = useState(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownFinishedRef = useRef(false);

  // Auto-save settings with debounce
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {}
    }, 300);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [settings]);

  // Countdown logic
  useEffect(() => {
    // Clear existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Only run if countdown is running and has time remaining
    if (!countdownRunning || countdownRemaining <= 0) {
      return;
    }

    // Start new interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdownRemaining(prev => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          // Countdown finished
          setCountdownRunning(false);
          if (!countdownFinishedRef.current) {
            countdownFinishedRef.current = true;
            // Trigger the finished state
            setCountdownFinished(true);
          }
          return 0;
        }
        return newValue;
      });
    }, 1000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [countdownRunning, countdownRemaining]);

  const startCountdown = (minutes: number) => {
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    // Reset the finished flag when starting
    countdownFinishedRef.current = false;
    // Ensure minutes is valid
    const validMinutes = Math.max(0.01, minutes); // At least 0.01 minutes (0.6 seconds)
    setCountdownRemaining(validMinutes * 60);
    setCountdownRunning(true);
  };

  const pauseCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownRunning(false);
  };

  const resetCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    // Reset the finished flag when manually resetting
    countdownFinishedRef.current = false;
    setCountdownRunning(false);
    setCountdownRemaining(0);
  };

  const updateSettings = useCallback((partial: Partial<ClockSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  // Listen for fullscreen changes (e.g., user presses Esc)
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const applyTheme = useCallback((theme: 'cyberpunk' | 'minimal' | 'retro') => {
    const themes = {
      cyberpunk: {
        fontColor: '#00ff00',
        bgColor: '#0a0a0a',
        fontFamily: "'Orbitron', sans-serif",
      },
      minimal: {
        fontColor: '#1a1a1a',
        bgColor: '#ffffff',
        fontFamily: "'Playfair Display', serif",
      },
      retro: {
        fontColor: '#00aa00',
        bgColor: '#001100',
        fontFamily: "'Courier Prime', monospace",
      },
    };
    updateSettings(themes[theme]);
  }, [updateSettings]);

  return (
    <ClockContext.Provider value={{
      settings,
      updateSettings,
      isFullscreen,
      toggleFullscreen,
      showCalibration,
      setShowCalibration,
      showAlarmCountdown,
      setShowAlarmCountdown,
      showDateCountdownPanel,
      setShowDateCountdownPanel,
      countdownRemaining,
      countdownRunning,
      startCountdown,
      pauseCountdown,
      resetCountdown,
      applyTheme,
      countdownFinished,
      setCountdownFinished,
    }}>
      {children}
    </ClockContext.Provider>
  );
}

export function useClock() {
  const ctx = useContext(ClockContext);
  if (!ctx) throw new Error('useClock must be used within ClockProvider');
  return ctx;
}

export const THEME_PRESETS = {
  cyberpunk: { name: '赛博朋克', fontColor: '#00ff00', bgColor: '#0a0a0a' },
  minimal: { name: '极简白', fontColor: '#1a1a1a', bgColor: '#ffffff' },
  retro: { name: '复古绿屏', fontColor: '#00aa00', bgColor: '#001100' },
} as const;
